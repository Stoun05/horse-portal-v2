/* Main-process login coordinator. Signed offline grants are required, never fabricated. */
function createDesktopLoginFlow({loginClient,offlineSessions,getSignedGrant}){
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
     offlineSessions.authorize({userId:user.id,...signed});
     return user;
    }catch(error){
     offlineSessions.logout();
     await loginClient.logout();
     throw error;
    }
   }finally{busy=false;}
  },
  async logout(){offlineSessions.logout();await loginClient.logout();}
 });
}
module.exports={createDesktopLoginFlow};
