// ===== Store data =====
// Photos: put full-size photos in images/<store>/ and ~800px copies in images/<store>/thumbs/
// (if a thumb is missing, the full photo is used). List the file names here.
const STORES = {
  madipakkam: {
    tel: 'tel:+919698471616',
    wa: 'https://wa.me/919698471616',
    map: 'https://maps.app.goo.gl/Lc5Mn1nZLhLbLNLt5',
    photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg',
             '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg'],
  },
  medavakkam: {
    tel: 'tel:+919444577336',
    wa: 'https://wa.me/919444577336',
    map: 'https://maps.app.goo.gl/SWVrHgRHAYiuGCfy9',
    photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg',
             '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg'],
  },
};

const TEXT = {
  empty: { en: 'Photos of this store are coming soon – do visit us in person!', ta: 'இந்தக் கடையின் புகைப்படங்கள் விரைவில் – நேரில் வாருங்கள்!' },
  call: { en: 'Call which store?', ta: 'எந்தக் கடையை அழைக்க?' },
  whatsapp: { en: 'WhatsApp which store?', ta: 'எந்தக் கடைக்கு WhatsApp?' },
  directions: { en: 'Directions to which store?', ta: 'எந்தக் கடைக்கு வழி?' },
};

let lang = 'en';
const langHooks = [];   // functions re-run when the language changes
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ===== Language toggle =====
const translatable = $$('[data-ta]');
// Elements marked data-html keep their <em> highlights (text is our own, fixed markup)
translatable.forEach(el => { el.dataset.en = el.hasAttribute('data-html') ? el.innerHTML : el.textContent; });

function setLang(next) {
  lang = next;
  translatable.forEach(el => {
    if (el.hasAttribute('data-html')) el.innerHTML = el.dataset[lang];
    else el.textContent = el.dataset[lang];
  });
  document.documentElement.lang = lang;
  $('#langToggle').textContent = lang === 'en' ? 'தமிழ்' : 'English';
  $$('.gallery-empty').forEach(el => { el.textContent = TEXT.empty[lang]; });
  if (typeof markDesktopOverflow === 'function' && grid) markDesktopOverflow();
  langHooks.forEach(fn => fn());
  try { localStorage.setItem('lang', lang); } catch (e) {}
}
$('#langToggle').addEventListener('click', () => setLang(lang === 'en' ? 'ta' : 'en'));

// ===== Hero carousel (one slide per store) =====
const hero = $('.hero');
const slides = $$('.slide', hero);
const dots = $$('.carousel-dot', hero);
const SLIDE_MS = 7000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let slideIndex = 0;
let slideTimer = null;
hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

function goToSlide(i) {
  slideIndex = (i + slides.length) % slides.length;
  slides.forEach((s, k) => { s.classList.toggle('is-active', k === slideIndex); s.setAttribute('aria-hidden', k !== slideIndex); });
  dots.forEach((d, k) => {
    d.classList.remove('is-active');
    d.setAttribute('aria-selected', k === slideIndex);
  });
  void hero.offsetWidth;                       // restart the progress-bar animation
  dots[slideIndex].classList.add('is-active');
  restartTimer();
}
function restartTimer() {
  clearTimeout(slideTimer);
  if (!reduceMotion && !hero.classList.contains('is-paused')) slideTimer = setTimeout(() => goToSlide(slideIndex + 1), SLIDE_MS);
}
function setPaused(p) { hero.classList.toggle('is-paused', p); if (p) clearTimeout(slideTimer); else restartTimer(); }

dots.forEach((d, k) => d.addEventListener('click', () => goToSlide(k)));
$$('.carousel-arrow', hero).forEach(b => b.addEventListener('click', () => goToSlide(slideIndex + Number(b.dataset.dir))));
hero.addEventListener('mouseenter', () => setPaused(true));
hero.addEventListener('mouseleave', () => setPaused(false));
hero.addEventListener('focusin', () => setPaused(true));
hero.addEventListener('focusout', () => setPaused(false));
document.addEventListener('visibilitychange', () => setPaused(document.hidden));
let heroX = null;
hero.addEventListener('touchstart', e => { heroX = e.touches[0].clientX; }, { passive: true });
hero.addEventListener('touchend', e => {
  if (heroX === null) return;
  const dx = e.changedTouches[0].clientX - heroX;
  if (Math.abs(dx) > 50) goToSlide(slideIndex + (dx < 0 ? 1 : -1));
  heroX = null;
});
if (reduceMotion) hero.classList.add('is-paused');
goToSlide(0);

// Keep the carousel controls just above the stats strip
const strip = $('.hero-strip');
const setStripH = () => hero.style.setProperty('--strip-h', strip.offsetHeight + 'px');
setStripH();
window.addEventListener('resize', setStripH);

// ===== Madipakkam photo: used automatically once images/madipakkam/1.jpg exists =====
function usePhotoIfExists(el, urls) {
  const [url, ...rest] = urls;
  if (!url) return;
  const probe = new Image();
  probe.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add('has-photo'); };
  probe.onerror = () => usePhotoIfExists(el, rest);
  probe.src = url;
}
$$('[data-photo]').forEach(el => usePhotoIfExists(el, [el.dataset.photo, el.dataset.photoFull].filter(Boolean)));

// ===== Header shadow on scroll =====
const header = $('#header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile menu =====
const nav = $('#nav');
const menuToggle = $('#menuToggle');
function setMenu(open) {
  // The menu panel starts right under the header (the red top bar may still be on screen)
  if (open) document.documentElement.style.setProperty('--menu-top', header.getBoundingClientRect().bottom + 'px');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', open);
}
menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
window.matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// ===== Pre-filled WhatsApp messages (so website enquiries are easy to spot) =====
const WA_TEXT = {
  en: (occasion) => `Hi, I saw your website.${occasion ? ` I'd like help with ${occasion}.` : ''}`,
  ta: (occasion) => `வணக்கம், உங்கள் இணையதளத்தைப் பார்த்தேன்.${occasion ? ` ${occasion} பற்றி தெரிந்துகொள்ள விரும்புகிறேன்.` : ''}`,
};
const waLink = (base, occasion) => `${base}?text=${encodeURIComponent(WA_TEXT[lang](occasion))}`;
// Direct WhatsApp links (store cards, carousel) get the message at click time
$$('a[href^="https://wa.me/"]').forEach(a => {
  const base = a.getAttribute('href').split('?')[0];
  a.addEventListener('click', () => { a.href = waLink(base); });
});

// ===== Store picker (call / WhatsApp / directions) =====
const picker = $('#picker');
const pickerTitle = $('#pickerTitle');
const pickLinks = { madipakkam: $('#pickMadipakkam'), medavakkam: $('#pickMedavakkam') };

// Delegated, so buttons added later (festival banners) work too
document.addEventListener('click', e => {
  const el = e.target.closest('[data-picker]');
  if (!el) return;
  e.preventDefault();
  const mode = el.dataset.picker;
  const key = mode === 'call' ? 'tel' : mode === 'whatsapp' ? 'wa' : 'map';
  pickerTitle.textContent = TEXT[mode][lang];
  Object.entries(pickLinks).forEach(([store, link]) => {
    link.href = mode === 'whatsapp' ? waLink(STORES[store].wa, el.dataset.occasion) : STORES[store][key];
    link.target = mode === 'call' ? '_self' : '_blank';
  });
  picker.showModal();
});
Object.values(pickLinks).forEach(link => link.addEventListener('click', () => picker.close()));
picker.addEventListener('click', e => { if (e.target === picker) picker.close(); });

// ===== Maps load only when opened (saves mobile data) =====
$$('.map-toggle').forEach(d => d.addEventListener('toggle', () => {
  const box = $('.map', d);
  if (!d.open || box.firstChild) return;
  const iframe = document.createElement('iframe');
  iframe.src = box.dataset.map;
  iframe.title = box.dataset.title;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  box.appendChild(iframe);
}));

// ===== Store card photo fallback =====
$$('.store-media[data-fallback]').forEach(media => {
  const img = $('img', media);
  const fail = () => {
    if (img.dataset.full && img.src.indexOf(img.dataset.full) === -1) { img.src = img.dataset.full; return; }
    media.classList.add('no-photo');
  };
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth === 0) fail();
});

// ===== Gallery =====
const grid = $('#galleryGrid');
let current = [];   // full-size URLs of the photos currently shown

function renderGallery(store) {
  grid.innerHTML = '';
  grid.classList.remove('is-empty');
  const files = STORES[store].photos;
  current = files.map(f => `images/${store}/${f}`);
  if (!files.length) return showEmpty();

  files.forEach((file, i) => {
    const full = current[i];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.setProperty('--i', Math.min(i, 8));   // stagger for the fade-in
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = `Inside Madipakkam Saravana Stores, ${store[0].toUpperCase() + store.slice(1)} – vessels and kitchenware, photo ${i + 1}`;
    img.onerror = () => {
      if (!img.dataset.retried) { img.dataset.retried = '1'; img.src = full; return; }
      btn.remove();
      current = current.filter(u => u !== full);
      if (!current.length) showEmpty(); else markDesktopOverflow();
    };
    img.src = `images/${store}/thumbs/${file}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => openLightbox(current.indexOf(full)));
    grid.appendChild(btn);
  });
  markDesktopOverflow();
  grid.scrollTo({ left: 0, behavior: 'instant' });   // a new store always starts from its first photo
}

// Desktop shows a tidy 4×4 mosaic; the last tile says "+N more"
const DESKTOP_TILES = 13;   // 1 large (2×2) + 12 small = a full 4×4 grid
function markDesktopOverflow() {
  const btns = $$('button', grid);
  btns.forEach((b, i) => {
    b.classList.toggle('is-extra', i >= DESKTOP_TILES);
    b.classList.remove('has-more');
    delete b.dataset.more;
  });
  if (btns.length > DESKTOP_TILES) {
    const last = btns[DESKTOP_TILES - 1];
    last.classList.add('has-more');
    last.dataset.more = `+${btns.length - DESKTOP_TILES} ${lang === "ta" ? "மேலும்" : "more"}`;
  }
}

function showEmpty() {
  grid.classList.add('is-empty');
  const p = document.createElement('p');
  p.className = 'gallery-empty';
  p.textContent = TEXT.empty[lang];
  grid.appendChild(p);
}

$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', t === tab); });
  switchGallery(tab.dataset.tab);
}));

// Smooth store switch: fade the current photos out, swap (and rewind) while hidden, then fade the new ones in
let switchTimer = null;
function switchGallery(store) {
  if (reduceMotion) return renderGallery(store);
  clearTimeout(switchTimer);
  grid.classList.add('is-leaving');
  switchTimer = setTimeout(() => {
    renderGallery(store);
    grid.classList.remove('is-leaving');
    grid.classList.add('is-entering');
    void grid.offsetWidth;                       // start the entrance from the hidden state
    grid.classList.remove('is-entering');
  }, 260);
}
renderGallery('medavakkam');

// ===== Lightbox =====
const lightbox = $('#lightbox');
const lbImg = $('#lightboxImg');
const lbCount = $('#lbCount');
let lbIndex = 0;

function showPhoto(i) {
  lbIndex = (i + current.length) % current.length;
  lbImg.src = current[lbIndex];
  lbImg.alt = `Store photo ${lbIndex + 1}`;
  lbCount.textContent = `${lbIndex + 1} / ${current.length}`;
}
function openLightbox(i) { if (i < 0) return; showPhoto(i); lightbox.showModal(); }

lightbox.addEventListener('click', e => {
  const action = e.target.closest('[data-lb]')?.dataset.lb;
  if (action === 'close' || e.target === lightbox) lightbox.close();
  else if (action === 'prev') showPhoto(lbIndex - 1);
  else if (action === 'next') showPhoto(lbIndex + 1);
});
lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
});
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ===== Reveal on scroll =====
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));
  // Safety net: never leave on-screen (or already scrolled-past) content hidden
  const revealOnScreen = () => $$('.reveal:not(.is-visible)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
  });
  setTimeout(revealOnScreen, 1500);
  window.addEventListener('hashchange', () => setTimeout(revealOnScreen, 900));
} else {
  $$('.reveal').forEach(el => el.classList.add('is-visible'));
}

const esc = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ===== Festival & season banners (dates and text live in js/site-config.js) =====
// Shows 2–3 banners: festivals whose window is open today first (bigger festivals first),
// then running seasons, then festivals coming up soon, then the default banner.
const SITE = window.SITE || {};
const DAY = 86400000;
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

function pickBanners(today = startOfToday(), max = 3) {
  const t = today.getTime();
  const active = [], soon = [], seasonal = [], filler = [];
  (SITE.festivals || []).forEach(f => (f.dates || []).forEach(entry => {
    // A date is "YYYY-MM-DD", or ["YYYY-MM-DD", number of days] for festivals that last several days
    const [ds, len] = Array.isArray(entry) ? entry : [entry, f.days || 1];
    const day = parseDay(ds).getTime();
    const from = day - (f.daysBefore || 14) * DAY, to = day + (len - 1) * DAY;
    const item = { ...f, date: ds, left: Math.round((day - t) / DAY) };
    if (t >= from && t <= to) active.push(item);
    else if (t < from && from - t <= (SITE.lookAheadDays || 45) * DAY) soon.push(item);
  }));
  const md = (d) => String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const now = md(today);
  (SITE.seasons || []).forEach(s => {
    const on = (s.ranges || []).some(([a, b]) => a <= b ? now >= a && now <= b : now >= a || now <= b);
    if (on) ((s.priority || 1) > 1 ? seasonal : filler).push(s);
  });
  active.sort((a, b) => (b.priority || 1) - (a.priority || 1) || a.left - b.left);
  seasonal.sort((a, b) => (b.priority || 1) - (a.priority || 1));
  soon.sort((a, b) => a.left - b.left);
  const seen = new Set();
  const out = [...active, ...seasonal, ...soon, ...filler].filter(b => !seen.has(b.key) && seen.add(b.key));
  if (out.length < 2 && SITE.defaultSeason) out.push(SITE.defaultSeason);
  return out.slice(0, max);
}

const seasonBox = $('#season');
const seasonTrack = $('#seasonTrack');
const seasonDots = $('#seasonDots');
let seasonTimer = null;

function countdownText(b) {
  if (b.left == null) return '';
  if (b.left > 0) return lang === 'ta' ? `இன்னும் ${b.left} நாட்கள்` : `${b.left} day${b.left === 1 ? '' : 's'} to go`;
  if (b.left === 0) return lang === 'ta' ? 'இன்று' : 'Today';
  return lang === 'ta' ? 'இப்போது' : 'On now';
}

function renderSeason() {
  if (!seasonBox) return;
  const banners = pickBanners();
  seasonBox.hidden = !banners.length;
  if (!banners.length) return;
  seasonTrack.innerHTML = banners.map((b, i) => {
    const t = b[lang] || b.en;
    const year = b.date && b.showYear !== false ? ' ' + b.date.slice(0, 4) : '';
    const count = countdownText(b);
    return `
      <article class="season-card" aria-roledescription="slide" aria-label="${i + 1} / ${banners.length}">
        <div class="season-media"><img src="${esc(b.image)}" alt="${esc(b.en.title)}" loading="lazy"></div>
        <div class="season-body">
          <p class="season-tag"><span>${esc(t.tag + year)}</span>${count ? `<span class="season-count">${esc(count)}</span>` : ''}</p>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.text)}</p>
          <a class="btn btn-primary" href="#" data-picker="whatsapp" data-occasion="${esc(b.en.tag + year)}"><svg class="ico"><use href="#i-chat"/></svg><span>${esc(t.cta)}</span></a>
        </div>
      </article>`;
  }).join('');
  seasonTrack.classList.toggle('is-single', banners.length === 1);
  seasonDots.innerHTML = banners.length > 1 ? banners.map((b, i) =>
    `<button type="button" class="season-dot" aria-label="${esc((b[lang] || b.en).tag)}" data-i="${i}"></button>`).join('') : '';
  $$('.season-arrow', seasonBox).forEach(a => { a.hidden = banners.length < 2; });
  goSeason(0);
  startSeasonAuto();
}

// Banners sit on top of each other and cross-fade
let seasonCur = 0;
const seasonCards = () => $$('.season-card', seasonTrack);
function goSeason(i) {
  const cards = seasonCards();
  if (!cards.length) return;
  seasonCur = (i + cards.length) % cards.length;
  cards.forEach((c, k) => { c.classList.toggle('is-active', k === seasonCur); c.setAttribute('aria-hidden', k !== seasonCur); });
  $$('.season-dot', seasonDots).forEach((d, k) => d.classList.toggle('is-active', k === seasonCur));
}
function startSeasonAuto() {
  clearInterval(seasonTimer);
  if (reduceMotion || seasonCards().length < 2) return;
  seasonTimer = setInterval(() => { if (!seasonBox.matches(':hover, :focus-within')) goSeason(seasonCur + 1); }, 6500);
}
if (seasonTrack) {
  let swipeX = null;
  seasonTrack.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; clearInterval(seasonTimer); }, { passive: true });
  seasonTrack.addEventListener('touchend', e => {
    if (swipeX !== null) {
      const dx = e.changedTouches[0].clientX - swipeX;
      if (Math.abs(dx) > 40) goSeason(seasonCur + (dx < 0 ? 1 : -1));
    }
    swipeX = null;
    startSeasonAuto();
  }, { passive: true });
  seasonDots.addEventListener('click', e => { const d = e.target.closest('.season-dot'); if (d) { goSeason(+d.dataset.i); startSeasonAuto(); } });
  $$('.season-arrow', seasonBox).forEach(a => a.addEventListener('click', () => { goSeason(seasonCur + Number(a.dataset.dir)); startSeasonAuto(); }));
}
renderSeason();
langHooks.push(renderSeason);

// ===== Google reviews (real ratings/quotes are added in js/site-config.js) =====
const REVIEW_TEXT = {
  madipakkam: { en: 'Madipakkam', ta: 'மடிப்பாக்கம்' },
  medavakkam: { en: 'Medavakkam', ta: 'மேடவாக்கம்' },
  reviews: { en: 'Google reviews', ta: 'Google மதிப்புரைகள்' },
};
const starRow = (n) => {
  const full = Math.round(n);
  return Array.from({ length: 5 }, (_, i) => `<svg class="ico star${i < full ? ' on' : ''}"><use href="#i-star"/></svg>`).join('');
};
function renderReviews() {
  const data = SITE.reviews || {};
  const section = $('#reviews');
  const storeName = (k) => (REVIEW_TEXT[k] ? REVIEW_TEXT[k][lang] : esc(k));
  // Every real quote from both shops, interleaved so the strip alternates shops
  const lists = Object.keys(data).map(k => (data[k].quotes || []).map(q => ({ ...q, store: k })));
  const quotes = [];
  for (let i = 0; lists.some(l => l[i]); i++) lists.forEach(l => { if (l[i]) quotes.push(l[i]); });
  const ratings = Object.keys(data).filter(k => data[k].rating);
  section.hidden = !quotes.length && !ratings.length;
  if (section.hidden) return;

  $('#reviewScores').innerHTML = ratings.map(k => `
    <a class="score-chip" href="${esc(data[k].url)}" target="_blank" rel="noopener">
      <strong>${Number(data[k].rating).toFixed(1)}</strong>
      <span><span class="stars">${starRow(data[k].rating)}</span>
      <small>${storeName(k)}${data[k].count ? ` · ${Number(data[k].count).toLocaleString('en-IN')} ${REVIEW_TEXT.reviews[lang]}` : ''}</small></span>
    </a>`).join('');

  const card = (q, hidden) => `
    <figure class="float-card"${hidden ? ' aria-hidden="true"' : ''}>
      <div class="stars">${starRow(q.stars || 5)}</div>
      <blockquote>${esc(q.text)}</blockquote>
      <figcaption><strong>${esc(q.name)}</strong><span>${storeName(q.store)}</span></figcaption>
    </figure>`;
  const track = $('#reviewTrack');
  // Content is doubled so the loop is seamless; repeat short lists so the strip is always full
  let base = quotes;
  while (base.length && base.length < 6) base = base.concat(quotes);
  track.innerHTML = base.map((q, i) => card(q, i >= quotes.length)).join('') + base.map(q => card(q, true)).join('');
  track.style.setProperty('--float-s', `${Math.max(30, base.length * 7)}s`);
}
renderReviews();
langHooks.push(renderReviews);

// ===== Google Analytics (GA4) – turns on when analyticsId is set in js/site-config.js =====
function track(name, params) { if (window.gtag) window.gtag('event', name, params); }
if (/^G-[A-Z0-9]+$/i.test(SITE.analyticsId || '')) {
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.analyticsId}`;
  document.head.appendChild(tag);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', SITE.analyticsId);
  // Count the actions that matter: calls, WhatsApp chats, directions
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const store = /9698471616|Lc5Mn1nZLhLbLNLt5/.test(href) ? 'madipakkam' : /9444577336|SWVrHgRHAYiuGCfy9/.test(href) ? 'medavakkam' : 'unknown';
    if (href.startsWith('tel:')) track('click_call', { store });
    else if (href.includes('wa.me/')) track('click_whatsapp', { store });
    else if (href.includes('maps.app.goo.gl')) track('click_directions', { store });
  }, true);
}

// ===== Init =====
$('#year').textContent = new Date().getFullYear();
let saved = null;
try { saved = localStorage.getItem('lang'); } catch (e) {}
if (saved === 'ta') setLang('ta');

// ===== Years since 1980 (legacy counters) =====
$$('.js-years').forEach(el => { el.textContent = new Date().getFullYear() - 1980; });

// ===== Start at the top on refresh =====
const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
if (!location.hash) { toTop(); window.addEventListener('load', toTop); }

// ===== Splash screen =====
// Plays its intro for at least ~2.3s, then lifts once the page has loaded (never waits more than 5s).
(function () {
  const splash = $('#splash');
  if (!splash) return;
  const MIN_MS = reduceMotion ? 600 : 2300;   // measured from the start of the page load
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    const wait = Math.max(0, MIN_MS - performance.now());
    setTimeout(() => {
      splash.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      setTimeout(() => splash.remove(), 1400);
    }, wait);
  }
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
  setTimeout(finish, 5000);
})();
