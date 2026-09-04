# aquavape-rebrand

Rebrand work for [aquavape.co.uk](https://aquavape.co.uk) — a Shopify
storefront on a bespoke theme (`[Main] AquaVape`, schema `Moonbase`).

- **Homepage:** https://yameenbux.github.io/aquavape-rebrand/
- **Catalogue:** https://yameenbux.github.io/aquavape-rebrand/shop.html

The site lives at the repository root so GitHub Pages serves it at the bare
URL. `.nojekyll` is present to stop Pages processing the repo with Jekyll —
without a root `index.html`, Jekyll renders `README.md` as the index instead.

## Layout

```
index.html          the prototype homepage
shop.html           the catalogue — all 2,083 products, filter/sort/search
product.html        product detail — one page serving every product via ?h=<handle>
404.html            branded not-found page

styles/             tokens, base + band system, components, motion, shop, product
scripts/
  data.js             homepage content (curated, hand-written)
  main.js             homepage behaviour
  shop.js             catalogue: filtering, sorting, URL state, rendering
  product.js          product detail, variant options, related products
  cart.js             shared basket — state and drawer, used by both pages
  nav.js              mobile category menu, shared by both pages
data/catalogue.json   the real catalogue: 2,083 products, 87 brands (108 KB gzipped)

assets/fonts/       self-hosted Archivo, Instrument Sans, JetBrains Mono
assets/products/    24 real product shots, WebP with alpha (460 KB)
DESIGN.md           the design direction and what changed from the live site
preview.png         full-page render

reference/          captured baseline of the live site
  tech-audit.md         platform, architecture, app stack, 10 findings
  design-tokens.css     the live 90-token system, de-minified
  design-tokens.json    grouped for tooling
  motion-inventory.md   every animation, easing curve and library in use
  section-inventory.md  homepage section and component map

tools/
  pull-theme.sh     authenticated Shopify theme pull (run locally)
```

## Running it

No build step and no dependencies. The homepage makes no network calls at
all; the catalogue fetches `data/catalogue.json` from the same origin and
product images from Shopify's CDN, so it needs a server rather than
`file://`:

```bash
python3 -m http.server 8899
# open http://127.0.0.1:8899
```

## The catalogue

`shop.html` runs over `data/catalogue.json` — the real Aquavape catalogue,
exported from the store's public `products.json` and reduced to what a
storefront needs: handle, title, vendor, type, price, was-price, stock,
image, strength, and a flavour colour derived from the product name.

| | |
|---|---|
| Products | 2,083 shown of 2,090 (7 have no image) |
| Variants | 6,051 |
| Brands | 87 |
| In stock | 1,712 |
| Types | E-liquid 864, Pods 857, Vape kits 154, Pouches 137, Coils 30, + 4 more |
| Prices | £0.70 – £57.99 |
| Multibuy offers | 24 distinct, on 1,479 products |
| File | 700 KB raw, **108 KB gzipped** |

Everything after the single fetch — search, strength, type, price band,
brand, sort, paging — runs in memory. Filters live in the query string, so
`shop.html?type=Pods&mg=20&sort=price-asc` is a linkable collection page.

The figure was wrong twice before it was right. A first pass stopped at four
pages of `products.json` and reported 998; a second stopped at eight and
reported 1,998. Both times the last page returned a **full** 250, which is the
signal that there is more — a short page is the only proof of exhaustion.
Page 9 holds 90 more and page 10 is empty, and the sitemap independently
counts 2,091 product URLs. 2,090 is the real number.

The point of building it is the migration question: a homepage proves a look,
a working catalogue over 2,000 real SKUs proves the thing can hold the shop.

## Status

The Liquid source is **not** in this repo — it is not publicly obtainable and
needs an authenticated pull. Run `tools/pull-theme.sh` from a machine with
Shopify store access to get it, then the prototype ports across per the
instructions at the end of `DESIGN.md`.

## Key facts about the live site

| | |
|---|---|
| Platform | Shopify + Cloudflare |
| Store handle | `disposablevapesuk.myshopify.com` (permanent) |
| Theme | `[Main] AquaVape` / `Moonbase` 1.0.0, id `133665358009` |
| Framework | None — Liquid + native Web Components + webpack |
| Carousels | Glide.js 3.7.1 |
| Motion | Lottie 5.7.4, MicroModal, IntersectionObserver |
| Typefaces | Nexa, Hurme Geometric Sans 1 (both licensed) |
| Brand navy | `#040E27` |
| Catalogue | 2,090 products, 87 brands, 864 e-liquid lines |
| Own-brand | 35 lines — `Aquavape` and `Aqua Salts` 10ml, plus an own `2in1` pod system. An earlier revision of these docs said there was none; that was read off a partial export. See DESIGN.md |
