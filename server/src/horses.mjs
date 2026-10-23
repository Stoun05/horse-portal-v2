import { pool } from "./db.mjs";

export async function listHorses(url) {
  const limitRaw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Number.isInteger(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;
  const result = await pool.query(
    "SELECT id, name, code, version, data, created_at, updated_at FROM horses ORDER BY name, id LIMIT $1",
    [limit]
  );
  return { horses: result.rows, count: result.rowCount };
}
