// Deterrente client-side. Solo delegacion de eventos: no debe mutar el DOM,
// porque React es el dueno del arbol.
(function () {
  var isImage = function (el) {
    return el && el.tagName === 'IMG';
  };

  document.addEventListener('contextmenu', function (e) {
    if (isImage(e.target)) e.preventDefault();
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (isImage(e.target)) e.preventDefault();
  }, true);
})();
