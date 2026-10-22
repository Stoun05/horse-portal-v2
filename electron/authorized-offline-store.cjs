/* Opt-in access gate: signed short-lived grant and protected per-user store.
   Authentication of the human user, server issuance, and UI integration are NOT implemented. */
const {verifyOfflineGrant,canUseLocalAction}=require("./offline-access.cjs");
const {openProtectedOfflineStore}=require("./protected-offline-store.cjs");
function openAuthorizedOfflineStore({root,userId,safeStorage,publicKey,grant,signature,now=Date.now(),platform=process.platform}) {
 const permissions=verifyOfflineGrant(grant,signature,publicKey,userId,now);
 if(!permissions || !canUseLocalAction(permissions,"horses:read")) throw Error("Offline access denied");
 const store=openProtectedOfflineStore({root,userId,safeStorage,platform});
 const ensureActive=(action)=>{
  if(grant.expiresAt<=Date.now() || !canUseLocalAction(permissions,action)) throw Error("Offline access expired or forbidden");
 };
 return Object.freeze({
  listHorses:()=>{ensureActive("horses:read");return store.listHorses();},
  listPending:()=>{ensureActive("horses:read");return store.listPending();},
  addLocalChange:change=>{
   const permission={create:"horses:create",update:"horses:update",delete:"horses:delete"}[change?.action];
   if(!permission) throw Error("Offline edit forbidden");
   ensureActive(permission);
   return store.addLocalChange(change);
  }
 });
}
module.exports={openAuthorizedOfflineStore};
