import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileDigest,tarDigest,assertSame} from './runtime-integrity.mjs';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const version='v24.21.0';
const targets=['darwin-arm64','darwin-x64','linux-x64','linux-arm64'];
const cache=path.resolve(process.argv[2]||path.join(root,'.release-build','downloads'));
const out=path.join(root,'.release-build','runtimes');
await fsp.mkdir(cache,{recursive:true});await fsp.mkdir(out,{recursive:true});
async function download(url,file){
  if(!fs.existsSync(file)){
    const res=await fetch(url);if(!res.ok)throw Error(`${url}: HTTP ${res.status}`);
    await fsp.writeFile(file,Buffer.from(await res.arrayBuffer()));
  }
}
const origin=`https://nodejs.org/dist/${version}`;
const sums=path.join(cache,'SHASUMS256.txt');
await download(`${origin}/SHASUMS256.txt`,sums);
const list=await fsp.readFile(sums,'utf8');

for(const target of targets){
  const filename=`node-${version}-${target}.tar.xz`;
  const expected=list.split(/\r?\n/).filter(l=>l.endsWith(`  ${filename}`));
  if(expected.length!==1)throw Error(`Missing or ambiguous official checksum: ${filename}`);
  const archive=path.join(cache,filename);await download(`${origin}/${filename}`,archive);
  const actual=(await fileDigest(archive)).sha256;if(actual!==expected[0].slice(0,64))throw Error(`Checksum mismatch: ${filename}`);
  const prefix=`node-${version}-${target}/`;
  const official=await tarDigest(archive,`${prefix}bin/node`,'xz');
  const staging=path.join(out,`.${target}-${process.pid}`);
  const dest=path.join(out,target);
  await fsp.rm(staging,{recursive:true,force:true});
  await fsp.mkdir(staging,{recursive:true});
  try{
    execFileSync('tar',['--no-same-owner','-xJf',archive,'--strip-components=1','-C',staging,`${prefix}bin/node`,`${prefix}LICENSE`]);
    const extracted=path.join(staging,'bin','node');
    assertSame(await fileDigest(extracted),official,`${target} extracted node`);
    await fsp.mkdir(path.join(staging,'runtime'));
    await fsp.rename(extracted,path.join(staging,'runtime','node'));
    await fsp.rename(path.join(staging,'LICENSE'),path.join(staging,'runtime','LICENSE'));
    await fsp.rm(path.join(staging,'bin'),{recursive:true,force:true});
    assertSame(await fileDigest(path.join(staging,'runtime','node')),official,`${target} prepared node`);
    const [platform,arch]=target.split('-');
    const provenance={version,platform,arch,archiveUrl:`${origin}/${filename}`,archiveSha256:actual,executableBytes:official.bytes,executableSha256:official.sha256};
    await fsp.writeFile(path.join(staging,'runtime','PROVENANCE.json'),JSON.stringify(provenance,null,2)+'\n');
    await fsp.mkdir(path.join(dest,'runtime'),{recursive:true});
    await fsp.copyFile(path.join(staging,'runtime','node'),path.join(dest,'runtime','node'));
    await fsp.copyFile(path.join(staging,'runtime','LICENSE'),path.join(dest,'runtime','LICENSE'));
    await fsp.copyFile(path.join(staging,'runtime','PROVENANCE.json'),path.join(dest,'runtime','PROVENANCE.json'));
    assertSame(await fileDigest(path.join(dest,'runtime','node')),official,`${target} final prepared runtime`);
    await fsp.rm(staging,{recursive:true,force:true});
  }catch(error){await fsp.rm(staging,{recursive:true,force:true});throw error;}
  console.log(`${target}: verified ${actual}`);
}
