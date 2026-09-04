#!/usr/bin/env python3
"""Shopify export -> Medusa product-create payloads.

Applies the cleanups the audit found (see spike/FINDINGS.md). Everything it
changes is logged to a report rather than done silently: a migration that
quietly rewrites a client's catalogue is worse than one that refuses to run.

    python3 spike/transform.py spike/shopify-export.json spike/medusa-seed.json

Three things it deliberately does NOT decide, because they are the owner's
call and not a developer's:

  * which of the five nic-shot phrasings is canonical  -> flagged, left alone
  * what happens to variants marked discontinued but still sellable -> flagged
  * which truncated option grids are intentional -> flagged

Those land in the report as questions.
"""
import json, re, sys, collections
from math import prod

# --- option-name normalisation ------------------------------------------
# Typos present in the live catalogue. Mapping them is safe and mechanical;
# the nic-shot phrasings are NOT here, because collapsing them is a product
# decision about an upsell, not a spelling fix.
NAME_MAP = {
    'strength': 'Strength', 'srength': 'Strength', 'stength': 'Strength',
    'resistance': 'Resistance', 'reistance': 'Resistance', 'resistance:': 'Resistance',
    'colour': 'Colour', 'colour*': 'Colour',
    'flavour': 'Flavour', 'flavours': 'Flavour',
    'pack size': 'Pack Size', 'size': 'Size', 'blend': 'Blend',
    'type': 'Type', 'qty': 'Quantity', 'refills': 'Refills',
    'mouthpiece type': 'Mouthpiece Type', 'flavour edition': 'Flavour Edition',
}
NIC_SHOT = re.compile(r'nic\s*shot', re.I)
DISCONTINUED = re.compile(r'\s*\(\s*discontinued\s*\)\s*', re.I)
# "Title" is Shopify's placeholder axis on single-variant products; it is not
# a real option and should not survive into the new catalogue.
PLACEHOLDER_AXIS = {'title'}


def norm_name(raw):
    key = raw.strip().lower()
    if NIC_SHOT.search(key):
        return raw.strip(), 'nic-shot'          # left as-is, flagged
    return NAME_MAP.get(key, raw.strip()), None


def clean_value(raw):
    """Strip the '(Discontinued)' marker out of an option value and return it
    as a separate fact, so status stops living inside a display string."""
    s = str(raw)
    if DISCONTINUED.search(s):
        return DISCONTINUED.sub('', s).strip(), True
    return s.strip(), False


def to_medusa(p, report):
    axes, drop_axis = [], False
    for o in p['op']:
        name, flag = norm_name(o['n'])
        if name.lower() in PLACEHOLDER_AXIS:
            drop_axis = True
            continue
        if flag == 'nic-shot':
            report['nic_shot_products'].add(p['h'])
        if name != o['n'].strip():
            report['renamed'][f"{o['n']} -> {name}"] += 1
        axes.append({'title': name,
                     'values': [clean_value(v)[0] for v in o['v']]})

    variants = []
    for v in p['vs']:
        vals, disc = [], False
        for raw in v['o']:
            cv, d = clean_value(raw)
            disc = disc or d
            vals.append(cv)
        if disc:
            report['discontinued'] += 1
            if v['a']:
                report['discontinued_still_sellable'].append(
                    {'product': p['h'], 'variant': v['t']})
        variants.append({
            'title': clean_value(v['t'])[0] or 'Default',
            'sku': v['k'].strip() or None,
            'manage_inventory': bool(v['k'].strip()),
            'allow_backorder': False,
            'weight': v['g'] or None,
            # Medusa prices are minor units; Shopify gives a decimal string
            'prices': [{'currency_code': 'gbp',
                        'amount': int(round(float(v['p']) * 100))}],
            'options': ({} if drop_axis and not axes
                        else {a['title']: val for a, val in zip(axes, vals)}),
            'metadata': {'shopify_discontinued': True} if disc else {},
        })
        if not v['k'].strip():
            report['blank_sku'] += 1

    expected = prod(max(len(a['values']), 1) for a in axes) if axes else 1
    if axes and expected != len(variants):
        report['incomplete_grid'].append(
            {'product': p['h'], 'expected': expected, 'actual': len(variants)})

    return {
        'title': p['t'],
        'handle': p['h'],
        'status': 'published',
        'options': axes or [{'title': 'Default', 'values': ['Default']}],
        'variants': variants,
        'images': [{'url': i} for i in p['im']],
        'metadata': {'vendor': p['v'], 'shopify_type': p['y'], 'tags': p['tg']},
    }


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else 'spike/shopify-export.json'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'spike/medusa-seed.json'
    ps = json.load(open(src))['products']

    report = {'renamed': collections.Counter(), 'nic_shot_products': set(),
              'discontinued': 0, 'discontinued_still_sellable': [],
              'blank_sku': 0, 'incomplete_grid': []}

    out = [to_medusa(p, report) for p in ps]
    json.dump({'products': out}, open(dst, 'w'), separators=(',', ':'), ensure_ascii=False)

    print(f"products      {len(out)}")
    print(f"variants      {sum(len(p['variants']) for p in out)}")
    print(f"option axes   {len({a['title'] for p in out for a in p['options']})} distinct after normalisation")
    print("\nrenamed option axes:")
    for k, c in report['renamed'].most_common():
        print(f"   {k:34} x{c}")
    print(f"\ndiscontinued markers moved out of option strings : {report['discontinued']}")
    print(f"blank SKUs left unmanaged (manage_inventory=false): {report['blank_sku']}")
    print("\nDECISIONS FOR THE OWNER — not made here:")
    print(f"   nic-shot upsell phrasing, {len(report['nic_shot_products'])} products affected")
    print(f"   discontinued but still sellable, {len(report['discontinued_still_sellable'])} variants")
    print(f"   option grids that do not fill, {len(report['incomplete_grid'])} products")
    json.dump({k: (sorted(v) if isinstance(v, set) else v)
               for k, v in report.items()},
              open(dst.replace('.json', '-report.json'), 'w'), indent=1, default=str)


if __name__ == '__main__':
    main()
