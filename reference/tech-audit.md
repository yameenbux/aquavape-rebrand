# Aquavape — technical audit

Captured from the live storefront, 2026-09-03.

## Platform

**Shopify**, behind Cloudflare.
Confirmed via `powered-by: Shopify`, `shopify-checkout-api-token`,
`content-language: en-GB`, `x-dc: gcp-us-east1`.

Store handle: **`disposablevapesuk.myshopify.com`**

The Aquavape rebrand happened at the marketing layer but not the platform
layer. The `.myshopify.com` handle is permanent on Shopify — it will keep
surfacing in app configs, webhook payloads and affiliate feeds indefinitely.
Not fixable; just needs to be known.

## Theme

```json
{"name":"[Main] AquaVape","id":133665358009,
 "schema_name":"Moonbase","schema_version":"1.0.0",
 "theme_store_id":null,"role":"main"}
```

`theme_store_id: null` — bespoke build, not a theme-store theme.

## Architecture

- **Liquid + Shopify Sections** — 22 sections on the homepage
- **Webpack-bundled vanilla JS, no framework.** `theme.js` ~150 KB, plus
  per-section bundles: `collection-slider.js` (35 KB), `usp-bar.js` (31 KB),
  `banner-grid.js`, `header.js`, `util.js`
- **Native Web Components** for interactive parts — no React/Vue, no jQuery
- **51 scripts, 81 stylesheets** on a single page load

### The CSS is a real design system

90 custom properties: a modular spacing scale on `--space-unit`, a 1.25-ratio
type scale, a max-width ladder, icon sizes, five-step elevation, five easing
curves, z-index scale.

The naming (`--space-unit`, `--text-scale-ratio`, the `xxxxs…xxxxl` ladder,
`--inner-glow`) matches **CodyHouse framework** conventions closely enough
that the theme was very likely built on it.

**This is the most important finding for the rebrand.** A large share of the
visual identity is swappable at the token layer. See `design-tokens.css`.

## App stack

| Function | Vendor |
|---|---|
| Search | Algolia (`3rgsgmjk41-dsn.algolia.net`) |
| Reviews | **Okendo + Lipscore + Trustpilot** |
| Loyalty | LoyaltyLion (~22 preloaded ES module chunks) |
| Subscriptions | Recharge + storefront-experiences |
| Email/SMS | Klaviyo (forms, tracking, Atlas, telemetry) |
| Web push | PushOwl |
| Live chat | LiveChat |
| Consent | TinyCookie + Shopify consent-tracking-api |
| Affiliates | Adtraction + Affiliate Future |
| Analytics | GTM, GA4 `G-9MC2539L6Z`, Universal Analytics `UA-86244313-1` |
| Checkout | Shop Pay / portable wallets, `webmcp-0.1.1.js` |
| Age verification | Present (UK vape compliance) |

## Findings

**1. Two near-identical navies.**
Header is `#040E27`; the primary button is `#040D25`. A 2/2 difference nobody
can see but every designer will trip over. Pick one, tokenise it.

**2. Both brand typefaces are commercially licensed.**
`@font-face` declares **Nexa** and **Hurme Geometric Sans 1**. Web font
licences are typically seat- or pageview-capped. Check the licence terms
before the rebrand changes traffic or ownership.

**3. The theme is square; the app widgets are round.**
Theme sets `--btn-radius: 0` and `--form-control-radius: 0`. Klaviyo's Atlas
widgets ship `--atlas-card-border-radius-normal: 32px`,
`--atlas-button-border-radius-normal: 20px`. Two visual languages on one page.

**4. Two conflicting z-index scales ship together.**
`--z-index-header: 16` and `--zindex-header: 3` (no hyphen) both exist. A
latent stacking bug waiting to surface.

**5. H1 is smaller than H2.**
H1 renders at 25px/500 weight; H2 at 31.25px/700. The type scale exists and
is well-formed, but the headings do not use it. Real hierarchy problem and a
straightforward fix.

**6. Three review platforms running simultaneously.**
Okendo, Lipscore and Trustpilot all load on the homepage. Triple subscription
cost, triple script weight, and social proof split three ways so none reads as
authoritative. Consolidating is a commercial decision, not a technical one,
but it is the highest-value call available.

**7. Universal Analytics is still firing.**
GA stopped processing UA hits in 2023. `UA-86244313-1` is dead weight and
suggests the tag stack has not been audited in years.

**8. The apps are the performance problem, not the theme.**
51 scripts, 81 stylesheets, ~345 requests. The theme itself is lean and
well-structured. Rewriting Liquid will not move the number; removing apps will.

**9. No `prefers-reduced-motion` in the theme's CSS.**
Five infinite animations run unguarded. See `motion-inventory.md`.

**10. Server render 1.8–2.6s.**
`processing;dur=1783` then `2562` across two loads, Shopify complexity score
1776–2550. Heavily-appended theme. Profile per-section cost before deciding
which sections survive.
