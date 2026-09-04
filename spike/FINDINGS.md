# Phase 01 spike — is the catalogue importable?

**Question asked:** before quoting £11,000 fixed-price to import Aquavape's
catalogue into a new commerce engine, does the data actually fit a normal
commerce schema, and what breaks?

**Answer:** structurally it is in better shape than expected. The mess is
semantic, not structural — which is the cheaper kind. **The 22-day estimate
holds.** What the spike changes is *what those days are spent on*.

Re-run `python3 spike/audit.py` against a fresh export before phase 01 begins.
These are live numbers and they move.

---

## What was extracted

The earlier export was **display data, not migration data** — it captured
variant *counts* and a flattened list of option values with no names, no SKUs,
no per-variant price. Enough to render a grid; nowhere near enough to import.

This one is migration-shaped: option names, and per-variant title, SKU, price,
compare-at price, stock and weight.

| | |
|---|---|
| Products | **2,088** |
| Variants | **6,072** |
| Source | `products.json`, 9 pages, page 10 empty |

A drift note worth carrying: an extract an hour earlier counted 2,090. The
catalogue moves as things publish and sell out. Any reconciliation has to be
against an export taken the same day, not a stale one.

---

## Clean — and these are the ones that usually hurt

| Check | Result |
|---|---|
| Duplicate SKUs | **0** |
| Unparseable prices | **0** |
| Zero-priced variants | **0** |
| Products with >3 option axes | **0** (2,031 have one axis, 57 have two) |

Duplicate SKUs are the classic thing that stops an import dead, and there are
none in 6,072 rows. That is the single most encouraging number here.

---

## The actual work

### 1. Option names are inconsistent — 25 distinct for about 9 concepts

Live, in production, today:

| Concept | Spellings found |
|---|---|
| Strength | `Strength` (1,690), **`Srength`** (10), **`Stength`** (7) |
| Resistance | `Resistance` (64), `RESISTANCE`, `Resistance:`, **`Reistance`** |
| Colour | `Colour` (103), `Colour*` |
| Flavour | `Flavour` (66), `Flavours` |
| Nic shot upsell | **5 phrasings** across 49 products, differing by case and a question mark |

Imported naively, each spelling becomes its own option type and filtering
breaks — "Strength" would show 1,690 products and silently omit 17.

**Fix:** a normalisation map applied at import. Cheap in code. The part that
is not automatic is the nic-shot upsell, which is an option on 49 products but
is really a product decision, and someone has to say which of the five it
should be.

### 2. "(Discontinued)" is written inside option strings

**654 variants** across **363 products** carry the word inside an option value
— `5mg (Discontinued)`, `0.6 Ohms (Discontinued)`. It is a status stored as
text, not a flag.

**67 of those are still marked available for sale.** So the live shop is
currently offering variants it has labelled discontinued, and a naive import
carries that straight across into a shop whose filters read
`5mg (Discontinued)` as a nicotine strength.

**Fix:** parse the marker out, set a real status field, and put those 67 in
front of the owner. That last part is his decision, not ours.

### 3. Two products sit on Shopify's 100-variant ceiling

`Lost Mary BM6000 Vape Kit` and `IVG Pro 12 Vape Kit` each have exactly 100
variants where their option grid implies 102. They have been silently
truncated by the platform.

More broadly, **52 products have fewer variants than their options imply.**
Some is deliberate (unavailable combinations removed), some is the ceiling.
They need listing and confirming rather than assuming.

Worth noting the other way round: a new platform without a 100-variant cap
removes a constraint they are currently living with.

### 4. 138 blank SKUs

Across just 3 products, and **none of them currently available**. Low
priority, but inventory management needs a SKU, so they get generated or
supplied before go-live.

---

## What this does to the estimate

It does not move the number. It sharpens what the 22 days buy:

- The import mechanics are lower risk than assumed — no duplicate SKUs, no
  deep option nesting, clean prices.
- A **data cleanup workstream** is now visible and named, rather than being
  discovered in week three.
- Three items are **the owner's decisions, not ours**: which nic-shot phrasing
  is canonical, what happens to the 67 sellable-but-discontinued variants, and
  which truncated variant grids are intentional. Those go in the phase 00 pack.

---

## Still unknown

- **Inventory quantities.** `products.json` exposes availability as a boolean,
  not a count. Real stock levels need admin access or the Admin API.
- **Anything unpublished.** Draft products and items held back from the online
  sales channel are invisible from outside. Only his admin knows the true total.
- **Metafields.** Any custom fields the theme relies on are not in this feed.

---

## Files

| | |
|---|---|
| `spike/audit.py` | Re-runnable audit. Takes an export path, prints the counts above as JSON. |
| `spike/shopify-export.json` | The migration-shaped export. **Deliberately not committed** — it aggregates every SKU and per-variant price into one competitor-ready file, and this repo is public. All of it is reachable through their own `products.json`, but publishing the aggregate is a different act. Keep it in private storage. |
