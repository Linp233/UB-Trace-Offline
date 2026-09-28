(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('offline-trace-autosave-v1') || 'null');
    if (saved?.trace?.kind === 'trace') window.OfflineTraceBoot = saved;
    localStorage.setItem('practice-code-language-v1', JSON.stringify(saved?.language || 'java'));
    if (!localStorage.getItem('mantine-color-scheme-value')) localStorage.setItem('mantine-color-scheme-value','dark');
  } catch (error) { console.warn('Local draft could not be restored:',error); }
})();
