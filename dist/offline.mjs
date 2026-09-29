import {normalizeDocument, emptyDocument} from './lib/document.mjs';
import {languages, translate, readLanguagePreference, writeLanguagePreference} from './i18n.mjs';

const preference = readLanguagePreference();
let language = preference.language;
const t = (key, values) => translate(language, key, values);
let current = {title: window.OfflineTraceBoot?.title || 'Untitled', notes: window.OfflineTraceBoot?.notes || ''};
let lastSnapshot = '', saveTimer, initialized = false, dialogNumber = 0;
let currentMessage = {key: 'loading', values: {}, error: false};
const bar = document.querySelector('#offline-bar');
bar.innerHTML = `<strong data-label="brand"></strong><button id="offline-language" data-label="language"></button><input id="offline-title" maxlength="150"/><button id="offline-save" data-label="save"></button><button id="offline-open" data-label="open"></button><select id="offline-examples"><option value="" data-label="examples"></option><option value="practice1"></option><option value="practice2"></option><option value="practice3"></option></select><button id="offline-new" data-label="new"></button><button id="offline-import" data-label="import"></button><button id="offline-paste" data-label="paste"></button><button id="offline-json" data-label="json"></button><button id="offline-png" data-label="png"></button><button id="offline-help" data-label="help"></button><span class="offline-status" role="status" aria-live="polite"></span>`;
const titleInput = bar.querySelector('#offline-title');
titleInput.value = current.title;
const status = bar.querySelector('.offline-status');

function renderStatus() {
  status.textContent = currentMessage.key ? t(currentMessage.key, currentMessage.values) : currentMessage.text;
  status.classList.toggle('offline-error', currentMessage.error);
}
function message(key, error = false, values = {}) {
  currentMessage = {key, values, error};
  renderStatus();
}
class InterfaceError extends Error {
  constructor(key, cause) { super(t(key), {cause}); this.key = key; }
}
function errorText(error) { return error instanceof InterfaceError ? t(error.key) : error.message; }
function reportError(error) {
  if (error instanceof InterfaceError) message(error.key, true);
  else { currentMessage = {text: error.message, error: true}; renderStatus(); }
}
function applyLanguage() {
  document.documentElement.lang = language;
  for (const element of bar.querySelectorAll('[data-label]')) element.textContent = t(element.dataset.label);
  titleInput.setAttribute('aria-label', t('titleLabel'));
  const examples = bar.querySelector('#offline-examples');
  examples.setAttribute('aria-label', t('examples'));
  for (const n of [1, 2, 3]) examples.querySelector(`[value="practice${n}"]`).textContent = `${n} · ${t('practice' + n)}`;
  renderStatus();
}
applyLanguage();
// Wrapping keeps every action reachable when translated labels take more space.
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--offline-height', `${bar.getBoundingClientRect().height}px`);
}).observe(bar);

function snapshot() {
  const bridge = window.__offlineTraceBridge;
  if (!bridge) throw new InterfaceError('editorLoading');
  return normalizeDocument({...current, ...bridge.get(), title: titleInput.value.trim() || 'Untitled'});
}
async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}
const post = (url, doc) => request(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(doc)});
function dialog(title) {
  const el = document.createElement('dialog');
  el.className = 'offline-dialog';
  const heading = document.createElement('h2');
  heading.id = `offline-dialog-title-${++dialogNumber}`;
  heading.textContent = title;
  el.setAttribute('aria-labelledby', heading.id);
  el.append(heading);
  el.addEventListener('close', () => el.remove());
  document.body.append(el);
  return el;
}
function button(text, action) {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = text;
  b.addEventListener('click', action);
  return b;
}
function footer(el, buttons = []) {
  const f = document.createElement('footer');
  f.append(...buttons, button(t('close'), () => el.close()));
  el.append(f);
}
function languageDialog(firstRun = false) {
  const el = dialog('');
  el.classList.add('offline-language-dialog');
  let selected = language;
  const heading = el.querySelector('h2');
  const intro = document.createElement('p'), scope = document.createElement('p'), remember = document.createElement('p');
  const choices = document.createElement('div');
  choices.className = 'offline-language-options';
  choices.setAttribute('role', 'radiogroup');
  choices.setAttribute('aria-labelledby', heading.id);
  const confirm = button('', () => {
    const persisted = writeLanguagePreference(selected);
    language = selected;
    applyLanguage();
    message(persisted ? 'languageSaved' : 'languageSession', !persisted);
    el.close();
    bar.querySelector('#offline-language').focus();
  });
  confirm.className = 'offline-primary';
  const cancel = button('', () => el.close());
  function renderChoice() {
    const local = key => translate(selected, key);
    el.lang = selected;
    heading.textContent = local(firstRun ? 'chooseLanguage' : 'languageTitle');
    intro.textContent = local(firstRun ? 'languageIntro' : 'languageScope');
    scope.textContent = local('languageScope');
    remember.textContent = local('languageRemember');
    confirm.textContent = local(firstRun ? 'continue' : 'apply');
    cancel.textContent = local('cancel');
  }
  for (const choice of languages) {
    const label = document.createElement('label'); label.lang = choice.id;
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'offline-ui-language'; input.value = choice.id;
    input.checked = choice.id === selected;
    input.addEventListener('change', () => { selected = input.value; renderChoice(); });
    label.append(input, document.createTextNode(choice.name)); choices.append(label);
  }
  const f = document.createElement('footer');
  if (!firstRun) f.append(cancel);
  f.append(confirm);
  el.append(intro, choices);
  if (firstRun) el.append(scope);
  el.append(remember, f);
  if (firstRun) el.addEventListener('cancel', event => event.preventDefault());
  renderChoice(); el.showModal();
  choices.querySelector(':checked').focus();
}

function storeDraft(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}
async function saveDraft(force = false) {
  if (!initialized) return;
  const doc = snapshot(), serialized = JSON.stringify(doc);
  if (!force && serialized === lastSnapshot) return;
  const browserSaved = storeDraft('offline-trace-autosave-v1', serialized);
  try {
    await post('/api/draft', doc); lastSnapshot = serialized;
    message(browserSaved ? 'saved' : 'diskSaved');
  } catch (error) {
    const failure = new InterfaceError(browserSaved ? 'diskFailed' : 'saveFailed', error);
    reportError(failure); throw failure;
  }
}
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveDraft().catch(console.warn), 650); }
async function load(input) {
  const doc = normalizeDocument(input); // Validate everything before modifying the current editor.
  if (initialized) {
    await saveDraft(); const previous = snapshot();
    storeDraft('offline-trace-previous-v1', JSON.stringify(previous));
    await post('/api/library', previous);
  }
  current = {title: doc.title, notes: doc.notes}; titleInput.value = doc.title;
  window.__offlineTraceBridge.set(doc);
  lastSnapshot = ''; initialized = true;
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await saveDraft(true);
  document.title = `${doc.title} — Tracing Offline`;
}
async function loadExample(name) {
  const doc = await request('/examples/' + name + '.json');
  // Localize only the built-in example being opened, never an existing user document.
  await load({...doc, title: t(name)});
}
function download(blob, extension) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = (titleInput.value.trim() || 'trace').replace(/[<>:"/\\|?*]/g, '_') + extension;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function bind(id, fn) { bar.querySelector(id).addEventListener('click', () => Promise.resolve().then(fn).catch(reportError)); }
bind('#offline-language', () => languageDialog());
bind('#offline-save', async () => { await saveDraft(true); await post('/api/library', snapshot()); message('copySaved'); });
bind('#offline-open', async () => {
  const list = await request('/api/library'), el = dialog(t('libraryTitle'));
  const container = document.createElement('div'); container.className = 'offline-library';
  if (!list.length) container.textContent = t('libraryEmpty');
  for (const entry of list) {
    container.append(button(`${entry.title} · ${new Date(entry.modified).toLocaleString(language)}`, async () => {
      try { await load(await request('/api/library/' + entry.id)); el.close(); } catch (error) { reportError(error); }
    }));
  }
  el.append(container); footer(el); el.showModal();
});
bar.querySelector('#offline-examples').addEventListener('change', async event => {
  try { if (event.target.value) await loadExample(event.target.value); }
  catch (error) { reportError(error); }
  finally { event.target.value = ''; }
});
bind('#offline-new', () => load({...emptyDocument(snapshot().language), title: t('untitled')}));
bind('#offline-import', () => {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    try { if (input.files[0]) await load(JSON.parse(await input.files[0].text())); }
    catch (error) { message('importFailed', true, {detail: errorText(error)}); }
  });
  input.click();
});
bind('#offline-paste', () => {
  const el = dialog(t('pasteTitle')), p = document.createElement('p'); p.textContent = t('pasteDescription');
  const area = document.createElement('textarea'); area.setAttribute('aria-label', t('jsonLabel')); area.spellcheck = false;
  const error = document.createElement('p'); error.className = 'offline-error'; error.setAttribute('role', 'alert');
  el.append(p, area, error);
  footer(el, [button(t('loadDiagram'), async () => {
    try { await load(JSON.parse(area.value)); el.close(); }
    catch (failure) { error.textContent = t('importFailed', {detail: errorText(failure)}); }
  })]);
  el.showModal(); area.focus();
});
bind('#offline-json', () => download(new Blob([JSON.stringify(snapshot(), null, 2)], {type: 'application/json'}), '.json'));
bind('#offline-png', async () => {
  if (!window.htmlToImage) throw new InterfaceError('pngLoading');
  document.activeElement?.blur(); await saveDraft(); message('pngExporting');
  const element = document.querySelector('#__next');
  const data = await window.htmlToImage.toPng(element, {pixelRatio: 2, backgroundColor: document.documentElement.dataset.mantineColorScheme === 'light' ? '#ffffff' : '#0f1014', skipFonts: true});
  const bytes = Uint8Array.from(atob(data.split(',')[1]), char => char.charCodeAt(0));
  await request('/api/export-png', {method: 'POST', headers: {'Content-Type': 'image/png'}, body: bytes});
  download(new Blob([bytes], {type: 'image/png'}), '.png'); message('pngSaved');
});
bind('#offline-help', () => {
  const el = dialog(t('helpTitle'));
  for (const key of ['helpEditor', 'helpSaving', 'helpAI', 'helpLimits', 'helpLanguage']) {
    const p = document.createElement('p'); p.textContent = t(key); el.append(p);
  }
  footer(el); el.showModal();
});
titleInput.addEventListener('input', scheduleSave);
window.addEventListener('offline-trace-change', scheduleSave);
window.addEventListener('pagehide', () => {
  if (initialized) { try { storeDraft('offline-trace-autosave-v1', JSON.stringify(snapshot())); } catch {} }
});
setInterval(() => { if (initialized) saveDraft().catch(console.warn); }, 1800);
if (preference.needsChoice) languageDialog(true);

async function initialize() {
  for (let attempts = 0; !window.__offlineTraceBridge && attempts < 300; attempts++) await new Promise(resolve => setTimeout(resolve, 100));
  if (!window.__offlineTraceBridge) throw new InterfaceError('editorFailed');
  const query = new URLSearchParams(location.search);
  // Activate the current draft before a requested import, so switching documents preserves it.
  initialized = true;
  if (query.has('document')) {
    await load(await request('/api/library/' + encodeURIComponent(query.get('document'))));
    history.replaceState(null, '', location.pathname);
  } else if (query.has('example') && /^practice[123]$/.test(query.get('example'))) {
    await loadExample(query.get('example')); history.replaceState(null, '', location.pathname);
  } else if (!window.OfflineTraceBoot) {
    const disk = await request('/api/draft');
    if (disk) { initialized = false; await load(disk); } else await saveDraft(true);
  } else await saveDraft(true);
}
initialize().catch(reportError);
