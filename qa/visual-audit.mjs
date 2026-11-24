import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { createHash } from "node:crypto";
const root=process.cwd(),out=resolve(root,"qa-output");
const pages=["index","about","academics","admissions","life","gallery","news","contact"];
const viewports=[{width:390,height:844},{width:834,height:1194},{width:1440,height:900}];
const types={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".webp":"image/webp",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2",".ico":"image/x-icon"};
const server=createServer(async(req,res)=>{
 try{let p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
 if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);return res.end();}
 if(p===root)p=resolve(root,"index.html");if(!extname(p))p+=".html";
 await stat(p);res.writeHead(200,{"Content-Type":types[extname(p)]||"application/octet-stream"});res.end(await readFile(p));
 }catch{res.writeHead(404);res.end("Not found");}
});
await mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port,browser=await chromium.launch({headless:true});
const report={commit:process.env.GITHUB_SHA||null,viewports,pages:[],live:[],screenshots:[],warnings:[]};
const cap=24*1024*1024;let bytes=0;
try{
 for(const viewport of viewports){
  const ctx=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:"reduce"});
  await ctx.route("**/*",route=>route.request().url().startsWith(base)||route.request().url().startsWith("data:")?route.continue():route.abort());
  for(const name of pages){
   const p=await ctx.newPage(),errors=[];
   p.on("pageerror",e=>errors.push(e.message));
   p.on("response",r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+" "+r.url());});
   try{
    await p.goto(base+"/"+name+".html",{waitUntil:"load"});
    await p.evaluate(async()=>{await document.fonts.ready;for(const im of document.images)im.loading="eager";await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));});
    const metrics=await p.evaluate(()=>{
     const box=e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)};};
     return {documentWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
      splits:[...document.querySelectorAll(".container.split,.nonteach-row")].filter(e=>e.children.length===2).map(e=>({section:e.closest("section")?.getAttribute("aria-label")||e.closest("section")?.querySelector("h2")?.textContent||e.className,first:box(e.children[0]),second:box(e.children[1])})),
      overflow:[...document.querySelectorAll("h1,h2,h3,.tile,.leader-body p,.wm-house-name,.footer-col li,.date-value,.card-body p")].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>({text:e.textContent.trim().slice(0,100),client:e.clientWidth,scroll:e.scrollWidth})),
      broken:[...document.images].filter(e=>e.complete&&!e.naturalWidth&&e.getAttribute("src")&&!e.getAttribute("src").startsWith("http")).map(e=>e.getAttribute("src")),
      sections:[...document.querySelectorAll("main section")].map(e=>({name:e.getAttribute("aria-label")||e.querySelector("h2")?.textContent||e.id,box:box(e)}))};
    });
    report.pages.push({name,width:viewport.width,...metrics,errors});
    const maxHeight=10000;
    for(let top=0,part=1;top<metrics.height;top+=maxHeight,part++){
     const filename=name+"-"+viewport.width+"-"+part+".jpg";
     const buf=await p.screenshot({type:"jpeg",quality:56,scale:"css",animations:"disabled",...(metrics.height<=maxHeight?{fullPage:true}:{clip:{x:0,y:top,width:viewport.width,height:Math.min(maxHeight,metrics.height-top)}})});
     if(bytes+buf.length>cap){report.warnings.push("Screenshot budget reached; omitted "+filename);continue;}
     await writeFile(resolve(out,filename),buf);bytes+=buf.length;report.screenshots.push({filename,bytes:buf.length});
    }
   }catch(e){report.warnings.push(name+" "+viewport.width+": "+e.message);}
   finally{await p.close();}
  }
  await ctx.close();
 }
 for(const [path,local] of [["/","index.html"],["/about.html","about.html"],["/assets/css/style.css","assets/css/style.css"],["/assets/css/wm-home.css","assets/css/wm-home.css"],["/assets/js/main.js","assets/js/main.js"]]){
  try{const resp=await fetch("https://dbso.jayantjaiswal.com"+path,{signal:AbortSignal.timeout(12000),headers:{"Cache-Control":"no-cache"}});
   const hash=b=>createHash("sha256").update(b).digest("hex");
   const remote=hash(Buffer.from(await resp.arrayBuffer())),expected=hash(await readFile(resolve(root,local)));
   report.live.push({path,status:resp.status,match:resp.ok&&remote===expected,remote,expected});
  }catch(e){report.live.push({path,error:e.message});}
 }
 report.screenshotBytes=bytes;await writeFile(resolve(out,"report.json"),JSON.stringify(report,null,2));
 console.log(JSON.stringify({pages:report.pages.length,screenshots:report.screenshots.length,screenshotBytes:bytes,overflows:report.pages.flatMap(p=>p.overflow.map(o=>({page:p.name,width:p.width,...o}))),broken:report.pages.filter(p=>p.broken.length||p.errors.length).map(p=>({page:p.name,width:p.width,images:p.broken,errors:p.errors})),live:report.live.map(p=>({path:p.path,status:p.status,match:p.match,error:p.error})),warnings:report.warnings},null,2));
 if(report.pages.length!==24||report.warnings.length||report.pages.some(p=>p.broken.length||p.errors.length||p.overflow.length||p.documentWidth>p.width+2))process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
