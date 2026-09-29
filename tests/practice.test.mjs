import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {normalizeDocument} from '../lib/document.mjs';
import {problems} from '../scripts/practice/catalog.mjs';
import {documentFor,sourceFor} from '../scripts/practice/build.mjs';

const read = file => fs.readFile(new URL(`../practice/${file}`,import.meta.url),'utf8');
const answer = async id => JSON.parse(await read(`answers/${id}.json`));
const variables = scope => scope.items.flatMap(x=>x.kind==='scope'?variables(x):[x]);
const values = variable => variable.valueUpdates.map(x=>x.value);

test('ten instructional chapters each deliver five distinct sources, unsolved sheets and verified answers',async()=>{
 const manifest=JSON.parse(await read('manifest.json'));
 const report=await read('VERIFICATION.md');
 const questions=await read('QUESTIONS.md');
 assert.deepEqual(manifest.chapters.map(c=>c.lecture),[1,2,3,4,5,6,7,8,10,11]);
 assert.equal(manifest.problems.length,50);
 assert.equal(new Set(manifest.problems.map(p=>p.id)).size,50);
 for(const ch of manifest.chapters)assert.equal(manifest.problems.filter(p=>p.chapter===ch.id).length,5);
 for(const p of problems){
  const entry=manifest.problems.find(x=>x.id===p.id);
  const source=(await read(entry.source)).replaceAll('\r\n','\n');
  assert.equal(source,sourceFor(p));
  assert.ok(questions.includes(source.trimEnd()));
  assert.doesNotMatch(source,/TraceProbe|\/\*[@?]/);
  assert.ok(report.includes(createHash('sha256').update(source).digest('hex')),`${p.id}: verification record is stale`);
  const blank=normalizeDocument(JSON.parse(await read(entry.blank)));
  assert.equal(blank.code,source);
  assert.deepEqual([blank.trace.stackFrames,blank.trace.heapObjects,blank.trace.ioLines,blank.trace.globalVariables.items],[[],[],[],[]]);
  const solved=await answer(p.id);
  assert.deepEqual(solved,documentFor(p),`${p.id}: answer differs from reviewed catalog`);
  assert.deepEqual(normalizeDocument(solved),solved);
  for(const [name,content] of Object.entries(p.files||{}))assert.equal((await read(`sources/${name}`)).replaceAll('\r\n','\n'),content);
 }
});

test('every completed answer releases its scopes and associates constructors with the same receiver',async()=>{
 const scope = s => {assert.equal(s.scopeState,'released');for(const x of s.items)if(x.kind==='scope')scope(x);};
 for(const p of problems){
  const {trace}=await answer(p.id);
  trace.stackFrames.forEach((frame,i)=>{assert.equal(frame.totalStackFramesAtInsert,i);scope(frame.scope);});
  assert.deepEqual(trace.globalVariables.items,[]);
  const addresses=new Set(trace.heapObjects.map(h=>h.memoryAddress));
  for(const h of trace.heapObjects){
   if(h.constructorStackFrameId){
    const frame=trace.stackFrames.find(f=>f.stackFrameId===h.constructorStackFrameId);
    assert.equal(frame.scope.items[0].name,'this');
    assert.deepEqual(values(frame.scope.items[0]),[h.memoryAddress]);
   }
  }
  for(const v of [...trace.stackFrames.flatMap(f=>variables(f.scope)),...trace.heapObjects.flatMap(h=>h.variables)]){
   for(const value of values(v))if(/^0x[0-9a-f]+$/.test(value))assert.ok(addresses.has(value),`${p.id}: unresolved reference ${value}`);
  }
 }
});

test('constructor delegation, recursive results and field assignments use their actual targets',async()=>{
 const chain=(await answer('05-3')).trace;
 assert.deepEqual(chain.stackFrames.map(f=>f.name),['main','Child()','Child(int)','Base']);
 assert.equal(chain.heapObjects.length,1);
 assert.equal(chain.heapObjects[0].constructorStackFrameId,'outer');
 assert.deepEqual(chain.stackFrames.slice(1).map(f=>f.returnsToVariableId),['c',null,null]);
 const size=(await answer('08-3')).trace;
 assert.deepEqual(size.stackFrames.slice(4).map(f=>f.returnsToVariableId),['result','l0','l1','r1','r0','l4','r4']);
 const insert=(await answer('08-5')).trace;
 assert.deepEqual(insert.stackFrames.map(f=>f.stackFrameId),['main','c0','i0','i1','c1']);
 assert.deepEqual(insert.stackFrames.map(f=>f.returnsToVariableId),[null,'root','root','hl0','made']);
 assert.deepEqual(values(insert.heapObjects[0].variables.find(v=>v.name==='left')),['null','0x101']);
});

test('graph traversal and early loop termination retain executed calls and assignments only',async()=>{
 const dfs=(await answer('09-3')).trace;
 assert.deepEqual(dfs.stackFrames.slice(1).map(f=>values(f.scope.items[2])[0]),['0','1','2','2']);
 assert.deepEqual(dfs.ioLines.map(l=>l.value),['0','1','2']);
 assert.equal(dfs.stackFrames.at(-1).scope.items.length,3);
 const bfs=(await answer('09-2')).trace;
 assert.deepEqual(values(bfs.heapObjects.find(h=>h.memoryAddress==='0x104').variables[0]),['0','0']);
 const search=(await answer('10-5')).trace;
 assert.deepEqual(values(variables(search.stackFrames[0].scope).find(v=>v.name==='i')),['0','1','2']);
 assert.deepEqual(search.ioLines.map(l=>l.value),['3:2']);
});
