// Basic client-side mitigation: prevent right-click and dragging on images
// This is only obfuscation: determined users can still fetch and save images.
(function(){
  function protectImage(img){
    try {
      img.setAttribute('draggable', 'false');
      img.addEventListener('dragstart', function(e){ e.preventDefault(); });
      img.addEventListener('contextmenu', function(e){ e.preventDefault(); });
      // add a transparent overlay to intercept clicks (makes saving slightly harder)
      const wrapper = document.createElement('span');
      wrapper.style.position = 'relative';
      wrapper.style.display = getComputedStyle(img).display === 'block' ? 'block' : 'inline-block';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      const overlay = document.createElement('span');
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.background = 'transparent';
      overlay.style.pointerEvents = 'auto';
      overlay.style.userSelect = 'none';
      wrapper.appendChild(overlay);
    } catch (e) {
      // ignore
    }
  }

  function protectAll(){
    const imgs = document.querySelectorAll('img');
    imgs.forEach(function(img){
      // optional: only protect images with attribute data-protect="true"
      // if (!img.dataset.protect) return;
      protectImage(img);
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', protectAll);
  } else {
    protectAll();
  }
})();
