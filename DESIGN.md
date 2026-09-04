# Aquavape — rebrand prototype

A working front-end prototype of the rebranded Aquavape storefront. Live at
**https://yameenbux.github.io/aquavape-rebrand/**, or serve it locally:

```bash
python3 -m http.server 8899
# then open http://127.0.0.1:8899
```

No build step, no dependencies, no network calls. Fonts are self-hosted.

![Prototype preview](preview.png)

## Why it is built this way

The live theme is Liquid + **native Web Components** + Glide.js, with no
framework. This prototype matches that architecture deliberately — plain
HTML, token-driven CSS, and vanilla ES modules — so every component here
ports to a Liquid section without a rewrite. Adding React would have made
the port harder, not easier.

## A finding that changed the design

While pulling product photography from `products.json` I counted the actual
catalogue. It does not match the story the live homepage tells:

| | |
|---|---|
| Products | 1,993 |
| Brands | 86 |
| E-liquid lines | 776 |
| Deepest ranges | IVG 192, Hayati 171, Lost Mary 139, Vapemate 126 |
| In stock | 1,637 of 1,993 |
| Price range | £0.70 – £57.99 |
| Aquavape own-brand | 35 lines: 19 e-liquids, 13 pods, 2 kits |

The first count stopped at four pages of `products.json` and reported 998
products across 63 brands. Paging to the end gives **1,993 across 86**. The
figures above, and everywhere on the site, are the full count.

### A correction, recorded rather than quietly fixed

An earlier version of this document stated that Aquavape's four own-brand
best sellers — Fresh Menthol, Wild Berry, Raspberry Menthol, British Tobacco
— were **not in the catalogue**, and that no own-brand e-liquid existed at
all. That was wrong, and it was wrong for the same reason the product count
was: it was read off four pages of `products.json` instead of eight.

All four are there. So is a good deal more:

| Own-brand | Lines | Price |
|---|---|---|
| `Aquavape` 10ml e-liquid and nic salt | 8 | £2.49 – £2.99 |
| `Aqua Salts` 10ml nic salt (house value line) | 10 | **£0.70** |
| `Aquavape 2in1` pods — own pod system | 13 | £1.99 |
| `Aquavape 2in1` / Innokin Endura kits | 2 | £2.79, £10.99 |
| Accessories | 1 | £6.99 |
| `ICON Vape` co-branded pod packs | 2 | — |

**This is the most commercially interesting thing in the catalogue, and the
first pass argued it away.** Aquavape is not only a stockist: it runs its own
pod hardware with thirteen flavours locked to it, and a house e-liquid line
priced at 70p — a quarter of the cheapest third-party 10ml. That is margin
and repeat purchase, which is exactly the ground a migration pitch should be
fought on.

The homepage's range section stays as it is — breadth, availability and speed
are all still true, and the per-brand gauges are real counts. But "multi-brand
stockist, not a manufacturer" was an overreach from bad data. What
`products.json` actually supports is: Aquavape sells 86 brands **and its
own**. Whether the own-brand liquid is mixed in Lancashire is not something a
products endpoint can answer either way — that one still needs checking on
your side before any provenance claim goes near the page.

## The design direction

### What was wrong with the first version

It was a template painted eight colours. The audit made it plain: ten
sections, every one with 84px padding and a 46px heading and the same
eyebrow-then-grid recipe. Scrolling it was the same slide over and over with
the background swapped. Nothing ever broke its box — no overlap, no bleed,
no scale jump. Every colour band sat between two neutral bands, so the
palette was *applied* rather than composed. And the one asset the catalogue
actually owns — flavour — was used as a 16% tint.

Correct, accessible, systematic. Not designed.

### The subject, named

Not a pharmacy: a **pick'n'mix counter for adults**. 1,993 products, 86
brands, and every one is a flavour with a colour — Blue Raspberry, Rhubarb
& Custard, Pistachio Gelato, Bubblegum. Shoppers arrive knowing a flavour,
a strength and a budget. The page's job is to get them to the right bottle
fast and make the deal feel worth taking now.

### The signature: the flavour wall

The catalogue *is* a colour field, so the product grid stops being
cards-on-a-background and becomes the field itself. Full-bleed to the
viewport edge, 3px gaps, and **each tile entirely its own flavour colour**
with the bottle sitting on it and the type knocked out. A wall of sweets.

Text colour is derived, not chosen: `onFlavour()` in `main.js` computes each
flavour's luminance and picks ink or paper. All 24 catalogue colours were
checked before this shipped, and the rendered tiles were re-measured across
all three tabs — worst pair 5.2:1, every one clears AA. Guessing this by eye
across 24 saturated colours is how you ship an unreadable tile.

The gaps show the band colour rather than a fixed line colour, so the
section becomes the mortar between tiles — and an incomplete last row reads
as the band instead of as a hole.

### Boldness in one place

The wall is loud, so everything around it got **quieter**, not louder:

| | |
|---|---|
| Feature sections (wall, clearance, range, signup) | 112px headings, 84–144px padding |
| Everything else | 32px headings, 52px padding |

That alternation — loud, quiet, loud, quiet — is the rhythm that was
missing. The headings use Archivo's **width axis at 125%**, which is the
reason that typeface was self-hosted and the thing the first pass never
exploited.

### One accessory removed

The category tiles are gone. Four equal rounded tiles was the most templated
thing on the page, and the flavour wall browses better than they did.

## What is carried over from the live site

The promotional machinery is the business, so it stays: the sale hero with
its carousel slots, the 4-for-£10 multibuy flags, the clearance strip, the
20% off standing CTA, the USP promise bar, the trust-icon row, the tabbed
best sellers, the brand logo row and the blog feed.

## What changed, and why

| Change | Reason |
|---|---|
| Hero pairs the offer with a real product | The live hero is a "MEGA SALE" graphic — it sells the discount but says nothing about what Aquavape makes |
| Standing CTA is a tab, not an interstitial | Same acquisition lever, without blocking the page |
| "Shop by strength" promoted to primary navigation | Strength is how this category is actually shopped; the live site buries it in facets |
| H1 now larger than H2 | On the live site H1 renders at 25px and H2 at 31px |
| One review source | The live site runs Okendo, Lipscore and Trustpilot simultaneously |
| One z-index scale | The live theme ships `--z-index-header: 16` and `--zindex-header: 3` |
| One radius value | Theme is square (`--btn-radius: 0`), app widgets are 20–32px round |
| UK provenance given a section | Currently one line of meta description; it is the actual differentiator |
| Age gate designed in | Legally required for UK vape retail, so it should not look bolted on |
| `prefers-reduced-motion` honoured | `theme.css` has no reduced-motion block at all |

## Imagery

All product photography is **real, pulled from `aquavape.co.uk`** on
2026-09-03: 24 shots, re-encoded to WebP with transparency preserved and
cropped to each product's bounding box so every shot fills its frame to the
same margin. 460 KB for the set.

Nothing is stock photography and nothing is drawn. The earlier version used
hand-drawn SVG bottles, which read as placeholder next to the real thing.

Transparency matters here: the cards tint their swatch with the product's
flavour colour and flood it on hover, so a flattened white background would
show as a white box on colour.

The only drawn artwork left is UI iconography — stars, arrows, the USP and
trust icons, and the logo droplet.

## Motion

### The hero carousel

Five slides on a **5-second timer**. Each slide carries its own band colour,
so the palette rotating is the hero rather than a decoration on it: pink
sale, mint multibuy, peach new-in, lilac pouches, yellow clearance. Every
band was contrast-checked on the rendered page before use (lowest 6.08:1).

It runs on its own with **no pause button** — that was a client decision,
and it matches the live site. The trade-off is stated plainly in
`LAUNCH-CHECKLIST.md`: WCAG 2.2.2 asks for a mechanism to pause content that
moves automatically for over five seconds, and a visible control is the
textbook answer. What remains in its place:

- autoplay halts on hover and on keyboard focus anywhere in the hero
- it halts while the browser tab is hidden
- under `prefers-reduced-motion` it **never advances at all**, which covers
  the users the criterion exists to protect

The active dot fills across the interval, so the timer is something the
viewer can see coming rather than something the page does at them. Dots are
`role="tab"` with arrow-key, Home and End navigation, and each button is
40×24px to satisfy WCAG 2.2 Target Size — the visible bar is only 5px tall,
drawn with pseudo-elements inside the larger hit area.

The next slide's image is preloaded on each transition so the swap does not
flash.

### Brand logos

The featured-brands row uses the **real vector logos**, lifted from the live
site's own featured-brands section — ULTD, Aquavape, Elfliq, Lost Mary,
Vapemate and IVG. 20 KB for all six. They were previously set as uppercase
text, which on a phone wrapped "LOST MARY" onto two lines and read as a
placeholder.

Each is a **separate `.svg` file referenced by `<img>`**, not inlined. That
is deliberate: the source markup reuses `id="c"` and `cls-*` class names in
every single logo, so inlining all six would collide and the last one would
repaint the others. Extraction resolved each shape's computed paint to a
literal `fill` and stripped the `<style>`/`<defs>` machinery.

The logos have wildly different proportions — Lost Mary is 8.4:1, ULTD is
nearly square — so a single height makes some enormous and others weedy.
Each sits in a fixed-height box with `object-fit: contain` plus a per-logo
`--logo-scale` multiplier, tuned so all six carry the same optical weight.

They rest at 42% opacity so the row reads as one set rather than six
competing marks, and go to full strength on hover. Logos only — no stock
counts, so the row is a statement of range rather than a table. On any
device without hover, checked with `@media (hover: none)` rather than
guessed from viewport width, they sit at 72% so they read without needing a
hover that will never come.

### Trust icons

The four trust icons **run continuously**. There are two layers, and keeping
them separate is what makes it work:

1. the outlines **draw once**, the first time the icon appears
2. the moving parts then **loop forever**

Re-drawing the outlines every cycle reads as a glitch; looping only the
motion reads as the object doing its job. The card taps like a contactless
payment, the van keeps driving with speed lines sweeping past, the headset's
mic boom swings as if on a call, the parcel bobs. Each icon is offset by
`--idle-delay` so the row does not pulse in unison.

They started out hover-only, which meant they never played on a phone at
all. Continuous is now the behaviour; hover adds nothing.

Two of the icons were also redrawn because they did not read at all: "UK
stock & support" was an arc over a vertical line, which looked like an
umbrella, and the dispatch icon was a peaked box that read as a house with a
crack in it.

Implementation notes: every stroke carries `pathLength="1"` so the draw-on
effects can use a `stroke-dasharray` of 1 regardless of the real path
length, and `transform-box: fill-box` makes transform-origin behave on SVG
children. The replay is a JS class toggle rather than pure CSS, because a
CSS animation does not restart on an element whose classes have not changed.

The hero also runs a **vapour animation** — five blurred radial blobs on
staggered 7-second rises behind the product. It is the only continuously
running animation on the page, and it is switched off entirely under reduced
motion.

The **20% off tab sits on the left edge at every width**, which is where the
live site keeps it. It replaced a fixed bottom banner that was eating 68px
of a phone screen to do the same job.

Otherwise, carried over from the live theme because they are genuine brand
behaviours:
the sliding `::before` button fill, `IntersectionObserver` scroll reveals
(the technique already in `banner-grid.js`), and the two overshoot easing
curves — `--ease-out-back` and `--bounce`. The brand's motion language is
meant to have spring in it.

Everything animated is guarded. Under `prefers-reduced-motion: reduce` the
ticker stops, reveals resolve to their final state, the bottle appears
already filled, and the counter shows its final value. Content still
arrives; it just stops moving.

## The catalogue page

`shop.html` is the whole shop, not a sample: all 1,993 products, filtered
and sorted in the browser.

**Why it exists.** A homepage is a picture of a store. Nobody migrating a
storefront cares whether a picture is pretty — they care whether the thing
holds 2,000 SKUs, 86 brands and a basket without falling over. So the
catalogue is where the argument is made.

**How it works.** The whole catalogue ships as one 480 KB JSON file — 86 KB
over the wire, gzipped — and every filter, sort and search after that is a
pass over an in-memory array. No round trip, no spinner, no pagination
request. Compact keys (`h` handle, `t` title, `v` vendor, `p` price…) are
what keep 1,993 records under 100 KB.

**Filters are the product.** Strength, type, price band, brand, in-stock,
free text. Every one lives in the query string, so `shop.html?type=Pods&mg=20`
is a real, linkable collection page — that is what the header nav points at,
rather than anchors. Active filters are restated above the grid as chips you
can remove one at a time.

**Two decisions worth defending:**

- *"Featured" is a deterministic shuffle, not alphabetical.* Sorted by name,
  the first screen is five consecutive IQOS refills — a catalogue of 1,993
  products looking like a catalogue of one. The shuffle is seeded from the
  handle, so it is stable across reloads and "load more" never repeats a
  tile, but the first screen shows the range. "Featured" on a real shop is a
  merchandising order anyway; there is no popularity signal in
  `products.json` to sort by honestly.
- *The strength rail hides the long tail.* 23 distinct strengths exist —
  9.5 mg, 10.9 mg and 11.2 mg pouches are real, not parse errors. Twenty-three
  buttons is not a filter, it is a wall. The rail shows the eleven strengths
  with meaningful stock; the rest are still reachable by typing "13.5mg" into
  the search, which matches on strength.

**Images come from Shopify's CDN, sized per device.** The catalogue stores
image paths, not files, and each tile requests the width it actually renders
at through the CDN's `width` parameter — 160w on a 1× desktop up to 420w on a
3× phone. That is ~1 MB per screen of 48 tiles instead of ~4 MB.

**Colour comes from the data.** Every product's tile colour is derived from
its flavour by a lexicon — "blue raspberry" before "raspberry", "menthol"
and "ice" to the same teal — giving 35 colours across the catalogue. Text
colour on each tile is picked from that colour's luminance so every tile
clears AA, the same rule the homepage wall uses.

**The basket is shared.** `scripts/cart.js` owns both the state
(`localStorage`) and the drawer markup, so a basket started on the shop is
still there on the homepage and vice versa. Two renderers would only ever be
two chances to drift.

## The puff

The hero had "vapour" already: five blurred white circles rising continuously
from the middle of the image. It was steam off a coffee cup. Three things make
it read as a vape instead, and they are all structural rather than cosmetic:

**It is episodic.** A burst of six lobes inside 0.7s, then roughly four
seconds of nothing, on a 6.6s cycle. Continuous vapour is a chimney; a person
takes a draw and stops. A glow at the mouthpiece brightens as each draw is
released.

**It comes from the mouthpiece.** `--px`/`--py` are set per hero slide from
the actual product photo — 33%/3% for the DoJo, whose device sits left of its
spare pod, 50%/4% for the OXVA. The layer is sized to the image box rather
than to `.heroshot`, so a percentage origin lands where the mouthpiece is.

**Only devices puff.** Two of the five hero slides are bottles and one is a
tin of nicotine pouches whose own lede reads *"No vapour, no smoke, nothing to
charge"*. Animating vapour off those would contradict the page.

The silhouette needed a different technique. Blurred CSS circles will not do
it: however irregular you make the `border-radius`, several soft-edged shapes
emitted from one point average back into a circle, and the first three
attempts all produced a glowing orb rather than a cloud. The fix is an SVG
`feTurbulence` + `feDisplacementMap` filter that pushes the edges around with
fractal noise — three seeds so neighbouring lobes are not identical. The noise
is static and only `transform` and `opacity` animate, which keeps it on the
compositor: **56fps at 6× CPU throttle on a phone viewport**. Under
`prefers-reduced-motion` it is `display: none` with zero running animations.

On a stacked mobile hero the product sits tight to the top of the band, so a
full-height plume was sliced off by the band edge and read as a bug. The shot
drops to make headroom and the rise is shortened to match.

## Product pages

One document, `product.html`, serves all 1,993 products from `?h=<handle>`
against the catalogue already in memory — a product page costs no extra
request once you have browsed the grid.

The flavour colour that mortars the wall becomes the whole left panel. A tile
is 210px; here the product sits on its own colour at full size, which is the
one thing the grid can never do.

**The multibuy block is the loudest element on the page, deliberately.** It is
the most commercially interesting thing in the catalogue — 24 offers across
70% of the stock — and it was invisible until we parsed the tag namespaces.
Rendering it is also the clearest way to show a client what a replatform has
to reproduce.

The option control names itself from its values: `20mg` reads as *Strength*,
`0.6 ohm` as *Coil resistance*, a long list as *Flavour*. Guessing wrong
labels is how a control stops reading as considered.

**What is honest and what is not.** Prices, stock, images, brands, types,
strengths, offers and option names are live data. Per-variant price and stock
are not in the public endpoint, so choosing an option records the choice on
the basket line but does not change the price. That limit is written into the
top of `scripts/product.js` rather than left for someone to discover.

## Verified

- No horizontal overflow at 390px
- Contrast measured on the rendered page across 26 text elements on all
  seven bands — all pass WCAG AA (lowest 4.74:1)
- Visible focus ring on all interactive elements
- Focus returns to the trigger when a panel closes; `Esc` closes overlays; `/` opens search
- No console errors

## Porting to Liquid

1. `styles/tokens.css` → `assets/theme-tokens.css`, or map into `settings_schema.json`
2. Each `<section>` → a Shopify section with a schema block
3. `scripts/main.js` init functions → `customElements.define()` calls, matching the existing `<usp-bar>` / `<product-item>` pattern
4. `scripts/data.js` → Liquid product loops
5. Swap Archivo/Instrument Sans back to Nexa

See `tools/pull-theme.sh` for getting the real theme source.
