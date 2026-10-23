import { pool } from "./db.mjs";

export async function listHorses(url) {
  const limitRaw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isInteger(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;
  const offsetRaw = Number(url.searchParams.get("offset") ?? 0);
  const offset = Number.isSafeInteger(offsetRaw) && offsetRaw >= 0 && offsetRaw <= 100000 ? offsetRaw : 0;
  const result = await pool.query(
    "SELECT id, name, code, version, data, created_at, updated_at FROM horses ORDER BY name, id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return { horses: result.rows, count: result.rowCount };
}
