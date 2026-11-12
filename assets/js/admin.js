/* ЧароВница — админ-панель (без внешних зависимостей) */
(function () {
  'use strict';

  var LS = { hash: 'charovnica_admin_hash', draft: 'charovnica_admin_draft', override: 'charovnica_override', gh: 'charovnica_github' };
  var DEFAULT_PASS = 'charovnica2026';

  var state = null;
  var tab = 'services';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  function sha256(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function toast(msg, err, ms) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, ms || 3600);
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function persist() {
    try {
      var clone = JSON.parse(JSON.stringify(state));
      clone._ts = Date.now();
      localStorage.setItem(LS.draft, JSON.stringify(state));
      localStorage.setItem(LS.override, JSON.stringify(clone));
    } catch (e) { /* quota */ }
  }

  /* ---------------- авторизация ---------------- */
  function login(pass) {
    var saved = localStorage.getItem(LS.hash);
    return sha256(pass).then(function (h) {
      if (saved && saved === h) return true;
      if (!saved && pass === DEFAULT_PASS) return true;
      return false;
    });
  }

  async function initAuth() {
    $('#loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = $('#loginForm button[type=submit]');
      btn.disabled = true;
      try {
        var ok = await login($('#loginPass').value);
        if (!ok) { toast('Неверный пароль', true); btn.disabled = false; return; }
        showApp();
      } catch (err) {
        toast('Ошибка: ' + err.message, true);
        btn.disabled = false;
      }
    });
    if (sessionStorage.getItem('charovnica_admin_ok')) showApp();
  }

  function showApp() {
    sessionStorage.setItem('charovnica_admin_ok', '1');
    $('#loginWrap').hidden = true;
    $('#app').hidden = false;
    loadState().then(function () { setStatus(); render(); });
  }

  async function loadState() {
    try {
      state = await fetchJSON('content.json?v=' + Date.now());
    } catch (e) {
      try {
        var draft = JSON.parse(localStorage.getItem(LS.draft));
        if (draft) { state = draft; toast('Не удалось загрузить content.json — открыта сохранённая копия.'); }
      } catch (e2) { /* noop */ }
      if (!state) state = { meta: {}, contacts: {}, hero: {}, about: {}, services: [], team: [], gallery: [], reviews: [], offers: [], booking: {}, footer: {} };
    }
    ['meta', 'contacts', 'hero', 'about', 'booking', 'footer'].forEach(function (k) { if (!state[k]) state[k] = {}; });
    ['services', 'team', 'gallery', 'reviews', 'offers'].forEach(function (k) { if (!state[k]) state[k] = []; });
    if (!state.contacts.map) state.contacts.map = { lat: 0, lon: 0 };
  }

  function setStatus() {
    var n = state.services.length + state.team.length + state.gallery.length + state.reviews.length + state.offers.length;
    $('#sStatus').textContent = 'Разделов: ' + n + ' · сохранено в ' + (state.contacts.brand || '…');
  }

  /* ---------------- навигация ---------------- */
  function pickTab(view) {
    tab = view;
    $$('.tab-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
    var titles = { services: 'Услуги и цены', team: 'Мастера', gallery: 'Галерея', reviews: 'Отзывы', offers: 'Акции', settings: 'Настройки', publish: 'Публикация' };
    $('#viewTitle').textContent = titles[view] || view;
    render();
  }

  function render() {
    var v = $('#view');
    if (tab === 'settings') { v.innerHTML = renderSettings(); bindSettings(v); setStatus(); return; }
    if (tab === 'publish') { v.innerHTML = renderPublish(); bindPublish(v); setStatus(); return; }
    var cfg = { services: [svcDef, 'services'], team: [teamDef, 'team'], gallery: [galDef, 'gallery'], reviews: [revDef, 'reviews'], offers: [offDef, 'offers'] }[tab];
    if (!cfg) return;
    var defs = cfg[0], key = cfg[1];
    var items = state[key] || [];
    var rows = items.map(function (it, i) { return renderItem(defs, it, i, key); }).join('');
    v.innerHTML =
      '<div class="banner">Правки сохраняются автоматически и видны в «Открыть сайт». Чтобы сайт увидели все — нажми <strong>«Публикация»</strong> и «Опубликовать на GitHub».</div>' +
      '<div class="items">' + (rows || '<p class="empty">Пока пусто — добавь первую запись.</p>') + '</div>' +
      '<button class="btn btn-g add-btn" id="addBtn">+ Добавить</button>';
    bindList(v, defs, key, items.length);
    setStatus();
  }

  /* ---------------- рендер записи ---------------- */
  function field(def, val) {
    var v = val == null ? '' : val;
    var cls = def.full ? ' full' : '';
    if (def.type === 'textarea') {
      return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><textarea data-f="' + def.key + '">' + esc(v) + '</textarea></label>';
    }
    if (def.type === 'select') {
      var opts = def.options.map(function (o) {
        var ov = typeof o === 'object' ? o.v : o, ol = typeof o === 'object' ? o.l : o;
        return '<option value="' + esc(ov) + '"' + (String(v) === String(ov) ? ' selected' : '') + '>' + esc(ol) + '</option>';
      }).join('');
      return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><select data-f="' + def.key + '">' + opts + '</select></label>';
    }
    if (def.type === 'checkbox') {
      return '<label class="mini" style="display:flex;align-items:center;gap:8px"><input type="checkbox" data-f="' + def.key + '"' + (v ? ' checked' : '') + ' style="width:auto">' + esc(def.label) + '</label>';
    }
    var num = def.type === 'number' ? ' type="number" step="any"' : '';
    return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><input' + num + ' data-f="' + def.key + '" value="' + esc(v) + '"></label>';
  }

  function renderItem(defs, item, i, key) {
    var tDef = defs.find(function (d) { return d.title; });
    var sDef = defs.find(function (d) { return d.sub; });
    var title = tDef ? (item[tDef.key] || 'Без названия') : '';
    var sub = sDef ? String(item[sDef.key] != null ? item[sDef.key] : '') : '';
    var fields = defs.filter(function (d) { return !d.title && !d.sub; }).map(function (d) { return field(d, item[d.key]); }).join('');
    return '<div class="item" data-i="' + i + '" data-key="' + key + '">' +
      '<div class="item-head"><div><div class="t">' + esc(title) + '</div>' +
      (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' +
      '<div class="item-actions"><button class="btn btn-g btn-sm" data-a="up" title="Вверх">↑</button>' +
      '<button class="btn btn-g btn-sm" data-a="down" title="Вниз">↓</button>' +
      '<button class="btn btn-danger btn-sm" data-a="del">Удалить</button></div></div>' +
      '<div class="item-form">' + fields + '</div></div>';
  }

  function collectFields(root) {
    var item = {};
    $$('[data-f]', root).forEach(function (el) {
      var k = el.getAttribute('data-f');
      if (el.type === 'checkbox') item[k] = el.checked;
      else if (el.type === 'number') item[k] = el.value === '' ? '' : (isNaN(+el.value) ? el.value : +el.value);
      else item[k] = el.value;
    });
    return item;
  }

  function bindList(root, defs, key) {
    $('#addBtn', root).addEventListener('click', function () {
      var item = {};
      defs.forEach(function (d) { if (!d.title && !d.sub) item[d.key] = d.type === 'checkbox' ? false : (d.def != null ? d.def : ''); });
      state[key].push(item);
      persist(); render();
    });
    $$('.item', root).forEach(function (card) {
      var i = +card.getAttribute('data-i');
      card.addEventListener('input', function () { state[key][i] = Object.assign({}, state[key][i], collectFields(card)); persist(); setStatus(); });
      card.addEventListener('change', function () { state[key][i] = Object.assign({}, state[key][i], collectFields(card)); persist(); setStatus(); });
      $$('button[data-a]', card).forEach(function (b) {
        b.addEventListener('click', function () {
          var a = b.getAttribute('data-a');
          if (a === 'del') { if (confirm('Удалить запись?')) { state[key].splice(i, 1); persist(); render(); } }
          if (a === 'up' && i > 0) { var t = state[key][i]; state[key][i] = state[key][i - 1]; state[key][i - 1] = t; persist(); render(); }
          if (a === 'down' && i < state[key].length - 1) { var t2 = state[key][i]; state[key][i] = state[key][i + 1]; state[key][i + 1] = t2; persist(); render(); }
        });
      });
    });
  }

  /* ---------------- поля ---------------- */
  var T = function (label, key, type, extra) { return Object.assign({ label: label, key: key, type: type || 'text' }, extra || {}); };
  var svcDef = [
    T('Название услуги', 'title', 'text', { title: true, def: 'Новая услуга' }),
    T('Цена, ₽', 'price', 'number', { sub: true, def: 1000 }),
    T('Описание', 'desc', 'textarea', { full: true }),
    T('Длительность', 'duration', 'text', { def: '45 мин' }),
    T('Хит (бейдж «хит»)', 'popular', 'checkbox')
  ];
  var teamDef = [
    T('Имя мастера', 'name', 'text', { title: true, def: 'Мастер' }),
    T('Роль', 'role', 'text', { sub: true, def: 'Барбер' }),
    T('Опыт', 'exp', 'text', { def: '5 лет' }),
    T('Путь к фото (assets/img/...)', 'photo', 'text', { def: 'assets/img/team-arsen.jpg', full: true }),
    T('О мастере', 'text', 'textarea', { full: true }),
    T('Ссылка на соцсеть', 'social', 'text', { def: 'https://vk.com/' })
  ];
  var galDef = [
    T('Надпись', 'caption', 'text', { title: true, def: 'Работа мастера' }),
    T('Путь к фото (assets/img/...)', 'src', 'text', { sub: true, def: 'assets/img/work-1.jpg' })
  ];
  var revDef = [
    T('Имя клиента', 'name', 'text', { title: true, def: 'Клиент' }),
    T('Оценка 1–5', 'rating', 'number', { sub: true, def: 5 }),
    T('Дата', 'date', 'text', { def: '01.01.2026' }),
    T('Услуга', 'service', 'text', { def: 'Мужская стрижка' }),
    T('Текст отзыва', 'text', 'textarea', { full: true })
  ];
  var offDef = [
    T('Название', 'title', 'text', { title: true, def: 'Акция' }),
    T('Бейдж (например -20%)', 'badge', 'text', { sub: true, def: '-20%' }),
    T('Текст', 'text', 'textarea', { full: true })
  ];

  /* ---------------- настройки ---------------- */
  function lf(label, key, type, full, def, hint) {
    var c = state.contacts;
    var v = c && c[key] != null ? c[key] : (def != null ? def : '');
    var n = type === 'number' ? ' type="number" step="any"' : '';
    var h = hint ? '<span class="hint">' + esc(hint) + '</span>' : '';
    return '<label' + (full ? ' style="grid-column:1/-1"' : '') + '><span>' + label + '</span><input' + n + ' data-c="' + key + '" value="' + esc(v) + '">' + h + '</label>';
  }

  function renderSettings() {
    var c = state.contacts, h = state.hero, a = state.about, b = state.booking, f = state.footer, m = state.meta;

    function hoursRow(i) {
      var hr = (c.hours || [])[i] || { days: '', time: '' };
      return '<div class="grid2" data-hr="' + i + '"><label><span>Дни</span><input data-hd="' + i + '" value="' + esc(hr.days) + '"></label>' +
        '<label><span>Время</span><input data-ht="' + i + '" value="' + esc(hr.time) + '"></label></div>';
    }
    function socialRow(s, i) {
      var labels = { wa: 'WhatsApp', tg: 'Telegram', vk: 'VK', maps: 'Карта' };
      return '<div class="grid3" data-sr="' + i + '"><label><span>Сервис</span><select data-ss="' + i + '">' +
        ['wa', 'tg', 'vk', 'maps'].map(function (id) { return '<option value="' + id + '"' + (s.id === id ? ' selected' : '') + '>' + labels[id] + '</option>'; }).join('') +
        '</select></label><label><span>Название кнопки</span><input data-sl="' + i + '" value="' + esc(s.label) + '"></label>' +
        '<label><span>Ссылка</span><input data-su="' + i + '" value="' + esc(s.url) + '"></label></div>';
    }

    var hours = (c.hours || []).map(function (_, i) { return hoursRow(i); }).join('');
    var socials = (c.socials || []).map(socialRow).join('');

    return '' +
      '<div class="banner">Все изменения сохраняются автоматически. Пароль тоже меняется здесь.</div>' +
      '<div class="settings">' +

      '<fieldset><legend>Название и рейтинг</legend>' +
      '<div class="grid3">' +
      '<label><span>Название (бренд)</span><input data-c="brand" value="' + esc(c.brand || '') + '"></label>' +
      '<label><span>Рейтинг</span><input type="number" step="0.1" data-c="rating" value="' + esc(m.rating != null ? m.rating : '') + '"></label>' +
      '<label><span>Кол-во отзывов</span><input type="number" data-c="reviewsCount" value="' + esc(m.reviewsCount != null ? m.reviewsCount : '') + '"></label>' +
      '</div>' +
      '<label style="grid-column:1/-1"><span>Описание сайта (для поисковиков)</span><textarea data-c="description">' + esc(m.description || '') + '</textarea></label>' +
      '</fieldset>' +

      '<fieldset><legend>Контакты</legend>' +
      '<div class="grid2">' +
      lf('Телефон (как показывать)', 'phoneDisplay', 'text', false, '+7 (4852) 74-08-13') +
      lf('Телефон (для звонка: +7 без пробелов)', 'phoneLink', 'text', false, '+74852740813') +
      lf('Адрес', 'address', 'text', false, 'ул. Серго Орджоникидзе, 10к3') +
      lf('Город', 'city', 'text', false, 'Ярославль') +
      lf('E-mail', 'email', 'text', false, 'charovnica76@mail.ru') +
      '</div>' +
      '<div class="grid2">' +
      '<label><span>Координаты lat (карта)</span><input type="number" step="any" data-c="lat" value="' + esc(((c.map||{}).lat) || '') + '"></label>' +
      '<label><span>Координаты lon (карта)</span><input type="number" step="any" data-c="lon" value="' + esc(((c.map||{}).lon) || '') + '"></label>' +
      '</div>' +
      '<label style="grid-column:1/-1"><span>Часы работы (строки)</span></label>' + hours +
      '<div class="mini" style="grid-column:1/-1"><button class="btn btn-g btn-sm" id="addHour">+ Строка часов</button> <button class="btn btn-g btn-sm" id="addSocial">+ Соцсеть</button></div>' +
      socials +
      '</fieldset>' +

      '<fieldset><legend>Безопасность</legend>' +
      '<div class="grid2">' +
      '<label><span>Новый пароль админа (мин. 8 символов)</span><input type="password" id="newPass" autocomplete="new-password"></label>' +
      '<label><span>Повтори пароль</span><input type="password" id="newPass2" autocomplete="new-password"></label>' +
      '</div>' +
      '<div class="mini" style="grid-column:1/-1"><button class="btn btn-p btn-sm" id="changePass">Сменить пароль</button></div>' +
      '</fieldset>' +
      '</div>';
  }

  function bindSettings(root) {
    root.addEventListener('click', function (e) {
      if (e.target.id === 'addHour') { state.contacts.hours.push({ days: '', time: '' }); persist(); renderSettingsView(); }
      if (e.target.id === 'addSocial') { state.contacts.socials.push({ id: 'wa', label: 'WhatsApp', url: 'https://wa.me/' }); persist(); renderSettingsView(); }
      if (e.target.id === 'changePass') { changePassword(); }
    });
    root.addEventListener('input', function (e) {
      var ck = e.target.getAttribute('data-c');
      if (ck) {
        if (ck === 'lat' || ck === 'lon') { if (!state.contacts.map) state.contacts.map = {}; state.contacts.map[ck] = parseFloat(e.target.value) || 0; }
        else if (ck === 'rating' || ck === 'reviewsCount') state.meta[ck] = parseFloat(e.target.value) || 0;
        else state.contacts[ck] = e.target.value;
        persist();
      }
      var hd = e.target.getAttribute('data-hd'), ht = e.target.getAttribute('data-ht');
      if (hd != null) { state.contacts.hours[+hd].days = e.target.value; persist(); }
      if (ht != null) { state.contacts.hours[+ht].time = e.target.value; persist(); }
      var ss = e.target.getAttribute('data-ss'), sl = e.target.getAttribute('data-sl'), su = e.target.getAttribute('data-su');
      if (ss != null) { state.contacts.socials[+ss].id = e.target.value; persist(); }
      if (sl != null) { state.contacts.socials[+sl].label = e.target.value; persist(); }
      if (su != null) { state.contacts.socials[+su].url = e.target.value; persist(); }
    });

    async function changePassword() {
      var p1 = $('#newPass').value, p2 = $('#newPass2').value;
      if (p1.length < 8 || p1 !== p2) { toast('Пароль короткий или не совпадает', true); return; }
      var h = await sha256(p1);
      localStorage.setItem(LS.hash, h);
      toast('Пароль обновлён! Запомни его.');
      $('#newPass').value = ''; $('#newPass2').value = '';
    }
  }

  function renderSettingsView() {
    var scroll = window.scrollY;
    $('#view').innerHTML = renderSettings();
    bindSettings($('#view'));
    window.scrollTo(0, scroll);
  }

  /* ---------------- публикация ---------------- */
  function renderPublish() {
    var gh = {};
    try { gh = JSON.parse(localStorage.getItem(LS.gh)) || {}; } catch (e) {}
    return '' +
      '<div class="banner">Публикуй изменения на GitHub одним кликом — через 1–2 минуты сайт обновится для всех. Токен хранится <strong>только в твоём браузере</strong> и никуда не отправляется кроме GitHub API.</div>' +
      '<div class="settings">' +
      '<fieldset><legend>GitHub (публикация)</legend>' +
      '<div class="grid3">' +
      '<label><span>Логин GitHub</span><input id="ghUser" value="' + esc((gh.user || state.githubUser || '')) + '" placeholder="m1kasa155" autocomplete="off"></label>' +
      '<label><span>Репозиторий</span><input id="ghRepo" value="' + esc((gh.repo || 'charovnica')) + '" placeholder="charovnica" autocomplete="off"></label>' +
      '<label><span>Токен (ghp_...)</span><input id="ghToken" type="password" value="' + esc((gh.token || '')) + '" placeholder="ghp_xxx" autocomplete="off"></label>' +
      '</div>' +
      '<p class="hint" style="margin-top:10px">Токен: GitHub → Settings → Developer settings → Tokens (classic) → галка <b>repo</b> → Generate. Хранится только на этом устройстве.</p>' +
      '<div class="mini" style="margin-top:14px">' +
      '<button class="btn btn-p" id="ghPublish">Опубликовать на GitHub</button> ' +
      '<button class="btn btn-g" id="dlJson2">Скачать content.json</button> ' +
      '</div>' +
      '<div class="publish-log" id="pubLog" style="margin-top:14px;font-size:13px;color:var(--bone);white-space:pre-wrap"></div>' +
      '</fieldset>' +
      '<fieldset><legend>Резервная копия</legend>' +
      '<div class="mini"><button class="btn btn-g" id="dlJson">Скачать content.json</button> <button class="btn btn-g" id="zipBtn">Собрать обновление .zip (для любого хостинга)</button></div>' +
      '<p class="hint" style="margin-top:10px">ZIP содержит весь сайт с последними правками — можно залить на любой статический хостинг или хранить как резерв.</p>' +
      '</fieldset>' +
      '</div>';
  }

  function logLine(el, msg, err) {
    var div = document.createElement('div');
    div.textContent = msg;
    if (err) div.style.color = '#F2A0A0';
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  async function publishToGithub() {
    var log = $('#pubLog');
    log.innerHTML = '';
    var user = ($('#ghUser').value || '').trim();
    var repo = ($('#ghRepo').value || '').trim();
    var token = ($('#ghToken').value || '').trim();
    if (!user || !repo || !token) { toast('Заполни логин, репозиторий и токен', true); return; }
    try { localStorage.setItem(LS.gh, JSON.stringify({ user: user, repo: repo, token: token })); } catch (e) {}
    var content = JSON.stringify(state, null, 2);
    var base64 = btoa(unescape(encodeURIComponent(content)));
    var api = 'https://api.github.com/repos/' + encodeURIComponent(user) + '/' + encodeURIComponent(repo) + '/contents/content.json';
    try {
      logLine(log, '1/2  Проверяю токен и читаю версию файла…');
      var r = await fetch(api + '?ref=main', { headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CharovnicaAdmin' } });
      if (!r.ok) throw new Error('GitHub: ' + r.status + ' — проверь логин/токен (нужна галка repo)');
      var info = await r.json();
      var sha = info.sha;
      logLine(log, '2/2  Заливаю content.json…');
      var r2 = await fetch(api, {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'User-Agent': 'CharovnicaAdmin' },
        body: JSON.stringify({ message: 'Обновление контента через админку', content: base64, sha: sha, branch: 'main' })
      });
      if (!r2.ok) { var e2 = await r2.json().catch(function () { return {}; }); throw new Error('GitHub: ' + r2.status + ' ' + (e2.message || '')); }
      logLine(log, '✔ Готово! content.json обновлён. GitHub Pages пересобирает сайт — изменения появятся через 1–2 минуты.');
      toast('Опубликовано на GitHub!');
    } catch (err) {
      logLine(log, '✘ Ошибка: ' + err.message, true);
      toast('Не опубликовано: ' + err.message, true, 6000);
    }
  }

  function bindPublish(root) {
    $('#ghPublish', root).addEventListener('click', publishToGithub);
    ['dlJson', 'dlJson2'].forEach(function (id) {
      var el = $('#' + id, root);
      if (el) el.addEventListener('click', exportJson);
    });
    $('#zipBtn', root).addEventListener('click', buildZip);
  }

  /* ---------------- экспорт ---------------- */
  function download(name, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  function exportJson() {
    download('content.json', new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    toast('content.json скачан.');
  }

  /* ---------------- ZIP (без внешних библиотек, STORE) ---------------- */
  var CRC_TABLE = (function () {
    var t = new Int32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function dosTime() {
    var d = new Date();
    var t = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return [dt, t];
  }
  function makeZip(files) {
    var enc = new TextEncoder();
    var parts = [];
    var central = [];
    var offset = 0;
    var [dTime, dDate] = dosTime();
    var version = 20;
    files.forEach(function (f) {
      var nameB = enc.encode(f.name);
      var data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      var crc = crc32(data);
      // Локальный заголовок: sig, v, flags, method, time, date, crc, csize, usize, namelen, extralen
      var local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, version, true);
      local.setUint16(6, 0, true);            // flags
      local.setUint16(8, 0, true);            // method 0 = store
      local.setUint16(10, dTime, true);
      local.setUint16(12, dDate, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameB.length, true);
      local.setUint16(28, 0, true);
      // Центральный каталог: sig, vMade, vNeed, flags, method, time, date, crc, csize, usize, namelen, extralen, commentlen, disk, intAttr, extAttr, localOff
      var rec = new DataView(new ArrayBuffer(46));
      rec.setUint32(0, 0x02014b50, true);
      rec.setUint16(4, version, true);
      rec.setUint16(6, version, true);
      rec.setUint16(8, 0, true);              // flags
      rec.setUint16(10, 0, true);             // method
      rec.setUint16(12, dTime, true);
      rec.setUint16(14, dDate, true);
      rec.setUint32(16, crc, true);
      rec.setUint32(20, data.length, true);
      rec.setUint32(24, data.length, true);
      rec.setUint16(28, nameB.length, true);
      rec.setUint16(30, 0, true);
      rec.setUint16(32, 0, true);
      rec.setUint16(34, 0, true);
      rec.setUint16(36, 0, true);
      rec.setUint32(38, 0, true);
      rec.setUint32(42, offset, true);
      parts.push(local, nameB, data);
      central.push(rec, nameB);
      offset += 30 + nameB.length + data.length;
    });
    var cdSize = central.reduce(function (s, b) { return s + b.byteLength; }, 0);
    var eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);
    eocd.setUint16(8, files.length, true);
    eocd.setUint16(10, files.length, true);
    eocd.setUint32(12, cdSize, true);
    eocd.setUint32(16, offset, true);
    var total = offset + cdSize + 22;
    var out = new Uint8Array(total);
    var pos = 0;
    parts.concat(central, [eocd]).forEach(function (b) {
      if (b instanceof DataView) { out.set(new Uint8Array(b.buffer, b.byteOffset, b.byteLength), pos); pos += b.byteLength; }
      else { out.set(b, pos); pos += b.byteLength; }
    });
    return out;
  }

  var FILE_MANIFEST = [
    'index.html', 'admin.html', 'content.json', 'assets/favicon.svg',
    'assets/css/main.css', 'assets/js/main.js', 'assets/js/admin.js',
    'assets/fonts/unbounded-cyrillic-400.woff2', 'assets/fonts/unbounded-cyrillic-600.woff2', 'assets/fonts/unbounded-cyrillic-800.woff2',
    'assets/fonts/manrope-cyrillic-400.woff2', 'assets/fonts/manrope-cyrillic-500.woff2', 'assets/fonts/manrope-cyrillic-700.woff2', 'assets/fonts/manrope-cyrillic-800.woff2',
    'assets/img/hero-barber.jpg', 'assets/img/hero-shave.jpg', 'assets/img/about-interior.jpg',
    'assets/img/team-arsen.jpg', 'assets/img/team-misha.jpg', 'assets/img/team-roma.jpg', 'assets/img/team-nazim.jpg',
    'assets/img/work-1.jpg', 'assets/img/work-2.jpg', 'assets/img/work-3.jpg', 'assets/img/work-4.jpg',
    'assets/img/work-5.jpg', 'assets/img/work-6.jpg', 'assets/img/work-7.jpg', 'assets/img/work-8.jpg'
  ];

  function buildZip() {
    toast('Собираем ZIP…');
    var files = [];
    return Promise.all(FILE_MANIFEST.map(function (path) {
      return fetch(path, { cache: 'reload' }).then(function (r) {
        if (!r.ok) return Promise.reject(new Error(path));
        return r.arrayBuffer();
      }).then(function (buf) {
        if (path.endsWith('.json')) {
          files.push({ name: path, data: JSON.stringify(state, null, 2) });
        } else {
          files.push({ name: path, data: new Uint8Array(buf) });
        }
      }).catch(function () { files.push({ name: path, data: '' }); });
    })).then(function () {
      var readme = 'АРХИВ САЙТА «ЧАРОВНИЦА»\n=========================\nПолная копия сайта с последними правками.\nПубликация на GitHub Pages: репозиторий + ветка main, корень сайта.\n';
      files.push({ name: 'README.txt', data: readme });
      var zip = makeZip(files);
      try { window.__lastZip = zip; } catch (e) {}
      download('charovnica-site-backup.zip', new Blob([zip], { type: 'application/zip' }));
      toast('ZIP готов (' + Math.round(zip.length / 1024) + ' КБ).');
    }).catch(function (e) {
      toast('Не удалось собрать ZIP: ' + e.message, true);
    });
  }

  /* ---------------- шапка ---------------- */
  function viewSite() {
    persist();
    window.open('index.html?preview=1', '_blank', 'noopener');
  }

  /* ---------------- запуск ---------------- */
  function init() {
    $$('.tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { pickTab(b.getAttribute('data-view')); });
    });
    $('#resetLocalBtn').addEventListener('click', function () {
      if (!confirm('Сбросить локальные правки? На сайте они не появятся, пока не опубликуешь.')) return;
      localStorage.removeItem(LS.draft); localStorage.removeItem(LS.override);
      location.reload();
    });
    $('#sameViewBtn').addEventListener('click', viewSite);
    initAuth();
  }

  document.addEventListener('DOMContentLoaded', init);
})();