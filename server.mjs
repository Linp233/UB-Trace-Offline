import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {normalizeDocument} from './lib/document.mjs';
import {readVersion} from './lib/version.mjs';
import {config} from './config.mjs';

const ROOT = import.meta.dirname;
const appVersion = readVersion(ROOT);
const DIST = path.join(ROOT,'dist');
const DATA = path.join(ROOT,'data');
const LIBRARY = path.join(DATA,'library');
const EXPORTS = path.join(DATA,'exports');
const {port, host, baseUrl} = config;
await fs.mkdir(LIBRARY,{recursive:true});
await fs.mkdir(EXPORTS,{recursive:true});
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.woff':'font/woff','.woff2':'font/woff2'};
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
async function readJson(file) {try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function writeJson(file,value) {
  const temp = file + '.' + randomUUID() + '.tmp';
  await fs.writeFile(temp,JSON.stringify(value,null,2));
  await fs.rename(temp,file);
}
async function body(req) {
  const parts=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>5*1024*1024)throw new Error('Document exceeds 5 MB');parts.push(chunk);}
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
function json(res,value,status=200){res.writeHead(status,{'Content-Type':mime['.json'],'Cache-Control':'no-store'});res.end(JSON.stringify(value));}
function docPath(id){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw new Error('Invalid document ID');return path.join(LIBRARY,id+'.json');}

const server=http.createServer(async(req,res)=>{
  try{
    res.setHeader('Content-Security-Policy',csp);
    res.setHeader('X-Content-Type-Options','nosniff');
    const url = new URL(req.url,baseUrl);
    const pathname=decodeURIComponent(url.pathname);
    // Loopback only, and no cross-origin document writes.
    const allowedHosts = new Set([new URL(baseUrl).host,new URL(`http://localhost:${port}`).host]);
    if(!allowedHosts.has(req.headers.host)){json(res,{error:'Invalid host'},403);return;}
    if(req.method!=='GET' && req.method!=='HEAD' && req.headers.origin && !allowedHosts.has(new URL(req.headers.origin).host)){json(res,{error:'Cross-origin writes are not allowed'},403);return;}
    if(pathname==='/api/health'){json(res,{app:'tracing-offline',version:1,appVersion,port});return;}
    if(pathname==='/api/export-png' && req.method==='POST'){
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>40*1024*1024)throw new Error('PNG exceeds 40 MB');chunks.push(chunk);}
      const png=Buffer.concat(chunks);
      if(png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Expected a PNG image');
      const name=`trace-${Date.now()}-${randomUUID().slice(0,8)}.png`;
      await fs.writeFile(path.join(EXPORTS,name),png);
      json(res,{url:'/exports/'+name,file:path.join(EXPORTS,name)},201);return;
    }
    if(pathname.startsWith('/exports/') && req.method==='GET'){
      const name=pathname.slice('/exports/'.length);
      if(!/^trace-[0-9]+-[a-f0-9]{8}\.png$/.test(name))throw new Error('Invalid export filename');
      const bytes=await fs.readFile(path.join(EXPORTS,name));res.writeHead(200,{'Content-Type':'image/png'});res.end(bytes);return;
    }
    if(pathname==='/api/draft'){
      if(req.method==='GET'){json(res,await readJson(path.join(DATA,'draft.json')));return;}
      if(req.method==='POST'){const doc=normalizeDocument(await body(req));await writeJson(path.join(DATA,'draft.json'),doc);json(res,{ok:true});return;}
    }
    if(pathname==='/api/library' && req.method==='GET'){
      const files=(await fs.readdir(LIBRARY)).filter(f=>f.endsWith('.json'));
      const list=await Promise.all(files.map(async f=>{const doc=await readJson(path.join(LIBRARY,f));const stat=await fs.stat(path.join(LIBRARY,f));return{id:f.slice(0,-5),title:doc.title,language:doc.language,modified:stat.mtime.toISOString()};}));
      json(res,list.sort((a,b)=>b.modified.localeCompare(a.modified)));return;
    }
    if(pathname==='/api/library' && req.method==='POST'){
      const doc=normalizeDocument(await body(req));
      const id=randomUUID();await writeJson(docPath(id),doc);
      json(res,{id,url:`${baseUrl}/?document=${id}`},201);return;
    }
    if(pathname.startsWith('/api/library/') && req.method==='GET'){
      const doc=await readJson(docPath(pathname.slice('/api/library/'.length)));
      json(res,doc||{error:'Document not found'},doc?200:404);return;
    }
    if(pathname.startsWith('/api/trpc/')){
      // Only the original toolbar's harmless role query remains; no remote account is used.
      const names=pathname.slice('/api/trpc/'.length).split(',');
      const result=names.map(name=>({result:{data:{json:name==='member.isInstructor'?false:null}}}));
      json(res,url.searchParams.has('batch')?result:result[0]);return;
    }
    if(pathname==='/api/analytics'){json(res,{ok:true});return;}
    if(pathname.startsWith('/api/')){json(res,{error:'Unknown API'},404);return;}
    if(!['GET','HEAD'].includes(req.method)){json(res,{error:'Method not allowed'},405);return;}
    let requested = pathname;
    if(requested==='/' || requested==='/student/tracing/practice')requested='/index.html';
    if(requested==='/_next/image')requested=url.searchParams.get('url')||'';
    const file=path.resolve(DIST,'.'+requested);
    if(!file.startsWith(DIST+path.sep)){json(res,{error:'Invalid path'},403);return;}
    try{
      const bytes=await fs.readFile(file);
      res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
      res.end(req.method==='HEAD'?undefined:bytes);
    }catch(e){if(e.code==='ENOENT'){json(res,{error:'File not found',path:requested},404);}else throw e;}
  }catch(e){json(res,{error:e.message},400);}
});
server.listen(port,host,()=>console.log(`Tracing Offline v${appVersion}: ${baseUrl}`));
server.on('error',error=>{console.error(error.message);process.exit(1);});

if(process.argv.includes('--managed-launcher')){
  let stopping=false;
  const stop=()=>{
    if(stopping)return;
    stopping=true;
    // Drain active requests, but do not let an open connection keep the app alive.
    server.close(()=>process.exit(0));
    setTimeout(()=>process.exit(0),2000).unref();
  };
  // The launcher owns the other end of this pipe. EOF also covers a forced
  // launcher exit, where PowerShell's finally block may never run.
  process.stdin.on('end',stop).on('error',stop).resume();
  for(const signal of ['SIGINT','SIGTERM','SIGHUP'])process.on(signal,stop);
}
