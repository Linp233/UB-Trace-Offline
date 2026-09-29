import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {LANGUAGE_KEY, languages, messages, translate, readLanguagePreference, writeLanguagePreference} from '../dist/i18n.mjs';

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values};
}

test('new and invalid preferences default to English and request an explicit first-run choice', () => {
  for (const value of [null, '', 'fr', 'java', '"en"']) {
    const store = storage(value === null ? {} : {[LANGUAGE_KEY]: value});
    assert.deepEqual(readLanguagePreference(() => store), {language: 'en', needsChoice: true});
    assert.equal(store.getItem(LANGUAGE_KEY), value); // Reading never dismisses first-run setup.
  }
});

test('each saved language survives a new read without modifying source language or drafts', () => {
  const store = storage({'practice-code-language-v1': '"python"', 'offline-trace-autosave-v1': '{"title":"我的 trace"}'});
  for (const {id} of languages) {
    assert.equal(writeLanguagePreference(id, () => store), true);
    assert.deepEqual(readLanguagePreference(() => store), {language: id, needsChoice: false});
    assert.equal(store.getItem('practice-code-language-v1'), '"python"');
    assert.equal(store.getItem('offline-trace-autosave-v1'), '{"title":"我的 trace"}');
  }
  assert.throws(() => writeLanguagePreference('fr', () => store), RangeError);
  assert.equal(store.getItem(LANGUAGE_KEY), 'zh-CN');
});

test('unavailable storage and failed writes are recoverable without claiming persistence', () => {
  const denied = () => { throw new Error('Storage disabled'); };
  const full = () => ({getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); }});
  assert.deepEqual(readLanguagePreference(denied), {language: 'en', needsChoice: true});
  assert.equal(writeLanguagePreference('zh-CN', denied), false);
  assert.equal(writeLanguagePreference('en', full), false);
});

test('both catalogs cover the same messages and placeholders; English has no Chinese UI copy', () => {
  const keys = Object.keys(messages.en).sort();
  assert.deepEqual(Object.keys(messages['zh-CN']).sort(), keys);
  for (const key of keys) {
    assert.ok(messages.en[key].trim(), key);
    assert.ok(messages['zh-CN'][key].trim(), key);
    assert.doesNotMatch(messages.en[key], /\p{Script=Han}/u, key);
    const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(messages.en[key]), placeholders(messages['zh-CN'][key]), key);
  }
  assert.equal(translate('en', 'importFailed', {detail: 'Invalid document'}), 'Import failed: Invalid document');
  assert.equal(translate('zh-CN', 'importFailed', {detail: 'Invalid document'}), '导入失败：Invalid document');
  assert.equal(translate('unsupported', 'language'), 'Language');
  assert.throws(() => translate('en', 'misspelled-key'), /Unknown interface message/);
});

test('early boot agrees with the language preference and restores an existing Python draft', async () => {
  const script = await fs.readFile(new URL('../dist/boot.js', import.meta.url), 'utf8');
  const draft = {title: 'Keep my title', language: 'python', trace: {kind: 'trace'}};
  for (const choice of [null, 'en', 'zh-CN', 'invalid']) {
    const store = storage({'offline-trace-autosave-v1': JSON.stringify(draft), ...(choice ? {[LANGUAGE_KEY]: choice} : {})});
    const context = {document: {documentElement: {}}, localStorage: store, window: {}, console};
    vm.runInNewContext(script, context);
    assert.equal(context.document.documentElement.lang, readLanguagePreference(() => store).language);
    assert.equal(JSON.stringify(context.window.OfflineTraceBoot), JSON.stringify(draft));
    assert.equal(store.getItem('practice-code-language-v1'), '"python"');
  }
  const context = {document: {documentElement: {}}, window: {}, console: {warn() {}}};
  Object.defineProperty(context, 'localStorage', {get() {throw new Error('Storage disabled');}});
  vm.runInNewContext(script, context);
  assert.equal(context.document.documentElement.lang, 'en');
});

test('static and hydrated page titles both use English', async () => {
  const html = await fs.readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const app = await fs.readFile(new URL('../dist/_next/static/chunks/pages/_app-104129983f63fe39.js', import.meta.url), 'utf8');
  assert.match(html, /<title>Tracing Offline — Local practice<\/title>/);
  assert.match(app, /children:"Tracing Offline — Local practice"/);
  assert.doesNotMatch(html + app, /Tracing Offline — 本地练习/);
});
