import { PRODUCTS, CLEARANCE, STRENGTHS, POSTS, REVIEWS,
         BRANDS, STATS, HERO_SLIDES, HERO_INTERVAL } from './data.js';
import { cart, renderCartDrawer } from './cart.js';
import { initNav } from './nav.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '£' + n.toFixed(2);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Pick ink or paper for text sitting on a flavour, from its luminance.
   Guessing this by eye across 24 colours is how you ship an unreadable tile. */
function onFlavour(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255)
    .map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const onInk   = (L + 0.05) / (0.0114 + 0.05);   // vs #040E27
  const onPaper = (1.05) / (L + 0.05);
  return onInk >= onPaper ? 'var(--ink)' : 'var(--paper)';
}

const ICONS = {
  star:  '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3l-5-4.9 7-.9z"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>'
};


/* --- Age gate (session-scoped, as UK vape retail requires) --------------- */
function initAgeGate() {
  const gate = $('#agegate');
  if (sessionStorage.getItem('av-age-ok') === '1') return;
  gate.hidden = false;
  document.body.style.overflow = 'hidden';
  $('[data-age="yes"]', gate).addEventListener('click', () => {
    sessionStorage.setItem('av-age-ok', '1');
    gate.dataset.closing = 'true';
    document.body.style.overflow = '';
    setTimeout(() => { gate.hidden = true; $('#logo').focus(); }, 600);
  });
  $('[data-age="no"]', gate).addEventListener('click', () => {
    gate.innerHTML = '<div class="agegate__panel"><h2>Sorry</h2>' +
      '<p>You must be 18 or over to shop with us.</p></div>';
  });
}

/* --- Hero carousel -------------------------------------------------------
   Five slides on a 5s timer. Autoplay stops on hover, on keyboard focus,
   when the tab is hidden, and when the user presses pause. That last one is
   not optional: WCAG 2.2.2 requires a way to pause content that moves for
   more than five seconds, and an indefinite 5s loop qualifies.
   ------------------------------------------------------------------------ */
function initHero() {
  const hero  = $('#hero');
  const dots  = $('#heroDots');
  const panel = $('#heroPanel');
  const BANDS = HERO_SLIDES.map(s => `band--${s.band}`);

  let i = 0;
  let timer = null;
  let hovering = false;     // hover and keyboard focus still hold the timer

  dots.innerHTML = HERO_SLIDES.map((s, n) => `
    <button role="tab" id="hero-tab-${s.id}" aria-controls="heroPanel"
            aria-selected="${n === 0}" tabindex="${n === 0 ? 0 : -1}"
            aria-label="${s.chip}: ${s.a} ${s.b}"></button>`).join('');
  const tabs = $$('button', dots);

  function paint(n) {
    const s = HERO_SLIDES[n];
    hero.classList.remove(...BANDS);
    hero.classList.add(`band--${s.band}`);

    $('#hChip').textContent = s.chip;
    $('#hChip').className = `chip ${s.chipKind}`.trim();
    $('#hHead').innerHTML = `${s.a} <em>${s.b}</em>`;
    $('#hLede').textContent = s.lede;
    $('#hNote').textContent = s.note;
    const cta = $('#hCta');
    cta.setAttribute('href', s.href);
    cta.firstChild.nodeValue = s.cta + ' ';
    $('#hImg').src = s.img;
    $('#hImg').alt = s.alt;

    /* Only device slides puff, and each puffs from its own mouthpiece. Two of
       the five slides are bottles and one is a tin of pouches whose lede says
       "No vapour, no smoke" — vapour there would contradict the copy. */
    const shot = $('#heroShot');
    shot.dataset.puff = s.puff ? 'true' : 'false';
    if (s.puff) {
      shot.style.setProperty('--px', s.puff.x);
      shot.style.setProperty('--py', s.puff.y);
    }
    $('#hSpecA').textContent = s.specA;
    $('#hSpecB').textContent = s.specB;
    $('#heroGauge').style.setProperty('--level', String(s.level));

    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === n));
      t.tabIndex = k === n ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `hero-tab-${s.id}`);

    // warm the next slide's image so the swap does not flash
    const next = HERO_SLIDES[(n + 1) % HERO_SLIDES.length];
    new Image().src = next.img;

    // replay the enter animation on the slide content
    panel.classList.remove('is-entering');
    void panel.offsetWidth;
    panel.classList.add('is-entering');

    // retrigger the dot's fill so it tracks the actual interval
    dots.classList.remove('is-timing');
    void dots.offsetWidth;
    if (running()) dots.classList.add('is-timing');
  }

  const running = () => !reduced() && !hovering && !document.hidden;

  function go(n, fromUser) {
    i = (n + HERO_SLIDES.length) % HERO_SLIDES.length;
    paint(i);
    if (fromUser) restart();            // a click earns a fresh 5 seconds
  }

  function restart() {
    clearInterval(timer);
    timer = null;
    if (!running()) { dots.classList.remove('is-timing'); return; }
    dots.classList.add('is-timing');
    timer = setInterval(() => go(i + 1), HERO_INTERVAL);
  }

  tabs.forEach((t, n) => t.addEventListener('click', () => go(n, true)));

  // arrow-key navigation across the tablist, per the ARIA carousel pattern
  dots.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); go(i + k, true); tabs[i].focus(); }
    if (e.key === 'Home') { e.preventDefault(); go(0, true); tabs[0].focus(); }
    if (e.key === 'End')  { e.preventDefault(); go(HERO_SLIDES.length - 1, true); tabs[i].focus(); }
  });

  // hoverpause, carried over from the live theme's Glide config
  hero.addEventListener('pointerenter', () => { hovering = true;  restart(); });
  hero.addEventListener('pointerleave', () => { hovering = false; restart(); });
  hero.addEventListener('focusin',  () => { hovering = true;  restart(); });
  hero.addEventListener('focusout', () => { hovering = false; restart(); });

  // a hidden tab should not queue up eight slide changes
  document.addEventListener('visibilitychange', restart);

  paint(0);
  restart();

  const g = $('#heroGauge');
  const fill = () => g.style.setProperty('--level', String(HERO_SLIDES[0].level));
  reduced() ? fill() : setTimeout(fill, 620);

  $$('[data-stat]').forEach(el => { el.dataset.count = STATS[el.dataset.stat]; });
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    if (reduced()) { el.textContent = target; return; }
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 700);
  });
}

/* --- Trust icons ---------------------------------------------------------
   The animations loop forever in CSS. All this does is add .has-played the
   first time each icon appears, which starts the draw-on and then the loop,
   staggered so the row does not pulse in unison.
   ------------------------------------------------------------------------ */
function initTrustIcons() {
  const items = $$('.trust__item');
  if (!items.length) return;

  items.forEach((el, n) => el.style.setProperty('--idle-delay', `${n * 0.38}s`));

  if (reduced()) { items.forEach(el => el.classList.add('has-played')); return; }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = items.indexOf(e.target);
      setTimeout(() => e.target.classList.add('has-played'), n * 130);
      obs.unobserve(e.target);
    });
  }, { threshold: .5 });
  items.forEach(el => io.observe(el));
}

/* --- Sticky header shadow ------------------------------------------------- */
function initHeader() {
  const h = $('#header');
  const io = new IntersectionObserver(([e]) => { h.dataset.stuck = String(!e.isIntersecting); },
    { rootMargin: '-1px 0px 0px 0px', threshold: 1 });
  io.observe($('.promobar'));
}

/* --- Scroll reveal (same technique as the live theme's banner-grid.js) ---- */
function initReveal() {
  const els = $$('[data-reveal]');
  if (reduced()) { els.forEach(e => e.dataset.shown = 'true'); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.dataset.shown = 'true';
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
  els.forEach(e => io.observe(e));
}

/* --- Cards ---------------------------------------------------------------- */
function flagClass(flag) {
  if (!flag) return '';
  if (/save|low stock/i.test(flag)) return ' tile__flag--sale';
  if (/new/i.test(flag)) return ' tile__flag--new';
  return '';
}

function cardHTML(p) {
  const price = p.was
    ? `<del>${money(p.was)}</del><ins>${money(p.price)}</ins>`
    : money(p.price);
  const spec = [p.ml ? `${p.ml}ml` : null, p.mg ? `${p.mg}mg` : null,
                p.ratio !== '—' ? p.ratio : null].filter(Boolean).join(' · ');
  return `
  <article class="tile" style="--flavour:${p.flavour}; --on-flavour:${onFlavour(p.flavour)}">
    ${p.flag ? `<span class="tile__flag${flagClass(p.flag)}">${p.flag}</span>` : ''}
    <img class="tile__img" src="${p.img}" alt="${p.brand} ${p.name}"
         loading="lazy" decoding="async" width="420" height="420">
    <div class="tile__foot">
      <span class="tile__brand">${p.brand}</span>
      <h3 class="tile__name">${p.name}</h3>
      <span class="tile__spec">${spec}</span>
      <div class="tile__buy">
        <span class="tile__price">${price}</span>
        <button class="tile__add" data-add="${p.id}" aria-label="Add ${p.name} to basket">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

function bindAdds(root) {
  $$('[data-add]', root).forEach(b => b.addEventListener('click', () => {
    addToCart(b.dataset.add);
    b.dataset.added = 'true';
    setTimeout(() => { delete b.dataset.added; }, 1200);
  }));
}

/* --- Grid, tabs and strength filter --------------------------------------- */
let activeTab = 'eliquid';
let activeStrength = null;

/* Four tiles, never more. The homepage is a shop window, not the shop: its
   job is to make four products look worth buying and then hand you over to
   the catalogue. Counts and destination come from the real catalogue, so the
   button never promises a number the shop page will not show. */
const SHOWN = 4;
/* The numbers are IN-STOCK counts, not catalogue counts, because that is
   what the shop page shows when you land on it — it filters to in stock by
   default. The old button said "864 e-liquids" and then delivered 764, which
   is the kind of small dishonesty a customer notices and a client doesn't. */
const TABS = {
  eliquid: { label: 'liquids', one: 'liquid', total: 764,
             all: 'View all 764 e-liquids', href: 'shop.html?type=Eliquid' },
  kits:    { label: 'kits',    one: 'kit',    total: 140,
             all: 'View all 140 vape kits', href: 'shop.html?type=Vape%20Kits' },
  // 664 pods + 93 pouches. The link carries both types, which shop.js reads
  // as a comma-separated list, so one button covers the whole tab.
  pods:    { label: 'pods & pouches', one: 'pod', total: 757,
             all: 'View all 757 pods & pouches', href: 'shop.html?type=Pods,Nicotine%20Pouches' }
};

function renderGrid() {
  const list = PRODUCTS.filter(p =>
    p.type === activeTab && (activeStrength === null || p.mg === activeStrength));
  const shown = list.slice(0, SHOWN);

  const grid = $('#productGrid');
  grid.innerHTML = shown.map(cardHTML).join('');
  grid.style.setProperty('--cols', String(Math.max(shown.length, 1)));
  bindAdds(grid);

  const tab = TABS[activeTab];
  $('#gridHeading').textContent = activeStrength === null
    ? 'Best sellers' : `${activeStrength}mg ${tab.label}`;
  // The total is the real catalogue count, not this prototype's sample, so it
  // is only quotable when nothing is filtered.
  const noun = shown.length === 1 ? tab.one : tab.label;
  $('#gridCount').textContent = !shown.length
    ? 'Nothing at that strength in this range — try another.'
    : activeStrength === null
      ? `Showing ${shown.length} of ${tab.total} ${tab.label}`
      : `Showing ${shown.length} ${noun} at ${activeStrength}mg`;
  $('#gridAllLabel').textContent = tab.all;
  $('#gridAll').href = tab.href;
}

function initTabs() {
  $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    $$('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
    renderGrid();
  }));
}

function initStrengths() {
  $('#strengthGrid').innerHTML = STRENGTHS.map(s => `
    <button class="strength" data-mg="${s.mg}" aria-pressed="false">
      <span class="strength__val">${s.mg}<sub>mg</sub></span>
      <span class="strength__name">${s.name}</span>
      <span class="strength__note">${s.note}</span>
      <span class="gauge" style="--level:${s.level}"><span class="gauge__liquid"></span></span>
    </button>`).join('');

  $$('.strength').forEach(btn => btn.addEventListener('click', () => {
    const mg = +btn.dataset.mg;
    activeStrength = activeStrength === mg ? null : mg;
    $$('.strength').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.mg === activeStrength)));
    renderGrid();
    $('#bestsellers').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }));
}

/* --- Static sections ------------------------------------------------------ */
function initClearance() {
  const g = $('#clearanceGrid');
  g.innerHTML = CLEARANCE.map(cardHTML).join('');
  bindAdds(g);
}

function initBrands() {
  $('#brandGrid').innerHTML = BRANDS.map((b, i) => `
    <a class="brand" href="#bestsellers" data-reveal
       style="--reveal-delay:${i * 60}ms; --logo-scale:${b.scale}">
      <span class="brand__mark">
        <img src="assets/brands/${b.file}" alt="${b.name}" loading="lazy" decoding="async">
      </span>
    </a>`).join('');
}

function initReviews() {
  $('#reviewGrid').innerHTML = REVIEWS.map((r, i) => `
    <blockquote class="review" data-reveal style="--reveal-delay:${i * 70}ms">
      <div class="review__stars">${ICONS.star.repeat(r.n)}</div>
      <div class="review__t">${r.t}</div>
      <p class="review__q">${r.q}</p>
      <cite class="review__by">${r.by}</cite>
    </blockquote>`).join('');
}

function initNews() {
  $('#newsGrid').innerHTML = POSTS.map((p, i) => `
    <a class="post" href="${p.href || '#'}" data-reveal style="--reveal-delay:${i * 70}ms">
      <span class="post__img" style="--post:${p.colour}"><img src="${p.img}" alt="" loading="lazy" decoding="async" width="420" height="420"></span>
      <h3>${p.t}</h3>
      <p>${p.d}</p>
      <span class="post__more">Read news</span>
    </a>`).join('');
}

/* --- Cart -----------------------------------------------------------------
   State and drawer markup both live in cart.js: the basket has to survive the
   jump to shop.html, and a second renderer here would only drift from it. */
const ALL = [...PRODUCTS, ...CLEARANCE];
const find = id => ALL.find(p => p.id === id);

function addToCart(id) {
  const p = find(id);
  cart.add({
    h: p.id, t: p.name, p: p.price, i: p.img, c: p.flavour,
    v: `${p.ml ? p.ml + 'ml · ' : ''}${p.mg}mg`
  });
  showToast(p.name + ' added');
}
const renderCart = () =>
  renderCartDrawer('Your basket is empty.<br>Pick a strength to get started.');
document.addEventListener('cart:change', renderCart);

/* --- Overlays (focus returns to whatever opened the panel) ---------------- */
let lastTrigger = null;
function openPanel(el, trigger) {
  lastTrigger = trigger || null;
  $('#scrim').dataset.open = 'true';
  el.dataset.open = 'true';
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closePanels() {
  $('#scrim').dataset.open = 'false';
  ['#cart', '#search'].forEach(s => {
    $(s).dataset.open = 'false';
    $(s).setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
  if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
}

function initOverlays() {
  $('#cartOpen').addEventListener('click', e => openPanel($('#cart'), e.currentTarget));
  $('#cartClose').addEventListener('click', closePanels);
  $('#searchClose').addEventListener('click', closePanels);
  $('#scrim').addEventListener('click', closePanels);
  $('#searchOpen').addEventListener('click', e => {
    openPanel($('#search'), e.currentTarget);
    setTimeout(() => $('#searchInput').focus(), 120);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanels();
    if (e.key === '/' && !/input|textarea/i.test(e.target.tagName)) {
      e.preventDefault();
      openPanel($('#search'), $('#searchOpen'));
      setTimeout(() => $('#searchInput').focus(), 120);
    }
  });
}

/* --- Search: matches name, brand and spec, because people search "20mg"
       as often as they search "mango" ------------------------------------- */
function initSearch() {
  const hits = $('#searchHits');
  $('#searchInput').addEventListener('input', e => {
    const term = e.target.value.trim().toLowerCase();
    if (!term) { hits.innerHTML = ''; return; }
    const found = ALL.filter(p =>
      [p.name, p.brand, `${p.mg}mg`, `${p.ml}ml`, p.ratio].join(' ').toLowerCase().includes(term));
    hits.innerHTML = found.length
      ? found.slice(0, 8).map(p => {
          const name = p.name.replace(new RegExp(`(${term})`, 'ig'), '<em>$1</em>');
          return `<a class="search__hit" href="#bestsellers">
            <span><b>${name}</b> <span class="u-spec" style="color:#5A6580">${p.brand} · ${p.mg}mg</span></span>
            <span class="u-spec">${money(p.price)}</span></a>`;
        }).join('')
      : `<p class="search__none">Nothing matches "${e.target.value}". Try a flavour or a strength.</p>`;
  });
}

/* --- Toast ---------------------------------------------------------------- */
let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  $('#toastText').textContent = msg;
  t.dataset.open = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.dataset.open = 'false'; }, 2200);
}

function initSignup() {
  $('#signupForm').addEventListener('submit', e => {
    e.preventDefault();
    showToast('Signed up — 20% off on its way');
    e.target.reset();
  });
}

/* --- Boot ----------------------------------------------------------------- */
initAgeGate();
initStrengths();
initTabs();
renderGrid();
initClearance();
initBrands();
initReviews();
initNews();
initHero();
initHeader();
initTrustIcons();
initOverlays();
initNav();
initSearch();
initSignup();
renderCart();
initReveal();
