/* ============================================================
   PONM3AY // DRIFTER ARCHIVE — app.js（鸣潮黑金版）
   渲染管线 + 滚动编排 + tilt/磁吸/视差 + Lightbox。无外部依赖。
   ============================================================ */
(function () {
  'use strict';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LS_KEY = 'mc_content_v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function getPath(o, p) { return p.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, o); }
  function deepMerge(base, over) {
    if (!over || typeof over !== 'object') return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (var k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      var b = base ? base[k] : undefined, v = over[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' && !Array.isArray(b)) out[k] = deepMerge(b, v);
      else out[k] = v;
    }
    return out;
  }

  /* 数据装载 */
  var C = deepMerge(window.MC_DEFAULT_CONTENT, {});
  window.MCApp = { content: C, render: renderAll };
  function loadOverrides(done) {
    var req = new XMLHttpRequest();
    try {
      req.open('GET', 'content.json?t=' + Date.now(), true);
      req.timeout = 2500;
      req.onload = function () {
        if (req.status === 200) { try { C = deepMerge(C, JSON.parse(req.responseText)); } catch (e) { /* noop */ } }
        step2();
      };
      req.onerror = req.ontimeout = step2;
      req.send();
    } catch (e) { step2(); }
    function step2() {
      try {
        var raw = localStorage.getItem(LS_KEY);
        if (raw) C = deepMerge(C, JSON.parse(raw));
      } catch (e) { /* noop */ }
      window.MCApp.content = C;
      done();
    }
  }

  /* 占位扫描：访客隐藏 [待编辑] */
  function scanTodo() {
    document.querySelectorAll('.is-todo').forEach(function (el) { el.classList.remove('is-todo'); });
    document.querySelectorAll('[data-c]').forEach(function (el) {
      if (el.textContent.indexOf('[待编辑') !== -1) el.classList.add('is-todo');
    });
    document.querySelectorAll('.l-card').forEach(function (c) {
      if ((c.textContent || '').indexOf('[待编辑') !== -1) c.classList.add('is-todo');
    });
  }

  var stCls = function (st) { return st === 'gold' ? 'st-gold' : st === 'cyan' ? 'st-cyan' : st === 'red' ? 'st-red' : ''; };

  function renderAll() {
    C = window.MCApp.content;
    document.querySelectorAll('[data-c]').forEach(function (el) {
      var v = getPath(C, el.getAttribute('data-c'));
      if (typeof v === 'string') el.textContent = v;
    });
    var t = document.querySelector('.hero-title');
    if (t && getPath(C, 'identity.codename')) {
      t.textContent = C.identity.codename;
    }
    renderChips(); renderAttrs(); renderModules(); renderNews(); renderRows(); renderTimeline();
    var mail = document.getElementById('channelMail');
    if (mail) mail.href = 'mailto:' + getPath(C, 'connect.mail');
    var git = document.getElementById('channelGit');
    if (git) git.href = 'https://' + (getPath(C, 'connect.github') || 'github.com/ponm3ay');
    scanTodo();
    if (C.meta && C.meta.siteTitle) document.title = C.meta.siteTitle;
  }

  function renderChips() {
    var box = document.getElementById('bioChips');
    if (box && C.chips) box.innerHTML = C.chips.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('');
  }
  function renderAttrs() {
    var box = document.getElementById('attrsList');
    if (!box || !C.attrs) return;
    box.innerHTML = C.attrs.map(function (a) {
      return '<div class="attr-row"><span class="attr-name">' + esc(a.name) + ' · ' + esc(a.label || '') + '</span>' +
        '<span class="attr-bar"><i data-w="' + (+a.val || 0) + '"></i></span>' +
        '<span class="attr-val">' + (+a.val || 0) + '</span></div>';
    }).join('');
    requestAnimationFrame(function () {
      box.querySelectorAll('.attr-bar i').forEach(function (i) {
        if (i.hasAttribute('data-w')) { i.style.width = i.getAttribute('data-w') + '%'; i.removeAttribute('data-w'); }
      });
    });
  }
  function renderModules() {
    var list = document.getElementById('modulesList');
    if (!list || !C.modules) return;
    list.innerHTML = C.modules.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
    var cnt = document.getElementById('modulesCount');
    if (cnt) cnt.textContent = String(C.modules.length).padStart(2, '0');
  }
  function renderNews() {
    var grid = document.getElementById('newsGrid');
    if (!grid || !C.operations) return;
    grid.innerHTML = C.operations.slice(0, 3).map(function (o) {
      var link = o.link || '#';
      return '<article class="news-card" tabindex="0" data-no="' + esc(o.no || '') + '">' +
        '<div class="news-visual"><span class="nv-lang mono">' + esc(o.lang || '') + '</span>' +
        '<span class="nv-no mono">' + esc((o.no || 'OP').replace(/^OP-/, '')) + '</span></div>' +
        '<div class="news-body"><p class="news-date mono">' + esc(o.date || '') + ' · ' + esc(o.status || '') + '</p>' +
        '<h3 class="news-title"><a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(o.title) + '</a></h3>' +
        '<p class="news-desc">' + esc(o.desc) + '</p>' +
        '<div class="news-foot mono"><span>' + esc(o.meta || '') + '</span>' +
        '<a href="' + esc(link) + '" target="_blank" rel="noopener">OPEN REPO ↗</a></div></div></article>';
    }).join('');
    grid.querySelectorAll('.news-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        openCase(card.getAttribute('data-no'));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') openCase(card.getAttribute('data-no'));
      });
    });
  }
  function renderRows() {
    var box = document.getElementById('workRows');
    if (!box || !C.operations) return;
    box.innerHTML = C.operations.map(function (o, i) {
      var link = o.link || '#';
      return '<div class="row-item reveal" style="--i:' + i + '">' +
        '<span class="row-no">' + esc(o.no || '') + '</span>' +
        '<div class="row-main"><h3 class="row-title"><a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(o.title) + '</a></h3>' +
        '<p class="row-desc">' + esc(o.desc) + '</p></div>' +
        '<div class="row-meta"><span class="rm-lang">' + esc(o.lang || '') + '</span><span>' + esc(o.status || '') + '</span></div></div>';
    }).join('');
    observeReveals(box);
  }
  function renderTimeline() {
    var box = document.getElementById('timeline');
    if (!box || !C.log) return;
    box.innerHTML = '<span class="rail" aria-hidden="true"></span>' + C.log.map(function (l, i) {
      return '<div class="log-item" style="--i:' + i + '">' +
        '<p class="log-date mono">' + esc(l.date) + '</p>' +
        '<div class="log-head"><h3 class="log-title">' + esc(l.title) + '</h3>' +
        '<span class="log-status ' + stCls(l.st) + '">' + esc(l.status || '') + '</span></div>' +
        '<p class="log-text">' + esc(l.text) + '</p></div>';
    }).join('');
    scanTodo();
    initTimelineGrown();
  }

  /* Lightbox（鸣潮风详情） */
  function stCls(st) { return st === 'gold' ? 'st-gold' : st === 'cyan' ? 'st-cyan' : st === 'red' ? 'st-red' : ''; }
  function ensureLightbox() {
    if (document.getElementById('mcCase')) return;
    var d = document.createElement('div');
    d.className = 'mc-case'; d.id = 'mcCase'; d.hidden = true;
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="mc-backdrop" data-close></div>' +
      '<div class="mc-box"><span class="mc-wm mono" aria-hidden="true"></span>' +
      '<div class="mc-head"><span class="mc-no mono"></span><span class="mc-st mono"></span>' +
      '<button class="mc-x" aria-label="关闭">✕</button></div>' +
      '<h3 class="mc-title"></h3><p class="mc-desc"></p><div class="mc-tags mono"></div>' +
      '<div class="mc-foot mono"><span class="mc-meta"></span>' +
      '<a class="btn btn-gold mc-open" target="_blank" rel="noopener">打开仓库<span class="btn-en">OPEN REPO</span></a></div>' +
      '<span class="mc-stripe" aria-hidden="true"></span></div>';
    document.body.appendChild(d);
    d.querySelector('[data-close]').addEventListener('click', closeCase);
    d.querySelector('.mc-x').addEventListener('click', closeCase);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCase(); });
  }
  var lastFocus = null;
  function openCase(no) {
    ensureLightbox();
    var o = (C.operations || []).find(function (x) { return x.no === no; });
    if (!o) return;
    var d = document.getElementById('mcCase');
    lastFocus = document.activeElement;
    d.querySelector('.mc-wm').textContent = String(o.no || '').replace(/^OP-/, '');
    d.querySelector('.mc-no').textContent = o.no || '';
    var st = d.querySelector('.mc-st'); st.textContent = o.status || ''; st.className = 'mc-st mono ' + stCls(o.st);
    d.querySelector('.mc-title').textContent = o.title || '';
    d.querySelector('.mc-desc').textContent = o.desc || '';
    d.querySelector('.mc-tags').innerHTML = (o.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    d.querySelector('.mc-meta').textContent = o.meta || '';
    d.querySelector('.mc-open').href = o.link || '#';
    d.hidden = false;
    document.body.style.overflow = 'hidden';
    d.querySelector('.mc-x').focus();
  }
  function closeCase() {
    var d = document.getElementById('mcCase');
    if (!d || d.hidden) return;
    d.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* Toast */
  var toastEl = document.getElementById('toast'), toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="t-dot">◆</span>' + esc(msg);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  /* 开机序列 */
  var bootLines = [
    '[00.041] LINK WUTHERING NODE .......... <b class="ok">OK</b>',
    '[00.213] LOAD DRIFTER FILE <b>PONM3AY</b> ....... <b class="ok">OK</b>',
    '[00.402] VERIFY CLEARANCE <b>PUBLIC</b> ......... <b class="ok">OK</b>',
    '[00.688] RESONANCE STANDBY ............ <b class="ok">READY</b>',
    '[00.912] WELCOME BACK, <b>漂泊者</b>.'
  ];
  function runBoot() {
    var boot = document.getElementById('boot');
    if (!boot) return;
    if (RM || sessionStorage.getItem('mc_booted')) { boot.classList.add('is-done'); sessionStorage.setItem('mc_booted', '1'); return; }
    var box = document.getElementById('bootLines');
    var bar = document.getElementById('bootBarFill');
    var pct = document.getElementById('bootPct');
    var i = 0, p = 0;
    var lt = setInterval(function () {
      if (i >= bootLines.length) { clearInterval(lt); return; }
      var d = document.createElement('div');
      d.className = 'bl'; d.innerHTML = bootLines[i]; box.appendChild(d); i++;
    }, 260);
    var bt = setInterval(function () {
      p = Math.min(100, p + Math.random() * 22 + 8);
      if (bar) bar.style.width = p + '%';
      if (pct) pct.textContent = 'LOADING - ' + Math.floor(p) + '%';
      if (p >= 100) clearInterval(bt);
    }, 200);
    var finish = function () {
      boot.classList.add('is-done');
      sessionStorage.setItem('mc_booted', '1');
      clearInterval(lt); clearInterval(bt);
    };
    document.getElementById('bootSkip').addEventListener('click', finish);
    setTimeout(finish, 3400);
  }

  /* 导航 */
  function initNav() {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
      var max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var bar = document.getElementById('scrollBar');
      if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
    });
    var secs = ['top', 'profile', 'works', 'allworks', 'log', 'connect'];
    var navA = {};
    links.querySelectorAll('.nav-link').forEach(function (a) { navA[(a.getAttribute('href') || '').replace('#', '')] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && navA[en.target.id]) {
          Object.keys(navA).forEach(function (k) { navA[k].classList.toggle('is-active', k === en.target.id); });
        }
      });
    }, { rootMargin: '-38% 0px -55% 0px' });
    secs.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
    var clock = document.getElementById('navClock');
    var tick = function () {
      var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
      if (clock) clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    };
    tick(); setInterval(tick, 1000);
  }

  /* 滚动显现 + 时间线生长 */
  var revealIO = null;
  function observeReveals(root) {
    if (RM) { (root || document).querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); return; }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    (root || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) { revealIO.observe(el); });
  }
  function initTimelineGrown() {
    var box = document.getElementById('timeline');
    if (!box) return;
    if (RM) { box.classList.add('grown'); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { box.classList.add('grown'); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(box);
  }

  /* 豪华交互：tilt / 磁吸 / 视差（仅精确指针） */
  function initLuxury() {
    if (RM) return;
    if (!(matchMedia('(hover:hover) and (pointer:fine)').matches)) return;
    document.querySelectorAll('.news-card,.p-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        var lift = card.classList.contains('news-card') ? 'translateY(-6px) ' : 'translateY(-3px) ';
        card.style.transform = lift + 'perspective(950px) rotateX(' + (-py * 4).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
    var cta = document.querySelector('.hero-cta');
    if (cta) {
      var btns = cta.querySelectorAll('.btn');
      cta.addEventListener('pointermove', function (e) {
        btns.forEach(function (btn) {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          var reach = Math.max(r.width, 120) / 2 + 70;
          if (Math.hypot(dx, dy) < reach) btn.style.transform = 'translate(' + (dx * 0.12).toFixed(1) + 'px,' + (dy * 0.18).toFixed(1) + 'px)';
          else btn.style.transform = '';
        });
      });
      cta.addEventListener('pointerleave', function () { btns.forEach(function (btn) { btn.style.transform = ''; }); });
    }
    var glow = document.querySelector('.hero-glow');
    if (glow) {
      window.addEventListener('scroll', function () {
        glow.style.transform = 'translateY(' + (window.scrollY * 0.24).toFixed(1) + 'px)';
      }, { passive: true });
    }
  }

  /* 标题轮播 */
  function initTitleTicker() {
    var titles = ['PONM3AY // DRIFTER ARCHIVE', '▸▸ WUTHERING NODE ACTIVE', '◈ RESONANCE STANDBY', '▸▸ 8 REPOS · KURO STYLE'];
    var i = 0;
    setInterval(function () { i = (i + 1) % titles.length; document.title = titles[i]; }, 6000);
  }

  /* 启动 */
  loadOverrides(function () {
    renderAll();
    runBoot();
    initNav();
    observeReveals(document);
    initLuxury();
    if (!RM) initTitleTicker();
  });
})();
