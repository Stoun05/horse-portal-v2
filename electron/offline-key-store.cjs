/* Windows-only OS-protected key storage adapter. Opt-in, not wired to UI. */
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes, createHash } = require("node:crypto");
function keyPath(root, userId) {
  if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(userId)) throw new Error("Invalid user id");
  return path.join(root, createHash("sha256").update(userId).digest("hex"), "vault-key.dpapi");
}
function createWindowsKeyStore({ root, safeStorage, platform = process.platform }) {
  if (platform !== "win32" || !safeStorage?.isEncryptionAvailable?.()) throw new Error("OS encryption unavailable");
  if (typeof root !== "string" || !path.isAbsolute(root)) throw new Error("Invalid storage root");
  return {
    loadOrCreate(userId) {
      const filename = keyPath(root, userId);
      if (fs.existsSync(filename)) {
        const encoded = fs.readFileSync(filename);
        const decrypted = safeStorage.decryptString(encoded);
        if (!/^[a-f0-9]{64}$/.test(decrypted)) throw new Error("Corrupt key");
        return Buffer.from(decrypted, "hex");
      }
      const key = randomBytes(32);
      const wrapped = safeStorage.encryptString(key.toString("hex"));
      fs.mkdirSync(path.dirname(filename), { recursive: true, mode: 0o700 });
      // Never silently overwrite an existing key: it would orphan the encrypted vault.
      try { fs.writeFileSync(filename, wrapped, { flag: "wx", mode: 0o600 }); }
      catch (error) { if (error.code !== "EEXIST") throw error; return this.loadOrCreate(userId); }
      return key;
    }
  };
}
module.exports = { keyPath, createWindowsKeyStore };
