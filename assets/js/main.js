/* ЧароВница — main.js */
(function () {
  'use strict';

  var FALLBACK = {
    meta: { rating: 4.7, reviewsCount: 49 },
    contacts: {
      brand: 'ЧароВница', tagline: 'Мужская парикмахерская',
      address: 'ул. Серго Орджоникидзе, 10к3', city: 'Ярославль',
      phoneDisplay: '+7 (4852) 74-08-13', phoneLink: '+74852740813',
      email: 'charovnica76@mail.ru',
      hours: [
        { days: 'Пн–Пт', time: '09:00 – 20:00' },
        { days: 'Сб–Вс', time: '10:00 – 18:00' }
      ],
      scheduleWeekly: [
        { day: 0, open: '10:00', close: '18:00' }, { day: 1, open: '09:00', close: '20:00' },
        { day: 2, open: '09:00', close: '20:00' }, { day: 3, open: '09:00', close: '20:00' },
        { day: 4, open: '09:00', close: '20:00' }, { day: 5, open: '09:00', close: '20:00' },
        { day: 6, open: '10:00', close: '18:00' }
      ],
      socials: [
        { id: 'wa', label: 'WhatsApp', url: 'https://wa.me/74852740813' },
        { id: 'tg', label: 'Telegram', url: 'https://t.me/charovnica76' },
        { id: 'vk', label: 'VK', url: 'https://vk.com/charovnica76' },
        { id: 'maps', label: '2ГИС', url: 'https://2gis.ru/yaroslavl' }
      ],
      mapQuery: 'Ярославль, Серго Орджоникидзе 10к3'
    },
    hero: {
      badge: 'Ярославль · с 2014 года', headlineTop: 'Мужская', headlineMain: 'ЧароВница',
      subtitle: 'Стрижки, борода и бритьё опасной бритвой в самом спокойном месте района. Кофе, музыка и без суеты.',
      photoMain: 'assets/img/hero-barber.jpg', photoSide: 'assets/img/hero-shave.jpg',
      stats: [
        { value: '4.7', label: 'рейтинг в 2ГИС', stars: true },
        { value: '49', label: 'отзывов клиентов' },
        { value: '12', label: 'лет мастерам' },
        { value: '0', label: 'лишних разговоров' }
      ]
    },
    about: {
      title: 'Твой барбершоп на Орджоникидзе',
      text: ['«ЧароВница» — мужская парикмахерская для тех, кто ценит чёткие линии и своё время.',
        'Работаем по предзаписи, чтобы не ждать в очереди: пришёл, сел в кресло, вышел собранным.'],
      features: [
        { icon: 'coffee', title: 'Кофе и чай', text: 'Пока ты в кресле — нальём американо или чёрный чай.' },
        { icon: 'music', title: 'Своя музыка', text: 'Приноси плейлист — выберем под настроение.' },
        { icon: 'park', title: 'Парковка у дверей', text: 'Оставь машину прямо у входа.' }
      ],
      photo: 'assets/img/about-interior.jpg'
    },
    services: [
      { id: 'haircut', title: 'Мужская стрижка', desc: 'Стрижка под машинку и ножницы, мытьё головы, укладка', price: 1400, duration: '60 мин', popular: true },
      { id: 'haircut-clipper', title: 'Стрижка машинкой', desc: 'Быстрая стрижка с окантовкой и контуром', price: 1000, duration: '35 мин' },
      { id: 'beard', title: 'Моделирование бороды', desc: 'Форма, контур и окантовка бороды', price: 800, duration: '30 мин' },
      { id: 'royal', title: 'Королевское бритьё', desc: 'Горячее полотенце, масло, опасная бритва', price: 1200, duration: '45 мин', popular: true },
      { id: 'fade', title: 'Фейд под насадку', desc: 'Плавный переход от кожи к волосам любой сложности', price: 1300, duration: '50 мин' },
      { id: 'complex', title: 'Стрижка + борода', desc: 'Полный комплект: стрижка, борода и укладка', price: 2000, duration: '90 мин', popular: true },
      { id: 'styling', title: 'Укладка', desc: 'Укладка с профессиональной косметикой', price: 500, duration: '15 мин' },
      { id: 'child', title: 'Детская стрижка', desc: 'Аккуратная стрижка для парней до 12 лет', price: 900, duration: '40 мин' }
    ],
    team: [
      { id: 'arsen', name: 'Арсен', role: 'Основатель, топ-барбер', exp: '14 лет', photo: 'assets/img/team-arsen.jpg', text: 'Фейды, классика и работа с плотной бородой.', social: 'https://vk.com/' },
      { id: 'misha', name: 'Миша', role: 'Барбер', exp: '8 лет', photo: 'assets/img/team-misha.jpg', text: 'Сложные переходы и идеальная окантовка.', social: 'https://vk.com/' },
      { id: 'roma', name: 'Рома', role: 'Барбер', exp: '6 лет', photo: 'assets/img/team-roma.jpg', text: 'Машинка и ножницы — одинаково уверенно.', social: 'https://vk.com/' },
      { id: 'nazim', name: 'Назим', role: 'Барбер', exp: '5 лет', photo: 'assets/img/team-nazim.jpg', text: 'Бритьё опасной бритвой и уход за кожей.', social: 'https://vk.com/' }
    ],
    gallery: [
      { src: 'assets/img/work-1.jpg', caption: 'Мужская стрижка' },
      { src: 'assets/img/work-2.jpg', caption: 'Укладка после стрижки' },
      { src: 'assets/img/work-3.jpg', caption: 'Работа мастера' },
      { src: 'assets/img/work-4.jpg', caption: 'Стиль и форма' },
      { src: 'assets/img/work-5.jpg', caption: 'Атмосфера цеха' },
      { src: 'assets/img/work-6.jpg', caption: 'Точность до миллиметра' },
      { src: 'assets/img/work-7.jpg', caption: 'Интерьер барбершопа' },
      { src: 'assets/img/work-8.jpg', caption: 'Классика ремесла' }
    ],
    reviews: [
      { name: 'Дмитрий К.', rating: 5, date: '18.10.2026', service: 'Стрижка + борода', text: 'Попал по записи, боясь очередей — не успел, а уже сижу в кресле. Чёткие линии, никакой воды.' },
      { name: 'Сергей В.', rating: 5, date: '02.10.2026', service: 'Фейд под насадку', text: 'Сложная макушка, куда в салонах боятся лезть. Тут — без вопросов, 40 минут и отличный фейд.' }
    ],
    booking: {
      title: 'Запишись — и приходи в кресло',
      text: 'Выбери услугу, оставь контакт — и мы подтвердим время в мессенджере. Потом просто приходи: кофе уже будет.',
      note: 'Нажми «Отправить» — откроется WhatsApp или Telegram с готовым сообщением.'
    },
    footer: { text: 'Мужская парикмахерская «ЧароВница» · Ярославль\nРаботаем по предзаписи.', devNote: 'Сайт-визитка для парикмахерской' }
  };

  var ICONS = {
    coffee: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h11v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z"/><path d="M15 10h2a3 3 0 0 1 0 6h-2"/><path d="M7 3v2M10.5 3v2M14 3v2"/></svg>',
    music: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    park: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M3 9h16M9 7v2M13 7v2"/></svg>'
  };

  var SOCIAL_ICONS = {
    wa: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.4-.5-.6-.8-1.3-.9-1.4-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 3.9 3.5.5.2 1 .3 1.3.4.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M21.9 4.6 19 19.2c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.5.5-.9.5l.3-4.5L18.5 6.6c.4-.3-.1-.5-.6-.2L6.8 13.1l-4.4-1.4c-1-.3-1-1 .2-1.4l17.5-6.8c.8-.3 1.5.2 1.8 1.1z"/></svg>',
    vk: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M13.1 17.9c-5.5 0-8.8-3.9-9-10.3h2.8c.2 4.8 2.3 6.8 4 7.2V7.6h2.8v4.1c1.7-.2 3.4-2 4-4.1h2.8c-.4 2.6-2.3 4.4-3.6 5.1 1.3.7 3.4 2.4 4.1 5.2h-3c-.6-2-2.1-3.6-4.1-3.9v3.9h-.7"/></svg>',
    maps: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>'
  };

  var fmt = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var stars = function (r, cls) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += i <= r ? '★' : '☆';
    return '<span class="' + (cls || 'stars') + '" aria-label="Оценка ' + r + ' из 5">' + out + '</span>';
  };

  var DATA = FALLBACK;
  var toastTimer = null;

  function toast(msg, ms) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, ms || 4200);
  }

  /* ---------- загрузка данных ---------- */
  function loadData() {
    // локальные правки из админки (тот же origin) — действуют 1 час, для предпросмотра
    try {
      var ov = localStorage.getItem('charovnica_override');
      if (ov) {
        var parsed = JSON.parse(ov);
        if (parsed && parsed._ts && Date.now() - parsed._ts < 3600000) {
          delete parsed._ts;
          DATA = parsed;
          return Promise.resolve();
        }
      }
    } catch (e) { /* noop */ }
    var url = 'content.json?v=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { DATA = j; })
      .catch(function () { DATA = FALLBACK; });
  }

  /* ---------- рендер ---------- */
  function render() {
    var c = DATA.contacts || {}, h = DATA.hero || {}, a = DATA.about || {},
        b = DATA.booking || {}, f = DATA.footer || {}, meta = DATA.meta || {};

    // meta
    document.title = meta.title || ((c.brand || 'ЧароВница') + ' — мужская парикмахерская');
    var md = document.querySelector('meta[name=description]');
    if (md && meta.description) md.setAttribute('content', meta.description);

    // бренд
    Array.prototype.forEach.call(document.querySelectorAll('.brand-name, .footer-name'), function (el) {
      el.textContent = c.brand || 'ЧароВница';
    });

    // hero
    setText('heroBadge', h.badge);
    setText('heroTitleTop', h.headlineTop);
    setText('heroTitleMain', h.headlineMain);
    setText('heroSub', h.subtitle);
    setImg('heroPhotoMain', h.photoMain, 'Стрижка в барбершопе ' + (c.brand || ''));
    setImg('heroPhotoSide', h.photoSide, 'Инструменты барбера');

    var stats = (h.stats || []).map(function (s) {
      return '<li><span class="stat-value">' + esc(s.value) + (s.stars ? '<span class="stat-stars">★★★★★</span>' : '') + '</span>' +
        '<span class="stat-label">' + esc(s.label) + '</span></li>';
    }).join('');
    setHTML('heroStats', stats);

    // тикер — из услуг
    var services = DATA.services || [];
    var tickerItems = services.slice(0, 8).map(function (s) {
      return '<span class="ticker-item">' + esc(s.title) + ' — ' + fmt(s.price) + ' ₽</span>';
    }).join('');
    var track = document.getElementById('tickerTrack');
    if (track && tickerItems) {
      var half = tickerItems + '<span class="ticker-item" aria-hidden="true"></span>';
      track.innerHTML = half + half;
    }

    // about
    setText('aboutTitle', a.title);
    setHTML('aboutText', (a.text || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''));
    setImg('aboutPhoto', a.photo, 'Интерьер барбершопа');
    setHTML('featureList', (a.features || []).map(function (fe) {
      return '<li><span class="feat-icon">' + (ICONS[fe.icon] || '') + '</span>' +
        '<div><h3>' + esc(fe.title) + '</h3><p>' + esc(fe.text) + '</p></div></li>';
    }).join(''));

    // услуги
    var popular = services.length ? services.some(function (s) { return s.popular; }) : false;
    setHTML('servicesGrid', services.map(function (s) {
      return '<article class="service-card">' +
        (s.popular ? '<span class="s-pop">хит</span>' : '') +
        '<div class="s-top"><h3>' + esc(s.title) + '</h3><span class="s-dots"></span><span class="s-price">' + fmt(s.price) + ' ₽</span></div>' +
        (s.desc ? '<p class="s-desc">' + esc(s.desc) + '</p>' : '') +
        '<div class="s-meta"><span class="dur">⏱ ' + esc(s.duration || '') + '</span></div>' +
        '</article>';
    }).join(''));

    // акции
    setHTML('offersGrid', (DATA.offers || []).map(function (o) {
      return '<article class="offer-card"><div class="offer-badge">' + esc(o.badge || 'акция') + '</div>' +
        '<div><h3>' + esc(o.title) + '</h3><p>' + esc(o.text) + '</p></div></article>';
    }).join(''));

    // команда
    setHTML('teamGrid', (DATA.team || []).map(function (m) {
      return '<article class="team-card"><img src="' + esc(m.photo) + '" alt="' + esc(m.name) + ' — ' + esc(m.role) + '" loading="lazy">' +
        (m.exp ? '<span class="t-exp">' + esc(m.exp) + '</span>' : '') +
        '<div class="t-body"><div class="t-name">' + esc(m.name) + '</div>' +
        '<div class="t-role">' + esc(m.role) + '</div>' +
        (m.text ? '<p class="t-text">' + esc(m.text) + '</p>' : '') + '</div>' +
        (m.social ? '<a class="t-link" href="' + esc(m.social) + '" target="_blank" rel="noopener" aria-label="' + esc(m.name) + ' в соцсети">↗</a>' : '') +
        '</article>';
    }).join(''));

    // галерея
    setHTML('galleryGrid', (DATA.gallery || []).map(function (g) {
      return '<figure class="gallery-item"><img src="' + esc(g.src) + '" alt="' + esc(g.caption || '') + '" loading="lazy"><figcaption>' + esc(g.caption || '') + '</figcaption></figure>';
    }).join(''));

    // отзывы + рейтинг
    var rating = meta.rating || 0, rc = meta.reviewsCount || 0;
    setText('ratingBig', String(rating).replace('.', ','));
    setText('ratingCount', rc + (rc === 1 ? ' отзыв' : (rc % 10 >= 2 && rc % 10 <= 4 && (rc % 100 < 10 || rc % 100 >= 20) ? ' отзыва' : ' отзывов')));
    setHTML('ratingStars', stars(rating));
    setHTML('reviewsScroll', (DATA.reviews || []).map(function (rv) {
      return '<article class="review-card"><div class="r-head"><span class="r-name">' + esc(rv.name) + '</span><span class="r-date">' + esc(rv.date || '') + '</span></div>' +
        '<span class="r-stars" aria-hidden="true">' + '★★★★★'.slice(0, rv.rating) + '☆☆☆☆☆'.slice(0, 5 - rv.rating) + '</span>' +
        (rv.service ? '<span class="r-service">Услуга: ' + esc(rv.service) + '</span>' : '') +
        '<p class="r-text">' + esc(rv.text) + '</p></article>';
    }).join(''));

    // запись
    setText('bookingTitle', b.title);
    setText('bookingText', b.text);
    setText('bookingNote', b.note);
    setHTML('serviceChips', '<button type="button" class="chip" data-s="">Любая / подберёте</button>' +
      services.map(function (s) {
        return '<button type="button" class="chip" data-s="' + esc(s.title) + '">' + esc(s.title) + ' · ' + fmt(s.price) + ' ₽</button>';
      }).join(''));

    // контакты
    setText('bkPhone', c.phoneDisplay);
    setText('bkAddress', c.address);
    setText('bkHours', (c.hours || []).map(function (x) { return x.days + ' ' + x.time; }).join(' · '));
    setHTML('contactsList',
      row('adr', 'Адрес', c.address + ', ' + c.city) +
      row('tel', 'Телефон', '<a href="tel:' + esc(c.phoneLink) + '">' + esc(c.phoneDisplay) + '</a>') +
      row('clock', 'Часы работы', (c.hours || []).map(function (x) { return x.days + ': ' + x.time; }).join('<br>')) +
      row('mail', 'Почта', '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>'));
    setHTML('socials', (c.socials || []).map(function (s) {
      var ic = SOCIAL_ICONS[s.id] || '';
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + ic + ' ' + esc(s.label) + '</a>';
    }).join(''));

    // карта (OpenStreetMap, без ключей)
    var mapFrame = document.getElementById('mapFrame');
    if (mapFrame) {
      var mp = c.map || { lat: 57.6482, lon: 39.9482 };
      var lat = parseFloat(mp.lat), lon = parseFloat(mp.lon);
      if (isFinite(lat) && isFinite(lon)) {
        var d = 0.0045, d2 = 0.0032;
        var bbox = [lon - d, lat - d2, lon + d, lat + d2].join(',');
        mapFrame.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox +
          '&layer=mapnik&marker=' + lat + ',' + lon;
      }
    }

    // футер
    setText('footerText', f.text);
    setText('footerDev', f.devNote);

    // телефоны в ссылках
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="tel:"], #fabPhone'), function (a) {
      a.setAttribute('href', 'tel:' + (c.phoneLink || ''));
    });

    buildOpenBadge();
  }

  function row(iconName, label, html) {
    var icons = {
      adr: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      tel: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>',
      clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      mail: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
    };
    return '<div class="c-row"><span class="c-ico">' + (icons[iconName] || '') + '</span>' +
      '<div><dt>' + esc(label) + '</dt><dd>' + html + '</dd></div></div>';
  }

  function setText(id, v) { var el = document.getElementById(id); if (el && v != null) el.textContent = v; }
  function setHTML(id, v) { var el = document.getElementById(id); if (el && v != null) el.innerHTML = v; }
  function setImg(id, src, alt) {
    var el = document.getElementById(id); if (!el || !src) return;
    el.src = src; if (alt) el.alt = alt;
  }

  /* ---------- статус «открыто/закрыто» ---------- */
  function buildOpenBadge() {
    var el = document.getElementById('openBadge');
    if (!el) return;
    var week = DATA.contacts && DATA.contacts.scheduleWeekly;
    if (!week || !week.length) { el.hidden = true; return; }
    var now = new Date();
    var day = now.getDay();
    var hm = now.getHours() * 60 + now.getMinutes();
    var sched = null;
    for (var i = 0; i < week.length; i++) if (week[i].day === day) { sched = week[i]; break; }
    if (!sched) { el.hidden = true; return; }
    var toMin = function (t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
    var open = hm >= toMin(sched.open) && hm < toMin(sched.close);
    var closeH = String(sched.close).split(':')[0];
    el.textContent = open ? 'Открыто до ' + closeH + ':00' : 'Закрыто · открытие ' + sched.open;
    el.className = 'open-badge ' + (open ? 'open' : 'closed');
    el.hidden = false;
  }

  /* ---------- запись ---------- */
  function initBooking() {
    var form = document.getElementById('bookingForm');
    if (!form) return;
    var selected = '';
    var chips = document.getElementById('serviceChips');
    chips.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      selected = chip.getAttribute('data-s') || '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = DATA.contacts || {};
      var name = document.getElementById('bkName').value.trim();
      var contact = document.getElementById('bkContact').value.trim();
      var comment = document.getElementById('bkComment').value.trim();
      if (!name || !contact) { toast('Заполни имя и контакт — иначе мастер не найдёт тебя.'); return; }
      var lines = [
        'Запись в барбершоп «' + (c.brand || 'ЧароВница') + '»',
        '',
        'Имя: ' + name,
        contact ? 'Контакт: ' + contact : '',
        selected ? 'Услуга: ' + selected : '',
        comment ? 'Комментарий: ' + comment : ''
      ].filter(Boolean);
      var text = encodeURIComponent(lines.join('\n'));
      var wa = (c.socials || []).find(function (s) { return s.id === 'wa'; });
      var tg = (c.socials || []).find(function (s) { return s.id === 'tg'; });
      var url = '';
      if (wa) url = wa.url + '?text=' + text;
      if (tg) url = tg.url + '?text=' + text;
      if (!url) {
        var ph = c.phoneLink ? 'tel:' + c.phoneLink : '#';
        url = ph; toast('Не настроены мессенджеры — звони: ' + (c.phoneDisplay || ''));
      }
      toast('Запись сформирована! Отправь сообщение — и мы подтвердим время.');
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------- интерфейс: хедер, меню, reveal, скроллбар ---------- */
  function initUI() {
    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
    }
    window.addEventListener('scroll', function () {
      header && header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });

    // reveal
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) { io.observe(el); });

    // прогресс отзывов
    var scroll = document.getElementById('reviewsScroll');
    var bar = document.getElementById('reviewsBar');
    if (scroll && bar) {
      var update = function () {
        var max = scroll.scrollWidth - scroll.clientWidth;
        var p = max > 0 ? (scroll.scrollLeft / max) * 60 : 0;
        bar.querySelector('span').style.width = (40 + p) + '%';
      };
      scroll.addEventListener('scroll', update, { passive: true });
      update();
    }
  }

  /* ---------- запуск ---------- */
  loadData().then(render).then(initUI).then(initBooking);
})();