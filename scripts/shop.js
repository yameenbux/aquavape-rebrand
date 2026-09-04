/* Shop — the whole live catalogue, filtered client-side.
   2,083 products load once as ~108 KB gzipped JSON, then every filter and
   sort runs in memory. Results render 48 at a time; putting 2,000 tiles in
   the DOM at once is what makes catalogue pages feel broken. */

import { cart, money, renderCartDrawer } from './cart.js';
import { initNav } from './nav.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PAGE = 48;
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const MG_MIN = 12;   // hide strengths with fewer products than this from the rail
const TYPE_MIN = 5;  // and the same for the store's one-off taxonomy strays

let DATA = [], CDN = '', shown = PAGE;
const state = { q: '', mg: null, type: null, price: null, brands: new Set(), stock: true, sort: 'featured' };

/* --- age gate (same contract as the homepage) ---------------------------- */
(function ageGate() {
  const g = $('#agegate');
  if (!g || sessionStorage.getItem('av-age-ok') === '1') return;
  g.hidden = false; document.body.style.overflow = 'hidden';
  $('[data-age="yes"]', g).addEventListener('click', () => {
    sessionStorage.setItem('av-age-ok', '1');
    g.dataset.closing = 'true'; document.body.style.overflow = '';
    setTimeout(() => { g.hidden = true; }, 600);
  });
  $('[data-age="no"]', g).addEventListener('click', () => {
    g.innerHTML = '<div class="agegate__panel"><h2>Sorry</h2><p>You must be 18 or over to shop with us.</p></div>';
  });
})();

/* --- url state: filters belong in the address bar, so a filtered view can
       be linked, bookmarked and reloaded like any real storefront -------- */
function toURL() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.mg !== null) p.set('mg', state.mg);
  if (state.type) p.set('type', state.type);
  if (state.price) p.set('price', state.price);
  if (state.brands.size) p.set('brand', [...state.brands].join('|'));
  if (!state.stock) p.set('stock', 'all');
  if (state.sort !== 'featured') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}
function fromURL() {
  const p = new URLSearchParams(location.search);
  state.q = p.get('q') || '';
  state.mg = p.has('mg') ? +p.get('mg') : null;
  state.type = p.get('type');
  state.price = p.get('price');
  state.brands = new Set((p.get('brand') || '').split('|').filter(Boolean));
  state.stock = p.get('stock') !== 'all';
  state.sort = p.get('sort') || 'featured';
}

/* --- filtering ----------------------------------------------------------- */
const BANDS = { 'u5': [0, 5], '5-10': [5, 10], '10-20': [10, 20], '20+': [20, 1e9] };

function match(p) {
  if (state.stock && !p.a) return false;
  // type accepts a comma-separated list so a link can cover two categories
  // at once — the homepage's "pods & pouches" button is one URL over two.
  if (state.type && !state.type.split(',').includes(p.y)) return false;
  if (state.brands.size && !state.brands.has(p.v)) return false;
  if (state.mg !== null && p.s !== state.mg) return false;
  if (state.price) { const [lo, hi] = BANDS[state.price]; if (p.p < lo || p.p >= hi) return false; }
  if (state.q) {
    const t = state.q.toLowerCase();
    if (!(`${p.t} ${p.v} ${p.y} ${p.s ?? ''}mg`).toLowerCase().includes(t)) return false;
  }
  return true;
}

/* "Featured" on a real storefront is a merchandising order, not alphabetical.
   There is no popularity signal in products.json, so this is a deterministic
   shuffle: stable across reloads (so a shared URL shows the same grid and
   "load more" doesn't repeat tiles) but interleaved enough that the first
   screen shows the range instead of five consecutive IQOS refills. */
function seed(h) {
  let n = 2166136261;
  for (let i = 0; i < h.length; i++) { n ^= h.charCodeAt(i); n = Math.imul(n, 16777619); }
  return (n >>> 0) / 4294967295;
}

const SORTS = {
  'featured':   (a, b) => (b.a - a.a) || (seed(a.h) - seed(b.h)),
  'price-asc':  (a, b) => a.p - b.p,
  'price-desc': (a, b) => b.p - a.p,
  'name':       (a, b) => a.t.localeCompare(b.t),
  'brand':      (a, b) => a.v.localeCompare(b.v) || a.t.localeCompare(b.t)
};

function results() { return DATA.filter(match).sort(SORTS[state.sort]); }

/* --- rendering -----------------------------------------------------------
   Shopify's CDN resizes on the `width` query parameter, so the tiles can ask
   for the size they actually render at instead of one fixed large file. It
   matters at this scale: the first page is 48 images, and a flat ?width=420
   pulls ~85 KB each (~4 MB) to fill a box that is 155 px wide on a desktop
   grid. `format=webp` is not used — the CDN ignores it and content-negotiates
   from the browser's Accept header anyway. */
const img = p => `${CDN}${p.i}?width=320`;
const srcset = p => [160, 200, 320, 420].map(w => `${CDN}${p.i}?width=${w} ${w}w`).join(', ');
/* image box ≈ 74% of a grid column: two columns on a phone, five at 1440 */
const SIZES = '(max-width: 560px) 33vw, (max-width: 900px) 22vw, 11vw';

function tile(p) {
  const price = p.w ? `<del>${money(p.w)}</del><ins>${money(p.p)}</ins>` : money(p.p);
  const spec = [p.s !== null ? `${p.s}mg` : null, p.y].filter(Boolean).join(' · ');
  return `
  <article class="tile" style="--flavour:${p.c}; --on-flavour:${p.k ? 'var(--paper)' : 'var(--ink)'}">
    <a class="tile__link" href="product.html?h=${encodeURIComponent(p.h)}"><span class="u-visually-hidden">${esc(p.t)}</span></a>
    ${!p.a ? '<span class="tile__flag tile__flag--new">Out of stock</span>' :
      p.w ? `<span class="tile__flag tile__flag--sale">Save ${Math.round((1 - p.p / p.w) * 100)}%</span>` : ''}
    ${p.m ? `<span class="tile__mb">${esc(p.m[0])}</span>` : ''}
    <img class="tile__img" src="${img(p)}" srcset="${srcset(p)}" sizes="${SIZES}"
         alt="${esc(p.t)}" loading="lazy" decoding="async" width="420" height="420">
    <div class="tile__foot">
      <span class="tile__brand">${esc(p.v)}</span>
      <h3 class="tile__name">${esc(p.t)}</h3>
      <span class="tile__spec">${esc(spec)}</span>
      <div class="tile__buy">
        <span class="tile__price">${price}</span>
        <button class="tile__add" data-add="${esc(p.h)}" aria-label="Add ${esc(p.t)} to basket"${p.a ? '' : ' disabled'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

/* `append` adds only the new page. Rebuilding 1,000+ tiles on every "load
   more" is what makes a big catalogue stutter, and it throws away the images
   the browser has already decoded. */
function render(append = false) {
  const list = results();
  if (append) $('#results').insertAdjacentHTML('beforeend', list.slice(shown - PAGE, shown).map(tile).join(''));
  else        $('#results').innerHTML = list.slice(0, shown).map(tile).join('');
  $('#empty').hidden = list.length > 0;
  $('#loadMore').hidden = shown >= list.length;
  $('#loadMore').textContent = `Load more (${Math.min(PAGE, list.length - shown)} of ${list.length - shown} left)`;
  const active = (state.q ? 1 : 0) + (state.mg !== null ? 1 : 0) + (state.type ? 1 : 0)
               + (state.price ? 1 : 0) + state.brands.size + (state.stock ? 0 : 1);
  $('#filterOpen').textContent = active ? `Filters · ${active}` : 'Filters';
  $('#drawerCount').textContent = `${list.length.toLocaleString()} results`;
  $('#resultCount').textContent = list.length === DATA.length
    ? `All ${list.length.toLocaleString()} products`
    : `${list.length.toLocaleString()} of ${DATA.length.toLocaleString()} products`;

  $$('#results [data-add]:not([data-bound])').forEach(b => { b.dataset.bound = '1'; b.addEventListener('click', () => {
    const p = DATA.find(x => x.h === b.dataset.add);
    cart.add({ h: p.h, t: p.t, v: p.v, p: p.p, i: `${CDN}${p.i}?width=160`, c: p.c });
    b.dataset.added = 'true';
    toast(`${p.t} added`);
    setTimeout(() => { delete b.dataset.added; }, 1200);
  }); });
  chips();
  toURL();
}

/* the active filters, restated as removable chips — a filtered view should
   always say what it is filtered by */
function chips() {
  const out = [];
  if (state.q)            out.push(['q', `“${state.q}”`]);
  if (state.mg !== null)  out.push(['mg', `${state.mg}mg`]);
  if (state.type)         out.push(['type', state.type]);
  if (state.price)        out.push(['price', { 'u5':'Under £5','5-10':'£5–£10','10-20':'£10–£20','20+':'£20+' }[state.price]]);
  [...state.brands].forEach(b => out.push(['brand:' + b, b]));
  if (!state.stock)       out.push(['stock', 'Including out of stock']);
  $('#activeChips').innerHTML = out.length
    ? out.map(([k, l]) => `<button class="fchip fchip--active" data-clear="${esc(k)}">${esc(l)}<span aria-hidden="true">×</span></button>`).join('')
    : '';
  $$('#activeChips [data-clear]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.clear;
    if (k === 'q') { state.q = ''; $('#q').value = ''; }
    else if (k === 'mg') state.mg = null;
    else if (k === 'type') state.type = null;
    else if (k === 'price') state.price = null;
    else if (k === 'stock') { state.stock = true; $('#inStock').checked = true; }
    else if (k.startsWith('brand:')) state.brands.delete(k.slice(6));
    shown = PAGE; buildFilters(); render();
  }));
}

/* --- filter controls, built from the data rather than hand-listed -------- */
function counts(key) {
  const m = new Map();
  DATA.forEach(p => { const v = p[key]; if (v === null || v === '') return; m.set(v, (m.get(v) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function buildFilters() {
  /* 23 distinct strengths exist in the data — 9.5mg and 11.2mg pouches are
     real, not parse errors, but a rail of 23 buttons is unusable. Show the
     strengths carrying real stock; the long tail stays reachable by typing
     "9.5mg" into the search, which matches on strength. */
  const mgs = counts('s').filter(([, n]) => n >= MG_MIN).map(([v]) => v).sort((a, b) => a - b);
  $('#fStrength').innerHTML = mgs.map(v =>
    `<button class="fchip" data-mg="${v}" aria-pressed="${state.mg === v}">${v}mg <small>${DATA.filter(p => p.s === v).length}</small></button>`).join('');

  $('#fType').innerHTML = counts('y').filter(([, n]) => n >= TYPE_MIN).map(([v, n]) =>
    `<button class="fchip" data-type="${esc(v)}" aria-pressed="${state.type === v}">${esc(v)} <small>${n}</small></button>`).join('');

  $('#fPrice').innerHTML = Object.entries({ 'u5':'Under £5','5-10':'£5–£10','10-20':'£10–£20','20+':'£20+' })
    .map(([k, l]) => `<button class="fchip" data-price="${k}" aria-pressed="${state.price === k}">${l}</button>`).join('');

  const term = ($('#brandFilter').value || '').toLowerCase();
  const brands = counts('v').filter(([v]) => v.toLowerCase().includes(term));
  $('#fBrand').innerHTML = brands.length
    ? brands.map(([v, n]) => `<label class="brandlist__row"><input type="checkbox" data-brand="${esc(v)}"${state.brands.has(v) ? ' checked' : ''}> <span>${esc(v)}</span> <small>${n}</small></label>`).join('')
    : `<p class="brandlist__none">No brand matches “${esc(term)}”.</p>`;

  $$('#fStrength [data-mg]').forEach(b => b.onclick = () => { state.mg = state.mg === +b.dataset.mg ? null : +b.dataset.mg; shown = PAGE; buildFilters(); render(); });
  $$('#fType [data-type]').forEach(b => b.onclick = () => { state.type = state.type === b.dataset.type ? null : b.dataset.type; shown = PAGE; buildFilters(); render(); });
  $$('#fPrice [data-price]').forEach(b => b.onclick = () => { state.price = state.price === b.dataset.price ? null : b.dataset.price; shown = PAGE; buildFilters(); render(); });
  $$('#fBrand [data-brand]').forEach(c => c.onchange = () => { c.checked ? state.brands.add(c.dataset.brand) : state.brands.delete(c.dataset.brand); shown = PAGE; render(); });
}

/* --- basket ------------------------------------------------------------- */
const renderCart = () => renderCartDrawer('Your basket is empty.');
document.addEventListener('cart:change', renderCart);

let toastTimer;
function toast(msg) {
  const t = $('#toast'); $('#toastText').textContent = msg;
  t.dataset.open = 'true'; clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.dataset.open = 'false'; }, 2000);
}

/* --- boot ---------------------------------------------------------------- */
(async function init() {
  const res = await fetch('data/catalogue.json');
  const j = await res.json();
  DATA = j.products; CDN = j.cdn;

  const brands = new Set(DATA.map(p => p.v)).size;
  $('#shopEyebrow').textContent =
    `${DATA.length.toLocaleString()} products · ${brands} brands · live catalogue`;

  fromURL();
  $('#q').value = state.q;
  $('#inStock').checked = state.stock;
  $('#sort').value = state.sort;

  buildFilters(); render(); renderCart();

  let t;
  $('#q').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value.trim(); shown = PAGE; render(); }, 140);
  });
  $('#brandFilter').addEventListener('input', buildFilters);
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; shown = PAGE; render(); });
  $('#inStock').addEventListener('change', e => { state.stock = e.target.checked; shown = PAGE; render(); });
  $('#loadMore').addEventListener('click', () => { shown += PAGE; render(true); });
  const clear = () => {
    Object.assign(state, { q: '', mg: null, type: null, price: null, brands: new Set(), stock: true, sort: 'featured' });
    $('#q').value = ''; $('#inStock').checked = true; $('#sort').value = 'featured';
    shown = PAGE; buildFilters(); render();
  };
  $('#clearAll').addEventListener('click', clear);
  $('#emptyClear').addEventListener('click', clear);

  // overlays
  const open = el => { $('#scrim').dataset.open = 'true'; el.dataset.open = 'true'; el.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; };
  const close = () => {
    $('#scrim').dataset.open = 'false';
    $('#cart').dataset.open = 'false'; $('#cart').setAttribute('aria-hidden', 'true');
    $('#filters').classList.remove('is-open');
    $('#filterOpen').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  initNav();
  $('#cartOpen').onclick = () => open($('#cart'));
  $('#cartClose').onclick = close;
  $('#scrim').onclick = close;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); $('#q').focus(); }
  });
  const openFilters = () => {
    $('#filters').classList.add('is-open');
    $('#filterOpen').setAttribute('aria-expanded', 'true');
    $('#scrim').dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  };
  $('#filterOpen').onclick = openFilters;
  $('#filterClose').onclick = close;
  /* On a phone the search box lives inside the filter drawer, so the header's
     search button has to open the drawer rather than scroll to a hidden input. */
  $('#searchOpen').onclick = () => {
    if (getComputedStyle($('#filterOpen')).display !== 'none') { openFilters(); return $('#q').focus(); }
    $('#q').scrollIntoView({ block: 'center' }); $('#q').focus();
  };
})();
