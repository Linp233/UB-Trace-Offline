export const chapters = [
  ['01','Java 基础：表达式、方法与控制流',1,'week1_1_Java.pdf'],
  ['02','Java 集合、文件与 CSV',2,'week2_1_Java.pdf'],
  ['03','类与对象',3,'week3_1_Classes.pdf'],
  ['04','链表、栈与队列',4,'Week4_1_Linked_List.pdf'],
  ['05','继承',5,'Week6_1_Inheritance.pdf'],
  ['06','多态与比较器',6,'Week9_1_Polymorphism.pdf'],
  ['07','测试',7,'week2_1_Unit_Testing.pdf'],
  ['08','树与二叉搜索树',8,'Week7_1_Trees.pdf'],
  ['09','图与路径',10,'Week10_1_Graphs.pdf'],
  ['10','运行时间与操作计数',11,null]
];
export const V=(id,name,...values)=>({kind:'variable',variableId:id,name,valueUpdates:values.map((value,i)=>({kind:'value-update',valueUpdateId:`${id}-u${i}`,value:String(value)}))});
export const S=(id,items)=>({kind:'scope',scopeId:id,scopeState:'released',items});
export const F=(id,name,items,target=null)=>({kind:'stack-frame',stackFrameId:id,name,totalStackFramesAtInsert:0,returnsToVariableId:target,scope:S(`${id}-scope`,items)});
export const H=(address,type,variables,ctor=null)=>({kind:'heap-object',heapObjectId:`heap-${address}`,memoryAddress:address,objectType:type,constructorStackFrameId:ctor,variables});
export const A=(address,type,prefix,values)=>H(address,type,values.map((x,i)=>V(`${prefix}${i}`,String(i),x)));
export const W=(expression,...targets)=>({expression,targets});
export const at=(id,...indices)=>({id,indices});
export const R=(expression,...values)=>({expression,expected:values.map(String)});
export const allVars=scope=>scope.items.flatMap(x=>x.kind==='scope'?allVars(x):[x]);
export const varsOf=p=>[...p.frames.flatMap(f=>allVars(f.scope)),...(p.heap||[]).flatMap(h=>h.variables)];
export function expectedWatch(p,w){
  if(w.expected)return w.expected;
  const vars=new Map(varsOf(p).map(v=>[v.variableId,v.valueUpdates.map(u=>u.value)]));
  return w.targets.flatMap(t=>{const id=typeof t==='string'?t:t.id;const values=vars.get(id);if(!values)throw new Error(`${p.id}: unknown watch ${id}`);return typeof t==='string'?values:t.indices.map(i=>{if(values[i]===undefined)throw new Error(`${p.id}: bad history index ${id}/${i}`);return values[i];});});
}
export function P(ch,n,title,focus,body,frames,heap,io,watches,explanation,extra={}){
 const id=`${ch}-${n}`,className=`P${ch}${String(n).padStart(2,'0')}`;
 return {id,ch,n,title,focus,className,source:`public class ${className} {\n${body}\n}\n`,frames,heap,io,watches,explanation,...extra};
}
export const main=(code)=>`    public static void main(String[] args) throws Exception {\n${code}\n    }`;
export const m=(items)=>F('main','main',items);
export const thisV=(id,addr)=>V(id,'this',addr);
