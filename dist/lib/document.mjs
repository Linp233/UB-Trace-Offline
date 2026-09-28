const FORMAT = 'ub-trace-offline/v1';
const string = (value, label) => {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  if (value.length > 300000) throw new Error(`${label} is too long`);
  return value;
};

export function normalizeDocument(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected a tracing document object');
  if (input.format && input.format !== FORMAT) throw new Error(`Unsupported format: ${input.format}`);
  const language = input.language || input.programmingLanguage || 'java';
  if (!['java', 'python'].includes(language)) throw new Error('Language must be java or python');
  let counter = 0;
  const id = kind => `${kind}-${++counter}`;
  const variableIds = new Map();
  const references = [];
  const variable = (v, prefix) => {
    if (!v || typeof v !== 'object') throw new Error('Invalid variable');
    const name = string(v.name, 'Variable name');
    const values = v.values ?? [v.value ?? ''];
    if (!Array.isArray(values) || !values.length) throw new Error(`Variable ${name} needs at least one value`);
    const variableId = id('variable');
    const key = v.id || `${prefix}.${name}`;
    if (variableIds.has(key)) throw new Error(`Duplicate variable key ${key}; give variables distinct id values`);
    variableIds.set(key, variableId);
    return {kind:'variable', name, variableId, valueUpdates: values.map(value => ({kind:'value-update', value:string(value, 'Value (write numbers and booleans as strings)'), valueUpdateId:id('value')}))};
  };
  const scope = (items = [], released = false, prefix = 'global', depth = 0) => {
    if (depth > 30 || !Array.isArray(items)) throw new Error('Invalid or excessively nested scope');
    return {kind:'scope', scopeId:id('scope'), scopeState:released ? 'released':'active', items:items.map((item,index) => item && Array.isArray(item.scope) ? scope(item.scope, !!item.released, `${prefix}.scope${index}`, depth+1) : variable(item,prefix))};
  };
  let trace;
  if (input.trace?.kind === 'trace') {
    trace = structuredClone(input.trace);
  } else {
    const src = input.diagram || input.trace || {};
    const stackFrames = (src.stack || []).map((frame,index) => {
      const prefix = frame.id || `${frame.name}${index ? `#${index}`:''}`;
      const result = {kind:'stack-frame', name:string(frame.name,'Frame name'), stackFrameId:id('frame'), totalStackFramesAtInsert:index, returnsToVariableId:null, scope:scope(frame.items || [],!!frame.released,prefix)};
      if (frame.returnsTo) references.push([result, frame.returnsTo]);
      return result;
    });
    const heapObjects = (src.heap || []).map((object,index) => ({kind:'heap-object', heapObjectId:id('heap'), constructorStackFrameId:null, memoryAddress:string(object.address,'Heap address'), objectType:string(object.type || 'Object','Heap type'), variables:(object.items || []).map(v => variable(v,`heap${index}`))}));
    trace = {kind:'trace', version:'1_0_0', globalVariables:scope(src.globals || []), stackFrames, heapObjects, ioLines:(src.io || []).map(value => ({kind:'io-line',ioLineId:id('io'),value:string(value,'IO line')}))};
    for (const [frame,target] of references) {
      if (!variableIds.has(target)) throw new Error(`Unknown return destination: ${target}`);
      frame.returnsToVariableId = variableIds.get(target);
    }
  }
  validateTrace(trace);
  return {format:FORMAT,title:string(input.title || 'Untitled','Title'),language,code:string(input.code || '','Code'),notes:string(input.notes || '','Notes'),trace};
}

export function validateTrace(trace) {
  if (trace.kind !== 'trace' || trace.version !== '1_0_0') throw new Error('Unsupported native trace version');
  const ids = new Set(), variables = new Set(), frames = new Set(), addresses = new Set();
  const identifier = value => { string(value,'ID'); if (!value || ids.has(value)) throw new Error(`Missing or duplicate ID: ${value}`); ids.add(value); };
  const array = value => {if (!Array.isArray(value) || value.length > 10000) throw new Error('Expected an array with at most 10000 items'); return value;};
  const variable = v => {
    if (v.kind !== 'variable') throw new Error('Invalid variable kind');
    identifier(v.variableId); variables.add(v.variableId); string(v.name,'Variable name');
    const updates = array(v.valueUpdates);
    // The original editor permits deleting the final value; preserve that valid state.
    updates.forEach(u => {if(u.kind !== 'value-update') throw new Error('Invalid value update'); identifier(u.valueUpdateId); string(u.value,'Value');});
  };
  const scope = (s,depth=0) => {
    if (!s || s.kind !== 'scope' || depth > 30 || !['active','released'].includes(s.scopeState)) throw new Error('Invalid scope');
    identifier(s.scopeId);
    array(s.items).forEach(item => item.kind === 'scope' ? scope(item,depth+1) : variable(item));
  };
  scope(trace.globalVariables);
  array(trace.stackFrames).forEach(f => {if(f.kind !== 'stack-frame') throw new Error('Invalid stack frame'); identifier(f.stackFrameId); frames.add(f.stackFrameId); string(f.name,'Frame name'); if(!Number.isInteger(f.totalStackFramesAtInsert) || f.totalStackFramesAtInsert < 0) throw new Error('Invalid frame color index'); scope(f.scope);});
  array(trace.heapObjects).forEach(h => {if(h.kind !== 'heap-object') throw new Error('Invalid heap object'); identifier(h.heapObjectId); string(h.memoryAddress,'Address'); string(h.objectType,'Object type'); if(addresses.has(h.memoryAddress)) throw new Error(`Duplicate heap address: ${h.memoryAddress}`); addresses.add(h.memoryAddress); array(h.variables).forEach(variable); if(h.constructorStackFrameId && !frames.has(h.constructorStackFrameId)) throw new Error('Unknown constructor frame');});
  trace.stackFrames.forEach(f => {if(f.returnsToVariableId && !variables.has(f.returnsToVariableId)) throw new Error('Unknown return variable');});
  array(trace.ioLines).forEach(line => {if(line.kind !== 'io-line') throw new Error('Invalid IO line'); identifier(line.ioLineId); string(line.value,'IO text');});
  return trace;
}

export const emptyDocument = (language='java') => normalizeDocument({title:'Untitled',language,code:language==='java' ? 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n' : 'def main():\n    pass\n\nmain()\n',diagram:{}});
