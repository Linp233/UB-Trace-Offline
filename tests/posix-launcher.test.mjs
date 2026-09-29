import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import {spawn} from 'node:child_process';
const source=path.resolve(import.meta.dirname,'..');
const assets=['Start-Tracing.sh','Stop-Tracing.sh','config.mjs','server.mjs','VERSION'];
const dirs=['scripts','lib','dist'];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function port(){const s=http.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function fixture(p){const root=fs.mkdtempSync(path.join(os.tmpdir(),'Tracing Offline space '));for(const x of assets)fs.copyFileSync(path.join(source,x),path.join(root,x));for(const x of dirs)fs.cpSync(path.join(source,x),path.join(root,x),{recursive:true});fs.mkdirSync(path.join(root,'runtime'));fs.copyFileSync(process.execPath,path.join(root,'runtime/node'));fs.chmodSync(path.join(root,'runtime/node'),0o755);fs.writeFileSync(path.join(root,'config.json'),JSON.stringify({port:p}));return root;}
function run(root,command,args=[]){return spawn(path.join(root,command),args,{stdio:['ignore','pipe','pipe']});}
async function health(p){return new Promise(resolve=>{http.get(`http://127.0.0.1:${p}/api/health`,r=>{r.resume();resolve(r.statusCode===200);}).on('error',()=>resolve(false));});}
async function until(fn){for(let i=0;i<80;i++){if(await fn())return;await delay(100);}throw Error('Timed out');}
async function exit(child){return new Promise(r=>child.once('exit',(code,signal)=>r({code,signal})));}
test('installation ownership, duplicate, port conflict, and forced parent closure', {skip:process.platform==='win32'},async()=>{
  const p=await port(),q=await port();const a=await fixture(p),b=await fixture(q),conflict=await fixture(p);
  const one=run(a,'Start-Tracing.sh',['--no-browser']);
  try{
    await until(()=>health(p));
    const duplicate=run(a,'Start-Tracing.sh',['--no-browser']);assert.notEqual((await exit(duplicate)).code,0);assert.equal(await health(p),true);
    const occupied=run(conflict,'Start-Tracing.sh',['--no-browser']);assert.notEqual((await exit(occupied)).code,0);assert.equal(await health(p),true);
    const two=run(b,'Start-Tracing.sh',['--no-browser']);
    try{
      await until(()=>health(q));
      const stopped=run(a,'Stop-Tracing.sh');assert.equal((await exit(stopped)).code,0);
      await until(async()=>!(await health(p)));assert.equal(await health(q),true);
      // Kill the foreground launcher and its owner; server must see stdin EOF.
      two.kill('SIGKILL');await exit(two);await until(async()=>!(await health(q)));
    }finally{two.kill('SIGKILL');}
  }finally{one.kill('SIGKILL');for(const r of [a,b,conflict])fs.rmSync(r,{recursive:true,force:true});}
});

test('long path, concurrent start, stale lock recovery', {skip:process.platform==='win32'},async()=>{
  const p=await port();const root=await fixture(p);
  const long=path.join(root,'deep folder '.repeat(15));fs.mkdirSync(long,{recursive:true});
  for(const x of [...assets,'config.json','Stop-Tracing.sh'])fs.copyFileSync(path.join(root,x),path.join(long,x));
  for(const x of dirs)fs.cpSync(path.join(root,x),path.join(long,x),{recursive:true});
  fs.cpSync(path.join(root,'runtime'),path.join(long,'runtime'),{recursive:true});
  assert.ok(long.length>150);
  fs.mkdirSync(path.join(long,'data','.launcher-lock'),{recursive:true});
  fs.mkdirSync(path.join(long,'data','.launcher-recovery')); // leftover from a killed old recovery
  fs.writeFileSync(path.join(long,'data','.launcher-lock','control.json'),JSON.stringify({port:12345,token:'00000000-0000-0000-0000-000000000000'}));
  const first=run(long,'Start-Tracing.sh',['--no-browser']);
  try{
    await until(()=>health(p));
    const lockPath=path.join(long,'data','.launcher-lock');
    assert.equal(fs.statSync(lockPath).mode & 0o777,0o700);
    assert.equal(fs.statSync(path.join(lockPath,'control.json')).mode & 0o777,0o600);
    const record=JSON.parse(fs.readFileSync(path.join(lockPath,'control.json'),'utf8'));
    const idle=net.createConnection({host:'127.0.0.1',port:record.port});
    await new Promise(resolve=>idle.once('connect',resolve));
    const oversized=net.createConnection({host:'127.0.0.1',port:record.port});
    oversized.on('error',()=>{});oversized.on('connect',()=>oversized.write('x'.repeat(1024)));
    const reset=net.createConnection({host:'127.0.0.1',port:record.port});
    reset.on('error',()=>{});reset.on('connect',()=>reset.destroy());
    await delay(1200);assert.equal(await health(p),true);
    idle.destroy();oversized.destroy();
    const other=run(long,'Start-Tracing.sh',['--no-browser']);assert.notEqual((await exit(other)).code,0);
    const idleDuringStop=net.createConnection({host:'127.0.0.1',port:record.port});
    idleDuringStop.on('error',()=>{});await new Promise(resolve=>idleDuringStop.once('connect',resolve));
    const stop=run(long,'Stop-Tracing.sh');assert.equal((await exit(stop)).code,0);
    await until(async()=>!(await health(p)));idleDuringStop.destroy();
    // Competing starts on a clean path must leave exactly one live owner.
    const a=run(long,'Start-Tracing.sh',['--no-browser']);const b=run(long,'Start-Tracing.sh',['--no-browser']);
    await until(()=>health(p));
    const stop2=run(long,'Stop-Tracing.sh');assert.equal((await exit(stop2)).code,0);
    await until(async()=>!(await health(p)));
    a.kill('SIGKILL');b.kill('SIGKILL');
  }finally{first.kill('SIGKILL');fs.rmSync(root,{recursive:true,force:true});}
});

test('killed startup with stale recovery artifacts restarts cleanly', {skip:process.platform==='win32'},async()=>{
  const p=await port(),root=await fixture(p);
  fs.mkdirSync(path.join(root,'data','.launcher-recovery'),{recursive:true});
  const first=run(root,'Start-Tracing.sh',['--no-browser']);
  try{
    await until(()=>fs.existsSync(path.join(root,'data','.launcher-lock','control.json')));
    first.kill('SIGKILL');await exit(first);
    await until(async()=>!(await health(p)));
    const restarted=run(root,'Start-Tracing.sh',['--no-browser']);
    try{await until(()=>health(p));const stop=run(root,'Stop-Tracing.sh');assert.equal((await exit(stop)).code,0);await until(async()=>!(await health(p)));}
    finally{restarted.kill('SIGKILL');}
  }finally{first.kill('SIGKILL');fs.rmSync(root,{recursive:true,force:true});}
});
