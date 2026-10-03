"""List product names that need fixing: duplicates, spelling mistakes, billing codes, unclear names.

Usage:  python tools/review_names.py   (uses the same stock CSV as build_catalogue.py)
Writes tools/name_review.csv - open it in Excel, fill in the last column, and send it back.
"""
import csv, re, sys, os, difflib, collections
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(SITE, 'tools'))
import build_catalogue as bc

# ---- rebuild the catalogue in memory, remembering raw billing names per clean name ----
path = bc.find_csv()
items = {}
for d in bc.read_rows(path):
    code = d['Item Code'].strip()
    price = bc.num(d.get('Selling')) or bc.num(d.get('MRP'))
    when = (d.get('Transaction Date') or '').strip()[:10]
    it = items.setdefault(code, {'name': d['Item Name'].strip(), 'stock': 0.0, 'date': '', 'price': 0.0})
    it['stock'] += bc.num(d.get('Current Stock'))
    if when >= it['date'] and price > 0:
        it['date'], it['price'], it['name'] = when, price, d['Item Name'].strip()
from datetime import date, timedelta
newest = max(i['date'] for i in items.values() if i['date'])
keep_after = (date.fromisoformat(newest) - timedelta(days=bc.KEEP_MONTHS * 30)).isoformat()
cat = {}
raw = collections.defaultdict(set)
codes = collections.defaultdict(set)
prices = collections.defaultdict(set)
for code, it in items.items():
    if it['price'] <= 0 or not (it['stock'] > 0 or it['date'] >= keep_after):
        continue
    name = bc.fix_name(bc.clean_name(it['name'], it['price']))[0]
    if len(re.sub(r'[^A-Za-z]', '', name)) < 3 or name.lower() in bc.EXCLUDE_NAMES:
        continue
    raw[name].add(it['name']); codes[name].add(code); prices[name].add(round(it['price']))
    cat[name] = bc.categorise(name)
names = sorted(raw)

# ---- helpers ----
def phon(w):
    w = w.lower()
    for a, b in [('ph', 'f'), ('zh', 'l'), ('z', 'l'), ('w', 'v'), ('ee', 'i'), ('oo', 'u')]:
        w = w.replace(a, b)
    w = re.sub(r'([kgcjtdpbs])h', r'\1', w)
    w = re.sub(r'y$', 'i', w)
    return re.sub(r'(.)\1+', r'\1', w)
def words(s): return re.findall(r'[a-z]+', s.lower())
UNIT = {'ml': ('l', 0.001), 'l': ('l', 1), 'lit': ('l', 1), 'lits': ('l', 1), 'ltr': ('l', 1), 'li': ('l', 1), 'litre': ('l', 1),
        'kg': ('kg', 1), 'g': ('kg', 0.001), 'gm': ('kg', 0.001), 'inch': ('in', 1), 'cm': ('cm', 1), 'mm': ('cm', 0.1),
        'pc': ('pc', 1), 'pcs': ('pc', 1), 'p': ('pc', 1), 'b': ('b', 1)}
def sizes(s):
    out = re.findall(r'\d+\s*x\s*\d+', s.lower())   # "8x6" net / sheet sizes
    s = re.sub(r'\d+\s*x\s*\d+', ' ', s.lower())
    for n, u in re.findall(r'(\d+(?:\.\d+)?)\s*\.?\s*(ml|lits|lit|ltr|litre|li|l|kg|gm|g|inch|cm|mm|pcs|pc|p|b)?\b', s.lower()):
        if u in UNIT:
            unit, f = UNIT[u]; out.append(f'{float(n) * f:g}{unit}')
        else:
            out.append(f'{float(n):g}')
    return sorted(out)
UNIT_WORDS = set(UNIT)
def key(s):
    ws = [w for w in words(s) if w not in UNIT_WORDS]
    return ' '.join(phon(w) for w in ws) + ' #' + ','.join(sizes(s))

# Correct spellings for words that appear in this shop's names (English + common Tamil item names)
KNOWN = set('''
stainless steel aluminium brass copper iron cast plastic glass wood wooden bamboo silicone ceramic clay mud non stick nonstick
container containers box boxes basket baskets bucket buckets tub tubs mug mugs jug jugs bottle bottles flask flasks casserole casseroles
plate plates bowl bowls tumbler tumblers spoon spoons fork forks knife knives ladle laddle tray trays lid lids cover covers stand stands
holder holders rack racks set sets pan pans pot pots kadai tawa cooker cookers pressure idly idli pot dosa tope sauce fry frying tadka
handi appam paniyaram kuli kulipaniyaram puttu idiyappam murukku press filter coffee tea milk boiler kettle steamer strainer grater
peeler chopper cutter cutting board scrubber brush broom mop wiper duster cloth towel mat mats curtain bedsheet sheet pillow carpet
mirror stool chair table cupboard ladder umbrella lock clock torch lamp lamps light lights emergency vilakku kuthu kamatchi deepam agal
urli kudam anda sombu dabbara tiffin lunch carrier bento water oil spice masala salt sugar storage airtight jar jars dispenser
freshener air room spray liquid detergent soap hand wash dish dishwash washing machine powder cleaner floor toilet tiles phenyle
naphthalene balls ball mosquito net bat tennis cricket toy toys doll car game baby kids soft hot cold big small medium large mini jumbo
round square oval deep flat double single heavy fancy premium deluxe classic regular kitchen pooja puja gift gifts combo pack piece
pieces inch litre litres ml with without and for steel bucket gas stove burner induction mixer mixie grinder jar juicer blender
sandwich maker toaster oven otg iron box fan heater bell plate arathi abishegam kunguma chimil thali tumbler glassware serving
dinner buffet hotpot casserole rice vegetable veg fruit egg cake mould mold baking roti chapathi poori vada puri tawa skillet wok
grill barbecue pizza tongs whisk beater masher scoop opener sieve colander rolling pin belan polpat mortar pestle hook hooks hanger
clip clips peg pegs rope wire hose pipe drum barrel can crate bin dustbin trash garbage dhoop agarbathi camphor sandal
'''.split())

# Real words / plurals / valid Tamil item names that look like typos but aren't
KNOWN |= set('''chairs fruits games pillows scales tiffins towels conditioner cookie cookies handle lighter power saucer saucers
sticker tablet planter kulfi jaladai thalipu thavali tawala deepa karanji housie glassy scrubby sprayer bathi kundam
dosai poojai kungumam paniyara idiyappa'''.split())
rows = []   # (group, issue, name, suggestion)
def add(group, issue, name, suggestion=''):
    rows.append((group, issue, name, suggestion))

# 1) Near-duplicates: same phonetic key, or very similar names
groups = collections.defaultdict(list)
for n in names:
    groups[key(n)].append(n)
seen_pairs = set()
gid = 0
group_of = {}
def union_group(members, why):
    global gid
    existing = {group_of[m] for m in members if m in group_of}
    g = min(existing) if existing else None
    if g is None:
        gid += 1; g = gid
    for m in members:
        group_of[m] = g
    for m in members:
        reasons.setdefault(g, set()).add(why)
reasons = {}
for k, ms in groups.items():
    if len(ms) > 1:
        union_group(ms, 'same item, spelled differently')
# fuzzy pass (bucket by first 3 letters of key for speed)
by_prefix = collections.defaultdict(list)
for n in names:
    k = key(n)
    by_prefix[k[:2]].append(n)
for pref, ms in by_prefix.items():
    for i in range(len(ms)):
        a = ms[i]; ka = key(a)
        for b in ms[i + 1:]:
            kb = key(b)
            if ka == kb: continue
            if sizes(a) != sizes(b):      # different sizes are different products
                continue
            # compare only the words that differ ("Stainless Steel Kadai" vs "Stainless Steel Kudam" → "kadai" vs "kudam")
            wa, wb = ka.split(' #')[0].split(), kb.split(' #')[0].split()
            while wa and wb and wa[0] == wb[0]: wa, wb = wa[1:], wb[1:]
            while wa and wb and wa[-1] == wb[-1]: wa, wb = wa[:-1], wb[:-1]
            ra, rb = ''.join(wa), ''.join(wb)          # joined, so "anna kudai" ≈ "annakudai"
            if not ra or not rb:
                continue
            r = difflib.SequenceMatcher(None, ra, rb).ratio()
            need = 0.86 if max(len(ra), len(rb)) <= 6 else 0.8   # short words: "coker" vs "cuter" is not a typo
            if (r >= need and min(len(ra), len(rb)) >= 4) or ra == rb:
                union_group([a, b], 'very similar names – probably the same item')
# word-level typo check
wc = collections.Counter(w for n in names for w in words(n))
vocab_good = KNOWN | {w for w, c in wc.items() if c >= 4}
typo_of = {}
good = KNOWN | {w for w, c in wc.items() if c >= 6}
for w, c in wc.items():
    if w in KNOWN or len(w) < 5 or c >= 4 or w in UNIT_WORDS:
        continue
    cands = [v for v in good if v != w and abs(len(v) - len(w)) <= 2 and v[0] == w[0]]
    m = difflib.get_close_matches(w, cands, n=1, cutoff=0.8 if len(w) >= 6 else 0.86)
    if m:
        typo_of[w] = m[0]

JUNK = [
    (r'\b(Ra|Ptd|Prt|R|Ind|Rs)\b$', 'ends with a billing code'),
    (r'\b\d+(\.\d+)?\s?(li|lit|ltr|lits)\b|\b\d+\.(lit|l)\b|\.lit\b', 'litre written oddly (3li / 5lit / 1.lit)'),
    (r'([a-z])\1\1', 'letter repeated 3 times'),
    (r'^(Tt|Aa|Ee)', 'doubled first letter'),
    (r'\s[.&/-]\w|\w[&]\w', 'stray symbol / missing space'),
    (r'^[A-Z][a-z]?\.?\s?-?\s?\w', None),   # placeholder (handled below)
]
PREFIX_CODE = re.compile(r'^(Sw|Sq|Bh|B\.h|M-|C-|Co|Ex|Bf|W)[\s.\-]', re.I)
UNCLEAR = {'look', 'cube', 'tools', 'grade', 'horn', 'coin', 'gift', 'blossom', 'track', 'truck', 'crab', 'plant', 'beder', 'dope',
           'jara', 'cimta', 'daksha', 'belon', 'somugha', 'comuga', 'thudupu', 'mukkali', 'penguin', 'apple nanda', 'jaguar small',
           'jaguar jumbo', 'novelty compact', 'premier glow', 'premier amiga', 'premier flamma', 'ace 2b', 'bolt 3b', 'trio 3b',
           'friendly shakthi 2b', 'kumcha', 'luster brown', 'ural r', 'oppo 4000ml', 'oppo 5000ml', 'standard 5 l', 'cute 2l'}

out = []
for n in names:
    issues, fixes = [], n
    g = group_of.get(n)
    if g:
        issues.append(f'Duplicate group {g}: ' + '; '.join(sorted(reasons[g])))
    for w in words(n):
        if w in typo_of:
            issues.append(f'Spelling: "{w}" → "{typo_of[w]}"?')
            fixes = re.sub(rf'\b{w}\b', typo_of[w].capitalize() if fixes[0].isupper() else typo_of[w], fixes, flags=re.I)
    for pat, why in JUNK:
        if why and re.search(pat, n, flags=0 if 'Tt' in pat else re.I):
            issues.append(why)
    if re.search(r'with id', n, re.I):
        issues.append('"Id" should be "Lid"')
        fixes = re.sub(r'(with) id', r' Lid', fixes, flags=re.I)
    if PREFIX_CODE.search(n):
        issues.append('starts with a short code (brand/size?) – unclear to customers')
    if n.lower() in UNCLEAR or (len(words(n)) == 1 and cat[n] == 'other'):
        issues.append('unclear name – customers won’t know what this is')
    if issues:
        out.append({'name': n, 'issues': issues, 'suggest': fixes if fixes != n else '', 'group': g or ''})

# suggested names for duplicate groups: the most "correct" spelling (most known words, then most billing codes)
group_members = collections.defaultdict(list)
for n, g in group_of.items(): group_members[g].append(n)
def score(n):
    ws = words(n)
    return (sum(w in KNOWN for w in ws) - sum(w in typo_of for w in ws), len(codes[n]), -len(n))
best = {g: max(ms, key=score) for g, ms in group_members.items()}

dst = os.path.join(SITE, 'tools', 'name_review.csv')
with open(dst, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['Group (same item)', 'Name on website', 'Suggested name', 'Problem found', 'Category', 'Price range (billing)',
                'Item codes', 'Billing names (examples)', 'YOUR DECISION (keep / rename to … / merge / remove)'])
    out.sort(key=lambda r: (r['group'] == '', r['group'] or 0, r['name'].lower()))
    for r in out:
        g = r['group']
        sug = r['suggest'] or (best[g] if g and best[g] != r['name'] else '')
        ps = sorted(prices[r['name']])
        w.writerow([g, r['name'], sug, ' | '.join(r['issues']), cat[r['name']],
                    f'₹{ps[0]}' if len(ps) == 1 else f'₹{ps[0]} – ₹{ps[-1]}', len(codes[r['name']]),
                    ' / '.join(sorted(raw[r['name']])[:3]), ''])
print('flagged', len(out), 'of', len(names))
print('duplicate groups', len(group_members), 'names in groups', len(group_of))
print('spelling words', len(typo_of))
print(f'Wrote {dst}')
