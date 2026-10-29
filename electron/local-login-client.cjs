/* Main-process-only loopback login. Does not persist passwords or tokens. */
function createLocalLoginClient({baseUrl="http://127.0.0.1:4100",fetchImpl=fetch,timeoutMs=10000}={}){
 const url=new URL(baseUrl);
 if(url.protocol!=="http:"||!["127.0.0.1","localhost"].includes(url.hostname)||url.pathname!=="/"||url.username||url.password||url.search||url.hash)throw Error("Local login requires loopback HTTP");
 if(typeof fetchImpl!=="function"||!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)throw Error("Invalid login transport");
 let session=null;
 const request=async(path,options={})=>fetchImpl(new URL(path,url),{...options,cache:"no-store",signal:AbortSignal.timeout(timeoutMs)});
 return Object.freeze({
  async login(username,password){
   if(session)throw Error("Logout before another login");
   if(typeof username!=="string"||!username||username.length>100||typeof password!=="string"||!password||password.length>1024)throw Error("Invalid credentials");
   const response=await request("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
   if(response.status!==200)throw Error("Login rejected");
   const data=await response.json();
   if(!/^[a-f0-9]{64}$/.test(data?.token??"")||!data?.user||typeof data.user.id!=="string"||!data.user.id||typeof data.user.role!=="string")throw Error("Invalid login response");
   session={token:data.token,user:Object.freeze({id:data.user.id,role:data.user.role,username:data.user.username})};
   return session.user;
  },
  getSession(){return session?Object.freeze({user:session.user}):null;},
  async listServerHorses(){
   if(!session)throw Error("Not authenticated");
   const token=session.token;
   const horses=[];
   for(let offset=0;offset<=1000;offset+=100){
    if(!session||session.token!==token)throw Error("Horse catalog session changed");
    const response=await request("/api/horses?limit=100&offset="+offset,{method:"GET",headers:{Authorization:"Bearer "+token}});
    if(response.status!==200)throw Error("Horse catalog unavailable");
    const body=await response.json();
    if(!Array.isArray(body?.horses)||body.horses.length>100)throw Error("Invalid horse catalog");
    if(offset===1000){if(body.horses.length)throw Error("Horse catalog exceeds safe import limit");return horses;}
    horses.push(...body.horses);
    if(body.horses.length<100)return horses;
   }
   throw Error("Horse catalog import incomplete");
  },
  async listServerDeletions(){
   if(!session)throw Error("Not authenticated");
   const response=await request("/api/horses/deletions",{method:"GET",headers:{Authorization:"Bearer "+session.token}});
   if(response.status!==200)throw Error("Deletion list unavailable");
   const body=await response.json();
   if(!Array.isArray(body?.deletedHorseIds)||body.deletedHorseIds.length>1000)throw Error("Invalid deletion list");
   return body.deletedHorseIds;
  },
  async getSignedGrant(){
   if(!session)throw Error("Not authenticated");
   const response=await request("/api/auth/offline-grant",{method:"POST",headers:{Authorization:"Bearer "+session.token}});
   if(response.status!==200)throw Error("Offline grant rejected");
   const data=await response.json();
   if(data?.grant?.userId!==session.user.id||!Array.isArray(data.grant.permissions)||!Number.isSafeInteger(data.grant.expiresAt)||typeof data.signature!=="string"||typeof data.publicKey!=="string")throw Error("Invalid signed grant");
   return data;
  },
  async withToken(callback){
   if(!session||typeof callback!=="function")throw Error("Not authenticated");
   return callback(session.token,session.user);
  },
  async logout(){
   const current=session;session=null;
   if(!current)return;
   try{await request("/api/auth/logout",{method:"POST",headers:{Authorization:"Bearer "+current.token}});}
   catch{/* client has already revoked its in-memory session */ }
  }
 });
}
module.exports={createLocalLoginClient};
