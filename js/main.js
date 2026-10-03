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
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = $('.hero');
if (hero) {   // home page only
const slides = $$('.slide', hero);
const dots = $$('.carousel-dot', hero);
const SLIDE_MS = 7000;
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
}

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
    // data-wa-text (catalogue / gift lists) replaces the whole pre-filled message
    link.href = mode !== 'whatsapp' ? STORES[store][key]
      : el.dataset.waText ? `${STORES[store].wa}?text=${encodeURIComponent(el.dataset.waText)}`
      : waLink(STORES[store].wa, el.dataset.occasion);
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
    // Light WebP thumb first (made by tools/optimize_images.py), then the JPG thumb, then the full photo
    const tries = [`images/${store}/thumbs/${file}`, full];
    img.onerror = () => {
      if (tries.length) { img.src = tries.shift(); return; }
      btn.remove();
      current = current.filter(u => u !== full);
      if (!current.length) showEmpty(); else markDesktopOverflow();
    };
    img.src = `images/${store}/thumbs/${file.replace(/\.jpe?g$/i, '.webp')}`;
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
if (grid) renderGallery('medavakkam');

// ===== Lightbox =====
const lightbox = $('#lightbox');
const lbImg = $('#lightboxImg');
const lbCount = $('#lbCount');
let lbIndex = 0;

function showPhoto(i) {
  lbIndex = (i + current.length) % current.length;
  // Lighter WebP copy (tools/optimize_images.py) when there is one, else the original JPG
  const jpg = current[lbIndex];
  lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = jpg; };
  lbImg.src = jpg.replace(/\.jpe?g$/i, '.webp');
  lbImg.alt = `Store photo ${lbIndex + 1}`;
  lbCount.textContent = `${lbIndex + 1} / ${current.length}`;
}
function openLightbox(i) { if (i < 0) return; showPhoto(i); lightbox.showModal(); }

if (lightbox) {   // home page only
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
}

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
  if (!section) return;
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

// ===== Google Analytics (GA4) =====
// The gtag snippet sits in <head> of index.html. If it's ever removed, setting analyticsId
// in js/site-config.js loads it from here instead. Events sent (see README for GA4 setup):
//   view_category    a category card scrolled into view        category
//   select_category  a category shortcut tapped (menu, quick)  category, link_location
//   select_product   a product line tapped in a category card  category, product
//   select_occasion  an occasion / festival "Ask" tapped       occasion
//   select_location  a store looked at (visit link, photo tab, map)  store, action
//   open_store_picker  the "which store?" sheet opened         contact_method, + context
//   picker_dismissed   sheet closed without choosing a store   contact_method, + context
//   click_call / click_whatsapp / click_directions  the lead   store, contact_method, + context
// "context" = link_location plus the last category / product / occasion tapped, so a lead
// can be traced back to what the visitor was interested in.
if (!window.gtag && /^G-[A-Z0-9]+$/i.test(SITE.analyticsId || '')) {
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.analyticsId}`;
  document.head.appendChild(tag);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', SITE.analyticsId);
} else if (window.gtag && /^G-[A-Z0-9]+$/i.test(SITE.analyticsId || '')) {
  // The <head> tag only configures the Google Ads ID – add GA4 to the same tag
  window.gtag('config', SITE.analyticsId);
}
// Add ?ga_debug to the URL to see events live in GA4 → Admin → DebugView
const GA_DEBUG = /[?&]ga_debug\b/.test(location.search);

// ----- Ad attribution -----
// Visitors from an ad arrive with gclid / gbraid / wbraid (Google Ads auto-tagging), fbclid (Meta),
// utm_* tags, and sl=<name> on sitelinks (e.g. ?sl=seer#occ-seer). This is remembered for 30 days
// in the visitor's browser, so a lead on a later visit still counts for the ad that brought them.
// Every event then carries ad_source, ad_campaign, ad_sitelink and ad_click (yes/no).
const AD_KEY = 'ad_visit';
const AD_DAYS = 30;
const clean = (v, fallback) => (v || '').replace(/[^\w\- .]/g, '').slice(0, 60) || fallback;
const adVisit = (function () {
  const q = new URLSearchParams(location.search);
  const clickId = q.get('gclid') || q.get('gbraid') || q.get('wbraid');
  const fromAd = clickId || q.get('fbclid') || q.get('utm_source') || q.get('sl');
  if (fromAd) {
    const visit = {
      ad_source: clean(q.get('utm_source'), clickId ? 'google' : q.get('fbclid') ? 'facebook' : '(unknown)'),
      ad_campaign: clean(q.get('utm_campaign'), clickId ? 'google_ads' : '(not set)'),
      ad_sitelink: clean(q.get('sl'), '(none)'),
      ad_click: 'yes',
      landed: Date.now(),
    };
    try { localStorage.setItem(AD_KEY, JSON.stringify(visit)); } catch (e) {}
    return { ...visit, is_new: true };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(AD_KEY));
    if (saved && Date.now() - saved.landed < AD_DAYS * 864e5) return saved;
  } catch (e) {}
  return null;
})();
const adCtx = adVisit
  ? { ad_source: adVisit.ad_source, ad_campaign: adVisit.ad_campaign, ad_sitelink: adVisit.ad_sitelink, ad_click: 'yes' }
  : { ad_click: 'no' };

// Optional: report leads straight to Google Ads as conversions (see adsConversion in js/site-config.js)
const ADS = SITE.adsConversion || {};
// (The AW- tag itself is configured in <head> of index.html, so Google Ads can detect it.)
const adsOn = window.gtag && /^AW-\d+$/.test(ADS.id || '');

function track(name, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', name, { ...adCtx, ...params, ...(GA_DEBUG && { debug_mode: true }), transport_type: 'beacon' });
  const label = adsOn && (ADS.labels || {})[name.replace('click_', '')];
  if (label && name.startsWith('click_')) window.gtag('event', 'conversion', { send_to: `${ADS.id}/${label}`, value: 1.0, currency: 'INR', transport_type: 'beacon' });
}
// The visit that came from an ad: which ad, which sitelink, which section it opened on
if (adVisit && adVisit.is_new) track('ad_landing', { landing_section: clean(location.hash.slice(1), 'top') });
if (window.gtag) {
  const CATEGORY = { 'cat-steel': 'steel_brass', 'cat-cookware': 'cookware_appliances', 'cat-plastics': 'plastics_household', 'cat-pooja': 'pooja_occasions' };
  const storeOf = (s) => /madipakkam|9698471616|Lc5Mn1nZLhLbLNLt5|12\.97/i.test(s) ? 'madipakkam'
    : /medavakkam|9444577336|SWVrHgRHAYiuGCfy9|12\.92/i.test(s) ? 'medavakkam' : 'not_chosen';
  const placeOf = (el) => {
    const zones = [['#listSheet', 'my_list'], ['.action-bar', 'action_bar'], ['.nav-extra', 'menu'], ['#header', 'header'], ['.hero', 'hero'],
      ['.quick-item', 'quick_links'], ['.season-card', 'festival_banner'], ['footer', 'footer']];
    for (const [sel, name] of zones) if (el.closest(sel)) return name;
    const sec = el.closest('section[id]');
    return sec ? sec.id : 'page';
  };
  // What the visitor last showed interest in – carried onto their call / WhatsApp / directions tap
  const interest = { category: '(none)', product: '(none)', occasion: '(none)' };
  let pickerCtx = null;   // set while the "which store?" sheet is open
  let pickerChosen = false;

  // Funnel step 1: which categories people actually look at
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      track('view_category', { category: CATEGORY[en.target.id] });
      seen.unobserve(en.target);
    }), { threshold: 0.5 });
    $$('.cat-card[id]').forEach(c => seen.observe(c));

    // How far down the page people get: a section counts once its top passes the middle of the screen
    const reached = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      track('view_section', { section: en.target.id });
      reached.unobserve(en.target);
    }), { rootMargin: '0px 0px -50% 0px' });
    $$('main section[id]').forEach(s => reached.observe(s));

    // Which store card people actually read
    const storeSeen = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      track('view_store', { store: en.target.id });
      storeSeen.unobserve(en.target);
    }), { threshold: 0.5 });
    $$('.store[id]').forEach(s => storeSeen.observe(s));
  }

  // Every other tap is reported as ui_click with the button's English text, read now
  // (before Tamil can be switched on) so reports don't split one button into two languages
  const labels = new WeakMap();
  const labelOf = (el) => {
    if (!labels.has(el)) {
      const text = el.getAttribute('aria-label') || el.textContent || ($('img', el) || {}).alt || '';
      labels.set(el, text.replace(/\s+/g, ' ').trim().slice(0, 60) || '(no text)');
    }
    return labels.get(el);
  };
  $$('a, button, summary').forEach(labelOf);

  // Capture phase so we see the tap before other handlers change the link or close the sheet
  document.addEventListener('click', e => {
    const el = e.target.closest('a, button, summary');
    if (!el) return;
    const href = el.getAttribute('href') || '';
    const link_location = placeOf(el);

    // FAQ question opened (the store-card map has its own event below)
    if (el.matches('summary')) {
      const item = el.closest('.faq-item');
      if (item && !item.open) track('faq_open', { question: labelOf(el) });
      return;
    }
    // Category shortcuts (#cat-steel etc.)
    if (CATEGORY[href.slice(1)]) {
      interest.category = CATEGORY[href.slice(1)];
      track('select_category', { category: interest.category, link_location });
      return;
    }
    // Store look-ups: "Visit Medavakkam", gallery tabs, a photo opened
    if (href === '#madipakkam' || href === '#medavakkam') return track('select_location', { store: href.slice(1), action: 'visit_link', link_location });
    if (el.matches('.tab[data-tab]')) return track('select_location', { store: el.dataset.tab, action: 'photo_tab', link_location });
    if (el.closest('#galleryGrid')) {
      const tab = $('.tab.is-active[data-tab]');
      return track('view_photo', { store: tab ? tab.dataset.tab : 'not_chosen', link_location: 'gallery' });
    }
    if (el.id === 'langToggle') return track('change_language', { language: document.documentElement.lang === 'ta' ? 'en' : 'ta' });
    if (el.id === 'menuToggle') { if (el.getAttribute('aria-expanded') !== 'true') track('open_menu', { link_location }); return; }

    // Opening the "which store?" sheet
    if (el.dataset.picker) {
      const card = el.closest('.cat-card[id]');
      if (card) {
        interest.category = CATEGORY[card.id];
        interest.product = el.dataset.occasion || '(none)';
        track('select_product', { category: interest.category, product: interest.product });
      } else if (el.closest('#catalogue') && el.dataset.occasion) {
        interest.category = el.dataset.category ? `catalogue_${el.dataset.category}` : 'catalogue';
        interest.product = el.dataset.occasion.slice(0, 100);
        track('select_product', { category: interest.category, product: interest.product });
      } else if (el.dataset.occasion) {
        interest.occasion = el.dataset.occasion;
        track('select_occasion', { occasion: interest.occasion, link_location });
      }
      pickerCtx = { contact_method: el.dataset.picker, link_location, ...interest };
      pickerChosen = false;
      track('open_store_picker', pickerCtx);
      return;
    }

    // The lead itself: call, WhatsApp or directions (direct links, or a store chosen in the sheet)
    const method = href.startsWith('tel:') ? 'call' : href.includes('wa.me/') ? 'whatsapp' : href.includes('maps.app.goo.gl') ? 'directions' : null;
    if (!method) {
      // Anything else: section links, festival banners, carousel and photo arrows, social links…
      const link_url = /^(#|$)/.test(href) ? (href.length > 1 ? href : '(none)') : href.slice(0, 100);
      return track('ui_click', { element: labelOf(el), link_location, link_url });
    }
    const inSheet = el.closest('#picker');
    if (inSheet) pickerChosen = true;
    const ctx = inSheet && pickerCtx ? pickerCtx : { link_location, ...interest };
    track(`click_${method}`, { ...ctx, contact_method: method, store: storeOf(href), via_picker: inSheet ? 'yes' : 'no' });
  }, true);

  // Drop-off: sheet opened but no store chosen
  $('#picker').addEventListener('close', () => {
    if (pickerCtx && !pickerChosen) track('picker_dismissed', pickerCtx);
    pickerCtx = null;
  });
  // Map opened on a store card
  $$('.map-toggle').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) track('select_location', { store: storeOf($('.map', d).dataset.map), action: 'map_open', link_location: 'stores' });
  }));
}

// ===== Init =====
$('#year').textContent = new Date().getFullYear();
let saved = null;
try { saved = localStorage.getItem('lang'); } catch (e) {}
if (saved === 'ta') setLang('ta');

// ===== Years since 1980 (legacy counters) =====
$$('.js-years').forEach(el => { el.textContent = new Date().getFullYear() - 1980; });

// ===== Scroll position: top on a fresh visit or refresh, the same spot after pressing Back =====
// (e.g. Home → tap "Stainless steel vessels" → catalogue → Back = back at the category cards)
const navType = (performance.getEntriesByType && (performance.getEntriesByType('navigation')[0] || {}).type) || '';
const isBack = navType === 'back_forward';
const SCROLL_KEY = 'scroll:' + location.pathname;
window.addEventListener('pagehide', () => { try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY))); } catch (e) {} });
const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
let savedY = null;
try { savedY = sessionStorage.getItem(SCROLL_KEY); } catch (e) {}
if (isBack && savedY !== null) {
  const back = () => window.scrollTo({ top: +savedY, left: 0, behavior: 'instant' });
  back();
  window.addEventListener('load', () => { back(); setTimeout(back, 350); });   // again once photos have their size
} else if (!location.hash) { toTop(); window.addEventListener('load', toTop); }

// ===== Splash screen =====
// Plays its intro for at least ~2.3s, then lifts once the page has loaded (never waits more than 5s).
(function () {
  // Played once per visit (see the script in <head>): remembered for the rest of the browsing session
  try { sessionStorage.setItem('splashSeen', '1'); } catch (e) {}
  const splash = $('#splash');
  if (!splash) { document.documentElement.classList.remove('is-loading'); return; }
  // No intro after Back, or when coming from another page of the site
  if (isBack || document.documentElement.classList.contains('is-back')) {
    splash.remove(); document.documentElement.classList.remove('is-loading'); return;
  }
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
