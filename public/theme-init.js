(function () {
  var root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');

  // The site is dark only. A light value saved by the old toggle would be read back by ThemeProvider.
  try {
    var key = 'nsma-theme';
    if (localStorage.getItem(key) !== 'dark') {
      localStorage.setItem(key, 'dark');
    }
  } catch (e) {
    // localStorage may be unavailable
  }
})();
