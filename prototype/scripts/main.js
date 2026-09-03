import { PRODUCTS, STRENGTHS, FREE_DELIVERY } from './data.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '£' + n.toFixed(2);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Age gate ------------------------------------------------------------
   Session-scoped, as UK vape retail requires. Blocks paint of the page
   behind it rather than appearing after the fact. */
function initAgeGate() {
  const gate = $('#agegate');
  if (sessionStorage.getItem('av-age-ok') === '1') return;
  gate.hidden = false;
  document.body.style.overflow = 'hidden';

  $('[data-age="yes"]', gate).addEventListener('click', () => {
    sessionStorage.setItem('av-age-ok', '1');
    gate.dataset.closing = 'true';
    document.body.style.overflow = '';
    setTimeout(() => {
      gate.hidden = true;
      $('.header__logo').focus();   // land focus somewhere sensible
    }, 600);
  });
  $('[data-age="no"]', gate).addEventListener('click', () => {
    gate.innerHTML = '<div class="agegate__panel"><h2>Sorry</h2>' +
      '<p>You must be 18 or over to shop with us.</p></div>';
  });
}

/* --- Ticker: duplicated once so the -50% scroll loops seamlessly --------- */
function initTicker() {
  const items = [
    ['Free UK delivery over', '£20'],
    ['Mixed and bottled in', 'Lancashire'],
    ['TPD registered', 'MHRA'],
    ['Order before 3pm for', 'next-day'],
    ['4.8 average from', '12,400 reviews']
  ];
  const html = items.map(([t, b]) =>
    `<span class="ticker__item">${t} <b>${b}</b></span>`).join('');
  $('#ticker').innerHTML = html + html;
}

/* --- Hero: fill the bottle, then count the flavours ---------------------- */
function initHero() {
  const bottle = $('#heroBottle');
  const run = () => { bottle.style.setProperty('--level', '0.72'); };
  reduced() ? run() : setTimeout(run, 620);

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

/* --- Scroll reveal: same IntersectionObserver technique the live theme
       already uses in banner-grid.js, applied consistently ---------------- */
function initReveal() {
  const els = $$('[data-reveal]');
  if (reduced()) { els.forEach(e => e.dataset.shown = 'true'); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.dataset.shown = 'true';
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
  els.forEach(e => io.observe(e));
}

/* --- Strength selector --------------------------------------------------- */
let activeStrength = null;

function initStrengths() {
  $('#strengthGrid').innerHTML = STRENGTHS.map(s => `
    <button class="strength" data-mg="${s.mg}" aria-pressed="false">
      <span class="strength__val">${s.mg}<sub>mg</sub></span>
      <span class="strength__name">${s.name}</span>
      <span class="strength__name" style="text-transform:none;letter-spacing:0">${s.note}</span>
      <span class="gauge" style="--level:${s.level}"><span class="gauge__liquid"></span></span>
    </button>`).join('');

  $$('.strength').forEach(btn => btn.addEventListener('click', () => {
    const mg = +btn.dataset.mg;
    activeStrength = activeStrength === mg ? null : mg;
    $$('.strength').forEach(b =>
      b.setAttribute('aria-pressed', String(+b.dataset.mg === activeStrength)));
    renderGrid();
  }));
}

/* --- Product grid -------------------------------------------------------- */
const bottleSVG = `<svg class="card__bottle" viewBox="0 0 120 260" aria-hidden="true">
  <path d="M30 90c0-18 20-24 20-34h20c0 10 20 16 20 34v148a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8Z"/>
  <rect x="44" y="4" width="32" height="34" rx="2"/><rect x="50" y="38" width="20" height="20"/></svg>`;

function cardHTML(p) {
  const price = p.was
    ? `<del>${money(p.was)}</del><ins>${money(p.price)}</ins>`
    : money(p.price);
  return `
  <article class="card" style="--flavour:${p.flavour}">
    <div class="card__swatch">
      ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
      <span class="card__flood"></span>
      ${bottleSVG}
    </div>
    <div class="card__body">
      <span class="card__brand">${p.brand}</span>
      <h3 class="card__name">${p.name}</h3>
      <div class="card__meta">
        <span>${p.ml}ml</span><span>${p.mg}mg</span><span>${p.ratio}</span>
      </div>
      <div class="card__stock">
        <span class="gauge" style="--level:${p.stock}"><span class="gauge__liquid"></span></span>
        <small>${p.stock < 0.3 ? 'Low stock' : 'In stock'}</small>
      </div>
      <div class="card__foot">
        <span class="card__price">${price}</span>
        <button class="card__add" data-add="${p.id}" aria-label="Add ${p.name} to basket">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const list = activeStrength === null
    ? PRODUCTS
    : PRODUCTS.filter(p => p.mg === activeStrength);

  $('#productGrid').innerHTML = list.map(cardHTML).join('');
  $('#gridHeading').textContent = activeStrength === null
    ? 'Best sellers'
    : `${activeStrength}mg liquids`;
  $('#gridCount').textContent = list.length
    ? `Showing ${list.length} ${list.length === 1 ? 'liquid' : 'liquids'}`
    : 'Nothing at that strength yet — try another.';

  $$('[data-add]').forEach(b => b.addEventListener('click', () => {
    addToCart(b.dataset.add);
    b.dataset.added = 'true';
    setTimeout(() => { delete b.dataset.added; }, 1200);
  }));
}

/* --- Cart ----------------------------------------------------------------
   The delivery threshold is the gauge doing real work: the vessel fills as
   the basket approaches free delivery. */
const cart = new Map();

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(PRODUCTS.find(p => p.id === id).name + ' added');
}

function setQty(id, delta) {
  const next = (cart.get(id) || 0) + delta;
  next <= 0 ? cart.delete(id) : cart.set(id, next);
  renderCart();
}

function cartTotal() {
  let t = 0;
  cart.forEach((q, id) => { t += PRODUCTS.find(p => p.id === id).price * q; });
  return t;
}

function renderCart() {
  const body  = $('#cartBody');
  const count = [...cart.values()].reduce((a, b) => a + b, 0);
  const total = cartTotal();

  const badge = $('#cartCount');
  badge.textContent = count;
  badge.hidden = count === 0;

  body.innerHTML = count === 0
    ? `<p class="drawer__empty">Your basket is empty.<br>Pick a strength to get started.</p>`
    : [...cart.entries()].map(([id, qty]) => {
        const p = PRODUCTS.find(x => x.id === id);
        return `
        <div class="line">
          <div class="line__thumb">${bottleSVG.replace('class="card__bottle"', '')}</div>
          <div>
            <div class="line__n">${p.name}</div>
            <div class="line__m">${p.ml}ml · ${p.mg}mg · ${p.ratio}</div>
            <div class="qty">
              <button data-q="-1" data-id="${id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-q="1" data-id="${id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <span class="line__p">${money(p.price * qty)}</span>
        </div>`;
      }).join('');

  $$('[data-q]', body).forEach(b =>
    b.addEventListener('click', () => setQty(b.dataset.id, +b.dataset.q)));

  $('#cartTotal').textContent = money(total);

  const remaining = Math.max(FREE_DELIVERY - total, 0);
  $('#threshold').innerHTML = `
    <div class="threshold__label">
      <span>${remaining > 0 ? 'Free delivery at £20' : 'Free delivery unlocked'}</span>
      <b>${remaining > 0 ? money(remaining) + ' to go' : '✓'}</b>
    </div>
    <span class="gauge gauge--h" style="--level:${Math.min(total / FREE_DELIVERY, 1)}">
      <span class="gauge__liquid"></span>
    </span>`;
}

/* --- Overlays ------------------------------------------------------------
   Focus returns to whatever opened the panel, so keyboard users are not
   dropped back at the top of the document. */
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
  $('#cart').addEventListener('keydown', e => { if (e.key === 'Escape') closePanels(); });
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

/* --- Search: matches name, flavour and spec, because people search
       "20mg" as often as they search "mango" ---------------------------- */
function initSearch() {
  const input = $('#searchInput');
  const hits  = $('#searchHits');

  const render = q => {
    const term = q.trim().toLowerCase();
    if (!term) { hits.innerHTML = ''; return; }

    const found = PRODUCTS.filter(p =>
      [p.name, p.brand, `${p.mg}mg`, `${p.ml}ml`, p.ratio]
        .join(' ').toLowerCase().includes(term));

    hits.innerHTML = found.length
      ? found.map(p => {
          const name = p.name.replace(new RegExp(`(${term})`, 'ig'), '<em>$1</em>');
          return `<a class="search__hit" href="#bestsellers">
            <span><b>${name}</b> <span class="u-spec" style="color:var(--on-ink-mute)">${p.ml}ml · ${p.mg}mg</span></span>
            <span class="u-spec">${money(p.price)}</span></a>`;
        }).join('')
      : `<p class="search__none">Nothing matches "${q}". Try a flavour or a strength.</p>`;
  };

  input.addEventListener('input', e => render(e.target.value));
}

/* --- Toast --------------------------------------------------------------- */
let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  $('#toastText').textContent = msg;
  t.dataset.open = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.dataset.open = 'false'; }, 2200);
}

/* --- Reviews ------------------------------------------------------------- */
function initReviews() {
  const reviews = [
    { q: 'Switched off disposables in a week. The 20mg salt is the only one that actually held me.', by: 'Dan H. · Verified', n: 5 },
    { q: 'Batch code on the bottle is a small thing but it is why I stopped buying from the corner shop.', by: 'Priya R. · Verified', n: 5 },
    { q: 'Rhubarb and custard shortfill is genuinely as good as the description. Ordered four more.', by: 'Marcus O. · Verified', n: 4 }
  ];
  const star = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.2 3.3L7 14.3l-5-4.9 7-.9z"/></svg>`;
  $('#reviewGrid').innerHTML = reviews.map((r, i) => `
    <blockquote class="review" data-reveal style="--reveal-delay:${i * 80}ms">
      <div class="review__stars">${star.repeat(r.n)}</div>
      <p class="review__q">${r.q}</p>
      <cite class="review__by">${r.by}</cite>
    </blockquote>`).join('');
}

/* --- Misc ---------------------------------------------------------------- */
function initSignup() {
  $('#signupForm').addEventListener('submit', e => {
    e.preventDefault();
    showToast('Signed up — check your inbox');
    e.target.reset();
  });
}

/* --- Boot ---------------------------------------------------------------- */
initAgeGate();
initTicker();
initStrengths();
renderGrid();
initReviews();
initHero();
initOverlays();
initSearch();
initSignup();
renderCart();
initReveal();
