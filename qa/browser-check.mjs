import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
const root = process.cwd();
const pages = ["index","about","academics","admissions","life","gallery","news","contact"];
const sizes = [320,360,390,601,650,768,834,861,890,960,1024,1100,1440,1536];
const types = {".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2",".ico":"image/x-icon"};
const server = createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,"http://localhost");
    let path = resolve(root,"."+decodeURIComponent(url.pathname));
    if(path !== root && !path.startsWith(root+sep)) { res.writeHead(403); return res.end(); }
    if(path === root) path = resolve(root,"index.html");
    if(!extname(path)) path += ".html";
    await stat(path);
    res.writeHead(200,{"Content-Type":types[extname(path)]||"application/octet-stream"});
    res.end(await readFile(path));
  } catch { res.writeHead(404,{"Content-Type":"text/html"}); res.end(await readFile(resolve(root,"404.html")).catch(()=>Buffer.from("Not found"))); }
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true});
const failures=[], results=[];
async function check(name,width,mode){
 const ctx=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:mode!=="no-js",reducedMotion:mode==="reduced"?"reduce":"no-preference"});
 // Keep this check deterministic: external links and embedded remote services are not part of local rendering QA.
 await ctx.route("**/*",route=>route.request().url().startsWith(base)||route.request().url().startsWith("data:")?route.continue():route.abort());
 const p=await ctx.newPage();
 const errors=[];
 p.on("pageerror",e=>errors.push("JS: "+e.message));
 p.on("response",r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+" "+r.url());});
 try{
  await p.goto(base+"/"+name+".html",{waitUntil:"load"});
  await p.evaluate(()=>document.fonts&&document.fonts.ready);
  const dom=await p.evaluate(()=>{
   const ids=[...document.querySelectorAll("[id]")].map(e=>e.id);
   return {h1:document.querySelectorAll("h1").length,duplicates:ids.filter((x,i)=>ids.indexOf(x)!==i),width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,icons:[...document.querySelectorAll('img[src*="/ai-icons/"]')].filter(e=>!e.closest(".wm-value-slide--clone")).map(e=>e.getAttribute("src")),iconPlacement:[...document.querySelectorAll('img[src*="/ai-icons/"]')].every(e=>!!e.closest(".wm-value-slide")),cloneAccessibility:[...document.querySelectorAll(".wm-value-slide--clone")].every(e=>e.getAttribute("aria-hidden")==="true"),alt:[...document.images].filter(e=>!e.hasAttribute("alt")).length};
  });
  assert.equal(dom.h1,1,"one page H1");
  assert.equal(dom.duplicates.length,0,"unique IDs");
  assert.equal(dom.alt,0,"image alt attributes");
  assert.equal(dom.icons.length,["index","about"].includes(name)?7:0,"illustrated icon scope");
  assert.ok(dom.icons.every(x=>x.includes("/value-")) && dom.iconPlacement,"core value images only");
  assert.ok(dom.cloneAccessibility,"carousel clones hidden from assistive technology");
  const navText=await p.locator(".main-nav a").allTextContents();
  assert.ok(navText.includes("Campus") && navText.includes("Notices"),"short navigation labels");
  if(name==="gallery") assert.equal(await p.locator(".event-head .gold-rule").count(),36,"all gallery events use gold heading rule");
  if(name==="about") { const staffCopy=await p.locator(".nonteach-text").allTextContents(); assert.equal(staffCopy.length,2,"both staff groups"); assert.ok(staffCopy.every(t=>t.trim().length>180),"staff descriptions expanded"); }
  if(name==="contact") assert.equal(await p.locator('button[type="submit"]').count(),1,"enquiry button");
  assert.ok(dom.width<=dom.viewport+2,"horizontal overflow: "+dom.width+" > "+dom.viewport);
  if(mode==="no-js"&&name==="academics")for(const panel of ["panel-science","panel-commerce","panel-humanities"])assert.ok(await p.locator("#"+panel).isVisible(),"no-JS stream "+panel);
  if(mode==="normal"&&name==="index"&&width===390){
    const toggle=p.locator(".menu-toggle");await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"),"true","menu opens");
    await p.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"),"false","menu closes");
    const pause=p.locator(".life-strip-pause");await pause.click();assert.equal(await pause.getAttribute("aria-pressed"),"true","photo strip pauses");await pause.click();assert.equal(await pause.getAttribute("aria-pressed"),"false","photo strip resumes");
  }
  assert.equal(errors.length,0,errors.join("; "));
  results.push({name,width,mode,status:"pass"});
 }catch(e){failures.push({name,width,mode,error:e.message,errors});results.push({name,width,mode,status:"fail"});}
 finally{await ctx.close();}
}
try{
 for(const name of pages){for(const width of sizes)await check(name,width,"normal");await check(name,390,"no-js");await check(name,1440,"reduced");}
 for(const [old,target] of [["staff","about#staff"],["fees","admissions#fees"],["facilities","life#facilities"],["videos","gallery#videos"]]){
  const p=await browser.newPage();try{await p.goto(base+"/"+old+".html");await p.waitForURL(u=>u.pathname.endsWith("/"+target.split("#")[0]+".html")&&u.hash==="#"+target.split("#")[1]);}catch(e){failures.push({name:old,error:e.message});}finally{await p.close();}
 }
 console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.status==="pass").length,failures},null,2));
 if(failures.length)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
