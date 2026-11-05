import test from "node:test";
import assert from "node:assert/strict";
import { applyWebCors } from "../src/web-cors.mjs";
function mock(){const headers={};return {headers,setHeader(k,v){headers[k]=v;}};}
test("only configured exact origin is allowed",()=>{
 const r=mock();
 assert.equal(applyWebCors({headers:{origin:"http://localhost:3000"}},r,"http://localhost:3000"),true);
 assert.equal(r.headers["Access-Control-Allow-Origin"],"http://localhost:3000");
});
test("unknown and ambiguous origins are rejected",()=>{
 for(const origin of ["http://evil.local","http://localhost:3000.evil.org","null"]){
  const r=mock();
  assert.equal(applyWebCors({headers:{origin}},r,"http://localhost:3000"),false);
  assert.equal(r.headers["Access-Control-Allow-Origin"],undefined);
 }
});
test("CORS is disabled without explicit configuration",()=>{
 assert.equal(applyWebCors({headers:{origin:"http://localhost:3000"}},mock(),undefined),false);
});
