import fs from 'node:fs/promises';
import path from 'node:path';
import {normalizeDocument} from '../lib/document.mjs';

// These states are manually derived, not obtained by executing Java.
const root = path.resolve(import.meta.dirname, '..');
const variable = (key, name, ...values) => ({
  kind: 'variable', variableId: `v-${key}`, name,
  valueUpdates: values.map((value, i) => ({kind: 'value-update', valueUpdateId: `u-${key}-${i+1}`, value}))
});
const scope = (key, items, scopeState = 'released') => ({kind: 'scope', scopeId: `s-${key}`, scopeState, items});
const frame = (key, name, items, target = null) => ({
  kind: 'stack-frame', stackFrameId: `f-${key}`, name,
  totalStackFramesAtInsert: 0, returnsToVariableId: target, scope: scope(key, items)
});
const receiver = (key, address) => variable(`${key}-this`, 'this', address);
const heap = (key, address, objectType, constructor, variables) => ({
  kind: 'heap-object', heapObjectId: `h-${key}`, memoryAddress: address, objectType,
  constructorStackFrameId: constructor, variables
});
const v = variable;
const profile = 'profile=cse116-java-2026-09-28; checkpoint=normal program exit; input=none; args=omitted (unused); histories=retained; loopLocals=grouped by declaration; fieldDefaults=observable-only; exceptions=none. ';

async function save(file, source, title, frames, objects, output, extraNotes) {
  frames.forEach((f, index) => { f.totalStackFramesAtInsert = index; });
  const document = normalizeDocument({
    format: 'ub-trace-offline/v1', title, language: 'java',
    code: (await fs.readFile(path.join(root, 'examples', source), 'utf8')).replaceAll('\r\n', '\n'),
    notes: profile + extraNotes,
    trace: {
      kind: 'trace', version: '1_0_0', globalVariables: scope('global', [], 'active'),
      stackFrames: frames, heapObjects: objects,
      ioLines: output.map((value, index) => ({kind: 'io-line', ioLineId: `io-${index+1}`, value}))
    }
  });
  await fs.writeFile(path.join(root, 'examples', file), JSON.stringify(document, null, 2) + '\n');
}

await save('agent-oop.trace.json', 'AgentOopReference.java', 'Agent reference: inheritance and calls', [
  frame('main-1', 'main', [
    v('main-first', 'first', '0x100'), v('main-alias', 'alias', '0x100'),
    v('main-total', 'total', '0', '5', '16'),
    scope('main-loop1', [v('main-loop-i', 'i', '0', '1', '2'), v('main-loop-result', 'result', '5', '11')]),
    v('main-second', 'second', '0x101'), v('main-finalValue', 'finalValue', '11'),
    v('main-label', 'label', '"total"')
  ]),
  frame('step-ctor-1', 'StepCounter', [receiver('step-ctor-1', '0x100'), v('step-ctor-1-start', 'start', '2'), v('step-ctor-1-step', 'step', '3')], 'v-main-first'),
  frame('counter-ctor-1', 'Counter', [receiver('counter-ctor-1', '0x100'), v('counter-ctor-1-start', 'start', '2')]),
  frame('bump-1', 'StepCounter.bump', [receiver('bump-1', '0x100'), v('bump-1-times', 'times', '1')], 'v-main-loop-result'),
  frame('bump-1-base', 'Counter.bump', [receiver('bump-1-base', '0x100'), v('bump-1-base-delta', 'delta', '3')]),
  frame('bump-2', 'StepCounter.bump', [receiver('bump-2', '0x100'), v('bump-2-times', 'times', '2')], 'v-main-loop-result'),
  frame('bump-2-base', 'Counter.bump', [receiver('bump-2-base', '0x100'), v('bump-2-base-delta', 'delta', '6')]),
  frame('counter-ctor-2', 'Counter', [receiver('counter-ctor-2', '0x101'), v('counter-ctor-2-start', 'start', '10')], 'v-main-second'),
  frame('bump-3', 'Counter.bump', [receiver('bump-3', '0x101'), v('bump-3-delta', 'delta', '1')], 'v-main-finalValue')
], [
  heap('counter-static', 'static:Counter', 'Counter (static storage)', null, [v('counter-static-calls', 'Counter.calls', '0', '1', '2', '3')]),
  heap('first', '0x100', 'StepCounter', 'f-step-ctor-1', [v('heap-first-step', 'step', '3'), v('heap-first-value', 'value', '2', '5', '11')]),
  heap('second', '0x101', 'Counter', 'f-counter-ctor-2', [v('heap-second-value', 'value', '10', '11')])
], ['11', 'total:16', '11'],
'Original generic example. Object and library internals are omitted. f-bump-1-base returned 5 to f-bump-1\'s return expression; f-bump-1 returned 5 to v-main-loop-result. f-bump-2-base returned 11 to f-bump-2\'s return expression; f-bump-2 returned 11 to v-main-loop-result. Indirect return arrows are omitted. Both constructors for 0x100 use the same object; only the outer StepCounter constructor is linked to the object. The second Counter allocation is 0x101. static:Counter is shared class storage for Counter.calls, displayed in the heap panel because Java mode hides globalVariables; it is not a third allocated instance or a Java object reference.');

await save('agent-recursion.trace.json', 'AgentRecursionReference.java', 'Agent reference: recursive return destinations', [
  frame('main-1', 'main', [v('main-answer', 'answer', '3')]),
  frame('sum-1', 'AgentRecursionReference.sum', [v('sum-1-n', 'n', '2'), v('sum-1-smaller', 'smaller', '1')], 'v-main-answer'),
  frame('sum-2', 'AgentRecursionReference.sum', [v('sum-2-n', 'n', '1'), v('sum-2-smaller', 'smaller', '0')], 'v-sum-1-smaller'),
  frame('sum-3', 'AgentRecursionReference.sum', [v('sum-3-n', 'n', '0')], 'v-sum-2-smaller')
], [], ['3'], 'Original generic example. sum(0) returns 0; sum(1) returns 1; sum(2) returns 3. Each invocation has its own frame and variables. The base case creates no smaller variable.');

console.log('Generated two original agent reference documents.');
