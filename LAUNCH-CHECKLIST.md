# Launch checklist — audit

Audited 2026-09-03 against the prototype at
https://yameenbux.github.io/aquavape-rebrand/ — re-run after the catalogue
page (`shop.html`, 1,993 products) was added.

Two columns matter, and they often disagree: what a **design prototype** on a
public URL needs, versus what the **live Shopify store** needs. Several items
are legally required on the live store and actively wrong on a prototype.

| Item | Prototype | Live store | Notes |
|---|---|---|---|
| Privacy policy | linked | **required** | Prototype links to the live store's Shopify policy. Do not draft new legal text for a mockup. |
| Terms page | linked | **required** | Same. Shopify generates these under `/policies/`. |
| Clear CTA | done | done | Hero primary (now opening the matching catalogue view), standing side tab at every width, newsletter block |
| FAQ | added | already exists | Six questions, native `<details>` — keyboard operable, no JS |
| Custom 404 | added | check | `404.html`, absolute asset paths so it works at any depth |
| Alt text | done | check | Homepage: 23 images, 15 described, 8 intentionally `alt=""`. Catalogue: every tile image takes its product title, every decorative basket thumbnail is `alt=""` |
| Analytics | **deliberately none** | already live | See below |
| Meta title | done | done | |
| Meta description | done | done | |
| Social share | added | check | OG + Twitter card, 1200×630 image, image alt |
| Favicon | added | done | SVG + 180px PNG for iOS |
| Canonical | added | done | |
| Mobile version | **was broken** | check | See below. No category navigation existed below 1000px until a menu was added. |
| Accessibility | done | check | See below |
| Test forms | done | n/a | Native validation, no navigation, toast confirms, field clears |
| Broken links | 3 remain | check | Was 7. The catalogue gave the nav, hero CTAs, footer shop links and "view all" buttons real destinations |
| Performance | done | **the real work** | See below |
| Catalogue page | added | n/a | 1,993 products, filter/sort/search, shared basket |

### The mobile check that this audit got wrong

This row previously read "done", on the strength of *no horizontal overflow at
390px*. That is not what "mobile version" means. `.header__nav` is hidden
below 1000px and **nothing replaced it** — on any phone or small tablet there
was no route to a category at all, on a catalogue of 1,993 products across 86
brands. The page fitted the screen and was unusable, and the audit measured
the first thing and reported the second.

Fixed with a full-height category menu (`scripts/nav.js`, rendered once and
used by both pages so they cannot drift). What it has to get right, and does:

- The burger stays **visible above the panel** and becomes the ✕. A
  full-screen menu that covers its own close control is a trap on a phone,
  where there is no Escape key — the first version of this did exactly that.
- Closes on the ✕, `Escape`, or any link inside it. A link that scrolls down
  the current page has to close the menu, or it lands you behind the panel.
- `aria-expanded` on the trigger, `aria-hidden` on the panel, focus moves to
  the first item on open and returns to the burger on close.
- `Tab` is kept inside the panel while it is open; behind it the whole page is
  still in the tab order.
- Clears the sticky header in **both** scroll states — its bottom edge is at
  64px scrolled and 95px with the promobar showing, so nav.js measures it
  rather than assuming.

The lesson worth keeping: *fits on the screen* and *works on the screen* are
different tests, and only the second one matters.

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
  pass WCAG AA, lowest 4.74:1. Re-checked on the catalogue's own controls:
  lowest 5.82:1 (muted labels and counts on paper), filter chips 19.14:1 both
  idle and pressed. Contrast is why clearance red is `#C81E17` and the deal
  green is `#5F7C2C` rather than the live site's values.
- One `<h1>` per page, no heading-level skips. The catalogue page shipped
  without one — its title was an `<h2>` — and was fixed rather than excused
- All four landmarks present on both content pages (`header`, `nav`, `main`,
  `footer`); `404.html` is `main` only, by design
- Every input labelled; no control without an accessible name
- Visible focus ring throughout; focus returns to the trigger when a panel closes
- `Esc` closes overlays, `/` opens search
- Every catalogue control clears WCAG 2.5.8 target size: filter chips 62×32,
  brand rows 232×32, sort 176×34 (minimum is 24×24)
- The catalogue's filter drawer sets `aria-expanded` on its trigger, closes on
  the scrim, the ✕ and `Esc`, and restores page scroll each way
- `prefers-reduced-motion` honoured: vapour off, trust-icon loops off,
  carousel does not advance, reveals resolved, counters at final value

### One knowing exception: WCAG 2.2.2 (Pause, Stop, Hide)

The hero carousel auto-advances every five seconds and has **no pause
button**. The criterion asks for a mechanism to pause content that moves
automatically for longer than five seconds, and a visible control is the
textbook way to satisfy it. That control was built, then removed at the
client's request to match the live site.

This is recorded as a deliberate exception rather than quietly dropped. What
mitigates it:

- autoplay halts on hover and on keyboard focus within the hero
- it halts while the browser tab is hidden
- under `prefers-reduced-motion` the carousel never advances, the trust-icon
  loops are off, and the hero vapour is hidden — so users with vestibular
  sensitivity, who are who the criterion protects, get no motion at all
- the dots remain full `role="tab"` controls with arrow-key, Home and End
  navigation, so a keyboard user can take manual control of the sequence

The trust icons also loop indefinitely, which falls under the same criterion.
The same reduced-motion mitigation applies. If this ever needs to pass a
formal audit, reinstating a single pause control for the hero is the fix, and
it is about ten lines.

Not covered: no screen-reader pass with an actual screen reader, and no
keyboard walk of the full page. Both worth doing before this becomes a real
theme.

## Performance

| Metric | Homepage | Catalogue | Good threshold |
|---|---|---|---|
| FCP | 144 ms | 120–208 ms | < 1800 ms |
| LCP | 160–220 ms | — | < 2500 ms |
| CLS | 0.0002 | 0.0002 | < 0.1 |
| Requests (initial) | 18 | 15 | — |
| Transfer (initial) | 307 KB | 307 KB + 86 KB catalogue (gzipped) | — |
| DOM nodes | — | 1,205 | — |

CLS is near-zero because every image carries `width`/`height`.
Only 6 of 23 images load initially on the homepage — the rest are lazy.

**The catalogue's CLS took work.** It first measured **0.158** — a clear
fail. The cause was structural, not cosmetic: the grid and the filter rail
both paint empty and then grow by thousands of pixels when the fetched
catalogue lands. Two fixes, in order of what they bought:

1. 48 ghost tiles as **static markup** in `shop.html`, one per tile of the
   first page. Script-injected placeholders were tried first and only got it
   to 0.109 — a deferred module runs after first paint, so the shift had
   already happened. → 0.0586
2. Row heights reserved in CSS for the strength, type and price groups
   (`--rows` per group), and a fixed height on the brand list. The rail is a
   fixed 244 px, so how many rows each group wraps to is knowable up front.
   → **0.0002**

Rendering 1,993 tiles at once is the other way a catalogue page breaks. The
grid renders 48 at a time and **"load more" appends** rather than rebuilding,
so already-decoded images are not thrown away. 1,145 DOM nodes at rest.

**Product images are the catalogue's real weight**, and they come from
Shopify's CDN, not this repo. A flat `?width=420` pulls ~85 KB per image to
fill a box that measures **137 px** on a desktop grid — 48 of those is ~4 MB
for one screen of results. Each tile now carries a `srcset` across the CDN's
own width parameter (160/200/320/420) with `sizes` matched to the grid.
Verified by reading `currentSrc` on the rendered page: 160w on a 1× desktop,
320w at 2× and on a 2× phone, 420w only at 3×. First page on a 1× desktop:
**~4 MB → ~1 MB**. `format=webp` is *not* used — the CDN ignores the
parameter (tested: identical bytes, `content-type: image/png`) and
content-negotiates from the browser's `Accept` header instead.

Fonts were the single largest cost at 148 KB. Subset to Latin-1 plus the
punctuation in use, preserving both of Archivo's variable axes: **264 KB
across 6 files → 132 KB across 3**. Archivo is preloaded because it renders
the hero headline.

**The prototype is not where the performance problem is.** The live store
loads 51 scripts, 81 stylesheets and ~345 requests, almost entirely
third-party apps. That is the optimisation that matters, and no amount of
front-end work here touches it.

## Remaining broken links

Down from seven to three. The catalogue page gave real destinations to what
were placeholders: the header nav now points at filtered collection views
(`shop.html?type=Pods`), every hero CTA opens the matching slice of the
catalogue, "View all 776 e-liquids" and "All clearance" resolve, and the
footer Shop column links to filtered views instead of homepage anchors.

Three remain, all genuinely unbuilt: the account icon (twice — one per page)
and "All news". Accounts and a blog are out of scope for a storefront
prototype; both would be real pages in a theme.
