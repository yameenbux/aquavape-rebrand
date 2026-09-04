# Phase 01 spike — is the catalogue importable?

**Question asked:** before quoting £11,000 fixed-price to import Aquavape's
catalogue into a new commerce engine, does the data actually fit a normal
commerce schema, and what breaks?

**Answer: yes. All 2,088 products and 6,072 variants are now sitting in a real
Medusa database, imported in 29.9 seconds, zero failures.** It is not a
paper exercise — the import was run, it broke three times, and each break is
written up below.

Structurally the data is in better shape than expected; the mess is semantic,
not structural, which is the cheaper kind. **The 22-day estimate holds.** What
the spike changes is *what those days are spent on*.

This document runs in two halves: **the audit** (what static analysis found
before anything was imported) and **the import** (what actually happened when
it was). The gap between them is the point.

Re-run `python3 spike/audit.py` against a fresh export before phase 01 begins.
These are live numbers and they move.

---

# Part one — the audit

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

# Part two — the import

The audit above says the data *should* import. That is a different claim from
*it imports*, and the difference cost three failed runs to find. Everything in
this half was surfaced by running the thing, not by reading it. **The static
audit passed all three problems below.**

## Environment

| | |
|---|---|
| Engine | Medusa **2.20.1**, 146 tables migrated |
| Database | PostgreSQL **16.13**, local |
| Loader | `medusa exec` running an import script in batches of 25 |
| Source | `spike/medusa-seed.json`, produced by `spike/transform.py` |

The Medusa project itself is throwaway scaffolding outside this repo. What is
committed here is the transform and this write-up — the reproducible parts.

## Result

```
attempted 2088 products in 29.9s
ok 2088   failed 0
```

Verified by querying the database rather than trusting the script's own count:

| In the database afterwards | |
|---|---|
| Products | **2,088** |
| Variants | **6,072** |
| Distinct SKUs | **5,934** |
| GBP prices | **17,680** |

6,072 variants against 5,934 distinct SKUs is the 138 blank SKUs from the
audit, behaving exactly as designed — imported with `manage_inventory: false`
rather than blocked or invented.

## What broke, and what each break means

### Run 1 — 1,463 of 2,088. `ProductOptionValue.value is required`

625 products failed. Shopify puts a placeholder option axis called `Title` on
single-variant products; the transform correctly dropped it and substituted a
`Default` axis at product level, but left the *variants* with an empty options
dict. Medusa refuses a variant that does not supply a value for every axis its
product declares.

Precisely the products the audit had flagged as carrying `Title` — the audit
saw the field, and still did not predict the failure, because the failure was
in my handling of it rather than in the data.

**Fixed** in `transform.py`: variants on a substituted axis now carry
`{'Default': 'Default'}`.

### Run 2 — 584 of 2,088. `Inventory item with sku: X, already exists`

Not a data problem. **Medusa's product delete does not cascade to inventory
items.** Wiping the products between runs left 5,686 orphaned inventory items
holding the SKUs hostage, so the next import collided with its own predecessor.

Cleared with `TRUNCATE inventory_level, inventory_item CASCADE`.

**This is a phase 01 requirement, not a spike footnote.** A cutover is never
one clean run — it is a rehearsal, then a dry run, then the real thing on the
morning, each against a database that already has the last attempt in it. The
importer has to be **idempotent**: either a real teardown that clears inventory
items too, or upsert-by-SKU. Writing a create-only importer and discovering
this at 6am on cutover day is how migrations lose a weekend.

### Run 3 — 2,057 of 2,088. `Product option value 16mg already exists`

31 products failed, and this one changed a decision rather than fixing a bug.

The audit treated `(Discontinued)` inside an option string as noise to strip.
On 31 products it is not noise: they carry **both `16mg` and
`16mg (Discontinued)` as separate option values, with separate variants and
separate SKUs**. Stripping the marker merges two live, independently-stocked
things into one. Medusa rejected the duplicate, which is the only reason this
was caught — a more permissive platform would have silently merged them and
the loss would have shown up as a stock discrepancy weeks later.

**Fixed** with a collision-aware strip in `transform.py`: where removing the
marker would collapse two distinct values, the original text is kept and the
product is reported. It is now a fourth owner decision, not a cleanup:

> 31 products where "discontinued" is doing real work in the data model. Does
> he want two separate 16mg lines, or one?

### Run 4 — 2,088 of 2,088, 0 failures.

## The pattern worth paying for

| Problem | Would a static audit find it? | What surfaced it |
|---|---|---|
| Placeholder-axis bug | No | Medusa's validation |
| Non-cascading deletes make re-runs unsafe | No | A retry colliding on 5,686 orphaned SKUs |
| Discontinued markers are load-bearing | No | A duplicate option-value rejection |

Three for three. This is the argument for doing the import spike *before*
quoting phase 01 rather than during it: none of these were visible in the data,
they were only visible in the collision between the data and the engine.

One process note against myself: run 1's error report named the wrong product.
It logged the first handles in the failing batch of 25, which sent me to
diagnose a product that was fine. Failed batches are now retried one at a time
so the report points at the actual culprit. Batch imports that report at batch
granularity waste more time than they save.

## What this does NOT prove

Worth being blunt, because a green run invites over-reading:

- **Products only.** Customers, order history, and Recharge subscriptions are
  untouched. Subscriptions are the genuinely hard one — card tokens are held
  by the gateway, and moving them is a payments problem, not a data problem.
- **No inventory quantities.** `products.json` gives availability as a boolean.
  Real counts need admin access.
- **No metafields**, so no theme-dependent custom fields.
- **Local Postgres, not his infrastructure.** It proves the shape of the data
  fits the engine. It does not prove anything about his hosting, his traffic,
  or his cutover window.

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
| `spike/transform.py` | Shopify export → Medusa product payloads. Every change it makes is logged to a report; the four owner decisions are flagged, never guessed. |
| `spike/shopify-export.json` | The migration-shaped export. **Deliberately not committed** — it aggregates every SKU and per-variant price into one competitor-ready file, and this repo is public. All of it is reachable through their own `products.json`, but publishing the aggregate is a different act. Keep it in private storage. |
| `spike/medusa-seed.json`<br>`spike/medusa-seed-report.json` | Transform output and its change log. Not committed, for the same reason. Regenerate with `python3 spike/transform.py`. |

## The four questions for the owner

Collected here because they are the phase 00 pack, and none of them is a
developer's call to make:

1. Which of the **five nic-shot phrasings** is canonical (49 products).
2. What happens to the **67 variants marked discontinued but still sellable**.
3. Which of the **52 incomplete option grids** are intentional.
4. On the **31 marker-collision products**, are `16mg` and `16mg (Discontinued)`
   two lines or one.
