/* Mobile navigation.
   The header nav is hidden below 1000px and, until this existed, nothing
   replaced it — on a phone there was no way to reach a category at all.
   On a shop, that is not a styling gap, it is the shop being unusable.

   Rendered from one list here rather than duplicated into index.html and
   shop.html, because two copies of a nav drift. The panel starts hidden, so
   building it in script costs no layout shift. */

const CATEGORIES = [
  { t: 'Shop all',    href: 'shop.html',                        c: '#2BC9BC' },
  { t: 'Pods',        href: 'shop.html?type=Pods',              c: '#3B82F6' },
  { t: 'E-liquids',   href: 'shop.html?type=Eliquid',           c: '#F43F5E' },
  { t: 'Vape kits',   href: 'shop.html?type=Vape%20Kits',       c: '#F9C22E' },
  { t: 'Coils',       href: 'shop.html?type=Coils',             c: '#A855F7' },
  { t: 'Pouches',     href: 'shop.html?type=Nicotine%20Pouches',c: '#4ADE80' },
  { t: 'Vape deals',  href: 'shop.html?sort=price-asc',         c: '#C81E17', hot: true }
];

/* Secondary links live on the homepage, so they are absolute to it — the
   menu is identical on both pages and shop.html has no #strengths. */
const SECONDARY = [
  { t: 'Which strength?', href: 'index.html#strengths' },
  { t: 'Brands',          href: 'index.html#brands' },
  { t: 'Delivery & FAQ',  href: 'index.html#faq' },
  { t: '20% off — sign up', href: 'index.html#signup', cta: true }
];

export function initNav() {
  const burger = document.querySelector('#burger');
  const menu   = document.querySelector('#menu');
  if (!burger || !menu) return;

  menu.innerHTML = `
    <div class="menu__inner">
      <ul class="menu__cats">
        ${CATEGORIES.map((c, i) => `
          <li style="--i:${i}">
            <a href="${c.href}"${c.hot ? ' data-hot' : ''}>
              <span class="menu__swatch" style="--c:${c.c}"></span>
              <span class="menu__label">${c.t}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
            </a>
          </li>`).join('')}
      </ul>
      <ul class="menu__more">
        ${SECONDARY.map(s => `<li><a href="${s.href}"${s.cta ? ' class="menu__cta"' : ''}>${s.t}</a></li>`).join('')}
      </ul>
    </div>`;

  const focusable = () => [...menu.querySelectorAll('a')];

  const header = document.querySelector('.header');

  function open() {
    /* The header is sticky, so its bottom edge is at 64px when the page is
       scrolled and lower when the promobar is still on screen. Measuring it
       is the only way the first row clears it in both states. */
    if (header) menu.style.setProperty('--menu-top', Math.round(header.getBoundingClientRect().bottom) + 'px');
    menu.dataset.open = 'true';
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    const first = focusable()[0];
    if (first) first.focus();
  }
  function close(returnFocus = true) {
    menu.dataset.open = 'false';
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (returnFocus) burger.focus();
  }

  burger.addEventListener('click', () =>
    menu.dataset.open === 'true' ? close() : open());

  /* A link that only moves down the current page leaves the menu covering
     the thing it just scrolled to, so close on any click inside. */
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(false); });

  document.addEventListener('keydown', e => {
    if (menu.dataset.open !== 'true') return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    /* Keep Tab inside the panel: behind it the whole page is still in the
       tab order, and tabbing into content you cannot see is disorienting. */
    const f = [burger, ...focusable()];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });

  return { open, close };
}
