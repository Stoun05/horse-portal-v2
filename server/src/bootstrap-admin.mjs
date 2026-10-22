import { randomUUID } from "node:crypto";
import { pool } from "./db.mjs";
import { hashPassword } from "./passwords.mjs";
import { validateUsername } from "./user-management.mjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Run interactively on the physical academy server console, not through a web endpoint.
if (!input.isTTY || !output.isTTY) {
  console.error("Administrator setup requires an interactive server terminal.");
  process.exitCode = 1;
} else {
  const cli = createInterface({ input, output });
  try {
    const existing = await pool.query("SELECT 1 FROM portal_users WHERE role='Admin' LIMIT 1");
    if (existing.rowCount !== 0) throw new Error("An administrator already exists; bootstrap is disabled.");
    const username = (await cli.question("Initial admin username: ")).trim();
    if (!validateUsername(username)) throw new Error("Username must be 3-64 letters, digits, dots, dashes or underscores.");
    console.log("Do not enter passwords into shared terminals or recorded sessions.");
    const password = await cli.question("Initial admin password (visible while typing): ");
    const confirmation = await cli.question("Confirm admin password: ");
    if (password !== confirmation) throw new Error("Passwords do not match.");
    const passwordHash = await hashPassword(password);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query("SELECT pg_advisory_xact_lock(420017, 1)");
      void locked;
      const secondCheck = await client.query("SELECT 1 FROM portal_users WHERE role='Admin' LIMIT 1");
      if (secondCheck.rowCount) throw new Error("An administrator already exists.");
      await client.query(
        "INSERT INTO portal_users(id, username, password_hash, role, active) VALUES ($1,$2,$3,'Admin',true)",
        [randomUUID(), username, passwordHash]
      );
      await client.query("COMMIT");
      console.log("Initial administrator account created.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Administrator setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    cli.close();
    await pool.end();
  }
}
