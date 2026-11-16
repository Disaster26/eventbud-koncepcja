(function () {
  var d = document, root = d.documentElement;

  /* nagłówek: przezroczysty na zdjęciu, biały po przewinięciu */
  var top = d.getElementById('top');
  if (top && top.classList.contains('on-hero')) {
    var onScroll = function () { top.classList.toggle('solid', window.scrollY > 40 || top.classList.contains('menu-open')); };
    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(onScroll);
  }

  /* menu mobilne */
  var burger = d.querySelector('.burger'), nav = d.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      top.classList.toggle('menu-open', open);
      top.classList.toggle('solid', open || window.scrollY > 40 || !top.classList.contains('on-hero'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); top.classList.remove('menu-open'); }
    });
  }

  /* PL / EN */
  var enData = {};
  try { enData = JSON.parse(d.getElementById('i18n-en').textContent); } catch (e) {}
  var nodes = d.querySelectorAll('[data-i18n]');
  var plData = {};
  nodes.forEach(function (n) { plData[n.getAttribute('data-i18n')] = n.innerHTML; });
  function setLang(l) {
    nodes.forEach(function (n) {
      var k = n.getAttribute('data-i18n');
      var v = l === 'en' ? enData[k] : plData[k];
      if (v != null) n.innerHTML = v;
    });
    root.lang = l;
    root.classList.toggle('is-en', l === 'en');
    try { localStorage.setItem('eb-lang', l); } catch (e) {}
  }
  if (root.classList.contains('is-en')) setLang('en');
  var lb = d.querySelector('[data-lang]');
  if (lb) lb.addEventListener('click', function () { setLang(root.classList.contains('is-en') ? 'pl' : 'en'); });

  /* karuzela: przyciski + przeciąganie myszą */
  d.querySelectorAll('[data-carousel]').forEach(function (c) {
    var t = c.querySelector('.track');
    c.querySelectorAll('.car-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = t.querySelector('li');
        var step = item ? item.getBoundingClientRect().width + 18 : t.clientWidth;
        t.scrollBy({ left: step * Number(b.dataset.dir), behavior: 'smooth' });
      });
    });
    var down = false, sx = 0, sl = 0, moved = false;
    t.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = t.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; t.classList.add('drag'); }
      if (moved) t.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) {
        t.classList.remove('drag');
        var item = t.querySelector('li'); var w = item.getBoundingClientRect().width + 18;
        t.scrollTo({ left: Math.round(t.scrollLeft / w) * w, behavior: 'smooth' });
        setTimeout(function () { moved = false; }, 50);
      }
    });
    t.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    t.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* lightbox */
  var dlg = d.getElementById('lightbox');
  if (dlg && dlg.showModal) {
    var im = d.getElementById('lb-img'), cap = d.getElementById('lb-cap'), list = [], idx = 0;
    function show(i) {
      idx = (i + list.length) % list.length;
      var a = list[idx];
      im.src = a.getAttribute('href');
      im.alt = a.dataset.cap || '';
      cap.textContent = a.dataset.cap || '';
    }
    d.addEventListener('click', function (e) {
      var a = e.target.closest('a.lb');
      if (!a) return;
      e.preventDefault();
      list = Array.prototype.slice.call(d.querySelectorAll('a.lb[data-group="' + a.dataset.group + '"]'));
      show(list.indexOf(a));
      dlg.showModal();
    });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
    d.addEventListener('keydown', function (e) {
      if (!dlg.open) return;
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
    var tx = null;
    dlg.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* formularz pokazowy */
  var f = d.getElementById('form');
  if (f) f.addEventListener('submit', function (e) { e.preventDefault(); d.getElementById('form-msg').hidden = false; });
})();
