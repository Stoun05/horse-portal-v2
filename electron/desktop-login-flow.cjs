/* Main-process login coordinator. The trusted signing key must be pinned by deployment. */
const {createPublicKey}=require("node:crypto");
function createDesktopLoginFlow({loginClient,offlineSessions,getSignedGrant,trustedPublicKey}){
 if(!trustedPublicKey)throw Error("Trusted offline public key required");
 const trustedKey=trustedPublicKey?.type==="public" ? trustedPublicKey : createPublicKey(trustedPublicKey);
 if(trustedKey.asymmetricKeyType!=="ed25519")throw Error("Trusted signing key must be Ed25519");
 const trustedDer=trustedKey.export({format:"der",type:"spki"}).toString("hex");
 getSignedGrant=getSignedGrant??(()=>loginClient.getSignedGrant());
 if(!loginClient?.login||!loginClient?.logout||!offlineSessions?.authorize||!offlineSessions?.logout||typeof getSignedGrant!=="function")throw Error("Invalid desktop login dependencies");
 let busy=false;
 return Object.freeze({
  async login(username,password){
   if(busy)throw Error("Login already in progress");
   busy=true;
   try{
    offlineSessions.logout();
    await loginClient.logout();
    const user=await loginClient.login(username,password);
    try{
     const signed=await loginClient.withToken((token)=>getSignedGrant({token,user}));
     if(!signed||signed.grant?.userId!==user.id||!signed.publicKey||!signed.signature)throw Error("Missing signed offline grant");
     const received=createPublicKey(signed.publicKey);
     if(received.asymmetricKeyType!=="ed25519"||received.export({format:"der",type:"spki"}).toString("hex")!==trustedDer)throw Error("Offline signing key mismatch");
     offlineSessions.authorize({userId:user.id,...signed,publicKey:trustedKey});
     return user;
    }catch(error){
     offlineSessions.logout();
     await loginClient.logout();
     throw error;
    }
   }finally{busy=false;}
  },
  async refreshOfflineAccess(){
   if(busy)throw Error("Authentication in progress");
   const session=loginClient.getSession?.();
   if(!session?.user)throw Error("Not authenticated");
   busy=true;
   try{
    offlineSessions.logout();
    const user=session.user;
    const signed=await loginClient.withToken(token=>getSignedGrant({token,user}));
    if(!signed||signed.grant?.userId!==user.id||!signed.publicKey||!signed.signature)throw Error("Missing signed offline grant");
    const received=createPublicKey(signed.publicKey);
    if(received.asymmetricKeyType!=="ed25519"||received.export({format:"der",type:"spki"}).toString("hex")!==trustedDer)throw Error("Offline signing key mismatch");
    offlineSessions.authorize({userId:user.id,...signed,publicKey:trustedKey});
    return user;
   }catch(error){offlineSessions.logout();throw error;}
   finally{busy=false;}
  },
  async logout(){offlineSessions.logout();await loginClient.logout();}
 });
}
module.exports={createDesktopLoginFlow};
