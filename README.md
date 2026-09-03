# aquavape-rebrand

Rebrand work for [aquavape.co.uk](https://aquavape.co.uk) — a Shopify
storefront on a bespoke theme (`[Main] AquaVape`, schema `Moonbase`).

**Live prototype: https://yameenbux.github.io/aquavape-rebrand/**

The site lives at the repository root so GitHub Pages serves it at the bare
URL. `.nojekyll` is present to stop Pages processing the repo with Jekyll —
without a root `index.html`, Jekyll renders `README.md` as the index instead.

## Layout

```
index.html          the prototype homepage
styles/             tokens, base + band system, components, motion
scripts/            data.js (placeholder catalogue), main.js
assets/fonts/       self-hosted Archivo, Instrument Sans, JetBrains Mono
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

No build step, no dependencies, no network calls:

```bash
python3 -m http.server 8899
# open http://127.0.0.1:8899
```

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
