import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pool } from "./db.mjs";
try {
  for (const filename of ["001_initial.sql", "002_horse_fields.sql"]) {
    const sql = readFileSync(resolve(import.meta.dirname, "..", "sql", filename), "utf8");
    await pool.query(sql);
  }
  console.log("Initial database schema ready.");
} catch (error) {
  console.error("Database initialization failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
