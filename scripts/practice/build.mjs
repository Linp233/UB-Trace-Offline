import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeDocument} from '../../lib/document.mjs';
import {chapters,allVars} from './model.mjs';
import {problems} from './catalog.mjs';
export const root=path.resolve(import.meta.dirname,'../..');
export function sourceFor(p,probe=false){
 return p.source.replace(/\/\*\?([\w-]+):([\s\S]*?)\*\//g,(_,key,condition)=>{
  if(!p.watches[key])throw new Error(`${p.id}: missing watch ${key}`);
  return probe?`TraceProbe.condition("${key}", ${p.watches[key].expression}, ${condition.trim()})`:condition.trim();
 }).replace(/\/\*@([\w-]+)\*\//g,(_,key)=>{
  if(!p.watches[key])throw new Error(`${p.id}: missing watch ${key}`);
  return probe?`TraceProbe.check("${key}", ${p.watches[key].expression});`:'';
 }).split('\n').map(line=>line.trimEnd()).join('\n');
}
export function documentFor(p){
 const frames=structuredClone(p.frames);frames.forEach((f,i)=>f.totalStackFramesAtInsert=i);
 return normalizeDocument({format:'ub-trace-offline/v1',title:`${p.id} ${p.title}`,language:'java',code:sourceFor(p),
  notes:`profile=cse116-java-2026-09-28; checkpoint=normal program exit; input=${Object.keys(p.files||{}).join(',')||'none'}; args=omitted (unused); histories=retained; loopLocals=grouped by declaration; fieldDefaults=observable-only. ${p.explanation} ${p.notes||''}`,
  trace:{kind:'trace',version:'1_0_0',globalVariables:{kind:'scope',scopeId:'globals',scopeState:'active',items:[]},stackFrames:frames,heapObjects:p.heap,ioLines:p.io.map((value,i)=>({kind:'io-line',ioLineId:`io-${i}`,value}))}});
}
const cell=value=>String(value).replaceAll('|','\\|').replaceAll('\n','\\n');
const hist=v=>v.valueUpdates.map(u=>'`'+cell(u.value)+'`').join(' → ')||'尚未赋值';
function scopeRows(scope,label=''){
 return scope.items.flatMap(item=>item.kind==='scope'?scopeRows(item,label+item.scopeId+'/'):[`| ${cell(label+item.name)} | ${hist(item)} |`]);
}
export async function build(){
 const base=path.join(root,'practice');
 for(const folder of ['sources','blank','answers'])await fs.mkdir(path.join(base,folder),{recursive:true});
 const questions=['# Summer 2026 原创 Java trace 练习','', '对应 cse116.com 的授课单元；每单元 5 题，考试日不作为章节。不是官方试题。详细范围与来源见 [目录](README.md)。', '',
 '统一要求：从 main 执行到正常结束，画出完整 Stack / Heap / I/O；保留值历史、已结束作用域和每次自定义调用。地址按 0x100、0x101……分配。忽略未使用的 args 和库内部实现。循环体同一声明位置的变量合并历史。按 [编写指引](../CSE116-TRACE-GUIDE.md) 处理 String、构造器、返回箭头及 static。不要只写输出。', '',
 '先独立完成再查看 [单独的答案册](ANSWERS.md)。每题的空白 JSON 只包含源码，可导入本地工具作答。'];
 const answers=['# Summer 2026 trace 参考答案','', '题目在 [QUESTIONS.md](QUESTIONS.md)。这里列出全部调用帧、变量历史、堆和输出；每题另有可导入 JSON。', '',
 'v0.1 中返回到 Heap 字段的跨列箭头可能被面板裁切（如 04-5、08-5）；JSON 仍保留真实目标，本册逐帧列出返回目标 ID 和变量名，便于核对。', '',
 '所有帧和局部作用域在正常结束时均 released；没有列出的未执行分支不产生变量/帧。方法帧按进入顺序排列，this/super 构造器共享对象。`static:类名` 是明确标记的共享类存储，不算 new 实例。表中的 scope 前缀只用于辨认作用域。验证方式和实际结果见 [VERIFICATION.md](VERIFICATION.md)。'];
 const manifest=[];
 for(const [ch,title,lecture,pdf] of chapters){
  const list=problems.filter(p=>p.ch===ch);if(!list.length)continue;
  for(const doc of [questions,answers])doc.push('',`<a id="chapter-${ch}"></a>`,`## ${ch} ${title}（Lecture ${lecture}）`);
  for(const p of list){
   const source=sourceFor(p),doc=documentFor(p),sourcePath=`sources/${p.className}.java`,answerPath=`answers/${p.id}.json`,blankPath=`blank/${p.id}.json`;
   await fs.writeFile(path.join(base,sourcePath),source);
   await fs.writeFile(path.join(base,answerPath),JSON.stringify(doc,null,2)+'\n');
   await fs.writeFile(path.join(base,blankPath),JSON.stringify(normalizeDocument({title:`${p.id} ${p.title} — 练习`,language:'java',code:source,notes:'Unsolved practice; trace to normal program exit. '+p.focus,diagram:{}}),null,2)+'\n');
   for(const [name,contents] of Object.entries(p.files||{}))await fs.writeFile(path.join(base,'sources',name),contents);
   questions.push('',`### ${p.id} ${p.title}`,'',p.focus,'',`[源码](${sourcePath}) · [空白练习 JSON](${blankPath})`,'');
   if(p.files)questions.push(...Object.entries(p.files).flatMap(([name,contents])=>[`输入文件：[${name}](sources/${name})，运行时放在工作目录。`,'','```text',contents.trimEnd(),'```','']));
   questions.push('```java',source.trimEnd(),'```');
   if(p.task)questions.push('',p.task);
   answers.push('',`### ${p.id} ${p.title}`,'',`[完整答案 JSON](${answerPath}) · [源码](${sourcePath})`,'',p.explanation,'', '**Stack（进入顺序）**');
   const vars=new Map([...doc.trace.stackFrames.flatMap(f=>allVars(f.scope)),...doc.trace.heapObjects.flatMap(h=>h.variables)].map(v=>[v.variableId,v.name]));
   for(const frame of doc.trace.stackFrames){answers.push('',`**${frame.stackFrameId} · ${frame.name}** — 已结束；返回目标：${frame.returnsToVariableId?'`'+frame.returnsToVariableId+'`（'+cell(vars.get(frame.returnsToVariableId))+'）':'无直接变量目标'}。`,'','| 变量 / 作用域 | 值历史 |','|---|---|',...scopeRows(frame.scope));}
   answers.push('','**Heap**');
   if(!doc.trace.heapObjects.length)answers.push('','空。');
   for(const object of doc.trace.heapObjects)answers.push('',`**${object.memoryAddress} · ${object.objectType}**；构造器关联：${object.constructorStackFrameId||'无'}。`,'','| 字段 / 元素 | 值历史 |','|---|---|',...object.variables.map(v=>`| ${cell(v.name)} | ${hist(v)} |`));
   answers.push('','**I/O**','','```text',p.io.join('\n'),'```');
   if(p.notes)answers.push('',p.notes);
   manifest.push({id:p.id,chapter:ch,title:p.title,source:sourcePath,blank:blankPath,answer:answerPath,files:Object.keys(p.files||{})});
  }
 }
 await fs.writeFile(path.join(base,'QUESTIONS.md'),questions.join('\n')+'\n');
 await fs.writeFile(path.join(base,'ANSWERS.md'),answers.join('\n')+'\n');
 await fs.writeFile(path.join(base,'manifest.json'),JSON.stringify({format:'cse116-original-practice/v1',chapters:chapters.map(([id,title,lecture,pdf])=>({id,title,lecture,source:pdf?`https://cse116.com/static_files/slides/${pdf}`:'https://cse116.com/'})),problems:manifest},null,2)+'\n');
 const index=['# Summer 2026 原创 trace 题库','',`共 ${manifest.length} 题。按 [cse116.com Summer 2026](https://cse116.com/) 的 10 个授课单元组织，每章 5 题；Lecture 9 和 12 是考试，不另设练习章节。Lecture 1 与 2 分别覆盖基础语法和集合/文件。`, '',
 '这些是为离线工具原创的练习，不是复制的课堂题、官方题库或考试预测。问题与答案独立存放。', '',
 '- [题目册 QUESTIONS.md](QUESTIONS.md)：完整源码、固定输入、空白 JSON。',
 '- [答案册 ANSWERS.md](ANSWERS.md)：全部帧、作用域、堆、历史值、I/O 和可导入答案。',
 '- [验证记录 VERIFICATION.md](VERIFICATION.md)：编译、原程序输出和临时观测副本的历史比对。',
 '- [导入与界面抽查 IMPORT-CHECK.md](IMPORT-CHECK.md)：50 份答案导入往返、两道复杂题的界面抽查及显示限制。',
 '- [Agent 公开入口](../AGENT-START.md)：可随仓库分发，不依赖 AGENTS.md。','',
 '| 章节 | 课程单元 / 主要课件 | 题目 | 答案 |','|---|---|---|---|',...chapters.map(([id,title,lecture,pdf])=>`| ${id} ${title} | [Lecture ${lecture}](${pdf?'https://cse116.com/static_files/slides/'+pdf:'https://cse116.com/'}) | [5 题](QUESTIONS.md#chapter-${id}) | [参考答案](ANSWERS.md#chapter-${id}) |`),'',
 '使用方法：启动应用，在默认 [本地地址](http://127.0.0.1:4173/) 导入 blank 中对应题目的 JSON；完成后另开答案 JSON 比较。需要编译运行时，使用 sources 中的同名 Java 文件；CSV 输入题的文件必须置于运行工作目录。', '',
 '测试章节用可直接运行的布尔测试驱动表达断言结果，不依赖 JUnit 安装；比较器章节明确给出调用和排序步骤，避免依赖库排序实现的调用次序；图题固定邻居次序；运行时间题明确统计哪一步操作。', '',
 '维护：`runtime/node.exe scripts/practice/build.mjs` 重建文档与 JSON；`runtime/node.exe scripts/practice/verify.mjs` 用 JDK 重新验证。维护脚本保留在源码仓库；便携包提供现成题目和答案，无需安装 Java 才能使用编辑器。'];
 await fs.writeFile(path.join(base,'README.md'),index.join('\n')+'\n');
 console.log(`Built ${manifest.length} original trace exercises.`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
