// Interface language is independent of the Java/Python document language.
export const LANGUAGE_KEY = 'offline-trace-ui-language-v1';
export const DEFAULT_LANGUAGE = 'en';
export const languages = Object.freeze([
  {id: 'en', name: 'English'},
  {id: 'zh-CN', name: '简体中文'}
]);

export const messages = {
  en: {
    brand: 'Tracing · Offline', titleLabel: 'Exercise title', untitled: 'Untitled',
    language: 'Language', save: 'Save copy', open: 'Open', examples: 'Examples',
    practice1: 'Variable updates', practice2: 'Shared references', practice3: 'Loop scope',
    new: 'New', import: 'Import JSON', paste: 'Paste diagram', json: 'Export JSON',
    png: 'Export PNG', help: 'Help', loading: 'Loading…', saved: 'Autosaved',
    diskSaved: 'Saved to disk · browser storage unavailable',
    diskFailed: 'Saved in browser · disk save failed', saveFailed: 'Could not save the draft',
    copySaved: 'Copy saved on this computer', close: 'Close',
    libraryTitle: 'Saved exercises', libraryEmpty: 'No saved copies yet. Your current draft is saved automatically.',
    pasteTitle: 'Paste diagram JSON',
    pasteDescription: 'Paste generated diagram data. You can continue editing after import. A copy of your current exercise will be saved first.',
    jsonLabel: 'Diagram JSON', loadDiagram: 'Load diagram', importFailed: 'Import failed: {detail}',
    editorLoading: 'The editor is still loading. Please try again shortly.',
    editorFailed: 'The editor could not load. Check the local service log.',
    pngLoading: 'The PNG export component has not loaded yet.',
    pngExporting: 'Exporting PNG…', pngSaved: 'PNG saved on this computer',
    helpTitle: 'Practicing and generating diagrams',
    helpEditor: 'Stack, Heap, IO and the code editor use the original interface. Click variable names and values to edit them. Use “+” to append a historical value, the red cross to mark the end of a scope, and return arrows to connect a returned value to its receiving variable.',
    helpSaving: 'Your current code and diagram are saved automatically in the browser and on this computer. Switching exercises saves a copy first. “Save copy” keeps a named snapshot. JSON files let you back up your work or share it with an assistant.',
    helpAI: 'To generate a diagram with an assistant, provide the complete source, entry point, inputs and stopping point (for example, program completion or after line 12). Specify whether to retain value histories and completed scopes. Follow AGENT-START.md in the distribution, then load the resulting JSON with “Import JSON” or “Paste diagram”.',
    helpLimits: 'This is a manual tracing editor. It does not execute source code or automatically check answers. The built-in examples are generic demonstrations. PNG export captures the visible area; keep the JSON for the complete document, or resize the panels before exporting.',
    helpLanguage: 'Use “Language” to switch between English and Simplified Chinese. This setting changes the offline toolbar, dialogs and messages; the original diagram editor keeps its English labels. Exercise content and the Java/Python setting do not change.',
    chooseLanguage: 'Choose your language', languageTitle: 'Interface language',
    languageIntro: 'English is selected by default. You can change this later using “Language” in the toolbar.',
    languageScope: 'This setting controls the offline toolbar, dialogs and messages. The original diagram editor uses English. Your code and diagrams stay the same.',
    languageRemember: 'Your choice is remembered in this browser for this local address.',
    continue: 'Continue', apply: 'Apply', cancel: 'Cancel',
    languageSaved: 'Language saved', languageSession: 'Language changed for this session · browser storage unavailable'
  },
  'zh-CN': {
    brand: 'Tracing · 离线', titleLabel: '练习名称', untitled: '未命名',
    language: '语言', save: '保存副本', open: '打开', examples: '示例',
    practice1: '变量更新', practice2: '共享引用', practice3: '循环作用域',
    new: '新练习', import: '导入 JSON', paste: '粘贴图表', json: '导出 JSON',
    png: '导出 PNG', help: '帮助', loading: '正在加载…', saved: '已自动保存',
    diskSaved: '已存磁盘 · 浏览器存储不可用',
    diskFailed: '已存浏览器 · 磁盘保存失败', saveFailed: '无法保存草稿',
    copySaved: '副本已保存到本机', close: '关闭',
    libraryTitle: '本机保存的练习', libraryEmpty: '还没有保存的副本。当前草稿会自动保存。',
    pasteTitle: '粘贴图表 JSON',
    pasteDescription: '粘贴生成的图表数据。导入后仍能继续编辑；当前练习会先保存为副本。',
    jsonLabel: '图表 JSON', loadDiagram: '载入图表', importFailed: '导入失败：{detail}',
    editorLoading: '编辑器仍在加载，请稍后再试。',
    editorFailed: '编辑器未能加载，请查看本机服务日志。',
    pngLoading: 'PNG 导出组件尚未加载。',
    pngExporting: '正在导出 PNG…', pngSaved: 'PNG 已保存到本机',
    helpTitle: '练习与生成图表',
    helpEditor: 'Stack、Heap、IO 和代码编辑器沿用原网站。点击变量名和值可编辑；“＋”追加历史值；红叉表示作用域结束；返回箭头可连到接收返回值的变量。',
    helpSaving: '当前代码和图表自动保存到浏览器及本机。切换练习前会自动保存副本。“保存副本”可保留命名版本；JSON 文件可以备份和传给助手。',
    helpAI: '让助手根据源码做图：提供完整源码、入口和输入、停止位置（如“运行结束”或“第 12 行之后”），以及是否保留历史值和已结束的作用域。按照发行包中的 AGENT-START.md 指引生成 JSON，再通过“导入 JSON”或“粘贴图表”载入。',
    helpLimits: '本工具是手动 tracing 编辑器，不会执行源码或自动判定答案正确。内置示例是通用演示。PNG 导出当前可见区域；完整内容请保留 JSON，或先调整面板大小。',
    helpLanguage: '通过工具栏的“语言”可切换 English 或简体中文。此设置控制离线工具栏、弹窗和提示；原画图编辑器保留英文标签。练习内容及 Java/Python 设置不会改变。',
    chooseLanguage: '选择界面语言', languageTitle: '界面语言',
    languageIntro: '默认选择英文。之后可以通过工具栏的“语言”随时修改。',
    languageScope: '此设置控制离线工具栏、弹窗和提示。原画图编辑器使用英文。代码和图表内容保持原样。',
    languageRemember: '此浏览器会记住你在当前本地地址选择的语言。',
    continue: '继续', apply: '应用', cancel: '取消',
    languageSaved: '语言设置已保存', languageSession: '已切换本次使用的语言 · 浏览器存储不可用'
  }
};

export const isLanguage = value => languages.some(language => language.id === value);

export function translate(language, key, values = {}) {
  const template = messages[isLanguage(language) ? language : DEFAULT_LANGUAGE][key];
  if (typeof template !== 'string') throw new Error(`Unknown interface message: ${key}`);
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}

export function readLanguagePreference(getStorage = () => globalThis.localStorage) {
  try {
    const value = getStorage().getItem(LANGUAGE_KEY);
    if (isLanguage(value)) return {language: value, needsChoice: false};
  } catch { /* Storage can be disabled; still offer the language picker. */ }
  return {language: DEFAULT_LANGUAGE, needsChoice: true};
}

export function writeLanguagePreference(language, getStorage = () => globalThis.localStorage) {
  if (!isLanguage(language)) throw new RangeError('Unsupported interface language');
  try {
    getStorage().setItem(LANGUAGE_KEY, language);
    return true;
  } catch { return false; }
}
