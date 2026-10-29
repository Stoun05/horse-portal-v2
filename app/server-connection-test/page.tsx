"use client";

import { useState } from "react";
import { fetchRemoteHorseCatalog, type RemoteHorseResult } from "../../lib/remoteHorseCatalog";

/* Development-only diagnostic. No localStorage writes or catalog mutations.
 * Login restricted to loopback HTTP; never send passwords over LAN plaintext HTTP.
 */
export default function CatalogConnectionTest() {
  const [server, setServer] = useState("http://127.0.0.1:4100");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<RemoteHorseResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function inspect() {
    setLoading(true);
    setResult(null);
    setMessage("");
    try {
      const url = new URL(server);
      if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname) ||
          url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
        setMessage("Synag üçin diňe ýerli http://127.0.0.1:4100 salgysyna rugsat berilýär.");
        return;
      }
      const login = await fetch(new URL("/api/auth/login", url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      });
      if (!login.ok) {
        setMessage(login.status === 401 ? "Ulanyjy ady ýa-da parol nädogry." : "Serwere giriş başa barmady.");
        return;
      }
      const session: unknown = await login.json();
      if (!session || typeof session !== "object" || !("token" in session) ||
          typeof session.token !== "string" || !/^[a-f0-9]{64}$/.test(session.token)) {
        setMessage("Serweriň sessiýa jogaby nädogry.");
        return;
      }
      const token = session.token;
      const fetched = await fetchRemoteHorseCatalog(url.origin, token);
      setResult(fetched);
      try {
        await fetch(new URL("/api/auth/logout", url), {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
        });
      } catch {
        // Session expires on the server even if logout fails.
      }
    } catch {
      setMessage("Serwere birikmek başa barmady.");
    } finally {
      setPassword("");
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "4rem auto", padding: 24 }}>
      <h1>Serwer katalogy — diňe synag</h1>
      <p>Bu sahypa atlary üýtgetmeýär we localStorage-a ýazmaýar. Diňe şol kompýuterdäki synag serweri üçin.</p>
      <label htmlFor="server">Ýerli serwer salgysy</label>
      <input id="server" value={server} onChange={e => setServer(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 12 }} />
      <label htmlFor="username">Ulanyjy ady</label>
      <input id="username" autoComplete="off" value={username} onChange={e => setUsername(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 12 }} />
      <label htmlFor="password">Parol</label>
      <input id="password" type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 12 }} />
      <button onClick={inspect} disabled={loading || !username || !password}>
        {loading ? "Barlanýar..." : "Giriş et we maglumatlary barla"}
      </button>
      {message && <p role="status">{message}</p>}
      {result && (
        <section aria-live="polite" style={{ marginTop: 24 }}>
          {result.ok ? (
            <>
              <p>Serwerden {result.horses.length} at ýazgysy okaldy. Ilkinji 100 ýazgy görkezilýär.</p>
              <ul>{result.horses.map(horse => <li key={horse.id}>{horse.name} — {horse.code ?? horse.id}</li>)}</ul>
            </>
          ) : <p>Okamak başa barmady: {result.reason}</p>}
        </section>
      )}
    </main>
  );
}
