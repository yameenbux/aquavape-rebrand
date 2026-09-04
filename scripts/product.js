/* Product page.
   One document serving all 2,083 products: the handle comes from ?h= and
   everything else from the same catalogue.json the shop already loads, so a
   product page costs no extra request once you have browsed the grid.

   What is real here and what is not, stated plainly because a prototype that
   blurs the line is worse than useless: prices, stock, images, brands, types,
   strengths, multibuy offers and variant option names are all live data from
   the shop. Per-variant price and per-variant stock are NOT in the public
   endpoint, so choosing an option records the choice on the basket line but
   does not change the price. On a real build those come from the API. */

import { cart, money, renderCartDrawer } from './cart.js';
import { initNav } from './nav.js';

const $ = s => document.querySelector(s);
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const SIZES = '(max-width: 560px) 33vw, (max-width: 900px) 22vw, 11vw';

let DATA = [], CDN = '', P = null, chosen = null;

/* --- age gate (same contract as the other two pages) --------------------- */
(function ageGate() {
  const g = $('#agegate');
  if (!g || sessionStorage.getItem('av-age-ok') === '1') return;
  g.hidden = false; document.body.style.overflow = 'hidden';
  g.querySelector('[data-age="yes"]').addEventListener('click', () => {
    sessionStorage.setItem('av-age-ok', '1');
    g.dataset.closing = 'true'; document.body.style.overflow = '';
    setTimeout(() => { g.hidden = true; }, 600);
  });
  g.querySelector('[data-age="no"]').addEventListener('click', () => {
    g.innerHTML = '<div class="agegate__panel"><h2>Sorry</h2><p>You must be 18 or over to shop with us.</p></div>';
  });
})();

const src = (p, w) => `${CDN}${p.i}?width=${w}`;
const srcset = p => [320, 480, 640, 900].map(w => `${src(p, w)} ${w}w`).join(', ');

/* The option list is one axis on most products — strengths, or flavours, or
   coil resistances. Naming it correctly is the difference between a control
   that reads as considered and one that reads as generic. */
function optionLabel(vals) {
  const j = vals.join(' ').toLowerCase();
  if (/\d\s*mg/.test(j))              return 'Strength';
  if (/ohm/.test(j))                  return 'Coil resistance';
  if (/\d+\s*(ml|mah)/.test(j))       return 'Size';
  if (vals.length > 6)                return 'Flavour';
  return 'Options';
}

function paint(p) {
  document.title = `${p.t} — Aquavape`;
  $('#crumbName').textContent = p.t;
  const type = $('#crumbType');
  type.textContent = p.y;
  type.href = `shop.html?type=${encodeURIComponent(p.y)}`;

  const shot = $('#pdpShot');
  shot.style.setProperty('--flavour', p.c);
  shot.style.setProperty('--on-flavour', p.k ? 'var(--paper)' : 'var(--ink)');

  const img = $('#pdpImg');
  img.src = src(p, 640); img.srcset = srcset(p);
  img.sizes = '(max-width: 900px) 92vw, 46vw';
  img.alt = p.t;

  const flag = $('#pdpFlag');
  if (!p.a)      { flag.hidden = false; flag.textContent = 'Out of stock'; flag.className = 'pdp__flag pdp__flag--out'; }
  else if (p.w)  { flag.hidden = false; flag.textContent = `Save ${Math.round((1 - p.p / p.w) * 100)}%`; flag.className = 'pdp__flag pdp__flag--sale'; }

  $('#pdpBrand').textContent = p.v;
  $('#pdpTitle').textContent = p.t;
  $('#pdpSpec').textContent = [p.s !== null ? `${p.s}mg` : null, p.y, p.n ? `${p.n} variants` : null]
    .filter(Boolean).join('  ·  ');

  $('#pdpPrice').innerHTML = p.w
    ? `<del>${money(p.w)}</del><ins>${money(p.p)}</ins>`
    : money(p.p);

  if (p.m && p.m.length) {
    $('#pdpOffer').hidden = false;
    $('#pdpOfferList').innerHTML = p.m.map(o => `<span>${esc(o)}</span>`).join('');
  }

  if (p.o && p.o.length) {
    $('#pdpOptWrap').hidden = false;
    $('#pdpOptLabel').textContent = optionLabel(p.o);
    chosen = p.o[0];
    $('#pdpOpts').innerHTML = p.o.map((v, i) =>
      `<button class="fchip" data-opt="${esc(v)}" aria-pressed="${i === 0}">${esc(v)}</button>`).join('');
    $('#pdpOpts').addEventListener('click', e => {
      const b = e.target.closest('[data-opt]');
      if (!b) return;
      chosen = b.dataset.opt;
      $('#pdpOpts').querySelectorAll('[data-opt]')
        .forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
  }

  const add = $('#pdpAdd');
  add.disabled = !p.a;
  add.textContent = p.a ? 'Add to basket' : 'Out of stock';
  $('#pdpStock').textContent = p.a
    ? 'In UK stock · order before 4pm for same-day dispatch'
    : 'Not currently available.';

  $('#pdpFacts').innerHTML = [
    ['Brand', p.v],
    ['Type', p.y],
    p.s !== null ? ['Nicotine', `${p.s}mg`] : null,
    p.f && p.f.length ? ['Flavour profile', p.f.join(', ')] : null,
    p.n ? ['Variants', String(p.n)] : null,
    ['Product code', p.h]
  ].filter(Boolean).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');

  $('#pdp').setAttribute('aria-busy', 'false');
}

/* Related: same brand first, and fall back to the same flavour colour, which
   is the one axis every product in this catalogue has. */
function related(p) {
  let list = DATA.filter(x => x.h !== p.h && x.v === p.v && x.a);
  let label = `More from ${p.v}`;
  if (list.length < 5) {
    list = DATA.filter(x => x.h !== p.h && x.c === p.c && x.a);
    label = 'Similar flavours';
  }
  if (!list.length) return;
  list = list.slice(0, 10);

  $('#relatedWrap').hidden = false;
  $('#relatedHead').textContent = label;
  $('#relatedEyebrow').textContent = `${list.length} of ${DATA.filter(x => x.v === p.v).length} in this brand`;
  $('#related').innerHTML = list.map(x => `
    <a class="tile" href="product.html?h=${encodeURIComponent(x.h)}"
       style="--flavour:${x.c}; --on-flavour:${x.k ? 'var(--paper)' : 'var(--ink)'}">
      <img class="tile__img" src="${src(x, 320)}" srcset="${srcset(x)}" sizes="${SIZES}"
           alt="${esc(x.t)}" loading="lazy" decoding="async" width="420" height="420">
      <div class="tile__foot">
        <span class="tile__brand">${esc(x.v)}</span>
        <h3 class="tile__name">${esc(x.t)}</h3>
        <span class="tile__price">${money(x.p)}</span>
      </div>
    </a>`).join('');
}

function notFound(h) {
  $('#pdp').setAttribute('aria-busy', 'false');
  $('#crumbName').textContent = 'Not found';
  $('#pdpTitle').textContent = 'We could not find that product';
  $('#pdpSpec').textContent = h ? `No product matches “${h}”.` : 'No product was requested.';
  $('#pdpShot').hidden = true;
  $('#pdpAdd').outerHTML = '<a class="btn btn--primary btn--lg" href="shop.html">Back to the shop</a>';
}

const renderCart = () => renderCartDrawer('Your basket is empty.');
document.addEventListener('cart:change', renderCart);

let toastTimer;
function toast(msg) {
  const t = $('#toast'); $('#toastText').textContent = msg;
  t.dataset.open = 'true'; clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.dataset.open = 'false'; }, 2000);
}

(async function init() {
  const j = await (await fetch('data/catalogue.json')).json();
  DATA = j.products; CDN = j.cdn;

  const h = new URLSearchParams(location.search).get('h');
  P = DATA.find(x => x.h === h);
  if (!P) { notFound(h); }
  else { paint(P); related(P); }

  renderCart(); initNav();

  const add = $('#pdpAdd');
  if (add && P) add.addEventListener('click', () => {
    cart.add({
      h: chosen ? `${P.h}::${chosen}` : P.h,
      t: chosen ? `${P.t} — ${chosen}` : P.t,
      v: P.v, p: P.p, i: `${CDN}${P.i}?width=160`, c: P.c
    });
    toast(`${P.t} added`);
  });

  // overlays, same contract as the shop
  const close = () => {
    $('#scrim').dataset.open = 'false';
    $('#cart').dataset.open = 'false'; $('#cart').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $('#cartOpen').onclick = () => {
    $('#scrim').dataset.open = 'true';
    $('#cart').dataset.open = 'true'; $('#cart').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  $('#cartClose').onclick = close;
  $('#scrim').onclick = close;
  $('#searchOpen').onclick = () => { location.href = 'shop.html'; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
