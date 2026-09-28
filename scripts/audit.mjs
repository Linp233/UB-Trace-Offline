import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readVersion} from '../lib/version.mjs';

const sourceRoot=path.resolve(import.meta.dirname,'..');
const forbiddenTop=new Set(['data','references','.openai','upstream','vendor','node_modules','.vscode','.idea']);
const skippedSource=new Set(['.git','releases','.release-build']);
const forbiddenExtensions=/\.(log|tmp|bak|class|zip|tgz|map|png|jpg|jpeg|webp|har|pfx|p12|key)$/i;
const textExtensions=/\.(md|txt|mjs|js|css|json|html|svg|java|ps1|cmd)$/i;
const checks=[
  ['personal filesystem path',/\b[A-Z]:[\\/]+(?:Users|STU|Documents and Settings)[\\/]+/i],
  ['Unix home path',/(?:^|[\s"'=:(])\/(?:Users|home)\/[a-zA-Z0-9_.-]+\//],
  ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['cloud access key',/\bAKIA[0-9A-Z]{16}\b/],
  ['JWT credential',/\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/],
  ['literal secret',/\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][A-Za-z0-9_+\/=-]{24,}["']/i],
  ['telemetry deployment DSN',/dsn\s*:\s*["']https?:\/\//],
  ['static source map',/^[ \t]*\/\/[#@]\s*sourceMappingURL=/m]
];

export async function audit(root,{packaged=false}={}) {
  root=path.resolve(root);
  const entries=[],failures=[];
  async function visit(dir) {
    for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name),rel=path.relative(root,file).replaceAll('\\','/');
      const top=rel.split('/')[0];
      if(!packaged && skippedSource.has(top))continue;
      if(entry.isSymbolicLink()){failures.push(`${rel}: symbolic link`);continue;}
      if(forbiddenTop.has(top) || entry.name.startsWith('.env') || (packaged && top==='.git')){
        failures.push(`${rel}: private/local file location`);continue;
      }
      if(entry.isDirectory()){await visit(file);continue;}
      if(forbiddenExtensions.test(entry.name))failures.push(`${rel}: unexpected file type`);
      const bytes=await fs.readFile(file);
      if(textExtensions.test(entry.name) || ['LICENSE','.gitignore','.gitattributes'].includes(entry.name)) {
        const text=bytes.toString('utf8');
        for(const [label,pattern] of checks)if(pattern.test(text))failures.push(`${rel}: ${label}`);
        const user=process.env.USERNAME;
        if(user && user.length>=5 && !/^user\d*$/i.test(user) && text.includes(user))failures.push(`${rel}: current OS username`);
      }
      entries.push({path:rel,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
    }
  }
  await visit(root);
  if(failures.length)throw new Error('Privacy audit failed:\n'+failures.join('\n'));
  entries.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  return {files:entries.length,entries};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const packageIndex=process.argv.indexOf('--package');
  const target=packageIndex>=0?process.argv[packageIndex+1]:sourceRoot;
  if(!target)throw new Error('A package directory is required');
  const result=await audit(target,{packaged:packageIndex>=0});
  if(process.argv.includes('--manifest')) {
    const runtime=JSON.parse(await fs.readFile(path.join(target,'runtime/PROVENANCE.json'),'utf8'));
    const executable=result.entries.find(x=>x.path==='runtime/node.exe');
    if(!executable || executable.sha256!==runtime.executableSha256)throw new Error('Runtime provenance does not match node.exe');
    const manifest={format:'tracing-offline-release/v1',version:readVersion(target),platform:'win32-x64',projectLicense:'MIT',licenseScope:'Project-owned contributions only; third-party material retains its original rights and terms.',licenseStatus:'upstream-permission-unresolved',runtime,files:result.entries.filter(x=>x.path!=='release-manifest.json')};
    await fs.writeFile(path.join(target,'release-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  }
  console.log(`Privacy audit passed: ${result.files} files; no forbidden content matched the configured checks.`);
}
