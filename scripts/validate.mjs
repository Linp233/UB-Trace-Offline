import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {normalizeDocument} from '../lib/document.mjs';
import {readVersion} from '../lib/version.mjs';
import '../config.mjs';
const root=path.resolve(import.meta.dirname,'..');
const version=readVersion(root);
const html=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
const refs=[...html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map(m=>m[1]);
for(const ref of refs)await fs.access(path.join(root,'dist',ref));
const files=['config.mjs','server.mjs','lib/document.mjs','lib/version.mjs','dist/offline.mjs','dist/i18n.mjs','dist/boot.js','tools/import.mjs'];
for(const item of await fs.readdir(path.join(root,'scripts'),{recursive:true}))if(item.endsWith('.mjs'))files.push('scripts/'+item);
for(const ref of refs.filter(ref=>ref.endsWith('.js')))files.push('dist'+ref);
for(const file of files){const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(result.status!==0)throw new Error(file+'\n'+result.stderr);}
for(const n of [1,2,3])normalizeDocument(JSON.parse(await fs.readFile(path.join(root,`dist/examples/practice${n}.json`),'utf8')));
for(const name of ['agent-oop','agent-recursion'])normalizeDocument(JSON.parse(await fs.readFile(path.join(root,`examples/${name}.trace.json`),'utf8')));
const practice=JSON.parse(await fs.readFile(path.join(root,'practice/manifest.json'),'utf8'));
if(practice.chapters.length!==10||practice.problems.length!==50)throw new Error('Expected ten chapters and fifty practice exercises');
for(const chapter of practice.chapters)if(practice.problems.filter(p=>p.chapter===chapter.id).length!==5)throw new Error(`Chapter ${chapter.id} must contain five exercises`);
for(const p of practice.problems){
 const source=(await fs.readFile(path.join(root,'practice',p.source),'utf8')).replaceAll('\r\n','\n');
 for(const file of [p.blank,p.answer]){
  const doc=normalizeDocument(JSON.parse(await fs.readFile(path.join(root,'practice',file),'utf8')));
  if(doc.code!==source)throw new Error(`${file}: source mismatch`);
 }
 for(const file of p.files)await fs.access(path.join(root,'practice/sources',file));
}
for(const p of ['dist/vendor/monaco/vs/loader.js','dist/vendor/monaco/vs/editor/editor.main.js','dist/vendor/html-to-image.js'])await fs.access(path.join(root,p));
if(await fs.readFile(path.join(root,'lib/document.mjs'),'utf8')!==await fs.readFile(path.join(root,'dist/lib/document.mjs'),'utf8'))throw new Error('Browser and server adapters differ');
console.log(`v${version}: ${refs.length} local assets, ${files.length} JavaScript syntax checks, three basic examples, two agent reference examples and 50 blank/answer pairs passed.`);
