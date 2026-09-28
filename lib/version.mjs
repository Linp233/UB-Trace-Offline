import fs from 'node:fs';
import path from 'node:path';

export function readVersion(root) {
  const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').replace(/^\uFEFF/,'').trim();
  if(!/^\d+\.\d+(?:\.\d+)?$/.test(version))throw new Error('VERSION must contain a release number such as 0.1 or 0.1.1.');
  return version;
}
