const {trustedSender}=require("./offline-ipc.cjs");
const CHANNELS=Object.freeze({login:"desktop-auth:login",logout:"desktop-auth:logout",status:"desktop-auth:status"});
function registerDesktopAuthIpc({ipcMain,webContents,expectedOrigin,loginFlow,getSession}){
 if(!ipcMain?.handle||!ipcMain?.removeHandler||!webContents||!loginFlow?.login||!loginFlow?.logout||typeof getSession!=="function")throw Error("Invalid desktop auth dependencies");
 if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(expectedOrigin))throw Error("Invalid auth origin");
 let active=true,busy=false;
 const check=event=>{
  if(!active||webContents.isDestroyed?.())throw Error("Desktop auth closed");
  if(event?.sender!==webContents||!trustedSender(event,expectedOrigin))throw Error("Forbidden desktop auth sender");
 };
 const close=()=>{
  if(!active)return;
  active=false;
  webContents.removeListener?.("destroyed",close);
  for(const name of Object.values(CHANNELS))ipcMain.removeHandler(name);
 };
 if(webContents.isDestroyed?.())throw Error("Window destroyed");
 webContents.once?.("destroyed",close);
 try{
  ipcMain.handle(CHANNELS.login,async(event,credentials)=>{
   check(event);
   if(busy)throw Error("Authentication in progress");
   if(!credentials||Object.keys(credentials).sort().join(",")!=="password,username"||
      typeof credentials.username!=="string"||credentials.username.length<1||credentials.username.length>100||
      typeof credentials.password!=="string"||credentials.password.length<1||credentials.password.length>1024)throw Error("Invalid credentials");
   busy=true;
   try{
    const user=await loginFlow.login(credentials.username,credentials.password);
    return {id:user.id,username:user.username,role:user.role};
   }finally{busy=false;}
  });
  ipcMain.handle(CHANNELS.logout,async event=>{
   check(event);
   if(busy)throw Error("Authentication in progress");
   busy=true;
   try{await loginFlow.logout();return {success:true};}finally{busy=false;}
  });
  ipcMain.handle(CHANNELS.status,async event=>{
   check(event);
   const session=getSession();
   return session?.user?{authenticated:true,user:session.user}:{authenticated:false,user:null};
  });
 }catch(error){close();throw error;}
 return close;
}
module.exports={CHANNELS,registerDesktopAuthIpc};
