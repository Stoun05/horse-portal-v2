/* Destructive writes ONLY to the ephemeral PostgreSQL GitHub Actions database. */
import {randomUUID} from "node:crypto";
const base=process.env.PORTAL_URL??"http://127.0.0.1:4100";
if(process.env.PORTAL_INTEGRATION_DISPOSABLE!=="YES" ||
   !process.env.DATABASE_URL?.includes("/portal_integration") ||
   !process.env.PORTAL_TEST_USER || !process.env.PORTAL_TEST_PASSWORD)
 throw Error("Refusing sync integration test outside disposable database");
const url=new URL(base);
if(url.protocol!=="http:"||!["localhost","127.0.0.1"].includes(url.hostname)||url.pathname!=="/"||url.username||url.password||url.search||url.hash)
 throw Error("Loopback test server required");
const request=async(path,init={})=>fetch(new URL(path,url),{...init,signal:AbortSignal.timeout(10000)});
const login=await request("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:process.env.PORTAL_TEST_USER,password:process.env.PORTAL_TEST_PASSWORD})});
if(login.status!==200)throw Error("Login failed: "+login.status);
const {token}=await login.json();
if(!/^[a-f0-9]{64}$/.test(token??""))throw Error("Invalid token");
const headers={"Content-Type":"application/json",Authorization:"Bearer "+token};
const change={changeId:randomUUID(),entityId:randomUUID(),action:"create",baseVersion:null,payload:{name:"Offline CI Horse",code:"CI-"+randomUUID(),breed:"Ahalteke",sex:"At",year:2022}};
const post=async data=>{const response=await request("/api/sync/horses",{method:"POST",headers,body:JSON.stringify(data)});return {code:response.status,body:await response.json()};};
try{
 const first=await post(change);
 if(first.code!==200||first.body.status!=="accepted"||first.body.serverVersion!==1)throw Error("First creation not accepted");
 const duplicate=await post(change);
 if(duplicate.code!==200||duplicate.body.status!=="accepted"||duplicate.body.serverVersion!==1)throw Error("Idempotent retry failed");
 const tampered=await post({...change,payload:{...change.payload,name:"Changed retry"}});
 if(tampered.code!==409)throw Error("Reused change ID with different payload not rejected");
 const catalog=await request("/api/horses?limit=100",{headers});
 if(catalog.status!==200)throw Error("Cannot inspect synchronized horse");
 const {horses}=await catalog.json();
 if(horses.filter(h=>h.id===change.entityId).length!==1)throw Error("Horse missing or duplicated");
 console.log("PASS: create, idempotent retry, payload mismatch rejection, single persisted horse");
}finally{
 await request("/api/auth/logout",{method:"POST",headers}).catch(()=>{});
}
