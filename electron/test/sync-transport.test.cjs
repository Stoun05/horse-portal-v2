const test=require("node:test");
const assert=require("node:assert/strict");
const {createHorseSyncSender}=require("../sync-transport.cjs");
const token="a".repeat(64),change={changeId:"op1",entityId:"h1",action:"create",baseVersion:null,payload:{name:"Horse"}};
function sender(status,body){return createHorseSyncSender({token,fetchImpl:async(url,options)=>{assert.equal(url.hostname,"127.0.0.1");assert.equal(options.method,"POST");assert.equal(options.headers.Authorization,"Bearer "+token);return {status,json:async()=>body};}});}
test("valid ack is mapped without clearing queue directly",async()=>assert.deepEqual(await sender(200,{changeId:"op1",status:"accepted",serverVersion:1})(change),{changeId:"op1",status:"accepted",serverVersion:1}));
test("conflict maps to conflict",async()=>assert.deepEqual(await sender(409,{changeId:"op1",status:"conflict",serverVersion:3})(change),{changeId:"op1",status:"conflict",serverVersion:3}));
test("invalid response and unauthorized never become acknowledgement",async()=>{
 assert.equal(await sender(200,{changeId:"other",status:"accepted",serverVersion:1})(change),null);
 assert.equal(await sender(503,{error:"offline"})(change),null);
 assert.deepEqual(await sender(401,{})(change),{changeId:"op1",status:"forbidden"});
});
test("rejects remote endpoints and credentials in URLs",()=>{
 assert.throws(()=>createHorseSyncSender({baseUrl:"https://remote.example/",token}));
 assert.throws(()=>createHorseSyncSender({baseUrl:"http://127.0.0.1:4100/other",token}));
 assert.throws(()=>createHorseSyncSender({baseUrl:"http://user:pw@localhost:4100/",token}));
});
