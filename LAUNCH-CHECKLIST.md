# Launch checklist — audit

Audited 2026-09-03 against the prototype at
https://yameenbux.github.io/aquavape-rebrand/

Two columns matter, and they often disagree: what a **design prototype** on a
public URL needs, versus what the **live Shopify store** needs. Several items
are legally required on the live store and actively wrong on a prototype.

| Item | Prototype | Live store | Notes |
|---|---|---|---|
| Privacy policy | linked | **required** | Prototype links to the live store's Shopify policy. Do not draft new legal text for a mockup. |
| Terms page | linked | **required** | Same. Shopify generates these under `/policies/`. |
| Clear CTA | done | done | Hero primary, standing side tab, mobile bottom bar, newsletter block |
| FAQ | added | already exists | Six questions, native `<details>` — keyboard operable, no JS |
| Custom 404 | added | check | `404.html`, absolute asset paths so it works at any depth |
| Alt text | done | check | 23 images: 15 described, 8 intentionally `alt=""` (decorative) |
| Analytics | **deliberately none** | already live | See below |
| Meta title | done | done | |
| Meta description | done | done | |
| Social share | added | check | OG + Twitter card, 1200×630 image, image alt |
| Favicon | added | done | SVG + 180px PNG for iOS |
| Canonical | added | done | |
| Mobile version | done | done | No horizontal overflow at 390px; CTA becomes a bottom bar |
| Accessibility | done | check | See below |
| Test forms | done | n/a | Native validation, no navigation, toast confirms, field clears |
| Broken links | 7 remain | check | All are unbuilt destinations in a single-page prototype |
| Performance | done | **the real work** | See below |

## Where prototype and live store genuinely differ

**Analytics — deliberately absent here.** Adding GA to a prototype would
pollute the real property with mockup traffic, and any real analytics needs a
consent banner to be lawful in the UK, which is a lot of machinery for a
design mockup. The live store already runs GTM and GA4 (`G-9MC2539L6Z`) —
plus a dead Universal Analytics property (`UA-86244313-1`) that has not
processed a hit since 2023 and should be removed.

**noindex, not a sitemap.** The instinct on a checklist is to add
`sitemap.xml` and let search engines in. That is wrong here: this is a mockup
of a real trading brand on a public URL. Indexed, it could confuse customers
or compete with aquavape.co.uk in search. So the prototype ships
`robots.txt` with `Disallow: /` and a `noindex, nofollow` meta tag. The live
store wants the opposite.

**The age gate is not a real age gate.** It is `sessionStorage`, trivially
bypassed. Fine for a mockup, not a compliance control. The live store needs
real verification.

## Accessibility

Measured on the rendered page, not assumed:

- Contrast checked on 26 text elements across all seven colour bands — all
  pass WCAG AA, lowest 4.74:1. Fixing this is why clearance red is `#C81E17`
  and the deal green is `#5F7C2C` rather than the live site's values.
- One `<h1>`, no heading-level skips
- All four landmarks present (`header`, `nav`, `main`, `footer`)
- Every input labelled; no control without an accessible name
- Visible focus ring throughout; focus returns to the trigger when a panel closes
- `Esc` closes overlays, `/` opens search
- `prefers-reduced-motion` honoured: vapour off, reveals resolved, counters at
  final value

Not covered: no screen-reader pass with an actual screen reader, and no
keyboard walk of the full page. Both worth doing before this becomes a real
theme.

## Performance

| Metric | Value | Good threshold |
|---|---|---|
| LCP | 160–220 ms | < 2500 ms |
| CLS | 0.0002 | < 0.1 |
| Requests (initial) | 18 | — |
| Transfer (initial) | 307 KB | — |

CLS is near-zero because every image carries `width`/`height`. Only 6 of 23
images load initially — the rest are lazy.

Fonts were the single largest cost at 148 KB. Subset to Latin-1 plus the
punctuation in use, preserving both of Archivo's variable axes: **264 KB
across 6 files → 132 KB across 3**. Archivo is preloaded because it renders
the hero headline.

**The prototype is not where the performance problem is.** The live store
loads 51 scripts, 81 stylesheets and ~345 requests, almost entirely
third-party apps. That is the optimisation that matters, and no amount of
front-end work here touches it.

## Remaining broken links

Seven `href="#"` links, all destinations that do not exist in a single-page
prototype: the account icon, "View all 205 e-liquids", "All clearance",
"All news", and three of the four blog cards. Wired where a real target
exists — footer Shop links go to sections, Help links to the FAQ, Legal to
the live store's policies, and "Which nicotine strength?" to the strength
selector.
