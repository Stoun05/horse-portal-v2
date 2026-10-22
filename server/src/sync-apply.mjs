import { pool } from "./db.mjs";
import { createHash } from "node:crypto";
import { validateSyncChange, maySyncHorse } from "./sync-validation.mjs";
import { parseHorseInput } from "./horse-validation.mjs";

export async function applyHorseSync(user, change) {
  if (!user?.id || !validateSyncChange(change)) return { status: 400, error: "Invalid change" };
  const digest = createHash("sha256").update(JSON.stringify({ entityId: change.entityId, action: change.action, baseVersion: change.baseVersion, payload: change.payload ?? null })).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // The change ID is a durable idempotency key. Serialize repeated attempts.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [change.changeId]);
    if (!maySyncHorse(user.role, change.action)) {
      await client.query("ROLLBACK");
      return { status: 403, changeId: change.changeId, syncStatus: "forbidden", error: "Forbidden" };
    }
    const previous = await client.query(
      "SELECT actor_id,entity_id,status,server_version,request_digest FROM sync_operations WHERE change_id=$1",
      [change.changeId]
    );
    if (previous.rowCount) {
      await client.query("COMMIT");
      const prior = previous.rows[0];
      if (prior.actor_id !== user.id || prior.entity_id !== change.entityId || prior.request_digest !== digest)
        return { status: 409, error: "Change ID already used" };
      return { status: 200, changeId: change.changeId, syncStatus: prior.status, serverVersion: prior.server_version };
    }
    const existing = await client.query("SELECT id,version FROM horses WHERE id=$1 FOR UPDATE", [change.entityId]);
    const currentVersion = existing.rows[0]?.version ?? null;
    if ((change.action === "create" && currentVersion !== null) ||
        (change.action !== "create" && change.baseVersion !== currentVersion)) {
      await client.query("ROLLBACK");
      return { status: 409, changeId: change.changeId, syncStatus: "conflict", serverVersion: currentVersion };
    }
    let newVersion = currentVersion === null ? 1 : currentVersion + 1;
    if (change.action === "delete") {
      await client.query("DELETE FROM horses WHERE id=$1", [change.entityId]);
    } else {
      const horse = parseHorseInput(change.payload);
      if (!horse) {
        await client.query("ROLLBACK");
        return { status: 400, error: "Invalid horse payload" };
      }
      if (change.action === "create") {
        await client.query(
          "INSERT INTO horses(id,name,code,breed,year,sex,data,version) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,1)",
          [change.entityId,horse.name,horse.code,horse.breed,horse.year,horse.sex,JSON.stringify(change.payload)]
        );
      } else {
        await client.query(
          "UPDATE horses SET name=$2,code=$3,breed=$4,year=$5,sex=$6,data=$7::jsonb,version=version+1,updated_at=now() WHERE id=$1",
          [change.entityId,horse.name,horse.code,horse.breed,horse.year,horse.sex,JSON.stringify(change.payload)]
        );
      }
    }
    await client.query(
      "INSERT INTO sync_operations(change_id,actor_id,entity_id,status,server_version,request_digest) VALUES($1,$2,$3,'accepted',$4,$5)",
      [change.changeId,user.id,change.entityId,newVersion,digest]
    );
    await client.query(
      "INSERT INTO audit_log(actor_id,action,entity_type,entity_id) VALUES($1,$2,'horse',$3)",
      [user.id,"sync:"+change.action,change.entityId]
    );
    await client.query("COMMIT");
    return { status: 200, changeId: change.changeId, syncStatus: "accepted", serverVersion: newVersion };
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    if (error.code === "23505") return { status: 409, error: "Duplicate record" };
    throw error;
  } finally {
    client.release();
  }
}
