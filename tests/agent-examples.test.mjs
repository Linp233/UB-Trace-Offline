import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeDocument} from '../lib/document.mjs';

const read = name => fs.readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const example = async name => normalizeDocument(JSON.parse(await read(`examples/agent-${name}.trace.json`)));
const values = variable => variable.valueUpdates.map(update => update.value);
const vars = scope => scope.items.flatMap(item => item.kind === 'scope' ? vars(item) : [item]);

test('reference JSON includes the exact Java source and survives native round-trip', async () => {
  for (const [key, file] of [['oop', 'AgentOopReference.java'], ['recursion', 'AgentRecursionReference.java']]) {
    const raw = JSON.parse(await read(`examples/agent-${key}.trace.json`));
    const doc = normalizeDocument(raw);
    assert.equal(doc.code, (await read(`examples/${file}`)).replaceAll('\r\n', '\n'));
    assert.deepEqual(doc, raw);
    assert.deepEqual(normalizeDocument(JSON.parse(JSON.stringify(doc))), doc);
    assert.ok(doc.trace.stackFrames.every((f, i) => f.totalStackFramesAtInsert === i && f.scope.scopeState === 'released'));
  }
});

test('new and super share an object while a separate new has a separate constructor association', async () => {
  const {trace} = await example('oop');
  assert.equal(trace.stackFrames.length, 9);
  assert.deepEqual(trace.heapObjects.map(h => [h.memoryAddress, h.objectType, h.constructorStackFrameId]), [
    ['static:Counter', 'Counter (static storage)', null],
    ['0x100', 'StepCounter', 'f-step-ctor-1'], ['0x101', 'Counter', 'f-counter-ctor-2']
  ]);
  for (const [id, address, target] of [
    ['f-step-ctor-1', '0x100', 'v-main-first'],
    ['f-counter-ctor-1', '0x100', null],
    ['f-counter-ctor-2', '0x101', 'v-main-second']
  ]) {
    const frame = trace.stackFrames.find(f => f.stackFrameId === id);
    assert.deepEqual(values(frame.scope.items[0]), [address]);
    assert.equal(frame.returnsToVariableId, target);
  }
  const main = vars(trace.stackFrames[0].scope);
  assert.deepEqual(values(main.find(v => v.name === 'first')), values(main.find(v => v.name === 'alias')));
  const addresses = new Set(trace.heapObjects.map(h => h.memoryAddress));
  for (const variable of [...trace.stackFrames.flatMap(f => vars(f.scope)), ...trace.heapObjects.flatMap(h => h.variables)]) {
    for (const value of values(variable)) if (/^0x[0-9a-f]+$/i.test(value)) assert.ok(addresses.has(value));
  }
});

test('override/super calls preserve loop histories and use only direct return arrows', async () => {
  const {trace} = await example('oop');
  assert.deepEqual(trace.stackFrames.map(f => f.name), ['main', 'StepCounter', 'Counter', 'StepCounter.bump', 'Counter.bump', 'StepCounter.bump', 'Counter.bump', 'Counter', 'Counter.bump']);
  const main = trace.stackFrames[0].scope;
  const loop = main.items.find(i => i.kind === 'scope');
  assert.equal(loop.scopeState, 'released');
  assert.deepEqual(loop.items.map(v => [v.name, values(v)]), [['i', ['0','1','2']], ['result', ['5','11']]]);
  assert.deepEqual(values(main.items.find(v => v.name === 'total')), ['0','5','16']);
  assert.deepEqual(trace.stackFrames.slice(3,7).map(f => f.returnsToVariableId), ['v-main-loop-result', null, 'v-main-loop-result', null]);
  assert.deepEqual(trace.stackFrames.slice(3,7).map(f => values(f.scope.items[1])), [['1'], ['3'], ['2'], ['6']]);
  assert.deepEqual(values(trace.heapObjects.find(h => h.memoryAddress === '0x100').variables.find(v => v.name === 'value')), ['2','5','11']);
  assert.deepEqual(values(trace.heapObjects.find(h => h.memoryAddress === '0x101').variables[0]), ['10','11']);
  assert.deepEqual(values(trace.heapObjects.find(h => h.memoryAddress === 'static:Counter').variables[0]), ['0','1','2','3']);
  assert.equal(trace.globalVariables.items.length, 0);
  assert.deepEqual(trace.ioLines.map(l => l.value), ['11','total:16','11']);
});

test('recursive calls return to their immediate caller, not all to main', async () => {
  const {trace} = await example('recursion');
  assert.equal(trace.stackFrames.length, 4);
  assert.equal(trace.heapObjects.length, 0);
  assert.deepEqual(trace.stackFrames.slice(1).map(f => f.returnsToVariableId), ['v-main-answer', 'v-sum-1-smaller', 'v-sum-2-smaller']);
  assert.deepEqual(trace.stackFrames.slice(1).map(f => values(f.scope.items[0])), [['2'], ['1'], ['0']]);
  assert.deepEqual(trace.stackFrames.slice(1,3).map(f => values(f.scope.items[1])), [['1'], ['0']]);
  assert.equal(trace.stackFrames[3].scope.items.length, 1);
  assert.deepEqual(trace.ioLines.map(l => l.value), ['3']);
});

test('complete JSON blocks in SCHEMA are accepted authoring examples', async () => {
  const blocks = [...(await read('SCHEMA.md')).matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)];
  assert.equal(blocks.length, 2);
  for (const block of blocks) normalizeDocument(JSON.parse(block[1]));
});
