import pg from "pg";
import { databaseUrl } from "./config.mjs";
if (!databaseUrl) throw new Error("DATABASE_URL must be configured");
export const pool = new pg.Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 3000 });
