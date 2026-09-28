import {normalizeDocument,emptyDocument} from './lib/document.mjs';
let current={title:window.OfflineTraceBoot?.title||'Untitled',notes:window.OfflineTraceBoot?.notes||''};
let lastSnapshot='',saveTimer,initialized=false;
const bar=document.querySelector('#offline-bar');
bar.innerHTML=`<strong>Tracing · 离线</strong><input id="offline-title" aria-label="练习名称" maxlength="150"/><button id="offline-save">保存副本</button><button id="offline-open">打开</button><select id="offline-examples" aria-label="示例练习"><option value="">示例 / Examples</option><option value="practice1">1 · 变量更新 / Updates</option><option value="practice2">2 · 共享引用 / Aliases</option><option value="practice3">3 · 循环作用域 / Loop</option></select><button id="offline-new">新练习</button><button id="offline-import">导入 JSON</button><button id="offline-paste">粘贴图表</button><button id="offline-json">导出 JSON</button><button id="offline-png">导出 PNG</button><button id="offline-help">帮助</button><span class="offline-status" role="status" aria-live="polite">正在加载…</span>`;
const titleInput=bar.querySelector('#offline-title');titleInput.value=current.title;
const status=bar.querySelector('.offline-status');
function message(text,error=false){status.textContent=text;status.classList.toggle('offline-error',error);}
function snapshot(){const bridge=window.__offlineTraceBridge;if(!bridge)throw new Error('编辑器仍在加载，请稍后再试');return normalizeDocument({...current,...bridge.get(),title:titleInput.value.trim()||'Untitled'});}
async function request(url,options){const response=await fetch(url,options);const body=await response.json();if(!response.ok)throw new Error(body.error||`HTTP ${response.status}`);return body;}
const post=(url,doc)=>request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)});
function dialog(title){const el=document.createElement('dialog');el.className='offline-dialog';const heading=document.createElement('h2');heading.textContent=title;el.append(heading);el.addEventListener('close',()=>el.remove());document.body.append(el);return el;}
function button(text,action){const b=document.createElement('button');b.textContent=text;b.addEventListener('click',action);return b;}
function footer(el,buttons=[]){const f=document.createElement('footer');f.append(...buttons,button('关闭',()=>el.close()));el.append(f);}
async function saveDraft(force=false){
  if(!initialized)return;
  const doc=snapshot(),serialized=JSON.stringify(doc);
  if(!force && serialized===lastSnapshot)return;
  localStorage.setItem('offline-trace-autosave-v1',serialized);
  try{await post('/api/draft',doc);lastSnapshot=serialized;message('已自动保存');}
  catch(e){message('已存浏览器 · 磁盘保存失败',true);throw e;}
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveDraft().catch(e=>console.warn(e)),650);}
async function load(input){
  const doc=normalizeDocument(input); // Validate everything before modifying the current editor.
  if(initialized){await saveDraft();const previous=snapshot();localStorage.setItem('offline-trace-previous-v1',JSON.stringify(previous));await post('/api/library',previous);}
  current={title:doc.title,notes:doc.notes};titleInput.value=doc.title;
  window.__offlineTraceBridge.set(doc);
  lastSnapshot='';initialized=true;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  await saveDraft(true);
  document.title=`${doc.title} — Tracing Offline`;
}
function download(blob,extension){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=(titleInput.value.trim()||'trace').replace(/[<>:"/\\|?*]/g,'_')+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function bind(id,fn){bar.querySelector(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>message(e.message,true)));}
bind('#offline-save',async()=>{await saveDraft(true);await post('/api/library',snapshot());message('副本已保存到本机');});
bind('#offline-open',async()=>{
  const list=await request('/api/library');const el=dialog('本机保存的练习');const container=document.createElement('div');container.className='offline-library';
  if(!list.length)container.textContent='还没有保存的副本。当前草稿会自动保存。';
  for(const entry of list){container.append(button(`${entry.title} · ${new Date(entry.modified).toLocaleString()}`,async()=>{try{await load(await request('/api/library/'+entry.id));el.close();}catch(e){message(e.message,true);}}));}
  el.append(container);footer(el);el.showModal();
});
bar.querySelector('#offline-examples').addEventListener('change',async event=>{try{if(event.target.value)await load(await request('/examples/'+event.target.value+'.json'));}catch(e){message(e.message,true);}finally{event.target.value='';}});
bind('#offline-new',()=>load(emptyDocument(snapshot().language)));
bind('#offline-import',()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.addEventListener('change',async()=>{try{if(input.files[0])await load(JSON.parse(await input.files[0].text()));}catch(e){message('导入失败：'+e.message,true);}});input.click();});
bind('#offline-paste',()=>{
  const el=dialog('粘贴图表 JSON');const p=document.createElement('p');p.textContent='粘贴生成的图表数据。导入后仍能用原界面编辑；当前练习会先保存为副本。';
  const area=document.createElement('textarea');area.setAttribute('aria-label','图表 JSON');area.spellcheck=false;
  const error=document.createElement('p');error.className='offline-error';
  el.append(p,area,error);footer(el,[button('载入图表',async()=>{try{await load(JSON.parse(area.value));el.close();}catch(e){error.textContent=e.message;}})]);el.showModal();area.focus();
});
bind('#offline-json',()=>download(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}),'.json'));
bind('#offline-png',async()=>{
  if(!window.htmlToImage)throw new Error('PNG 导出组件尚未加载');
  document.activeElement?.blur();await saveDraft();message('正在导出 PNG…');
  const element=document.querySelector('#__next');
  const data=await window.htmlToImage.toPng(element,{pixelRatio:2,backgroundColor:document.documentElement.dataset.mantineColorScheme==='light'?'#ffffff':'#0f1014',skipFonts:true});
  const bytes=Uint8Array.from(atob(data.split(',')[1]),char=>char.charCodeAt(0));
  await request('/api/export-png',{method:'POST',headers:{'Content-Type':'image/png'},body:bytes});
  download(new Blob([bytes],{type:'image/png'}),'.png');message('PNG 已保存到本机');
});
bind('#offline-help',()=>{
  const el=dialog('练习与生成图表');
  const p=document.createElement('div');p.innerHTML='<p>Stack、Heap、IO 和代码编辑器沿用原网站。点击变量名和值可编辑；“＋”追加历史值；红叉表示作用域结束；返回箭头可连到接收返回值的变量。</p><p>当前代码和图表自动保存到浏览器及本机。切换练习前会自动保存副本。“保存副本”可保留命名版本；JSON 文件可以备份和传给助手。</p><p>让助手根据源码做图：提供完整源码、入口和输入、停止位置（如“运行结束”或“第 12 行之后”），以及是否保留历史值和已结束的作用域。助手可以生成 JSON，再通过“导入 JSON”或“粘贴图表”载入。</p><p>本工具是手动 tracing 编辑器，不会执行源码或自动证明答案正确。内置示例是通用演示，不包含课程截图或个人练习。PNG 导出当前可见区域；完整内容请保留 JSON，或先调整面板大小。</p>';
  el.append(p);footer(el);el.showModal();
});
titleInput.addEventListener('input',scheduleSave);
window.addEventListener('offline-trace-change',scheduleSave);
window.addEventListener('pagehide',()=>{if(initialized){try{localStorage.setItem('offline-trace-autosave-v1',JSON.stringify(snapshot()));}catch{}}});
setInterval(()=>{if(initialized)saveDraft().catch(e=>console.warn(e));},1800);

async function initialize(){
  for(let attempts=0;!window.__offlineTraceBridge && attempts<300;attempts++)await new Promise(resolve=>setTimeout(resolve,100));
  if(!window.__offlineTraceBridge)throw new Error('编辑器未能加载，请查看本机服务日志');
  const query=new URLSearchParams(location.search);
  // Activate the current draft before a requested import, so switching documents preserves it.
  initialized=true;
  if(query.has('document')){await load(await request('/api/library/'+encodeURIComponent(query.get('document'))));history.replaceState(null,'',location.pathname);}
  else if(query.has('example') && /^practice[123]$/.test(query.get('example'))){await load(await request('/examples/'+query.get('example')+'.json'));history.replaceState(null,'',location.pathname);}
  else if(!window.OfflineTraceBoot){const disk=await request('/api/draft');if(disk){initialized=false;await load(disk);}else await saveDraft(true);}
  else await saveDraft(true);
  message('已自动保存');
}
initialize().catch(e=>message(e.message,true));
