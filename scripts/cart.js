/* Shared basket.
   The homepage and the shop are separate documents, so the basket has to
   survive navigation — it lives in localStorage and every page reads the
   same store. Wrapped in try/catch because private browsing and blocked
   site-data both make localStorage throw rather than return null.

   Line shape, and both pages must write it identically or a basket started
   on one page renders wrong on the other:

     h  unique key (product handle, or the homepage product id)
     t  title
     v  sub-line — brand on the shop, "50ml · 10mg" on the homepage
     p  unit price, number
     i  image src, already resolved to a full URL
     c  flavour colour
     q  quantity, owned by this module
*/

const KEY = 'av-cart-v1';
export const FREE_DELIVERY = 10;

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
function write(c) {
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* non-fatal */ }
  document.dispatchEvent(new CustomEvent('cart:change'));
}

export const cart = {
  all()   { return read(); },
  count() { return Object.values(read()).reduce((a, l) => a + l.q, 0); },
  total() { return Object.values(read()).reduce((a, l) => a + l.q * l.p, 0); },
  add(item) {
    const c = read();
    const l = c[item.h] || { ...item, q: 0 };
    l.q += 1; c[item.h] = l; write(c);
  },
  setQty(h, d) {
    const c = read(); if (!c[h]) return;
    c[h].q += d;
    if (c[h].q <= 0) delete c[h];
    write(c);
  },
  clear() { write({}); }
};

export const money = n => '£' + n.toFixed(2);
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

/* One drawer renderer for both pages. The markup is identical in index.html
   and shop.html, so two implementations would only ever be two chances to
   drift apart. */
export function renderCartDrawer(empty = 'Your basket is empty.') {
  const $ = s => document.querySelector(s);
  const items = Object.values(cart.all());
  const count = cart.count(), total = cart.total();

  const badge = $('#cartCount');
  if (badge) { badge.textContent = count; badge.hidden = count === 0; }

  const body = $('#cartBody');
  if (!body) return;
  body.innerHTML = items.length === 0
    ? `<p class="drawer__empty">${empty}</p>`
    : items.map(l => `
      <div class="line">
        <div class="line__thumb" style="--flavour:${esc(l.c)}"><img src="${esc(l.i)}" alt="" width="420" height="420" loading="lazy"></div>
        <div>
          <div class="line__n">${esc(l.t)}</div>
          <div class="line__m">${esc(l.v)}</div>
          <div class="qty">
            <button data-q="-1" data-id="${esc(l.h)}" aria-label="Decrease quantity for ${esc(l.t)}">−</button>
            <span>${l.q}</span>
            <button data-q="1" data-id="${esc(l.h)}" aria-label="Increase quantity for ${esc(l.t)}">+</button>
          </div>
        </div>
        <span class="line__p">${money(l.p * l.q)}</span>
      </div>`).join('');

  body.querySelectorAll('[data-q]').forEach(b =>
    b.addEventListener('click', () => cart.setQty(b.dataset.id, +b.dataset.q)));

  const t = $('#cartTotal'); if (t) t.textContent = money(total);

  const left = Math.max(FREE_DELIVERY - total, 0);
  const th = $('#threshold');
  if (th) th.innerHTML = `
    <div class="threshold__label">
      <span>${left > 0 ? `Free delivery at ${money(FREE_DELIVERY)}` : 'Free delivery unlocked'}</span>
      <b>${left > 0 ? money(left) + ' to go' : '✓'}</b>
    </div>
    <span class="gauge gauge--h" style="--level:${Math.min(total / FREE_DELIVERY, 1)}"><span class="gauge__liquid"></span></span>`;
}
