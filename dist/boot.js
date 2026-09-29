(() => {
  try {
    // Same preference key as i18n.mjs; set the document language before the UI loads.
    document.documentElement.lang = localStorage.getItem('offline-trace-ui-language-v1') === 'zh-CN' ? 'zh-CN' : 'en';
  } catch { document.documentElement.lang = 'en'; }
  try {
    const saved = JSON.parse(localStorage.getItem('offline-trace-autosave-v1') || 'null');
    if (saved?.trace?.kind === 'trace') window.OfflineTraceBoot = saved;
    localStorage.setItem('practice-code-language-v1', JSON.stringify(saved?.language || 'java'));
    if (!localStorage.getItem('mantine-color-scheme-value')) localStorage.setItem('mantine-color-scheme-value','dark');
  } catch (error) { console.warn('Local draft could not be restored:',error); }
})();
