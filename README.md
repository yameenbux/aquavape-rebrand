# aquavape-rebrand

Rebrand work for [aquavape.co.uk](https://aquavape.co.uk) — a Shopify
storefront running a bespoke theme (`[Main] AquaVape`, schema `Moonbase`).

## Current state

`reference/` holds a captured baseline of the live site: the technical audit,
the extracted design-token system, a full motion inventory, and the homepage
section map. Start there.

**The Liquid source is not in this repo yet** — it is not publicly obtainable
and needs an authenticated pull. Run `scripts/pull-theme.sh` from a machine
with Shopify store access to get it.

## Layout

```
reference/
  README.md              how the baseline was captured, and what is missing
  tech-audit.md          platform, architecture, app stack, 10 findings
  design-tokens.css      the live token system, de-minified and organised
  design-tokens.json     same tokens, grouped and machine-readable
  motion-inventory.md    every animation, easing curve and motion library
  section-inventory.md   homepage section and component map
scripts/
  pull-theme.sh          authenticated Shopify theme pull (run locally)
```

## Key facts

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
| Design tokens | 90 custom properties, CodyHouse-style scales |
