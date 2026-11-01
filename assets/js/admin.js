/* ============================================================
   PONM3AY // DRIFTER ARCHIVE — admin.js（鸣潮黑金版）
   管理后台：令牌校验（SHA-256 摘要）→ 表单编辑 →
   保存 localStorage / 导出 content.json / 直发 GitHub。
   ============================================================ */
(function () {
  'use strict';

  var LS_KEY = 'mc_content_v1';
  var SS_KEY = 'mc_admin_unlocked';
  var GH_LS_TOKEN = 'mc_gh_token';
  var GH_API = 'https://api.github.com/repos/ponm3ay/mc-archive/contents/content.json';

  var modal = document.getElementById('adminModal');
  var stepToken = document.getElementById('adminStepToken');
  var stepEdit = document.getElementById('adminStepEdit');
  var body = document.getElementById('adminBody');
  var liveHint = null;
  var draft = null;

  /* ---------- SHA-256（纯 JS，兼容 file://） ---------- */
  function sha256hex(ascii) {
    function rrot(v, n) { return (v >>> n) | (v << (32 - n)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32);
    var result = '', words = [], asciiBitLength = ascii.length * 8;
    var hash = [], k = [], primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength);
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash.slice(0, 8);
      for (i = 16; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var s0 = rrot(w15, 7) ^ rrot(w15, 18) ^ (w15 >>> 3);
        var s1 = rrot(w2, 17) ^ rrot(w2, 19) ^ (w2 >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
      for (i = 0; i < 64; i++) {
        var S1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25);
        var ch = (e & f) ^ (~e & g);
        var temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
        var S0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var temp2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0; hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0; hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b2 = (hash[i] >> (j * 8)) & 255;
        result += ((b2 >> 4).toString(16)) + ((b2 & 15).toString(16));
      }
    }
    return result;
  }

  function setPath(o, p, v) {
    var ks = p.split('.'), o2 = o;
    for (var i = 0; i < ks.length - 1; i++) {
      if (o2[ks[i]] == null) o2[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o2 = o2[ks[i]];
    }
    o2[ks[ks.length - 1]] = v;
  }
  function getPath(o, p) { return p.split('.').reduce(function (o, k) { return o ? o[k] : undefined; }, o); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 表单构建 ---------- */
  function fInput(label, path, val, type) {
    return '<div class="f-group"><label class="f-label">' + label +
      '</label><input class="f-input" data-path="' + path + '" type="' + (type || 'text') + '" value="' + esc(val) + '"></div>';
  }
  function fTextarea(label, path, val, rows) {
    return '<div class="f-group"><label class="f-label">' + label +
      '</label><textarea class="f-textarea" data-path="' + path + '" rows="' + (rows || 3) + '">' + esc(val) + '</textarea></div>';
  }
  var ST_OPTS = [['gold', '金 GOLD'], ['cyan', '青 CYAN'], ['red', '红 RED'], ['dim', '灰 DIM']];
  function fSelect(label, path, val) {
    var opts = ST_OPTS.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
    return '<div class="f-group"><label class="f-label">' + label +
      '</label><select class="f-input f-select" data-path="' + path + '">' + opts + '</select></div>';
  }
  function fItem(inner, removePath) {
    return '<div class="f-item">' + inner +
      '<button class="f-item-x" type="button" data-remove="' + removePath + '" aria-label="删除">✕</button></div>';
  }

  function renderForm() {
    var h = '';
    h += '<section class="f-sec"><p class="f-sec-title">// 身份 IDENTITY</p><div class="f-row">';
    h += fInput('代号 CODENAME', 'identity.codename', getPath(draft, 'identity.codename'));
    h += fInput('姓名 NAME', 'identity.name', getPath(draft, 'identity.name'));
    h += fInput('职位 ROLE', 'identity.role', getPath(draft, 'identity.role'));
    h += fInput('头像 URL（留空默认）', 'identity.avatarUrl', getPath(draft, 'identity.avatarUrl') || '');
    h += '</div>';
    h += fTextarea('宣言 MISSION', 'identity.mission', getPath(draft, 'identity.mission'), 2);
    h += fTextarea('情报 BIO', 'identity.bio', getPath(draft, 'identity.bio'), 4);
    h += '</section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 统计 STATS</p><div class="f-row">';
    h += fInput('仓库 REPOS', 'stats.repos', getPath(draft, 'stats.repos'));
    h += fInput('星标 STARS', 'stats.stars', getPath(draft, 'stats.stars'));
    h += fInput('关注 FOLLOWERS', 'stats.followers', getPath(draft, 'stats.followers'));
    h += fInput('加入 SINCE', 'stats.since', getPath(draft, 'stats.since'));
    h += '</div></section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 能力 ATTRS</p><div class="f-list">';
    (draft.attrs || []).forEach(function (a, i) {
      h += fItem(
        '<div class="f-row">' +
        fInput('名称', 'attrs.' + i + '.name', a.name) +
        fInput('中文', 'attrs.' + i + '.label', a.label) +
        fInput('数值 0-100', 'attrs.' + i + '.val', a.val, 'number') +
        '</div>', 'attrs.' + i);
    });
    h += '</div><button class="f-add" type="button" data-add="attrs">＋ 添加能力</button></section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 模块 MODULES（每行一个）</p>';
    h += fTextarea('模块', 'modules__lines', (draft.modules || []).join('\n'), 5);
    h += fTextarea('档案标签 CHIPS（每行一个）', 'chips__lines', (draft.chips || []).join('\n'), 3);
    h += '</section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 作战 OPERATIONS</p><div class="f-list">';
    (draft.operations || []).forEach(function (o, i) {
      h += fItem(
        '<div class="f-row">' +
        fInput('编号', 'operations.' + i + '.no', o.no) +
        fInput('标题', 'operations.' + i + '.title', o.title) +
        '</div>' +
        fTextarea('描述', 'operations.' + i + '.desc', o.desc, 3) +
        '<div class="f-row">' +
        fInput('标签（逗号分隔）', 'operations.' + i + '.tags', (o.tags || []).join(', ')) +
        fInput('元信息 META', 'operations.' + i + '.meta', o.meta) +
        '</div>' +
        '<div class="f-row">' +
        fInput('日期 DATE', 'operations.' + i + '.date', o.date) +
        fInput('语言 LANG', 'operations.' + i + '.lang', o.lang) +
        '</div>' +
        '<div class="f-row">' +
        fInput('状态文字', 'operations.' + i + '.status', o.status) +
        fSelect('状态色', 'operations.' + i + '.st', o.st) +
        '</div>' +
        fInput('链接 LINK', 'operations.' + i + '.link', o.link),
        'operations.' + i);
    });
    h += '</div><button class="f-add" type="button" data-add="operations">＋ 添加项目</button></section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 轨迹 LOG</p><div class="f-list">';
    (draft.log || []).forEach(function (l, i) {
      h += fItem(
        '<div class="f-row">' +
        fInput('日期', 'log.' + i + '.date', l.date) +
        fInput('标题', 'log.' + i + '.title', l.title) +
        '</div>' +
        '<div class="f-row">' +
        fInput('状态文字', 'log.' + i + '.status', l.status) +
        fSelect('状态色', 'log.' + i + '.st', l.st) +
        '</div>' +
        fTextarea('内容', 'log.' + i + '.text', l.text, 2), 'log.' + i);
    });
    h += '</div><button class="f-add" type="button" data-add="log">＋ 添加日志</button></section>';

    h += '<section class="f-sec"><p class="f-sec-title">// 连接 CONNECT / 其他</p><div class="f-row">';
    h += fInput('邮箱 MAIL', 'connect.mail', getPath(draft, 'connect.mail'));
    h += fInput('GITHUB 文本', 'connect.github', getPath(draft, 'connect.github'));
    h += fInput('响应备注', 'connect.responseNote', getPath(draft, 'connect.responseNote'));
    h += fInput('站点标题', 'meta.siteTitle', getPath(draft, 'meta.siteTitle'));
    h += '</div>';
    h += fInput('页脚文本', 'footer.text', getPath(draft, 'footer.text'));
    h += '</section>';

    body.innerHTML = h;
  }

  /* ---------- 输入绑定 ---------- */
  function bindInputs() {
    body.addEventListener('input', function (e) {
      var el = e.target;
      var path = el.getAttribute && el.getAttribute('data-path');
      if (!path) return;
      var v = el.value;
      if (/__lines$/.test(path)) {
        var arr = v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        if (path === 'modules__lines') draft.modules = arr;
        if (path === 'chips__lines') draft.chips = arr;
        return;
      }
      if (/\.tags$/.test(path)) {
        setPath(draft, path, v.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean));
        return;
      }
      if (/\.val$/.test(path)) {
        setPath(draft, path, Math.max(0, Math.min(100, parseInt(v, 10) || 0)));
        return;
      }
      setPath(draft, path, v);
    });

    body.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) {
        var key = add.getAttribute('data-add');
        if (key === 'attrs') draft.attrs.push({ name: 'NEW ATTR', label: '新能力', val: 50 });
        if (key === 'operations') draft.operations.push({
          no: 'OP-' + String(draft.operations.length + 1).padStart(2, '0'),
          title: '新项目', lang: '', date: '[待编辑]', desc: '[待编辑]', tags: ['TAG'],
          status: 'DRAFT', st: 'dim', meta: '', link: 'https://github.com/ponm3ay/'
        });
        if (key === 'log') draft.log.unshift({ date: '[待编辑]', title: '新记录', status: 'DRAFT', st: 'dim', text: '[待编辑]' });
        renderForm();
        return;
      }
      var rm = e.target.closest('[data-remove]');
      if (rm) {
        var p = rm.getAttribute('data-remove').split('.');
        var arr = draft[p[0]];
        if (arr && arr.length > 1) { arr.splice(+p[1], 1); renderForm(); }
        else if (window.MCToast) window.MCToast('至少保留一项');
      }
    });
  }

  /* ---------- GitHub 直发 ---------- */
  function utf8ToB64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function pubSay(msg, cls, html) {
    var el = document.getElementById('pubStatus');
    if (!el) return;
    el.hidden = false;
    el.className = 'pub-status mono' + (cls ? ' ' + cls : '');
    if (html) el.innerHTML = msg; else el.textContent = msg;
  }
  async function ghPublish() {
    var token = '';
    try { token = localStorage.getItem(GH_LS_TOKEN) || ''; } catch (e) { /* noop */ }
    var tokenBox = document.getElementById('pubToken');
    if (!token) { tokenBox.hidden = false; document.getElementById('ghTokenInput').focus(); pubSay('首次发布需要配置 GitHub 令牌（见下方说明），保存后重试。', 'err'); return; }
    var btn = document.getElementById('adminPublish');
    btn.disabled = true;
    try {
      pubSay('① 获取远端文件状态…');
      var sha = null;
      var gr = await fetch(GH_API, { headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' } });
      if (gr.status === 200) sha = (await gr.json()).sha;
      else if (gr.status !== 404) throw new Error('提交失败：读取远端 HTTP ' + gr.status + (gr.status === 401 ? '（令牌无效/过期）' : gr.status === 403 ? '（无 Contents 写权限）' : ''));
      pubSay('② 提交 content.json 到 main…');
      var payload = {
        message: 'content update via admin console · ' + new Date().toLocaleString('zh-CN', { hour12: false }),
        content: utf8ToB64(JSON.stringify(draft, null, 2)),
        branch: 'main'
      };
      if (sha) payload.sha = sha;
      var pr = await fetch(GH_API, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!pr.ok) {
        var msg = 'HTTP ' + pr.status;
        try { var j = await pr.json(); if (j.message) msg = j.message; } catch (e2) { /* noop */ }
        throw new Error('提交失败：' + msg + (pr.status === 401 ? '（令牌无效/过期）' : ''));
      }
      var rj = await pr.json();
      var url = (rj.commit && rj.commit.html_url) || '';
      try { localStorage.setItem(LS_KEY, JSON.stringify(draft)); } catch (e3) { /* noop */ }
      window.MCApp.content = clone(draft);
      window.MCApp.render();
      pubSay('✓ 已提交 <a href="' + url + '" target="_blank" rel="noopener">' + (rj.commit ? String(rj.commit.sha).slice(0, 7) : '') + '</a> · Pages 约 1-2 分钟后自动上线', 'ok', true);
      if (window.MCToast) window.MCToast('已发布到 GitHub');
      tokenBox.hidden = true;
    } catch (e) {
      pubSay('✗ ' + e.message, 'err');
      if (window.MCToast) window.MCToast('发布失败：' + e.message.slice(0, 60));
    } finally {
      btn.disabled = false;
    }
  }
  function initPublish() {
    var btn = document.getElementById('adminPublish');
    var box = document.getElementById('pubToken');
    var saveT = document.getElementById('ghTokenSave');
    var inp = document.getElementById('ghTokenInput');
    if (!btn) return;
    btn.addEventListener('click', function () { ghPublish(); });
    saveT.addEventListener('click', function () {
      var v = inp.value.trim();
      if (!v) { pubSay('令牌为空，未保存。', 'err'); return; }
      try { localStorage.setItem(GH_LS_TOKEN, v); } catch (e) { pubSay('保存失败：' + e.message, 'err'); return; }
      inp.value = '';
      box.hidden = true;
      pubSay('令牌已保存。再点一次「发布到 GitHub」。', 'ok');
    });
  }

  /* ---------- 保存 / 导出 / 重置 ---------- */
  function hasLocal() { try { return !!localStorage.getItem(LS_KEY); } catch (e) { return false; } }
  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
      window.MCApp.content = clone(draft);
      window.MCApp.render();
      if (window.MCToast) window.MCToast('已保存到本浏览器 · 仅本机可见');
    } catch (e) {
      if (window.MCToast) window.MCToast('保存失败：' + e.message);
    }
  }
  function exportJson() {
    var blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    if (window.MCToast) window.MCToast('content.json 已导出');
  }
  function reset() {
    if (!confirm('恢复默认内容？将清除本浏览器保存的编辑。')) return;
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* noop */ }
    draft = clone(window.MC_DEFAULT_CONTENT);
    window.MCApp.content = clone(draft);
    window.MCApp.render();
    renderForm();
    if (window.MCToast) window.MCToast('已恢复默认内容');
  }

  /* ---------- 开关 ---------- */
  function syncAdminBody() {
    document.body.classList.toggle('mc-admin', sessionStorage.getItem(SS_KEY) === '1');
  }
  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (sessionStorage.getItem(SS_KEY) === '1') showEdit(); else showToken();
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
  function showToken() {
    stepToken.hidden = false; stepEdit.hidden = true;
    var inp = document.getElementById('tokenInput');
    setTimeout(function () { inp.focus(); }, 60);
    syncAdminBody();
  }
  function showEdit() {
    stepToken.hidden = true; stepEdit.hidden = false;
    draft = clone(window.MCApp.content);
    renderForm();
    syncAdminBody();
  }
  function checkToken(e) {
    e.preventDefault();
    var inp = document.getElementById('tokenInput');
    var err = document.getElementById('tokenErr');
    if (sha256hex(inp.value.trim()) === String(window.MC_TOKEN_SHA256 || '').toLowerCase()) {
      err.hidden = true; inp.value = '';
      sessionStorage.setItem(SS_KEY, '1');
      showEdit();
      if (window.MCToast) window.MCToast('ACCESS GRANTED · 管理员已解锁');
    } else {
      err.hidden = false;
      inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
    }
  }

  function init() {
    var entry = document.getElementById('megaAdmin');
    if (!entry) return;
    entry.addEventListener('click', openModal);
    modal.addEventListener('click', function (e) { if (e.target.closest('[data-admin-close]')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    document.getElementById('tokenForm').addEventListener('submit', checkToken);
    bindInputs();
    initPublish();
    document.getElementById('adminSave').addEventListener('click', save);
    document.getElementById('adminExport').addEventListener('click', exportJson);
    document.getElementById('adminReset').addEventListener('click', reset);
    document.getElementById('adminLogout').addEventListener('click', function () {
      sessionStorage.removeItem(SS_KEY);
      showToken(); syncAdminBody();
      if (window.MCToast) window.MCToast('已退出管理员会话');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
