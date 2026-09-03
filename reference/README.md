# Aquavape — captured baseline

Reference material captured from the live storefront at `https://aquavape.co.uk`
on 2026-09-03, to serve as the factual baseline for the rebrand.

## What is here

| File | Contents |
|---|---|
| `tech-audit.md` | Platform, architecture, app stack, and findings |
| `design-tokens.css` | The live token system, de-minified and organised |
| `design-tokens.json` | Same tokens, machine-readable |
| `motion-inventory.md` | Every animation, easing curve and motion library in use |
| `section-inventory.md` | Homepage section/component map |

## What is NOT here, and why

**The Liquid source is not in this repo, because it is not publicly obtainable.**

What a browser can see is the *compiled output* of the theme:
minified `theme.css` (262 KB), minified `theme.js` (150 KB), and rendered HTML.
The actual `.liquid` templates, sections, snippets, and `config/settings_schema.json`
live in the Shopify admin and only come out through an authenticated pull.

Everything in this folder was derived from that compiled output and from the
rendered DOM. It is accurate, but it is a *reconstruction*, not the source.

To get the real source, see `../tools/pull-theme.sh`.

## How it was captured

The theme was inspected in a headless Chromium session: response headers,
computed styles, parsed stylesheets, and the theme's own JS bundles. No
credentials were used and nothing was modified — read-only inspection of a
public storefront.
