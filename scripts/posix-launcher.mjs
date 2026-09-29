import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {createHash,randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {config} from '../config.mjs';

const root=fs.realpathSync(path.resolve(import.meta.dirname,'..'));
const data=path.join(root,'data');
const lock=path.join(data,'.launcher-lock');
const info=path.join(lock,'control.json');
const mode=process.argv[2];
const hash=createHash('sha256').update(root).digest();
const firstPort=20000+(hash.readUInt32BE(0)%40000);
const controlPort=firstPort===config.port?20000+((firstPort-20000+1)%40000):firstPort;
const owner={port:controlPort,token:randomUUID()};

function readOwner(){try{return JSON.parse(fs.readFileSync(info,'utf8'));}catch{return null;}}
function writableLock(){
  fs.mkdirSync(data,{recursive:true});
  if(fs.existsSync(lock)){
    const stat=fs.lstatSync(lock);
    if(!stat.isDirectory()||stat.isSymbolicLink()||stat.uid!==process.getuid())throw Error('Unsafe control directory');
    fs.chmodSync(lock,0o700);
  }else fs.mkdirSync(lock,{mode:0o700});
}
function publish(){
  const temp=path.join(lock,`.control-${randomUUID()}`);
  try{
    fs.writeFileSync(temp,JSON.stringify(owner),{mode:0o600,flag:'wx'});
    fs.renameSync(temp,info);
    fs.chmodSync(info,0o600);
  }finally{try{fs.rmSync(temp,{force:true});}catch{}}
}
async function request(action){
  const record=readOwner();
  if(!record||record.port!==controlPort||!/^[a-f0-9-]{36}$/.test(record.token))return false;
  return new Promise(resolve=>{
    let settled=false,input='';
    const finish=value=>{if(settled)return;settled=true;resolve(value);connection.destroy();};
    const connection=net.createConnection({host:'127.0.0.1',port:controlPort});
    connection.setTimeout(1000);
    connection.on('connect',()=>connection.write(`${record.token} ${action}\n`));
    connection.on('data',bytes=>{input+=bytes.toString();if(input.length>64)return finish(false);if(input.includes('\n'))finish(input==='ok\n');});
    connection.on('error',()=>finish(false));
    connection.on('timeout',()=>finish(false));
    connection.on('end',()=>finish(false));
  });
}
if(mode==='stop'){
  if(await request('stop'))console.log('Stop requested for this installation.');
  else{console.error('No active launcher belongs to this installation.');process.exitCode=1;}
}else if(mode==='start'){
  writableLock();
  const peers=new Set();let child,closing=false;
  const controller=net.createServer(connection=>{
    peers.add(connection);connection.setTimeout(1000);
    let input='';
    connection.on('data',bytes=>{
      input+=bytes.toString();
      if(input.length>128){connection.destroy();return;}
      if(!input.includes('\n'))return;
      const [provided,action]=input.trim().split(' ');
      if(input!==`${provided} ${action}\n`||provided!==owner.token||!['stop','ping'].includes(action)){
        connection.end('invalid\n');return;
      }
      connection.end('ok\n');
      if(action==='stop')shutdown(connection);
    });
    connection.on('error',()=>{});
    connection.on('timeout',()=>connection.destroy());
    connection.on('close',()=>peers.delete(connection));
  });
  try{await new Promise((resolve,reject)=>controller.once('error',reject).listen(controlPort,'127.0.0.1',resolve));}
  catch(error){console.error(error.code==='EADDRINUSE'?'An instance or another service already occupies this installation control port.':error.message);process.exit(1);}
  publish();
  child=spawn(process.execPath,[path.join(root,'server.mjs'),'--managed-launcher'],{cwd:root,stdio:['pipe','pipe','inherit']});
  function shutdown(reply){
    if(closing)return;closing=true;
    child.stdin.end();child.kill('SIGTERM');controller.close();
    for(const peer of peers)if(peer!==reply)peer.destroy();
  }
  for(const sig of ['SIGINT','SIGTERM','SIGHUP'])process.on(sig,()=>shutdown());
  let ready=false;
  child.stdout.on('data',chunk=>{
    const line=chunk.toString();process.stdout.write(line);
    if(!ready && line.includes('Tracing Offline v')){
      ready=true;
      if(!process.argv.includes('--no-browser')){
        const opener=process.platform==='darwin'?'open':'xdg-open';
        const browser=spawn(opener,[config.baseUrl],{stdio:'ignore',detached:true});
        browser.on('error',()=>console.error(`Open ${config.baseUrl} in your browser.`));browser.unref();
      }
      console.log(`Open ${config.baseUrl} in your browser. Press Ctrl+C or use Stop-Tracing to stop.`);
    }
  });
  child.on('exit',(code,signal)=>{
    controller.close();for(const peer of peers)peer.destroy();
    try{if(readOwner()?.token===owner.token)fs.rmSync(info,{force:true});}catch{}
    process.exitCode=code??(signal?1:0);
  });
  child.on('error',error=>{console.error(error.message);shutdown();process.exitCode=1;});
}else{console.error('Usage: posix-launcher.mjs start [--no-browser] | stop');process.exitCode=2;}
