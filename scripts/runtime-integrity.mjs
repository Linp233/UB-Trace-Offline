import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';

export async function fileDigest(file){
  const hash=createHash('sha256');let bytes=0;
  for await(const chunk of fs.createReadStream(file)){hash.update(chunk);bytes+=chunk.length;}
  return {bytes,sha256:hash.digest('hex')};
}
export async function tarDigest(archive,member,compression){
  const args=[compression==='xz'?'-xJOf':'-xzOf',archive,member];
  const child=spawn('tar',args,{stdio:['ignore','pipe','pipe']});
  const hash=createHash('sha256');let bytes=0,error='';
  child.stdout.on('data',chunk=>{hash.update(chunk);bytes+=chunk.length;});
  child.stderr.on('data',chunk=>{error+=chunk.toString();});
  const code=await new Promise((resolve,reject)=>child.on('error',reject).on('close',resolve));
  if(code!==0)throw Error(`Cannot read ${member} from ${archive}: ${error}`);
  return {bytes,sha256:hash.digest('hex')};
}
export function assertSame(actual,expected,context){
  if(actual.bytes!==expected.bytes||actual.sha256!==expected.sha256)
    throw Error(`${context}: runtime differs from official archive: ${JSON.stringify({actual,expected})}`);
}
