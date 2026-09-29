import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {problems} from './catalog.mjs';
import {varsOf,expectedWatch} from './model.mjs';
import {root,sourceFor,documentFor} from './build.mjs';
import {normalizeDocument} from '../../lib/document.mjs';

function run(command,args,cwd){
 const result=spawnSync(command,args,{cwd,encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:8*1024*1024});
 if(result.error||result.status!==0)throw new Error(`${command}: ${result.error||result.stderr||result.stdout}`);
 return {stdout:result.stdout.replaceAll('\r\n','\n'),stderr:result.stderr.replaceAll('\r\n','\n')};
}
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'cse116-practice-'));
const plain=path.join(temp,'plain'),probe=path.join(temp,'probe');
await fs.mkdir(plain);await fs.mkdir(probe);
const results=[];
try{
 await fs.copyFile(path.join(import.meta.dirname,'TraceProbe.java'),path.join(probe,'TraceProbe.java'));
 for(const p of problems){
  for(const [directory,instrument] of [[plain,false],[probe,true]]){
   await fs.writeFile(path.join(directory,p.className+'.java'),sourceFor(p,instrument));
   for(const [name,value] of Object.entries(p.files||{}))await fs.writeFile(path.join(directory,name),value);
  }
 }
 const javacVersion=run('javac',['-version'],temp).stdout.trim();
 for(const directory of [plain,probe])run('javac',['-encoding','UTF-8','-g','-d',directory,...problems.map(p=>path.join(directory,p.className+'.java')),...(directory===probe?[path.join(probe,'TraceProbe.java')]:[])],directory);
 for(const p of problems){
  const disk=JSON.parse(await fs.readFile(path.join(root,'practice/answers',p.id+'.json'),'utf8'));
  assert.deepEqual(normalizeDocument(disk),documentFor(p),`${p.id}: generated answer stale`);
  assert.equal((await fs.readFile(path.join(root,'practice/sources',p.className+'.java'),'utf8')).replaceAll('\r\n','\n'),sourceFor(p));
  const expected=p.io.join('\n')+(p.io.length?'\n':'');
  const a=run('java',['-cp',plain,p.className],plain),b=run('java',['-cp',probe,p.className],probe);
  assert.equal(a.stdout,expected,`${p.id}: original stdout`);assert.equal(a.stderr,'',`${p.id}: original stderr`);
  assert.equal(b.stdout,expected,`${p.id}: probes changed stdout`);
  const observed=new Map();let observations=0;
  for(const line of b.stderr.trimEnd().split('\n').filter(Boolean)){
   const match=/^TRACE\t([^\t]+)\t(.*)$/.exec(line);assert.ok(match,`${p.id}: unexpected stderr ${line}`);
   const value=Buffer.from(match[2],'base64').toString('utf8');
   if(!observed.has(match[1]))observed.set(match[1],[]);observed.get(match[1]).push(value);observations++;
  }
  const coverage=new Set();
  for(const [key,w] of Object.entries(p.watches)){
   assert.deepEqual(observed.get(key)||[],expectedWatch(p,w),`${p.id}: history probe ${key}`);
   for(const target of w.targets||[]){const id=typeof target==='string'?target:target.id;const v=varsOf(p).find(v=>v.variableId===id);for(const i of typeof target==='string'?v.valueUpdates.map((_,i)=>i):target.indices)coverage.add(`${id}/${i}`);}
  }
  assert.equal(observed.size,Object.keys(p.watches).length,`${p.id}: unknown probes`);
  for(const v of varsOf(p))for(let i=0;i<v.valueUpdates.length;i++)assert.ok(coverage.has(`${v.variableId}/${i}`),`${p.id}: unverified history ${v.variableId}/${i}`);
  const addresses=new Set(p.heap.map(h=>h.memoryAddress));
  for(const v of varsOf(p))for(const u of v.valueUpdates)if(/^0x[0-9a-f]+$/.test(u.value))assert.ok(addresses.has(u.value),`${p.id}: dangling reference`);
  const hash=createHash('sha256').update(sourceFor(p)).digest('hex');
  results.push({id:p.id,observations,values:coverage.size,hash});
  console.log(`${p.id}: stdout and ${observations} runtime observations passed (${coverage.size} authored value states).`);
 }
 const report=['# 题库验证记录','',`验证了 ${results.length} 个原创程序，共 ${results.reduce((n,r)=>n+r.observations,0)} 次运行时值观测；编译器：${javacVersion}。`,'',
 '1. 所有题目的原始 Java 源码实际编译并单独执行，输出逐字匹配答案。',
 '2. 临时副本在指定赋值/调用观测点读取变量和字段，并记录对象身份。每个答案变量的每个历史值都有运行时观测覆盖；同址/异址引用按对象身份核对。插桩前后标准输出也必须一致。',
 '3. 原生 JSON 校验、生成文件一致性、ID/关联合法性及非空引用目标检查通过。',
 '4. 帧进入顺序、词法作用域、构造器关联和箭头根据源码及课程约定人工复核；运行时值观测不是对这些绘图约定的自动证明。', '',
 '临时验证代码和 .class 文件不进入题目或发布包。此记录是本次执行结果，不代表官方评分或数学意义的无错保证。重新生成题库后应重新运行验证脚本。', '',
 '| 题号 | 运行时观测数 | 覆盖的历史值数 | 源码 SHA-256 |','|---|---:|---:|---|',...results.map(r=>`| ${r.id} | ${r.observations} | ${r.values} | ${r.hash} |`)];
 await fs.writeFile(path.join(root,'practice/VERIFICATION.md'),report.join('\n')+'\n');
 console.log(`Verified ${results.length} programs; ${results.reduce((a,r)=>a+r.observations,0)} observations.`);
}finally{
 // Remove only the unique temporary directory created above, using one filesystem API.
 const resolved=path.resolve(temp),allowed=path.resolve(os.tmpdir())+path.sep;
 if(!resolved.startsWith(allowed)||!path.basename(resolved).startsWith('cse116-practice-'))throw new Error('Unsafe temporary cleanup path');
 await fs.rm(resolved,{recursive:true,force:true});
}
