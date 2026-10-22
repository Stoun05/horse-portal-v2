/* Run against a dedicated local test database, never production.
 * Environment: PORTAL_URL=http://127.0.0.1:4100, PORTAL_TEST_USER,
 * PORTAL_TEST_PASSWORD. No secrets are logged or written to disk.
 */
const base=process.env.PORTAL_URL??"http://127.0.0.1:4100";
const username=process.env.PORTAL_TEST_USER;
const password=process.env.PORTAL_TEST_PASSWORD;
if(!username||!password) {
 console.log("SKIP live catalog smoke test: test account is not configured.");
 process.exit(0);
}
const url=new URL(base);
if(url.protocol!=="http:" || !["127.0.0.1","localhost"].includes(url.hostname) ||
   url.username || url.password || url.pathname!=="/" || url.search || url.hash) {
 console.error("Only loopback HTTP servers are supported by this test."); process.exit(2);
}
function endpoint(path){return new URL(path,url);}
let token;
try {
 const login=await fetch(endpoint("/api/auth/login"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password}),signal:AbortSignal.timeout(10000)});
 if(login.status!==200) throw Error("Login returned "+login.status);
 const session=await login.json();
 if(!/^[0-9a-f]{64}$/.test(session?.token??"")) throw Error("Invalid session token");
 token=session.token;
 const headers={Authorization:"Bearer "+token};
 const catalog=await fetch(endpoint("/api/horses?limit=100"),{headers,signal:AbortSignal.timeout(10000)});
 if(catalog.status!==200) throw Error("Catalog returned "+catalog.status);
 const body=await catalog.json();
 if(!Array.isArray(body?.horses)) throw Error("Invalid catalog response");
 if (process.env.WEB_ORIGIN) {
   const origin=process.env.WEB_ORIGIN;
   const preflight=await fetch(endpoint("/api/auth/login"),{
     method:"OPTIONS",headers:{Origin:origin,"Access-Control-Request-Method":"POST","Access-Control-Request-Headers":"content-type"},
     signal:AbortSignal.timeout(10000)
   });
   if(preflight.status!==204 || preflight.headers.get("access-control-allow-origin")!==origin)
     throw Error("Trusted browser origin preflight rejected");
   const webCatalog=await fetch(endpoint("/api/horses?limit=100"),{
     headers:{...headers,Origin:origin},signal:AbortSignal.timeout(10000)
   });
   if(webCatalog.status!==200 || webCatalog.headers.get("access-control-allow-origin")!==origin)
     throw Error("Trusted Web catalog request failed");
   const unknownOrigin=await fetch(endpoint("/api/horses"),{
     method:"OPTIONS",headers:{Origin:"http://untrusted.invalid","Access-Control-Request-Method":"GET"},
     signal:AbortSignal.timeout(10000)
   });
   if(unknownOrigin.status!==403 || unknownOrigin.headers.has("access-control-allow-origin"))
     throw Error("Untrusted origin preflight was permitted");
 }
 const forbidden=await fetch(endpoint("/api/horses"),{signal:AbortSignal.timeout(10000)});
 if(forbidden.status!==401) throw Error("Anonymous catalog access was not rejected");
 const logout=await fetch(endpoint("/api/auth/logout"),{method:"POST",headers,signal:AbortSignal.timeout(10000)});
 if(logout.status!==200) throw Error("Logout returned "+logout.status);
 const revoked=await fetch(endpoint("/api/auth/me"),{headers,signal:AbortSignal.timeout(10000)});
 if(revoked.status!==401) throw Error("Revoked session remains valid");
 console.log("PASS: login, catalog read, anonymous rejection, logout, revocation; read "+body.horses.length+" horses.");
} catch(e) {
 console.error("FAIL: "+(e instanceof Error?e.message:"Unknown error"));
 process.exitCode=1;
}
