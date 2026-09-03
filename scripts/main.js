import { PRODUCTS, CLEARANCE, STRENGTHS, CATEGORIES, POSTS, REVIEWS,
         BRANDS, STATS, HERO_SLIDES, HERO_INTERVAL, FREE_DELIVERY } from './data.js';

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
  const pauseBtn = $('#heroPause');
  const BANDS = HERO_SLIDES.map(s => `band--${s.band}`);

  let i = 0;
  let timer = null;
  let userPaused = false;   // explicit intent — outlives hover and blur
  let hovering = false;

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

  const running = () => !reduced() && !userPaused && !hovering && !document.hidden;

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

  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    $('#heroPauseLabel').textContent = userPaused ? 'Play' : 'Pause';
    restart();
  });

  if (reduced()) {
    pauseBtn.hidden = true;             // nothing is moving, so nothing to pause
  }

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

/* --- Trust icon animations -----------------------------------------------
   Play when the icon scrolls into view, replay on hover. The class is removed
   on animationend so hovering can retrigger it — a CSS-only replay is
   unreliable because the animation never restarts on an unchanged element.
   ------------------------------------------------------------------------ */
function initTrustIcons() {
  const items = $$('.trust__item');
  if (!items.length) return;

  const play = el => {
    if (reduced()) { el.classList.add('has-played'); return; }
    el.classList.remove('is-playing');
    void el.offsetWidth;                       // force a reflow so it restarts
    el.classList.add('is-playing', 'has-played');
  };

  items.forEach(el => {
    el.addEventListener('animationend', e => {
      if (e.target === el.querySelector('.trust__ring')) el.classList.remove('is-playing');
    });
    el.addEventListener('pointerenter', () => play(el));
  });

  if (reduced()) { items.forEach(el => el.classList.add('has-played')); return; }

  // stagger on first scroll-in so the row reads left to right
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const n = items.indexOf(e.target);
      setTimeout(() => play(e.target), n * 130);
      obs.unobserve(e.target);
    });
  }, { threshold: .55 });
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

function initBrands() {
  $('#brandGrid').innerHTML = BRANDS.map((b, i) => `
    <a class="brand" href="#bestsellers" data-reveal
       style="--reveal-delay:${i * 60}ms; --logo-scale:${b.scale}">
      <span class="brand__mark">
        <img src="assets/brands/${b.file}" alt="${b.name}" loading="lazy" decoding="async">
      </span>
      <span class="brand__n">${b.lines}</span>
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
initBrands();
initReviews();
initNews();
initHero();
initHeader();
initTrustIcons();
initOverlays();
initSearch();
initSignup();
renderCart();
initReveal();
