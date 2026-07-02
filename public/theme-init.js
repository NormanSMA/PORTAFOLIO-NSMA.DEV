(function(){
  try {
    const key = 'nsma-theme';
    const saved = localStorage.getItem(key);
    const isDark = saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#0A0A0F' : '#FFFFFF');
    }
  } catch (e) {
    // ignore (localStorage may be unavailable)
  }
})();
