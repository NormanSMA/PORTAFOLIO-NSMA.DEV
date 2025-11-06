(function(){
  try {
    const key = 'nsma-theme';
    const saved = localStorage.getItem(key);
    if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // ignore (localStorage may be unavailable)
  }
})();
