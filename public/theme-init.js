(function(){
  try {
    const key = 'nsma-theme';
    const saved = localStorage.getItem(key);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  } catch (e) {
    // ignore (localStorage may be unavailable)
  }
})();
