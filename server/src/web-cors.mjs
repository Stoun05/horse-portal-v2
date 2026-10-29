/* CORS only for explicitly configured trusted Web origin; no wildcard. */
export function applyWebCors(req,res,allowedOrigin=process.env.WEB_ORIGIN){
 const origin=req.headers.origin;
 if(!origin) return false;
 if(typeof allowedOrigin!=="string" || !/^https?:\/\//.test(allowedOrigin)) return false;
 try{
  const target=new URL(allowedOrigin);
  if(target.origin!==allowedOrigin || origin!==target.origin) return false;
 }catch{return false;}
 res.setHeader("Access-Control-Allow-Origin",origin);
 res.setHeader("Vary","Origin");
 res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS");
 res.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type");
 return true;
}
