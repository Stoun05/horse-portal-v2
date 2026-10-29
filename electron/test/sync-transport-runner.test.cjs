const test = require("node:test");
const assert = require("node:assert/strict");
const {createHorseSyncSender} = require("../sync-transport.cjs");
const {flushPending} = require("../sync-runner.cjs");
test("transport and runner retain pending change after outage and clear on acknowledgement", async () => {
 const change = {id:"op1",entity_id:"horse1",action:"create",base_version:null,payload:{name:"Test horse"}};
 const queue = [change];
 const store = {
  listPending:()=>queue.map(x=>({...x})),
  acknowledge:(id,response)=>{if(id!==change.id||response.serverVersion!==1)return false;queue.shift();return true;},
  markConflict:()=>false
 };
 const token="a".repeat(64);
 const unavailable=createHorseSyncSender({token,fetchImpl:async()=>{throw Error("offline");}});
 assert.equal((await flushPending({store,send:unavailable})).state,"retry");
 assert.equal(queue.length,1);
 const connected=createHorseSyncSender({token,fetchImpl:async(url,options)=>{
  assert.equal(url.pathname,"/api/sync/horses");
  assert.equal(JSON.parse(options.body).changeId,change.id);
  return {status:200,json:async()=>({changeId:change.id,status:"accepted",serverVersion:1})};
 }});
 assert.equal((await flushPending({store,send:connected})).state,"complete");
 assert.equal(queue.length,0);
});
