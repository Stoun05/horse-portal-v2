/* Electron main-process only. Never expose direct database access to web content. */
const { DatabaseSync } = require("node:sqlite");
const { randomUUID } = require("node:crypto");
const path = require("node:path");
const fs = require("node:fs");

function createOfflineStore(databaseFile) {
  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const db = new DatabaseSync(databaseFile);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS horse_cache (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      server_version INTEGER,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pending_changes (
      id TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
      payload TEXT,
      base_version INTEGER,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','conflict')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sync_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS pending_changes_status_idx ON pending_changes(status,created_at);
  `);
  const insertHorse = db.prepare("INSERT INTO horse_cache(id,content,server_version,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET content=excluded.content, server_version=excluded.server_version, updated_at=excluded.updated_at");
  const insertChange = db.prepare("INSERT INTO pending_changes(id,entity_id,action,payload,base_version,created_at) VALUES (?,?,?,?,?,?)");

  return {
    addLocalChange({ entityId, action, payload = null, baseVersion = null }) {
      if (typeof entityId !== "string" || !entityId || !["create","update","delete"].includes(action)) throw new Error("Invalid offline change");
      if (payload !== null && (typeof payload !== "object" || Array.isArray(payload))) throw new Error("Invalid payload");
      if (baseVersion !== null && (!Number.isInteger(baseVersion) || baseVersion < 0)) throw new Error("Invalid base version");
      const id = randomUUID(), now = new Date().toISOString();
      db.exec("BEGIN IMMEDIATE");
      try {
        insertChange.run(id,entityId,action,payload === null ? null : JSON.stringify(payload),baseVersion,now);
        if (action === "delete") db.prepare("DELETE FROM horse_cache WHERE id=?").run(entityId);
        else insertHorse.run(entityId,JSON.stringify(payload),baseVersion,now);
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
      return id;
    },
    listHorses() {
      return db.prepare("SELECT id,content,server_version,updated_at FROM horse_cache ORDER BY id").all().map(row=>({...row,content:JSON.parse(row.content)}));
    },
    listPending() {
      return db.prepare("SELECT * FROM pending_changes WHERE status='pending' ORDER BY created_at,id").all().map(row=>({...row,payload:row.payload===null?null:JSON.parse(row.payload)}));
    },
    markConflict(changeId) {
      return db.prepare("UPDATE pending_changes SET status='conflict' WHERE id=? AND status='pending'").run(changeId).changes;
    },
    // A change is only removed after a confirmed server acknowledgment.
    acknowledge(changeId) {
      return db.prepare("DELETE FROM pending_changes WHERE id=? AND status='pending'").run(changeId).changes;
    },
    lastSyncedAt() {
      return db.prepare("SELECT value FROM sync_metadata WHERE key='last_synced_at'").get()?.value ?? null;
    },
    setLastSyncedAt(isoTime) {
      if (!Number.isFinite(Date.parse(isoTime))) throw new Error("Invalid date");
      db.prepare("INSERT INTO sync_metadata(key,value) VALUES('last_synced_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(isoTime);
    },
    close() { db.close(); }
  };
}
module.exports = { createOfflineStore };
