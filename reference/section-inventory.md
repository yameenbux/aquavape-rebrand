# Section inventory — homepage

22 Shopify sections, captured 2026-09-03.

| # | Section id | Heading | Notes |
|---|---|---|---|
| 1 | `sections--…__announcement-bar` | — | Transparent bg, 16px |
| 2 | `sections--…__header` | AQUAVAPE | `#040E27`, 54px tall, `<mobile-menu-trigger>` |
| 3 | `sections--…__header-search` | — | `<predictive-search>` → Algolia |
| 4 | `sections--…__usp_bar_WatGmR` | — | `<usp-bar>` + Glide, autoplay/rewind/hoverpause |
| 5 | `breadcrumb` | — | |
| 6 | `strip-banner` | — | |
| 7 | `strip-banner2` | — | |
| 8 | `ajax-cart` | YOUR CART | Drawer cart |
| 9 | `template--…__homepage_carousel_TELNph` | SAVE UP TO 60% | Hero, `<carousel-slider-…>` + Glide |
| 10 | `template--…__1655907426a0b8b711` | PREMIUM UK MADE ELIQUID & VAPE KITS | Brand statement |
| 11 | `template--…__1656326620adc98c93` | — | |
| 12 | `template--…__1655967651b6a4d59f` | FEATURED BRANDS | |
| 13 | `template--…__165597257388713835` | BEST SELLERS | `<product-item>` grid |
| 14 | `template--…__1656413227ec4f7644` | — | |
| 15 | `template--…__1656426479d34904d2` | — | |
| 16 | `template--…__58fc2b06-…` | LATEST REVIEWS | Okendo carousel |
| 17 | `template--…__165702032920bc1e35` | CLEARANCE | |
| 18 | `template--…__16565043298c9797b0` | JUST LANDED | |
| 19 | `template--…__loyalty_faq_CYgwgP` | FAQS | LoyaltyLion, `.rewards__section` animated bg |
| 20 | `template--…__1657036081e730f1d9` | VAPING NEWS | Blog feed |
| 21 | `sections--…__newsletter` | — | Klaviyo |
| 22 | `sections--…__footer` | — | `#000` bg, white text |

Four of 22 sections have no heading at all (11, 14, 15, and the two strip
banners) — image-only promo strips. Worth auditing whether they earn their
place before carrying them into the rebrand.

## Custom elements in use

```
<mobile-menu-trigger>   <predictive-search>   <usp-bar>
<carousel-slider-…>     <product-item>        <product-images>
<banner-grid>           <shop-cart-sync>      (Shopify-injected)
```

These are native Web Components registered in `theme.js` — no framework.
This is the component contract to preserve or deliberately replace.

## Observed component styles

| Component | Value |
|---|---|
| Header | bg `#040E27`, `#fff`, Nexa 500, 16px, `letter-spacing: .32px`, height 54px |
| Primary button | bg `#040D25`, `#fff`, Nexa 400, 16px, **uppercase**, `padding: 16px`, `radius: 0` |
| Product card | transparent bg, no radius, no shadow |
| Product title | `#161313`, Nexa 500, 16px, `letter-spacing: .32px`, sentence case |
| H1 | Nexa 500, **25px**/30px, uppercase |
| H2 | Nexa 700, **31.25px**/37.5px, uppercase |
| Footer | bg `#000`, `#fff` |
