"""Build js/catalogue-data.js from the billing software's "Current Stock Detail" CSV export.

Usage:
    python tools/build_catalogue.py                 # newest stock CSV next to the site folder
    python tools/build_catalogue.py path/to/file.csv

Only Python's standard library is used. Edit CATEGORY_RULES below to change how
items are grouped; the script prints a count per category so you can spot gaps.
"""
import csv
import glob
import json
import os
import re
import sys
from datetime import date, timedelta

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, 'js', 'catalogue-data.js')

KEEP_MONTHS = 12      # items received within this many months are kept even if stock shows 0
NEW_DAYS = 45         # "New" badge for items received this many days before the export date

# Items never shown on the website – the cleaned name as it appears on the site (any case)
EXCLUDE_NAMES = {'bed'}

# Ordered: the first matching rule wins. Keywords are matched as whole words
# (or word prefixes when they end in '*') against the cleaned, upper-case name.
CATEGORY_RULES = [
    # checked before toys so "Mosquito Bat", "Washing Ball", "Naphthalene Ball" aren't filed as toys
    ('home',     ['MOSQUITO', 'WASHING', 'NAPH*', 'NAPTH*', 'WASH', 'DISHWASH']),
    # checked before pooja so "Emergency Lamp" isn't filed with the pooja lamps
    ('appliances', ['EMERGENCY', 'RECHARGEABLE']),
    ('toys',     ['TOY*', 'DOLL', 'BALL', 'YOYO', 'KIDS', 'CAR', 'GAME*', 'PUZZLE',
                  'UNO', 'LUDO', 'TENNIS', 'BAT', 'FISHING', 'DUCK', 'PENGUIN', 'CARROM', 'CHESS', 'BALLOON*', 'KITE']),
    ('pooja',    ['AGARBATHI', 'AGARPATHI', 'AGARBATTI', 'BATHI', 'BATHTHI', 'SAMBRANI', 'DHUBAKKAL', 'DUBAKKAL', 'DUBBAKKAL', 'VILAKU*', 'VILAKKU*', 'VILLAKU*', 'DEEPAM', 'AGAL', 'URLI', 'KALASAM', 'KALASH', 'POOJA',
                  'PUJA', 'KUTHU', 'SWAMY', 'SAMY', 'GOD', 'PANCHAPATHRA*', 'ARATHI', 'AARTHI', 'DHOOP*',
                  'KAMATCHI', 'KAMAKSHI', 'MANI', 'BELL', 'THAMBALAM', 'SOMBU', 'CHOMBU', 'KUMKUM*', 'LAMP*',
                  'DIYA', 'PHOTO', 'NILAVILAKKU', 'KUNKUMAM', 'GANESH*', 'LAKSHMI', 'SRI',
                  'VIBUTHI', 'VIBHUTHI', 'KUBERA', 'VIKRAHAM', 'VIGRAHAM', 'DHUBAKKAL', 'DHOOPAKKAL', 'SANDANA*',
                  'SANDHANA*', 'CHANDAN*', 'PAYALI', 'KOLAM', 'THIRUSHTI', 'DRISHTI', 'KUMBA*', 'NAGA*',
                  'PANCHA*', 'HOMAM', 'GOMATHI', 'RUDRAKSHA*', 'MALA', 'UNDIYAL',
                  'KUNDAM', 'OMAKUNDAM', 'TIRISULAM', 'TRISULAM', 'DEEPA', 'ARTHI', 'ARATHI', 'LOTA', 'URLY', 'PALLAGGULY', 'DUBBAKKAL', 'KUNGUMA*', 'GUNGUMA*', 'VEL']),
    ('appliances', ['MIXIE', 'MIXER', 'GRINDER', 'BLENDER', 'NUTRIBLENDER', 'JUICER', 'OTG', 'OVEN', 'KETTLE',
                  'INDUCTION', 'STOVE', 'BURNER', 'TOASTER', 'SANDWICH', 'IRONBOX', 'FAN', 'HEATER', 'GEYSER',
                  'CHOPPER', 'CITRUS', 'PHILIPS', 'PREETHI', 'PRESTIGE', 'BUTTERFLY', 'CROMPTON', 'BAJAJ',
                  'JUDGE', 'GREENCHEF', 'PIGEON', 'KROMA', 'EMERGENCY', 'TRIMMER', 'DRYER', 'MAKER',
                  'MIXEJAR', 'MIXCY', 'MIXY', 'SUJATA', 'VIDIEM', 'RADIANT', 'KHAITHAN', 'KHAITAN', 'SCALE', 'SCALES', 'SOCKET']),
    ('brass',    ['BRASS', 'BR', 'COPPER', 'CU', 'PITHALAI', 'PANCHALOHA*', 'BRONZE', 'VENKALAM',
                  'VENGALA', 'VENGALAM']),
    # before cookware/steel: "Basket With Lid" is storage, not cookware ("lid"); plain "Bucket" is plastic storage
    ('storage',  ['BASKET*', 'CRATE*', 'CONTAINER*', 'BUCKET', 'BUCKETS']),
    ('bottles',  ['MILTON', 'BOTTLE*', 'FLASK*', 'JUG', 'JUGS', 'CELLO', 'THERMO*', 'SIPPER', 'CASSEROLE*',
                  'HOT', 'CAMPER', 'DUO',
                  'CARAFE', 'BEVERAGE', 'CHARMY', 'RINGO', 'ATLANTIS', 'SMARTY', 'SUNPET']),
    ('cookware', ['KADAI', 'KADAAI', 'KADAYI', 'TAWA', 'THAWA', 'DOSA', 'COOKER*', 'TRIPLY', 'TRI', 'CAST',
                  'IRON', 'IDLY', 'IDLI', 'IDIYAPPAM', 'PANIYARA*', 'PANIYARAM', 'KULI', 'APPAM', 'APPACHATTI',
                  'TOPE', 'TOPES', 'PAN', 'PANS', 'FRY', 'TADKA', 'NONSTICK', 'NON', 'HANDI', 'PRESSURE',
                  'STEAMER', 'SAUCE', 'PAWALI', 'KADHAI', 'WOK', 'GRILL', 'MUSALA', 'LADDLE*', 'LADLE*',
                  'KARANDI', 'SPATULA', 'TONG*', 'PUTTU', 'MANNCHATTI', 'MANCHATTI', 'CLAY', 'URULI',
                  'GAS', 'STOVE', 'BURNER', 'MIXIE', 'MIXER', 'GRINDER', 'KETTLE', 'INDUCTION', 'OVEN',
                  'ALUMINIUM', 'SAMBADAM', 'ADUKKU', 'VADAI', 'POORI', 'CHAPATHI', 'CHAPPATHI', 'ROTI',
                  'MURUKKU', 'SEV', 'PRESS', 'JALADAI', 'STRAINER', 'COLANDER', 'GRATER', 'PEELER',
                  'KNIFE', 'KNIVES', 'CHOPPER', 'CUTTING', 'BOARD', 'BOARDS', 'SLICER', 'WHISK', 'BEATER',
                  'MORTAR', 'PESTLE', 'ROLLING', 'POLPAT', 'CAKE', 'MOULD*', 'MOLD*', 'BAKING', 'TEA',
                  'COFFEE', 'FILTER', 'MILK', 'BOILER', 'VESSEL*', 'POT', 'POTS', 'PANAI', 'CHATTI',
                  'KUNDAN', 'ANDA', 'GUNDAN', 'BIRIYANI', 'BIRYANI', 'DEGCHI', 'PATILA', 'PATHRAM',
                  'LID', 'LIDS', 'SCOOP*', 'SHAKER', 'ROASTER', 'GREATER', 'OPENER', 'CUTTER', 'CRUSH*', 'WOOD',
                  'WOODEN', 'MATHU', 'MATTHU', 'KATHI', 'ARIVAL', 'MANAI', 'VADIKATTI', 'MURAM', 'FULKA',
                  'PHULKA', 'LAGAN', 'HANDY', 'ADIUKKU', 'COOKPOT', 'IDIYAPPA', 'KUMCHA', 'ANNAKUDAI', 'KAI',
                  'SKILLET', 'SKILET', 'CASSEROL*', 'PAAL', 'KOOJA', 'SIEVE', 'SALLADAI', 'THAVA', 'KARAHI',
                  'STANDARD', 'STANDART', 'SPIL*', 'SPILL*', 'CUTE', 'BLUE', 'IDLYPOT', 'FRYPAN', 'SAUCEPAN', 'TADKAPAN', 'KUZIPANIYARAM', 'NSTAWA', 'ACHU', 'ACHI', 'MASHER', 'CHIPSER', 'DICER', 'EGG', 'POURER', 'SCISSOR*', 'JIFFY', 'PARATH', 'POTATO', 'KOLUKATTAI', 'SILICON*', 'COFFE', 'OMNI', 'PREMIER', 'MITHRA']),
    ('steel',    ['STAINLESS', 'STEEL', 'PLATE*', 'THATTU', 'TUMBLER*', 'GLASS', 'DABBARA*', 'DAVARA',
                  'TIFFIN', 'LUNCH', 'CARRIER', 'BOWL*', 'KINNAM', 'SPOON*', 'FORK*', 'DINNER', 'DISH',
                  'DISHES', 'TRAY*', 'THALI', 'KUDAM', 'BUCKET', 'MUG', 'CUP', 'CUPS', 'SAUCER*', 'KATORI',
                  'DABBA', 'SERVING', 'BENTO', 'CANISTER*', 'GLASSWARE', 'CUTLERY', 'BUFFET', 'HOTPOT',
                  'CHAFING', 'SNACK*', 'MASALA', 'ANJARAI', 'PETTI', 'SPICE', 'SALT', 'CHEESE', 'BUTTER']),
    ('storage',  ['CONTAINER*', 'BOX', 'BOXES', 'BASKET*', 'PLASTIC', 'TUB', 'TUBS', 'DRUM', 'BIN',
                  'RACK', 'STAND', 'ORGANISER', 'ORGANIZER', 'JAR', 'JARS', 'STORAGE', 'TUPPERWARE',
                  'AIRTIGHT', 'POUCH', 'BAG', 'BAGS', 'CLIP', 'CLIPS', 'HOOK*', 'HANGER*', 'SHELF', 'SELF',
                  'TROLLEY', 'KEEPER', 'VEG', 'FRUIT', 'DISPENSER', 'SIGNORAWARE', 'CONT', 'STOREWELL', 'CRATE*',
                  'CAN', 'FRESH', 'MAGNUM', 'KUDAI', 'LAUNDRY', 'CASE', 'TIN', 'TINS',
                  'JAADI', 'JADI', 'JARA', 'URUGAI', 'STACKO', 'HOLDER', 'POOKOODAI', 'KOODAI', 'CARBAGE']),
    ('home',     ['MOP', 'WIPER', 'BRUSH', 'BROOM', 'STOOL', 'MIRROR', 'CLOTH', 'TOWEL', 'MAT', 'MATS',
                  'DUSTBIN', 'DUST', 'SCRUB*', 'SPONGE', 'CLEAN*', 'LADDER', 'UMBRELLA', 'IRONBOX',
                  'CLOCK', 'TORCH', 'LOCK', 'SOAP', 'COMB', 'YOGA', 'PILLOW', 'BEDSHEET', 'CURTAIN',
                  'DOORMAT', 'APRON', 'GLOVE*', 'LIGHTER', 'THUKU', 'BATH', 'WASHING', 'DRYING', 'FAN',
                  'DECOR*', 'FLOWER', 'VASE', 'SHOWPIECE', 'WALL', 'PAINTING', 'FRAME', 'CHAIR*', 'CHIRS', 'TABLE',
                  'DESK', 'CUPBOARD', 'KATTAL', 'COT', 'POTTY', 'BABY', 'NET', 'PHENYLE', 'DETERGENT', 'FRESHENER',
                  'SPRAY', 'NAPHTHALENE', 'TISSUE', 'PAAI', 'PAI', 'LIGHTS', 'LIGHT', 'TAPE', 'REPELLENT',
                  'MOSQUITO', 'COVER', 'REMOTE', 'BULB', 'BATTERY', 'SINK', 'PEDAL', 'KOLAPAAI',
                  'UMBERLLA', 'CARPET', 'ROPE', 'TRAP', 'WASH', 'LIQUID', 'POLISH', 'SOFTNER', 'SHOWER', 'STICKERS', 'SCREEN', 'BED', 'SHEET', 'PILLOW*', 'PLLOW', 'THOTIL', 'CERVICAL', 'DUSTAR', 'DUSTER', 'GLOUSE', 'CALCULATOR', 'KATIL', 'TENT', 'CAP', 'COMBS']),
]
CATEGORY_ORDER = ['brass', 'pooja', 'cookware', 'steel', 'bottles', 'storage', 'appliances', 'home', 'toys', 'other']

# Short forms in the billing names -> readable words (applied to whole words)
ABBREV = {
    'SS': 'Stainless Steel', 'S.S': 'Stainless Steel', 'S.S.': 'Stainless Steel',
    'AL': 'Aluminium', 'AL.': 'Aluminium', 'ALU': 'Aluminium', 'ALU.': 'Aluminium', 'ALUM': 'Aluminium',
    'BR': 'Brass', 'BR.': 'Brass', 'CU': 'Copper', 'CU.': 'Copper', 'CO': 'Copper', 'CO.': 'Copper', 'PL': 'Plastic', 'PL.': 'Plastic',
    'PCS': 'pcs', 'PC': 'pc', 'NO': 'No.', 'ML': 'ml', 'LTR': 'L', 'LTRS': 'L', 'L': 'L', 'KG': 'kg',
    'MM': 'mm', 'CM': 'cm', 'GM': 'g', 'GMS': 'g', 'DIA': 'Dia', 'NS': 'Non-Stick', 'N/S': 'Non-Stick',
}
KEEP_UPPER = {'PVC', 'LED', 'USB', 'XL', 'XXL', 'II', 'III', 'IV', 'BPA', 'GI'}


def num(v):
    try:
        return float((v or '').replace(',', '').strip() or 0)
    except ValueError:
        return 0.0


def find_csv():
    if len(sys.argv) > 1:
        return sys.argv[1]
    found = [f for d in (os.path.dirname(SITE), SITE) for f in glob.glob(os.path.join(d, '*.csv'))
             if 'stock' in os.path.basename(f).lower().replace('_', '')]
    if not found:
        sys.exit('No stock CSV found. Pass the CSV path: python tools/build_catalogue.py file.csv')
    return max(found, key=os.path.getmtime)


def read_rows(path):
    with open(path, encoding='utf-8-sig', errors='ignore', newline='') as f:
        rows = list(csv.reader(f))
    for i, row in enumerate(rows):
        if row and row[0].strip().upper() == 'BRAND' and 'Item Name' in row:
            header = row
            body = rows[i + 1:]
            break
    else:
        sys.exit('Could not find the header row (BRAND, ..., Item Name, ...) in the CSV.')
    for r in body:
        if len(r) < len(header) // 2:
            continue
        d = dict(zip(header, r))
        if d.get('Item Code', '').strip() and d.get('Item Name', '').strip():
            yield d


PRICE_RE = re.compile(r'\b(?:RS|RS\.|INR|₹)\s*\.?\s*[\d,]+(?:\.\d+)?\s*/?-?', re.I)
TRAIL_NUM_RE = re.compile(r'[\s\-]+[\d,]{2,6}(?:\.\d+)?\s*/?-?\s*$')


def clean_name(raw, price):
    s = raw.replace(' ', ' ').strip()
    s = PRICE_RE.sub(' ', s)
    s = re.sub(r'₹\s*[\d,]+', ' ', s)
    # drop a trailing bare number that equals (roughly) the price, e.g. "Tope 679"
    m = TRAIL_NUM_RE.search(s)
    if m:
        n = num(m.group(0).strip(' -/'))
        if price and abs(n - price) <= max(25, price * 0.25):
            s = s[:m.start()]
    s = re.sub(r'\bS\s*\.?\s*S\b\.?', 'SS ', s, flags=re.I)
    s = re.sub(r'\b(AL|ALU|BR|CU|CO|PL|W)\.(?=[A-Za-z])', r'\1. ', s, flags=re.I)
    s = re.sub(r'\b(PLASTIC|TRIPLY|STEEL|BRASS|COPPER)(?=[A-Z]{3,})', r'\1 ', s, flags=re.I)
    s = re.sub(r'[()\[\]]', ' ', s)
    s = re.sub(r'\s*([.,/-])\s*$', '', s)
    words = []
    for w in re.split(r'\s+', s.strip()):
        if not w:
            continue
        u = w.upper()
        if u in ABBREV:
            words.append(ABBREV[u])
        elif u.rstrip('.') in ABBREV and u.endswith('.'):
            words.append(ABBREV[u.rstrip('.')])
        elif u in KEEP_UPPER:
            words.append(u)
        elif re.fullmatch(r'[\d.]+(ML|L|LTR|KG|G|GM|CM|MM|PCS|PC|INCH)', u):
            n, unit = re.match(r'([\d.]+)(\D+)', u).groups()
            words.append(n + ABBREV.get(unit, unit.lower()))
        elif re.search(r'\d', w):
            words.append(w.lower() if re.fullmatch(r'[\d.x*/+-]+[a-z]*', w, re.I) else w[:1].upper() + w[1:].lower())
        else:
            words.append(w[:1].upper() + w[1:].lower())
    s = ' '.join(words)
    s = re.sub(r'\s+', ' ', s).strip(' -.,/')
    return s


# ===== Name fixes agreed with the shop (applied after clean_name) =====
# One-letter codes at the start that stand for a word ("W. Ural" -> "Wooden Ural", "M-flexi Tiffin" -> "Milton Flexi Tiffin")
PREFIX_WORDS = [
    (re.compile(r'^W\s*\.\s*', re.I), 'Wooden '),
    (re.compile(r'^M\s*[-.]\s*', re.I), 'Milton '),
    (re.compile(r'^C\s*-\s*', re.I), 'Cello '),
]
# Other short codes at the start of billing names – removed ("Sw Lunch Box" -> "Lunch Box")
PREFIX_CODE_RE = re.compile(r'^(?:Sw|Sq|B\s?\.?\s?h|Bf|Ex)\s*[.\s]\s*', re.I)
# Billing codes at the end – removed ("Tiffin Box Ra" -> "Tiffin Box")
SUFFIX_CODE_RE = re.compile(r'(?:\s+R\s+S|\s+(?:Ra|R|Ptd|Prt|Ind|Rs))+$')
# Whole-word spelling fixes (any case) -> correct word
WORD_FIXES = {
    'kuththu': 'Kuthu', 'kutthu': 'Kuthu', 'vilaku': 'Vilakku', 'villaku': 'Vilakku', 'vlakku': 'Vilakku',
    'vlaku': 'Vilakku', 'vilku': 'Vilakku',
    'contanier': 'Container', 'continer': 'Container',
    'coffe': 'Coffee', 'coffie': 'Coffee', 'fiter': 'Filter', 'filtter': 'Filter', 'fileter': 'Filter',
    'mixcie': 'Mixie', 'mixcy': 'Mixie', 'mixe': 'Mixie', 'mixejar': 'Mixie Jar',
    'frashner': 'Freshner', 'freshener': 'Freshner',
    'watter': 'Water', 'toillet': 'Toilet', 'toliet': 'Toilet', 'botle': 'Bottle', 'bottal': 'Bottle',
    'umberlla': 'Umbrella', 'sqeezer': 'Squeezer', 'platic': 'Plastic', 'plastick': 'Plastic',
    'tawaala': 'Tawala',
    'ttriply': 'Triply', 'tryply': 'Triply', 'aaarathi': 'Aarathi', 'glassstop': 'Glasstop', 'trollley': 'Trolley',
}
# Whole-name renames (after the fixes above), lower-case name -> website name
RENAMES = {
    'container': 'Plastic Container Box',
    'mixer jar': 'Mixie Jar',
    'judge 4 l pan': 'Judge by Prestige Deluxe Induction Pressure Cooker 4 L',
    'judge 6 l pan': 'Judge by Prestige Deluxe Induction Pressure Cooker 6 L',
}
# Products listed once, with their sizes shown as extra info ("Can" · 5 L · 10 L · 20 L)
SIZES_AS_INFO = {'can', 'blue line pro', 'dish wash', 'floor cleaner',
                 'judge by prestige deluxe induction pressure cooker', 'max fresh cooker'}
# Size to show when the billing name has none ("DISH WASH 125" is the 1 L pack)
DEFAULT_SIZE = {'dish wash': '1 L', 'floor cleaner': '1 L'}
SIZE_RE = re.compile(r'\s+(\d+(?:\.\d+)?(?:\s+1\\2)?\s*(?:L|ml|kg|g))$')


def fix_name(name):
    """Returns (website name, size info or '')."""
    s = name
    for pattern, word in PREFIX_WORDS:
        s = pattern.sub(word, s)
    s = PREFIX_CODE_RE.sub('', s)
    s = SUFFIX_CODE_RE.sub('', s)
    s = re.sub(r'\b(Tri|Try)\s?Ply\b', 'Triply', s, flags=re.I)
    s = re.sub(r'\bWith Id\b', 'With Lid', s, flags=re.I)   # "Basket With Id" is "Basket With Lid"
    s = re.sub(r'[A-Za-z]+', lambda m: WORD_FIXES.get(m.group(0).lower(), m.group(0)), s)
    # litres always as "3 L"  (3li, 5lit, 1.lit, 7.5.lit, 3 Lit, 3L, 3ltr)
    # …but 100 or more "litres" is really millilitres ("MILTON 1000LIT" -> "Milton 1000 ml")
    s = re.sub(r'(\d+(?:\.\d+)?)\s*\.?\s*(?:litres?|lits?|ltrs?|li|l)\b\.?',
               lambda m: m.group(1) + (' ml' if float(m.group(1)) >= 100 else ' L'), s, flags=re.I)
    # millilitres always as "1000 ml", so "1000ml" and "1000 ml" are one product (models differ in price)
    s = re.sub(r'(\d+(?:\.\d+)?)\s*ml\b\.?', r'\1 ml', s, flags=re.I)
    # tidy symbols: "Cup&saucer" -> "Cup & Saucer", "Brass .plate" -> "Brass Plate", "Knife .60" -> "Knife 60"
    s = re.sub(r'\s*&\s*', ' & ', s)
    s = re.sub(r'\s\.(?=\w)', ' ', s)
    s = ' '.join(w[:1].upper() + w[1:] if w[:1].isalpha() and w not in ('ml', 'g', 'kg', 'cm', 'mm', 'pcs', 'pc') else w
                 for w in s.split())
    s = re.sub(r'\s+', ' ', s).strip(' -.,/&')
    s = RENAMES.get(s.lower(), s)
    info = ''
    m = SIZE_RE.search(s)
    if m and s[:m.start()].lower() in SIZES_AS_INFO:
        info = m.group(1).replace(' 1\\2', '.5')
        s = s[:m.start()]
    elif s.lower() in DEFAULT_SIZE:
        info = DEFAULT_SIZE[s.lower()]
    return s, info


def categorise(name):
    if re.search(r'\b[1-4]\s?B\b', name.upper()):     # "Ace 2b", "Bolt 3b" = gas stoves
        return 'appliances'
    words = re.findall(r'[A-Z]+', name.upper())
    wset = set(words)
    for cat, keys in CATEGORY_RULES:
        for k in keys:
            if k.endswith('*'):
                p = k[:-1]
                if any(w.startswith(p) for w in words):
                    return cat
            elif k in wset:
                return cat
    return 'other'


def main():
    path = find_csv()
    items = {}
    for d in read_rows(path):
        code = d['Item Code'].strip()
        price = num(d.get('Selling')) or num(d.get('MRP'))
        when = (d.get('Transaction Date') or '').strip()[:10]
        it = items.setdefault(code, {'name': d['Item Name'].strip(), 'stock': 0.0, 'date': '', 'price': 0.0})
        it['stock'] += num(d.get('Current Stock'))
        if when >= it['date'] and price > 0:
            it['date'], it['price'], it['name'] = when, price, d['Item Name'].strip()

    newest = max((i['date'] for i in items.values() if i['date']), default=date.today().isoformat())
    nd = date.fromisoformat(newest)
    keep_after = (nd - timedelta(days=KEEP_MONTHS * 30)).isoformat()
    new_after = (nd - timedelta(days=NEW_DAYS)).isoformat()

    merged = {}
    dropped = 0
    for it in items.values():
        if it['price'] <= 0 or not (it['stock'] > 0 or it['date'] >= keep_after):
            dropped += 1
            continue
        name, info = fix_name(clean_name(it['name'], it['price']))
        if len(re.sub(r'[^A-Za-z]', '', name)) < 3 or name.lower() in EXCLUDE_NAMES:
            dropped += 1
            continue
        key = name.lower()
        m = merged.get(key)
        if not m:
            merged[key] = m = {'name': name, 'prices': set(), 'new': False, 'info': set()}
        m['prices'].add(round(it['price']))
        if info:
            m['info'].add(info)
        m['new'] = m['new'] or it['date'] >= new_after

    out = []
    counts = {c: 0 for c in CATEGORY_ORDER}
    for m in sorted(merged.values(), key=lambda m: m['name'].lower()):
        cat = categorise(m['name'])
        counts[cat] += 1
        row = [m['name'], CATEGORY_ORDER.index(cat), sorted(m['prices']), 1 if m['new'] else 0]
        if m['info']:   # sizes shown under the name, smallest first: "2.5 L · 5 L · 10 L · 20 L"
            row.append(' · '.join(sorted(m['info'], key=lambda v: float(re.match(r'[\d.]+', v).group(0)))))
        out.append(row)

    data = {'built': newest, 'cats': CATEGORY_ORDER, 'items': out}
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('// Generated by tools/build_catalogue.py from the billing stock export – do not edit by hand.\n')
        f.write('// items: [name, category index (see cats), [prices of each size/variant], new (1/0), sizes info (optional)]\n')
        f.write('window.CATALOGUE = ')
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')

    print(f'CSV:      {path}')
    print(f'Items:    {len(items)} codes -> {len(out)} catalogue entries ({dropped} dropped)')
    print(f'Newest:   {newest} ({sum(o[3] for o in out)} marked new)')
    for c in CATEGORY_ORDER:
        print(f'  {c:9s} {counts[c]}')
    print(f'Wrote:    {OUT} ({os.path.getsize(OUT) // 1024} KB)')


if __name__ == '__main__':
    main()
