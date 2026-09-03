import { PRODUCTS, CLEARANCE, STRENGTHS, CATEGORIES, POSTS, REVIEWS,
         STATS, HERO_SLIDES, FREE_DELIVERY } from './data.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '£' + n.toFixed(2);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* --- Hero: fill the bottle, count the flavours, run the slide dots -------- */
function initHero() {
  const g = $('#heroGauge');
  const run = () => g.style.setProperty('--level', '1');
  reduced() ? run() : setTimeout(run, 620);

  $('#heroDots').innerHTML = HERO_SLIDES.map((s, i) =>
    `<button role="tab" aria-label="${s}" aria-current="${i === 0}"></button>`).join('');
  $$('#heroDots button').forEach((b, i) => b.addEventListener('click', () => {
    $$('#heroDots button').forEach((x, j) => x.setAttribute('aria-current', String(i === j)));
  }));

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
  if (/save|low stock/i.test(flag)) return ' flag--sale';
  if (/new/i.test(flag)) return ' flag--new';
  return '';
}

function cardHTML(p) {
  const price = p.was ? `<del>${money(p.was)}</del><ins>${money(p.price)}</ins>` : money(p.price);
  const meta = [p.ml ? `${p.ml}ml` : null, `${p.mg}mg`, p.ratio !== '—' ? p.ratio : null]
    .filter(Boolean).map(m => `<span>${m}</span>`).join('');
  return `
  <article class="card" style="--flavour:${p.flavour}">
    <div class="card__swatch">
      ${p.flag ? `<span class="flag${flagClass(p.flag)}">${p.flag}</span>` : ''}
      <span class="card__flood"></span>
      <img class="card__img" src="${p.img}" alt="${p.brand} ${p.name}" loading="lazy" decoding="async" width="420" height="420">
    </div>
    <div class="card__body">
      <span class="card__brand">${p.brand}</span>
      <h3 class="card__name">${p.name}</h3>
      <div class="card__meta">${meta}</div>
      <div class="card__stars">${ICONS.star.repeat(p.stars)}</div>
      <div class="card__stock">
        <span class="gauge" style="--level:${p.stock}"><span class="gauge__liquid"></span></span>
        <small>${p.stock < .3 ? 'Low stock' : 'In stock'}</small>
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

function renderGrid() {
  const list = PRODUCTS.filter(p =>
    p.type === activeTab && (activeStrength === null || p.mg === activeStrength));

  const grid = $('#productGrid');
  grid.innerHTML = list.map(cardHTML).join('');
  bindAdds(grid);

  const label = { eliquid: 'liquids', kits: 'kits', pods: 'pods & pouches' }[activeTab];
  $('#gridHeading').textContent = activeStrength === null
    ? 'Best sellers' : `${activeStrength}mg ${label}`;
  $('#gridCount').textContent = list.length
    ? `Showing ${list.length} ${label}`
    : 'Nothing at that strength in this range — try another.';
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
function initCategories() {
  $('#catGrid').innerHTML = CATEGORIES.map((c, i) => `
    <a class="cat" href="#bestsellers" style="--cat:${c.colour}" data-reveal style="--reveal-delay:${i * 70}ms">
      <img class="cat__img" src="${c.img}" alt="" loading="lazy" decoding="async" width="420" height="420">
      <span class="cat__n">${c.name}</span>
      <span class="cat__c">${c.count}</span>
    </a>`).join('');
}

function initClearance() {
  const g = $('#clearanceGrid');
  g.innerHTML = CLEARANCE.map(cardHTML).join('');
  bindAdds(g);
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
    <a class="post" href="#" data-reveal style="--reveal-delay:${i * 70}ms">
      <span class="post__img" style="--post:${p.colour}"><img src="${p.img}" alt="" loading="lazy" decoding="async" width="420" height="420"></span>
      <h3>${p.t}</h3>
      <p>${p.d}</p>
      <span class="post__more">Read news</span>
    </a>`).join('');
}

/* --- Cart ----------------------------------------------------------------- */
const ALL = [...PRODUCTS, ...CLEARANCE];
const cart = new Map();
const find = id => ALL.find(p => p.id === id);

function addToCart(id) {
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(find(id).name + ' added');
}
function setQty(id, d) {
  const n = (cart.get(id) || 0) + d;
  n <= 0 ? cart.delete(id) : cart.set(id, n);
  renderCart();
}

function renderCart() {
  const body = $('#cartBody');
  const count = [...cart.values()].reduce((a, b) => a + b, 0);
  let total = 0; cart.forEach((q, id) => { total += find(id).price * q; });

  const badge = $('#cartCount');
  badge.textContent = count; badge.hidden = count === 0;

  body.innerHTML = count === 0
    ? `<p class="drawer__empty">Your basket is empty.<br>Pick a strength to get started.</p>`
    : [...cart.entries()].map(([id, qty]) => {
        const p = find(id);
        return `<div class="line">
          <div class="line__thumb" style="--flavour:${p.flavour}"><img src="${p.img}" alt="" width="420" height="420"></div>
          <div>
            <div class="line__n">${p.name}</div>
            <div class="line__m">${p.ml ? p.ml + 'ml · ' : ''}${p.mg}mg</div>
            <div class="qty">
              <button data-q="-1" data-id="${id}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button data-q="1" data-id="${id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <span class="line__p">${money(p.price * qty)}</span>
        </div>`;
      }).join('');

  $$('[data-q]', body).forEach(b => b.addEventListener('click', () => setQty(b.dataset.id, +b.dataset.q)));
  $('#cartTotal').textContent = money(total);

  const left = Math.max(FREE_DELIVERY - total, 0);
  $('#threshold').innerHTML = `
    <div class="threshold__label">
      <span>${left > 0 ? 'Free delivery at £10' : 'Free delivery unlocked'}</span>
      <b>${left > 0 ? money(left) + ' to go' : '✓'}</b>
    </div>
    <span class="gauge gauge--h" style="--level:${Math.min(total / FREE_DELIVERY, 1)}"><span class="gauge__liquid"></span></span>`;
}

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
initCategories();
initClearance();
initReviews();
initNews();
initHero();
initHeader();
initOverlays();
initSearch();
initSignup();
renderCart();
initReveal();
