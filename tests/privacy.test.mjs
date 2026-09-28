import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {audit} from '../scripts/audit.mjs';

async function fixture(action) {
  const base=path.resolve(os.tmpdir());
  const dir=await fs.mkdtemp(path.join(base,'tracing-privacy-test-'));
  try {await action(dir);} finally {
    if(path.dirname(path.resolve(dir))!==base)throw new Error('Unsafe test cleanup path');
    await fs.rm(dir,{recursive:true,force:true});
  }
}

test('audit rejects personal data directories and synthetic credentials',async()=>{
  await fixture(async dir=>{
    await fs.mkdir(path.join(dir,'data'));
    await fs.writeFile(path.join(dir,'data/draft.json'),'{}');
    await assert.rejects(audit(dir,{packaged:true}),/private\/local file location/);
  });
  await fixture(async dir=>{
    await fs.writeFile(path.join(dir,'settings.json'),JSON.stringify({token:'ghp_'+'a'.repeat(40)}));
    await assert.rejects(audit(dir,{packaged:true}),/GitHub token/);
  });
});

test('audit detects user paths without rejecting public documentation URLs',async()=>{
  await fixture(async dir=>{
    await fs.writeFile(path.join(dir,'README.md'),'Reference: https://example.org/en/home/tables/reference.html');
    assert.equal((await audit(dir,{packaged:true})).files,1);
    await fs.writeFile(path.join(dir,'README.md'),'C:'+String.fromCharCode(92)+'Users'+String.fromCharCode(92)+'sample-person');
    await assert.rejects(audit(dir,{packaged:true}),/personal filesystem path/);
  });
});
