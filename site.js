(function () {
  var root = document.documentElement, hero = document.querySelector('.hero');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 오늘 요일의 영업시간 (서울 시간 기준)
  try {
    var day = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })).getDay();
    var col = document.querySelector('.hours th[data-days*="' + day + '"]');
    if (col) { var s = document.createElement('span'); s.className = 'now'; s.textContent = '오늘'; col.appendChild(s); }
    var bt = (day === 0 || day === 6) ? '15:00–16:00' : '15:00–17:00';
    document.getElementById('hours-now').textContent = bt; document.getElementById('hours-now2').textContent = bt;
    var lo = (day === 0 || day === 6) ? '14:50' : '14:30'; document.getElementById('lo-now').textContent = lo; document.getElementById('lo-now2').textContent = lo;
  } catch (e) {}

  // 조명: 마우스가 가까울수록 밝아지고, 조명을 누르면 켜 둘 수 있어요.
  (function () {
    var hw = document.querySelector('.hw'), im = hw && hw.querySelector('img'); if (!hw || !im) return;
    var IW = 1280, IH = 854, LX = 642, LY = 262, LR = 120, cx = 0, cy = 0, r = 100, target = 0, cur = 0, lit = false, raf = 0;
    function place() {
      var b = hw.getBoundingClientRect(), k = Math.max(b.width / IW, b.height / IH);
      cx = (b.width - IW * k) / 2 + LX * k; cy = (b.height - IH * k) / 2 + LY * k; r = LR * k;
      hw.style.setProperty('--lx', cx + 'px'); hw.style.setProperty('--ly', cy + 'px'); hw.style.setProperty('--lr', r + 'px');
    }
    function tick() {
      var goal = lit ? 1 : target; cur += (goal - cur) * (reduce ? 1 : .12);
      if (Math.abs(goal - cur) < .004) cur = goal;
      hw.style.setProperty('--p', cur.toFixed(3));
      raf = cur === goal ? 0 : requestAnimationFrame(tick);
    }
    function go() { if (!raf) raf = requestAnimationFrame(tick); }
    function dist(e) { var b = hw.getBoundingClientRect(); return Math.hypot(e.clientX - b.left - cx, e.clientY - b.top - cy); }
    place(); addEventListener('resize', place); im.addEventListener('load', place);
    if (matchMedia('(hover: none)').matches) { target = .8; go(); }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var d = dist(e); target = Math.max(0, Math.min(1, 1 - (d - r) / (r * 3.4)));
      hero.classList.toggle('on-lamp', d < r * 1.15); go();
    });
    hero.addEventListener('pointerleave', function () { target = 0; hero.classList.remove('on-lamp'); go(); });
    hero.addEventListener('click', function (e) {
      if (e.target.closest('a') || dist(e) > r * 1.3) return;
      lit = !lit; hw.classList.toggle('lit', lit); go();
    });
  })();

  // 파스타 하위 분류
  (function () {
    var bar = document.querySelector('.subtabs'); if (!bar) return;
    var subs = document.querySelectorAll('#pasta .msub');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var g = b.getAttribute('data-g');
      Array.prototype.forEach.call(bar.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      Array.prototype.forEach.call(subs, function (m) { m.hidden = g !== 'all' && m.getAttribute('data-g') !== g; m.classList.toggle('solo', g !== 'all'); });
    });
  })();

  // 한 화면 구성: 메뉴, 오시는 길, 자주 묻는 질문을 눌러서 열어요.
  (function () {
    var PANELS = ['menu', 'visit', 'faq', 'reserve'].filter(function (id) { return document.getElementById(id); }), CATS = ['signature', 'pasta', 'rice', 'steak', 'side', 'beverage', 'drinks'];
    var HOME = root.getAttribute('data-home'), MAIN = root.getAttribute('data-panel');
    var faq = document.getElementById('faq'), en = document.getElementById('english');
    if (faq && en) faq.appendChild(en);
    root.classList.add('app');
    var xbtn = document.querySelector('.xbtn'), last = null, open = null;
    function tab(id) {
      CATS.forEach(function (c) { var el = document.getElementById(c); if (el) el.hidden = c !== id; });
      var mp = document.getElementById('menu'); if (!mp) return; mp.scrollTop = 0; setTimeout(function () { mp.scrollTop = 0; }, 60);
      Array.prototype.forEach.call(document.querySelectorAll('.jump a'), function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    function show(id) {
      if (CATS.indexOf(id) > -1) { tab(id); id = 'menu'; }
      if (PANELS.indexOf(id) < 0) id = MAIN || null;
      PANELS.forEach(function (p) { document.getElementById(p).classList.toggle('open', p === id); });
      root.classList.toggle('panel-open', !!id);
      if (id && id !== open) { document.getElementById(id).scrollTop = 0; if (!MAIN) xbtn.focus({ preventScroll: true }); }
      if (!id && open && last) last.focus({ preventScroll: true });
      open = id;
    }
    function go(id) { if (!id && HOME) { location.href = HOME; return; } try { location.hash = id || 'top'; } catch (e) {} show(id); }
    tab('signature');
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (PANELS.indexOf(id) > -1 || CATS.indexOf(id) > -1) { e.preventDefault(); if (!open) last = a; go(id); }
      else if (id === 'top') { e.preventDefault(); go(null); }
    });
    xbtn.addEventListener('click', function (e) { if (HOME) return; go(null); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) go(null); });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
    show(location.hash.slice(1));
  })();

})();
