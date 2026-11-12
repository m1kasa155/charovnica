/* ЧароВница — админ-панель */
(function () {
  'use strict';

  var LS = { hash: 'charovnica_admin_hash', draft: 'charovnica_admin_draft', override: 'charovnica_override' };
  var DEFAULT_PASS = 'charovnica2026';

  var state = null;          // данные
  var tab = 'services';

  /* ---------- утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  function sha256(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function toast(msg, err) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 3600);
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function persist() {
    try {
      var clone = JSON.parse(JSON.stringify(state));
      clone._ts = Date.now();
      localStorage.setItem(LS.draft, JSON.stringify(state));
      localStorage.setItem(LS.override, JSON.stringify(clone));   // живой предпросмотр на этом же origin
    } catch (e) { /* quota */ }
  }

  /* ---------- авторизация ---------- */
  function login(pass) {
    return Promise.resolve(localStorage.getItem(LS.hash)).then(function (saved) {
      var hash = saved || null;
      return sha256(pass).then(function (h) {
        if (hash && hash === h) return true;
        if (!hash && pass === DEFAULT_PASS) return true;
        return false;
      });
    });
  }

  async function initAuth() {
    $('#loginForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var ok = await login($('#loginPass').value);
      if (!ok) { toast('Неверный пароль', true); return; }
      showApp();
    });
    // открыта сессия в этом окне?
    if (sessionStorage.getItem('charovnica_admin_ok')) showApp();
  }

  function showApp() {
    sessionStorage.setItem('charovnica_admin_ok', '1');
    $('#loginWrap').hidden = true;
    $('#app').hidden = false;
    loadState().then(function () {
      setStatus();
      render();
    });
  }

  async function loadState() {
    try {
      var remote = await fetchJSON('content.json?v=' + Date.now());
      state = remote;
    } catch (e) {
      try {
        var draft = JSON.parse(localStorage.getItem(LS.draft));
        if (draft) { state = draft; toast('Не удалось загрузить content.json — открыта сохранённая копия.'); }
      } catch (e2) { /* noop */ }
      if (!state) state = { services: [], team: [], gallery: [], reviews: [], offers: [], meta: {}, contacts: {}, hero: {}, about: {}, booking: {}, footer: {} };
    }
    if (!state.services) state.services = [];
    if (!state.team) state.team = [];
    if (!state.gallery) state.gallery = [];
    if (!state.reviews) state.reviews = [];
    if (!state.offers) state.offers = [];
    if (!state.meta) state.meta = {};
    if (!state.contacts) state.contacts = {};
    if (!state.hero) state.hero = {};
    if (!state.about) state.about = {};
    if (!state.booking) state.booking = {};
    if (!state.footer) state.footer = {};
  }

  function setStatus() {
    var n = (state.services || []).length + (state.team || []).length + (state.gallery || []).length +
      (state.reviews || []).length + (state.offers || []).length;
    $('#sStatus').textContent = 'Разделов: ' + n + ' · данных загружено';
  }

  /* ---------- навигация ---------- */
  function pickTab(view) {
    tab = view;
    $$('.tab-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
    var titles = {
      services: 'Услуги и цены', team: 'Мастера', gallery: 'Галерея', reviews: 'Отзывы',
      offers: 'Акции', settings: 'Настройки'
    };
    $('#viewTitle').textContent = titles[view] || view;
    render();
  }

  function render() {
    var v = $('#view');
    if (tab === 'settings') { v.innerHTML = renderSettings(); bindSettings(v); setStatus(); return; }
    var cfg = { services: [svcDef, 'services'], team: [teamDef, 'team'], gallery: [galDef, 'gallery'], reviews: [revDef, 'reviews'], offers: [offDef, 'offers'] };
    var c = cfg[tab];
    if (!c) return;
    var defs = c[0], key = c[1];
    var items = state[key] || [];
    var rows = items.map(function (it, i) {
      return renderItem(defs, it, i, key);
    }).join('');
    v.innerHTML =
      '<div class="banner">Изменения сохраняются автоматически и сразу видны тебе в предпросмотре. Чтобы обновить сайт для всех — собери <strong>.zip</strong> и перезалей его на tiiny (кнопка «Собрать обновление»).</div>' +
      '<div class="items">' + (rows || '<p class="empty">Пока пусто — добавь первую запись.</p>') + '</div>' +
      '<button class="btn btn-g add-btn" id="addBtn">+ Добавить</button>';
    bindList(v, defs, key, items.length);
    setStatus();
  }

  /* ---------- рендер записи ---------- */
  function field(def, val) {
    var v = val == null ? '' : val;
    var cls = def.full ? ' full' : '';
    if (def.type === 'textarea') {
      return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><textarea data-f="' + def.key + '">' + esc(v) + '</textarea></label>';
    }
    if (def.type === 'select') {
      var opts = def.options.map(function (o) {
        var ov = typeof o === 'object' ? o.v : o, ol = typeof o === 'object' ? o.l : o;
        return '<option value="' + ov + '"' + (String(v) === String(ov) ? ' selected' : '') + '>' + esc(ol) + '</option>';
      }).join('');
      return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><select data-f="' + def.key + '">' + opts + '</select></label>';
    }
    if (def.type === 'checkbox') {
      return '<label class="mini " style="display:flex;align-items:center;gap:8px;width:auto"><input type="checkbox" data-f="' + def.key + '"' + (v ? ' checked' : '') + ' style="width:auto">' + esc(def.label) + '</label>';
    }
    var num = def.type === 'number' ? ' type="number" step="any"' : '';
    return '<label class="' + cls + '"><span>' + esc(def.label) + '</span><input' + num + ' data-f="' + def.key + '" value="' + esc(v) + '"></label>';
  }

  function renderItem(defs, item, i, key) {
    var title = item[defs.find(function (d) { return d.title; }).key] || 'Без названия';
    var sub = String(item[defs.find(function (d) { return d.sub; }).key] || '');
    var fields = defs.filter(function (d) { return !d.title && !d.sub; }).map(function (d) { return field(d, item[d.key]); }).join('');
    if (defs.some(function (d) { return d.type === 'checkbox'; })) fields += '<div class="mini"></div>';
    return '<div class="item" data-i="' + i + '" data-key="' + key + '">' +
      '<div class="item-head"><div><div class="t">' + esc(title) + '</div>' +
      (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' +
      '<div class="item-actions"><button class="btn btn-g btn-sm" data-a="up">↑</button>' +
      '<button class="btn btn-g btn-sm" data-a="down">↓</button>' +
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

  function bindList(root, defs, key, count) {
    $('#addBtn', root).addEventListener('click', function () {
      var item = {};
      defs.forEach(function (d) { if (!d.title && !d.sub) item[d.key] = d.type === 'checkbox' ? false : (d.def != null ? d.def : ''); });
      state[key].push(item);
      persist(); render();
    });
    $$('.item', root).forEach(function (card) {
      var i = +card.getAttribute('data-i');
      card.addEventListener('input', function () {
        state[key][i] = Object.assign({}, state[key][i], collectFields(card));
        persist(); setStatus();
      });
      card.addEventListener('change', function () {
        state[key][i] = Object.assign({}, state[key][i], collectFields(card));
        persist(); setStatus();
      });
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

  /* ---------- описания полей ---------- */
  var T = function (label, key, type, extra) { return Object.assign({ label: label, key: key, type: type || 'text' }, extra || {}); };
  var svcDef = [
    T('Название услуги', 'title', 'text', { title: true, def: 'Новая услуга' }),
    T('Цена, ₽', 'price', 'number', { sub: true }),
    T('Описание', 'desc', 'textarea', { full: true }),
    T('Длительность', 'duration', 'text', { def: '45 мин' }),
    T('Хит (бейдж)', 'popular', 'checkbox')
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
    T('Надпись под фото', 'caption', 'text', { title: true, def: 'Работа мастера' }),
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
    T('Название акции', 'title', 'text', { title: true, def: 'Акция' }),
    T('Бейдж (например -20%)', 'badge', 'text', { sub: true, def: '-20%' }),
    T('Текст', 'text', 'textarea', { full: true })
  ];

  /* ---------- настройки ---------- */
  function lf(label, key, type, full, def, hint) {
    var c = state.contacts;
    var v = c && c[key] != null ? c[key] : (def != null ? def : '');
    var n = type === 'number' ? ' type="number" step="any"' : '';
    var h = hint ? '<span class="hint">' + hint + '</span>' : '';
    return '<label' + (full ? ' style="grid-column:1/-1"' : '') + '><span>' + label + '</span><input' + n + ' data-c="' + key + '" value="' + esc(v) + '">' + h + '</label>';
  }
  function gf(label, key, def) {
    var g = state.gallery || [];
    var opts = g.map(function (x) {
      var src = (x.src || '')
        .replace(/^\//, '')
        .replace(/[?#].*$/, '');
      return '<option value="' + esc(src) + '"' + '>' + esc(src) + '</option>';
    }).join('');
    return '<select data-c="' + key + '" id="galSel' + key + '">' + opts + '<option value=""' + (def ? '' : ' selected') + '>— выбрать фото —</option></select>';
  }

  function renderSettings() {
    var c = state.contacts || {}, h = state.hero || {}, a = state.about || {},
        b = state.booking || {}, f = state.footer || {}, m = state.meta || {};

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
    function svcRow(s) {
      return '<label><span>Услуга</span><input data-svc="' + s + '" value="' + esc(s) + '"></label>';
    }

    var hours = (c.hours || []).map(function (_, i) { return hoursRow(i); }).join('');
    var socials = (c.socials || []).map(socialRow).join('');
    var features = (a.features || []).map(function (fe, i) {
      return '<div class="grid3" data-fe="' + i + '"><input data-fk="' + i + '" value="' + esc(fe.icon) + '" placeholder="icon (coffee/music/park)">' +
        '<input data-ft="' + i + '" value="' + esc(fe.title) + '"><input data-fz="' + i + '" value="' + esc(fe.text) + '"></div>';
    }).join('');

    return '' +
      '<div class="banner">Все изменения сохраняются автоматически и видны в предпросмотре. Пароль админа тоже меняется здесь — не забудь его!</div>' +
      '<div class="settings">' +

      '<fieldset><legend>Название и рейтинг</legend>' +
      '<div class="grid3">' +
      '<label><span>Название</span><input data-m="brand" value="' + esc(c.brand) + '"></label>' +
      '<label><span>Рейтинг</span><input type="number" step="0.1" data-m="rating" value="' + esc(m.rating) + '"></label>' +
      '<label><span>Кол-во отзывов</span><input type="number" data-m="reviewsCount" value="' + esc(m.reviewsCount) + '"></label>' +
      '</div>' +
      '<label style="grid-column:1/-1"><span>Описание сайта (для поисковиков)</span><textarea data-m="description">' + esc(m.description) + '</textarea></label>' +
      '</fieldset>' +

      '<fieldset><legend>Контакты</legend>' +
      '<div class="grid2">' +
      lf('Телефон (как показывать)', 'phoneDisplay', 'text', false, '+7 (4852) 74-08-13') +
      lf('Телефон (для звонка, без + и пробелов)', 'phoneLink', 'text', false, '+74852740813') +
      lf('Адрес', 'address', 'text', false, 'ул. Серго Орджоникидзе, 10к3') +
      lf('Город', 'city', 'text', false, 'Ярославль') +
      lf('E-mail', 'email', 'text', false, 'charovnica76@mail.ru') +
      lf('Координаты lat', 'lat', 'number', false) +
      lf('Координаты lon', 'lon', 'number', false) +
      '</div>' +
      '<label style="grid-column:1/-1"><span>Часы работы (строки)</span></label>' + hours +
      '<div class="mini" style="grid-column:1/-1"><button class="btn btn-g btn-sm" id="addHour">+ Строка часов</button></div>' +
      '<label style="grid-column:1/-1"><span>Соцсети</span></label>' + socials +
      '<div class="mini" style="grid-column:1/-1"><button class="btn btn-g btn-sm" id="addSocial">+ Соцсеть</button></div>' +
      '</fieldset>' +

      '<fieldset><legend>Пароль админа</legend>' +
      '<div class="grid2">' +
      '<label><span>Новый пароль</span><input type="password" id="newPass" placeholder="не менее 8 символов"></label>' +
      '<label><span>Повтори пароль</span><input type="password" id="newPass2"></label>' +
      '</div>' +
      '<div class="mini" style="grid-column:1/-1"><button class="btn btn-p btn-sm" id="changePass">Сменить пароль</button></div>' +
      '</fieldset>' +
      '</div>';
  }

  function bindSettings(root) {
    // контакты
    root.addEventListener('input', function (e) {
      var ck = e.target.getAttribute('data-m');
      if (ck) { setNested(state.meta, e.target, 'data-m'); persist(); }
    });

    $$('[data-c]', root).forEach(function (el) {
      el.addEventListener('input', function () {
        var k = el.getAttribute('data-c');
        if (k === 'lat' || k === 'lon') {
          if (!state.contacts.map) state.contacts.map = { lat: 0, lon: 0 };
          state.contacts.map[k] = parseFloat(el.value) || 0;
        } else {
          state.contacts[k] = el.value;
        }
        persist();
      });
    });

    // часы
    root.addEventListener('click', function (e) {
      if (e.target.id === 'addHour') {
        state.contacts.hours.push({ days: '', time: '' });
        persist(); renderSettingsView();
      }
      if (e.target.id === 'addSocial') {
        state.contacts.socials.push({ id: 'wa', label: 'WhatsApp', url: 'https://wa.me/' });
        persist(); renderSettingsView();
      }
      if (e.target.id === 'changePass') { changePassword(); }
    });
    root.addEventListener('input', function (e) {
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
      toast('Пароль обновлён!');
      p1 = p2 = '';
      $('#newPass').value = ''; $('#newPass2').value = '';
    }
  }

  function renderSettingsView() {
    // переносим настройки из state -> рендер без потери коллекций
    var scroll = window.scrollY;
    var v = $('#view');
    v.innerHTML = renderSettings();
    bindSettings(v);
    window.scrollTo(0, scroll);
  }

  function setNested(obj, el, attr) {
    var k = el.getAttribute(attr);
    if (k === 'rating' || k === 'reviewsCount') obj[k] = parseFloat(el.value) || 0;
    else obj[k] = el.value;
  }

  /* ---------- экспорт ---------- */
  function download(name, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  function exportJson() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    download('content.json', blob);
    toast('content.json скачан.');
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
    toast('Собираем обновление… Не закрывай вкладку.');
    var zip = new JSZip();
    var failed = [];
    return Promise.all(FILE_MANIFEST.map(function (path) {
      return fetch(path, { cache: 'reload' }).then(function (r) {
        if (!r.ok) return Promise.reject(new Error(path));
        return r.blob();
      }).then(function (b) { zip.file(path, b); }).catch(function () { failed.push(path); });
    })).then(function () {
      zip.file('content.json', JSON.stringify(state, null, 2));
      var readme = 'КАК ОБНОВИТЬ САЙТ «ЧАРОВНИЦА»\n' +
        '================================\n\n' +
        '1. Открой https://tiiny.host/manage (вход по e-mail kamil619533@gmail.com).\n' +
        '2. Найди проект charovnica-a9d335.tiiny.site, нажми «Update».\n' +
        '3. Перетащи этот ZIP в окно загрузки. Готово — сайт обновится за минуту.\n\n' +
        (failed.length ? 'ВНИМАНИЕ: не скачались файлы: ' + failed.join(', ') + '. Если в ZIP нет картинок — перекачай полную сборку с собранного ранее site.zip.\n' : '') +
        'Файлы, которые не удалось собрать автоматически, можно достать из резервной копии проекта.\n';
      zip.file('ЧТО-ЭТО.txt', readme);
      return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    }).then(function (blob) {
      download('charovnica-update.zip', blob);
      toast(failed.length ? 'ZIP собран, но без ' + failed.length + ' файлов. Скачай site.zip из проекта.' : 'ZIP собран! Осталось перезалить на tiiny.');
    }).catch(function (e) {
      toast('Не удалось собрать ZIP: ' + e.message, true);
    });
  }

  /* ---------- предпросмотр ---------- */
  function viewSite() {
    persist();
    window.open('index.html?preview=1', '_blank', 'noopener');
  }

  /* ---------- инициализация ---------- */
  function init() {
    $$('.tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { pickTab(b.getAttribute('data-view')); });
    });
    $('#resetLocalBtn').addEventListener('click', function () {
      if (!confirm('Сбросить локальные правки? Данные на сайте не пострадают.')) return;
      localStorage.removeItem(LS.draft); localStorage.removeItem(LS.override);
      toast('Локальные правки сброшены.');
      location.reload();
    });
    $('#dlJsonBtn').addEventListener('click', exportJson);
    $('#zipBtn').addEventListener('click', buildZip);
    $('#sameViewBtn').addEventListener('click', viewSite);
    initAuth();
  }

  document.addEventListener('DOMContentLoaded', init);
})();