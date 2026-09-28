import fs from 'node:fs/promises';
import path from 'node:path';
import {normalizeDocument} from '../lib/document.mjs';
const args=process.argv.slice(2);
if(!args[0]){console.error('Usage: node tools/import.mjs <document.json> [--output <normalized.json>]');process.exit(1);}
const doc=normalizeDocument(JSON.parse(await fs.readFile(path.resolve(args[0]),'utf8')));
const outIndex=args.indexOf('--output');
if(outIndex>=0){if(!args[outIndex+1])throw new Error('Missing output path');await fs.writeFile(path.resolve(args[outIndex+1]),JSON.stringify(doc,null,2));console.log(path.resolve(args[outIndex+1]));}
else{
  const {config}=await import('../config.mjs');
  const response=await fetch(`${config.baseUrl}/api/library`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)});
  const result=await response.json();if(!response.ok)throw new Error(result.error);
  console.log(`Saved: ${doc.title}\nOpen: ${result.url}`);
}
