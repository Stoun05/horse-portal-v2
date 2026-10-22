const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  const url="http://127.0.0.1:4173/atlar/";
  page.on("pageerror",e=>console.error("PAGE ERROR:",e.message));
  const key="horse-portal-v3-real-horses";
  const record=[{id:"browser-local-test",name:"Local Test Horse",code:"LOCAL-001",breed:"Ahalteke",sex:"At",color:"Mele",year:2022,champion:false}];
  const raw=JSON.stringify(record);
  await page.addInitScript(({key,raw})=>{if(!sessionStorage.getItem("smoke-seeded")){localStorage.setItem(key,raw);sessionStorage.setItem("smoke-seeded","1");}},{key,raw});
  const response=await page.goto(url);
  assert.equal(response?.status(),200,"Horse page did not load");
  await page.getByText("Local Test Horse").first().waitFor({timeout:15000});
  await page.waitForTimeout(300);
  const stable=await page.evaluate(k=>localStorage.getItem(k),key);
  assert.ok(stable?.includes("Local Test Horse"),"Local horse was not hydrated");
  await page.getByRole("button",{name:/Merkezi serweriň katalogyny görkez/}).click();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),stable);
  await page.getByText("Ýerli serwer: 127.0.0.1:4100",{exact:false}).waitFor();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),stable);
  const broken="{ invalid json";
  await page.evaluate(([k,v])=>localStorage.setItem(k,v),[key,broken]);
  await page.reload();
  await page.getByRole("alert").waitFor();
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),broken);
  console.log("PASS: remote preview preserves local data; corrupt data not overwritten.");
 }finally{await browser.close();}
})().catch(e=>{console.error("BROWSER CATALOG SMOKE FAILURE:",e);process.exitCode=1;});
