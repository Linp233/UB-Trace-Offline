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
const files=['config.mjs','server.mjs','lib/document.mjs','lib/version.mjs','dist/offline.mjs','dist/boot.js','tools/import.mjs'];
for(const item of await fs.readdir(path.join(root,'scripts')))if(item.endsWith('.mjs'))files.push('scripts/'+item);
for(const ref of refs.filter(ref=>ref.endsWith('.js')))files.push('dist'+ref);
for(const file of files){const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});if(result.status!==0)throw new Error(file+'\n'+result.stderr);}
for(const n of [1,2,3])normalizeDocument(JSON.parse(await fs.readFile(path.join(root,`dist/examples/practice${n}.json`),'utf8')));
for(const p of ['dist/vendor/monaco/vs/loader.js','dist/vendor/monaco/vs/editor/editor.main.js','dist/vendor/html-to-image.js'])await fs.access(path.join(root,p));
if(await fs.readFile(path.join(root,'lib/document.mjs'),'utf8')!==await fs.readFile(path.join(root,'dist/lib/document.mjs'),'utf8'))throw new Error('Browser and server adapters differ');
console.log(`v${version}: ${refs.length} local assets, ${files.length} JavaScript syntax checks and three generic examples passed.`);
