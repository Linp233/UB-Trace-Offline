import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
let changed=0;
async function visit(dir) {
  for (const item of await fs.readdir(dir,{withFileTypes:true})) {
    const file=path.join(dir,item.name);
    if (item.isDirectory()) await visit(file);
    else if (/\.(js|css)$/.test(item.name)) {
      const before=await fs.readFile(file,'utf8');
      const after=before
        .replace(/dsn\s*:\s*"https?:\/\/[^"\s]+"/g,'dsn:void 0')
        .replace(/^[ \t]*\/\/[#@]\s*sourceMappingURL=[^\r\n]*\r?$/gm,'')
        .replace(/\/\*[#@]\s*sourceMappingURL=[^*]*\*\//g,'');
      if (after!==before) {await fs.writeFile(file,after); changed++;}
    }
  }
}
await visit(path.join(root,'dist'));
// The removed monitoring component rendered this empty Suspense boundary.
// Its server-rendered placeholder must be removed too, to keep hydration aligned.
const htmlFile=path.join(root,'dist/index.html');
const html=await fs.readFile(htmlFile,'utf8');
await fs.writeFile(htmlFile,html.replace('<!--$--><!--/$-->',''));
await fs.copyFile(path.join(root,'lib/document.mjs'),path.join(root,'dist/lib/document.mjs'));
console.log(`Sanitized ${changed} static assets; synchronized the document adapter.`);
