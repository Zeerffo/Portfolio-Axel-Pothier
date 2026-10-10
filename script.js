/* Comportements du site. Chaque bloc ci-dessous est indépendant. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Fond : parallaxe lente et assombrissement quand on descend.
        Changez 0.8 (distance avant d'être sombre) et 0.93 (opacité maximale). */
  var bgi = $('#bgi'), dim = $('#dim'), hw = $('#hw'), lk = $('#lk'), ticking = false;
  function onScroll() {
    var y = scrollY, vh = innerHeight, d = Math.min(1, y / (vh * 0.8)) * 0.93;
    dim.style.opacity = d;
    if (!reduce) bgi.style.transform = 'translateY(' + (-y * 0.04) + 'px) scale(' + (1 + Math.min(y / vh, 1.5) * 0.03) + ')';
    var f = Math.max(0, 1 - d * 1.5);
    hw.style.opacity = f; lk.style.opacity = f;
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* 2. Pastilles de niveau : lues depuis data-l="3" dans le HTML */
  $$('.pips').forEach(function (p) {
    var l = +p.dataset.l;
    for (var k = 0; k < 5; k++) {
      var s = document.createElement('i');
      if (k < l) s.className = 'on';
      s.style.setProperty('--k', k);
      p.appendChild(s);
    }
    p.setAttribute('role', 'img');
    p.setAttribute('aria-label', 'niveau ' + l + ' sur 5');
  });

  /* 3. Apparition des blocs au défilement (une seule fois, léger décalage) */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.rv').forEach(function (n, i) { n.style.setProperty('--d', (i % 4) * 0.07 + 's'); io.observe(n); });

  /* 4. Fenêtre de détail : le contenu vient du <template id="t-..."> du HTML */
  var dlg = $('#dlg'), dc = $('#dc');
  $$('.proj[data-p]').forEach(function (b) {
    b.addEventListener('click', function () {
      var tpl = $('#t-' + b.dataset.p);
      dc.replaceChildren(tpl.content.cloneNode(true));
      dlg.scrollTop = 0; dlg.showModal();
      document.body.classList.add('lock');
    });
  });
  $('#cl').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { document.body.classList.remove('lock'); });

  /* 5. Copier l'adresse mail */
  $('#cp').addEventListener('click', function () {
    var t = $('#toast'), m = 'axelpothier007@gmail.com';
    function say(s) { t.textContent = s; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(m).then(function () { say('Copié'); }, function () { say(m); });
    } else say(m);
  });
})();
