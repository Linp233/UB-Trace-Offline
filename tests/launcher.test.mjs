import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import http from 'node:http';
import {spawn} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const windows={skip:process.platform!=='win32',timeout:60000};
const powershell=path.join(process.env.SystemRoot||'C:/Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function until(check,message,timeout=15000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){if(await check())return;await delay(100);}
  assert.fail(message);
}

async function freePort(){
  const socket=net.createServer();
  await new Promise((resolve,reject)=>socket.once('error',reject).listen(0,'127.0.0.1',resolve));
  const port=socket.address().port;
  await new Promise(resolve=>socket.close(resolve));
  return port;
}

function running(pid){
  try{process.kill(pid,0);return true;}catch(error){if(error.code==='ESRCH')return false;throw error;}
}

async function installation(t){
  const base=path.resolve(os.tmpdir());
  const dir=await fs.mkdtemp(path.join(base,'tracing-launcher-test-'));
  const children=[];
  const port=await freePort();
  const url=`http://127.0.0.1:${port}`;
  const run=(file,args)=>{
    const child=spawn(file,args,{cwd:dir,windowsHide:true,stdio:['pipe','pipe','pipe']});
    child.output='';
    child.stdout.on('data',data=>{child.output+=data;});
    child.stderr.on('data',data=>{child.output+=data;});
    child.on('error',error=>{child.spawnError=error;});
    children.push(child);
    return child;
  };
  const ps=file=>run(powershell,['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(dir,file),...(file==='Start-Tracing.ps1'?['-NoBrowser']:[])]);
  const exited=async child=>{
    await until(()=>child.spawnError||child.exitCode!==null||child.signalCode!==null,`Launcher did not exit: ${child.output}`);
    if(child.spawnError)throw child.spawnError;
  };
  const healthy=async()=>{
    try{return (await (await fetch(url+'/api/health',{signal:AbortSignal.timeout(500),headers:{connection:'close'}})).json()).app==='tracing-offline';}
    catch{return false;}
  };
  t.after(async()=>{
    // Stop only the fixture's server, using the launcher's normal ownership check.
    const stop=ps('Stop-Tracing.ps1');
    await exited(stop);
    for(const child of children)if(child.exitCode===null&&child.signalCode===null)child.kill();
    await Promise.all(children.map(exited));
    await until(async()=>!await healthy(),'Fixture server did not stop');
    if(path.dirname(path.resolve(dir))!==base||!path.basename(dir).startsWith('tracing-launcher-test-'))throw new Error('Unsafe test cleanup path');
    await fs.rm(dir,{recursive:true,force:true,maxRetries:20,retryDelay:100});
  });
  await fs.mkdir(path.join(dir,'runtime'));
  await fs.copyFile(process.execPath,path.join(dir,'runtime/node.exe'));
  for(const file of ['VERSION','server.mjs','config.mjs','Start-Tracing.ps1','Start-Tracing.cmd','Stop-Tracing.ps1','Stop-Tracing.cmd']){
    await fs.copyFile(path.join(root,file),path.join(dir,file));
  }
  await fs.cp(path.join(root,'lib'),path.join(dir,'lib'),{recursive:true});
  await fs.writeFile(path.join(dir,'config.json'),JSON.stringify({port}));
  return {dir,port,ps,run,exited,healthy,
    ready:async child=>{
      await until(async()=>{
        assert.equal(child.exitCode,null,child.output);
        return child.output.includes('Keep this window open')&&await healthy();
      },'Server did not become ready');
      return Number((await fs.readFile(path.join(dir,'data/server.pid'),'utf8')).trim());
    }
  };
}

test('forced launcher exit stops its server; duplicate launch and another installation remain safe',windows,async t=>{
  const first=await installation(t);
  const second=await installation(t);
  const owner=first.ps('Start-Tracing.ps1');
  const firstPid=await first.ready(owner);
  const other=second.ps('Start-Tracing.ps1');
  const secondPid=await second.ready(other);
  const duplicate=first.ps('Start-Tracing.ps1');
  await first.exited(duplicate);
  assert.equal(duplicate.exitCode,0,duplicate.output);
  assert.match(duplicate.output,/already running/);
  assert.ok(await first.healthy());
  owner.kill();
  await first.exited(owner);
  await until(()=>!running(firstPid),'Orphaned server survived forced launcher exit');
  assert.equal(await first.healthy(),false);
  assert.ok(running(secondPid));
  assert.ok(await second.healthy());
  // Confirm the port is actually released, not just that HTTP requests fail.
  const probe=net.createServer();
  await new Promise((resolve,reject)=>probe.once('error',reject).listen(first.port,'127.0.0.1',resolve));
  await new Promise(resolve=>probe.close(resolve));
});

test('CMD entry point stays open until Stop-Tracing.cmd stops the server and removes its PID file',windows,async t=>{
  const app=await installation(t);
  const cmd=process.env.ComSpec||'cmd.exe';
  const owner=app.run(cmd,['/d','/c','Start-Tracing.cmd','-NoBrowser']);
  const serverPid=await app.ready(owner);
  assert.ok(running(serverPid));
  const stop=app.run(cmd,['/d','/c','Stop-Tracing.cmd']);
  await app.exited(stop);
  assert.equal(stop.exitCode,0,stop.output);
  await app.exited(owner);
  assert.equal(owner.exitCode,0,owner.output);
  await until(()=>!running(serverPid),'Stopped server process still exists');
  await assert.rejects(fs.access(path.join(app.dir,'data/server.pid')),{code:'ENOENT'});
});

test('an occupied port fails cleanly without leaving a managed server alive',windows,async t=>{
  const app=await installation(t);
  const occupied=http.createServer((req,res)=>{res.setHeader('Connection','close');res.end('{}');});
  await new Promise((resolve,reject)=>occupied.once('error',reject).listen(app.port,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>occupied.close(resolve)));
  const owner=app.ps('Start-Tracing.ps1');
  await app.exited(owner);
  assert.notEqual(owner.exitCode,0,owner.output);
  assert.match(owner.output,/EADDRINUSE/);
  await assert.rejects(fs.access(path.join(app.dir,'data/server.pid')),{code:'ENOENT'});
});
