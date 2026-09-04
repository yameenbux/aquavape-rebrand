#!/usr/bin/env python3
"""Import readiness audit for the Aquavape catalogue.

Reads spike/shopify-export.json (migration-shaped: option names, per-variant
SKU, price, stock) and reports the things that actually break a platform
migration. Run it again against a fresh export before phase 01 starts — the
catalogue moves, and these counts move with it.
"""
import json, collections, re, sys

ps = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'spike/shopify-export.json'))['products']
V = [(p, v) for p in ps for v in p['vs']]
r = {}

r['products'] = len(ps)
r['variants'] = len(V)

skus = [v['k'] for _, v in V]
r['sku_blank'] = sum(1 for s in skus if not s.strip())
r['sku_duplicate_values'] = sum(1 for _, c in collections.Counter(s for s in skus if s.strip()).items() if c > 1)

r['option_axes'] = dict(sorted(collections.Counter(len(p['op']) for p in ps).items()))
r['option_names'] = len({o['n'] for p in ps for o in p['op']})

# option values that smuggle a status or a second dimension into a string
disc = [(p, v) for p, v in V if re.search(r'discontinued', ' '.join(map(str, v['o'])) + v['t'], re.I)]
r['discontinued_in_option_string'] = len(disc)
r['discontinued_but_still_sellable'] = sum(1 for _, v in disc if v['a'])

# variants that do not fill the option grid
r['incomplete_option_grid'] = sum(
    1 for p in ps if p['op'] and
    __import__('math').prod(max(len(o['v']), 1) for o in p['op']) != len(p['vs']))
r['at_100_variant_ceiling'] = sum(1 for p in ps if len(p['vs']) >= 100)

r['price_unparseable'] = sum(1 for _, v in V if not re.fullmatch(r'\d+(\.\d+)?', str(v['p'] or '')))
r['price_zero'] = sum(1 for _, v in V if float(v['p'] or 0) == 0)

print(json.dumps(r, indent=2))
