"use client";

import { useState } from "react";
import { fetchRemoteHorseCatalog, type RemoteHorseResult } from "../../lib/remoteHorseCatalog";

/* Isolated development diagnostic; never writes browser storage or horse data. */
export default function CatalogConnectionTest() {
  const [server, setServer] = useState("http://127.0.0.1:3001");
  const [token, setToken] = useState("");
  const [result, setResult] = useState<RemoteHorseResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function inspect() {
    setLoading(true);
    setResult(null);
    try {
      setResult(await fetchRemoteHorseCatalog(server, token));
    } finally {
      setLoading(false);
      setToken("");
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "4rem auto", padding: 24 }}>
      <h1>Serwer katalogy — diňe synag</h1>
      <p>Bu sahypa hiç hili maglumat üýtgetmeýär ýa-da localStorage-a ýazmaýar. Diňe aýratyn synag gurşawynda ulanyň.</p>
      <label htmlFor="server">Serwer salgysy</label>
      <input id="server" value={server} onChange={e => setServer(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 12 }} />
      <label htmlFor="token">Sessiya tokeni (diňe synag)</label>
      <input id="token" type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 12 }} />
      <button onClick={inspect} disabled={loading || !token}>Maglumatlary barla</button>
      {result && (
        <section aria-live="polite" style={{ marginTop: 24 }}>
          {result.ok ? (
            <>
              <p>Serwerden {result.horses.length} at ýazgysy okaldy. Diňe ilkinji 100 ýazgy görkezilýär.</p>
              <ul>{result.horses.map(horse => <li key={horse.id}>{horse.name} — {horse.code ?? horse.id}</li>)}</ul>
            </>
          ) : <p>Okamak başa barmady: {result.reason}</p>}
        </section>
      )}
    </main>
  );
}
