/* Run against a dedicated local test database, never production.
 * Environment: PORTAL_URL=http://127.0.0.1:4100, PORTAL_TEST_USER,
 * PORTAL_TEST_PASSWORD. No secrets are logged or written to disk.
 */
const base=process.env.PORTAL_URL??"http://127.0.0.1:4100";
const username=process.env.PORTAL_TEST_USER;
const password=process.env.PORTAL_TEST_PASSWORD;
if(!username||!password) {
 console.error("Set PORTAL_TEST_USER and PORTAL_TEST_PASSWORD for a test account.");
 process.exit(2);
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
