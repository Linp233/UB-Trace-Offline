import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeDocument} from '../lib/document.mjs';
const source=async n=>JSON.parse(await fs.readFile(new URL(`../examples/practice${n}.source.json`,import.meta.url),'utf8'));

test('generic examples preserve updates, loop histories, released scopes and output',async()=>{
  const p1=normalizeDocument(await source(1));
  assert.deepEqual(p1.trace.ioLines.map(x=>x.value),['7']);
  assert.deepEqual(p1.trace.stackFrames[0].scope.items[0].valueUpdates.map(x=>x.value),['4','7']);
  assert.equal(p1.trace.stackFrames[0].scope.scopeState,'released');
  const p3=normalizeDocument(await source(3));
  const [sum,loop]=p3.trace.stackFrames[0].scope.items;
  assert.deepEqual(sum.valueUpdates.map(x=>x.value),['0','1','3','6']);
  assert.deepEqual(loop.items[0].valueUpdates.map(x=>x.value),['1','2','3','4']);
  assert.equal(loop.scopeState,'released');
  assert.deepEqual(p3.trace.ioLines.map(x=>x.value),['6']);
});

test('returned and aliased references share one heap object and retain mutations',async()=>{
  const p2=normalizeDocument(await source(2));
  const [main,call]=p2.trace.stackFrames;
  assert.equal(call.returnsToVariableId,main.scope.items[0].variableId);
  assert.equal(p2.trace.heapObjects.length,1);
  const address=p2.trace.heapObjects[0].memoryAddress;
  for(const variable of [...main.scope.items,...call.scope.items]) assert.equal(variable.valueUpdates[0].value,address);
  assert.deepEqual(p2.trace.heapObjects[0].variables[1].valueUpdates.map(x=>x.value),['8','9']);
});

test('JSON round-trip preserves native IDs, source and histories',async()=>{
  for(const n of [1,2,3]){const doc=normalizeDocument(await source(n));assert.deepEqual(normalizeDocument(JSON.parse(JSON.stringify(doc))),doc);}
});

test('invalid references, value types and duplicate IDs are rejected',async()=>{
  const bad=await source(2);bad.diagram.stack[1].returnsTo='missing.variable';assert.throws(()=>normalizeDocument(bad),/Unknown return/);
  const native=normalizeDocument(await source(1));native.trace.stackFrames[0].scope.items[0].valueUpdates[0].value=123;assert.throws(()=>normalizeDocument(native),/string/);
  const duplicate=normalizeDocument(await source(2));duplicate.trace.heapObjects[0].heapObjectId=duplicate.trace.stackFrames[0].stackFrameId;assert.throws(()=>normalizeDocument(duplicate),/duplicate/);
});
