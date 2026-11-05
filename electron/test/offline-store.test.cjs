const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const { createOfflineStore } = require("../offline-store.cjs");

test("offline changes survive app restart and are acknowledged explicitly", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-offline-"));
  const file = path.join(directory,"portal.sqlite");
  try {
    let store = createOfflineStore(file);
    const id = store.addLocalChange({entityId:"horse-001",action:"create",payload:{name:"Akýol"}});
    assert.equal(store.listPending().length,1);
    assert.equal(store.listHorses()[0].content.name,"Akýol");
    store.close();
    store = createOfflineStore(file);
    assert.equal(store.listPending()[0].id,id);
    assert.equal(store.listHorses()[0].content.name,"Akýol");
    assert.equal(store.acknowledge(id),1);
    assert.equal(store.listPending().length,0);
    store.close();
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
test("conflicts remain on disk for manual resolution", () => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),"atcylyk-conflict-"));
  try {
    const store=createOfflineStore(path.join(directory,"data.sqlite"));
    const id=store.addLocalChange({entityId:"horse-002",action:"update",payload:{name:"Parasat"},baseVersion:2});
    assert.equal(store.markConflict(id),1);
    assert.equal(store.listPending().length,0);
    assert.equal(store.acknowledge(id),0);
    store.close();
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
