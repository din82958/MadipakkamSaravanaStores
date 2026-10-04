"""Build the site's extra pages from index.html + pages/<name>.html + js/catalogue-data.js.

Usage:  python tools/build_pages.py

Writes:
  catalogue.html, gift-finder.html   – page content from pages/catalogue.html and pages/gift-finder.html
  <category>.html                    – one page per category (CATEGORIES below) listing every item with
                                       its price, so Google can find them (the catalogue itself is built in the browser)
  sitemap.xml                        – every page, for Google Search Console
  css/site.min.css                   – all of CSS_FILES in one small file (one download instead of eight)

The header, menu, footer, phone action bar and dialogs come from index.html, so they only
need editing in one place. Run this again after changing any of those files, any file in css/,
or after tools/build_catalogue.py (which runs it for you).
"""
import html
import json
import os
import re
from datetime import date
from urllib.parse import quote_plus

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMAIN = 'https://madipakkamsaravanastores.in'   # same as the CNAME file
BRAND = 'Madipakkam Saravana Stores'

# Stylesheets combined into css/site.min.css, in this order (later files override earlier ones)
CSS_FILES = ['style.css', 'v2.css', 'v3.css', 'animations.css', 'premium.css', 'texture.css', 'catalogue.css', 'mobile.css']

PAGES = {
    'catalogue': {
        'title': 'Vessels &amp; Kitchenware Prices, Chennai | Madipakkam Saravana Stores',
        'description': '2,000+ steel vessels, brass, pooja items, cookware, plastics and appliances with prices at '
                       'Madipakkam Saravana Stores, Chennai. Make a list, send it on WhatsApp.',
        'crumb': 'Catalogue',
    },
    'gift-finder': {
        'title': 'Seer Varisai &amp; Occasion Lists | Madipakkam Saravana Stores',
        'description': 'Seer varisai, housewarming, return gifts and festival lists within your budget, from real items '
                       'at Madipakkam Saravana Stores, Chennai. Send the list on WhatsApp.',
        'crumb': 'Seer &amp; Occasion Lists',
    },
}

# One landing page per catalogue category. Order = order of the links.
# key: category id in catalogue-data.js; slug: file name; h1/intro in English and Tamil;
# ex: short list of examples for the description; searches: quick links into the catalogue search.
CATEGORIES = [
    {'key': 'steel', 'slug': 'stainless-steel-vessels', 'icon': 'i-plate',
     'title': 'Stainless Steel Vessels with Prices, Chennai',
     'h1': 'Stainless steel vessels &amp; dining', 'h1_ta': 'எவர்சில்வர் பாத்திரங்கள் & டைனிங்',
     'label': 'Stainless steel', 'label_ta': 'எவர்சில்வர்',
     'intro': 'Plates, tumblers, bowls, dabbas, tiffin carriers, kudams and serving trays in stainless steel – for everyday use, seer varisai and gifting.',
     'intro_ta': 'தட்டுகள், டம்ளர்கள், கிண்ணங்கள், டப்பாக்கள், டிபன் கேரியர்கள், குடங்கள் மற்றும் சர்விங் ட்ரேக்கள் – தினசரி பயன்பாட்டுக்கும், சீர் வரிசைக்கும், பரிசுக்கும்.',
     'ex': 'plates, tumblers, dabbas, tiffin carriers',
     'searches': ['Plate', 'Tumbler', 'Bowl', 'Dabba', 'Tiffin', 'Kudam']},
    {'key': 'cookware', 'slug': 'cookware', 'icon': 'i-pan',
     'title': 'Cookware with Prices – Cookers, Kadai, Tawa',
     'h1': 'Cookware', 'h1_ta': 'சமையல் பாத்திரங்கள்',
     'label': 'Cookware', 'label_ta': 'சமையல் பாத்திரங்கள்',
     'intro': 'Pressure cookers, kadais, dosa tawas, idli pots, cast iron, tri-ply and non-stick cookware, plus ladles and kitchen tools.',
     'intro_ta': 'பிரஷர் குக்கர், கடாய், தோசைக் கல், இட்லி பாத்திரம், இரும்பு, ட்ரை-ப்ளை மற்றும் நான்-ஸ்டிக் பாத்திரங்கள், கரண்டிகள் மற்றும் சமையலறைக் கருவிகள்.',
     'ex': 'pressure cookers, kadais, tawas, idli pots',
     'searches': ['Cooker', 'Kadai', 'Tawa', 'Idly', 'Cast iron', 'Triply', 'Non-stick']},
    {'key': 'brass', 'slug': 'brass-copper-items', 'icon': 'i-pot',
     'title': 'Brass &amp; Copper Vessels with Prices, Chennai',
     'h1': 'Brass &amp; copper vessels', 'h1_ta': 'பித்தளை & செம்பு பாத்திரங்கள்',
     'label': 'Brass & copper', 'label_ta': 'பித்தளை & செம்பு',
     'intro': 'Brass kudams, handis, plates, tumblers, padi, murukku achu and copper vessels – for the kitchen, pooja and seer.',
     'intro_ta': 'பித்தளை குடம், ஹண்டி, தட்டு, டம்ளர், படி, முறுக்கு அச்சு மற்றும் செம்பு பாத்திரங்கள் – சமையலறைக்கும், பூஜைக்கும், சீருக்கும்.',
     'ex': 'kudams, handis, plates, copper vessels',
     'searches': ['Kudam', 'Handi', 'Plate', 'Tumbler', 'Copper', 'Vengala']},
    {'key': 'pooja', 'slug': 'pooja-items', 'icon': 'i-lamp',
     'title': 'Pooja Items &amp; Vilakku with Prices, Chennai',
     'h1': 'Pooja items &amp; lamps', 'h1_ta': 'பூஜை பொருட்கள் & விளக்குகள்',
     'label': 'Pooja items', 'label_ta': 'பூஜை பொருட்கள்',
     'intro': 'Kuthu vilakku, Kerala vilakku, agal deepam, urli, pooja sets, bells, sombu and arathi plates for home pooja, festivals and temples.',
     'intro_ta': 'குத்து விளக்கு, கேரள விளக்கு, அகல் தீபம், உருளி, பூஜை செட், மணி, சொம்பு மற்றும் ஆரத்தி தட்டுகள் – வீட்டுப் பூஜை, பண்டிகை மற்றும் கோவிலுக்கு.',
     'ex': 'vilakku, deepam, urli, bells',
     'searches': ['Vilakku', 'Deepam', 'Urli', 'Bell', 'Sombu', 'Kubera']},
    {'key': 'appliances', 'slug': 'kitchen-appliances', 'icon': 'i-bolt',
     'title': 'Mixie, Grinder, Stove &amp; Induction Prices',
     'h1': 'Kitchen appliances &amp; stoves', 'h1_ta': 'மின்சாதனங்கள் & அடுப்பு',
     'label': 'Appliances', 'label_ta': 'மின்சாதனங்கள்',
     'intro': 'Mixer grinders, wet grinders, gas stoves, induction cooktops, kettles, juicers and heaters from Butterfly, Prestige, Philips, Crompton, Judge and more.',
     'intro_ta': 'மிக்ஸி, வெட் கிரைண்டர், கேஸ் அடுப்பு, இண்டக்ஷன், கெட்டில், ஜூஸர் மற்றும் ஹீட்டர் – பட்டர்ஃப்ளை, பிரெஸ்டீஜ், பிலிப்ஸ், க்ராம்ப்டன், ஜட்ஜ் மற்றும் பல.',
     'ex': 'mixies, grinders, gas stoves, induction',
     'searches': ['Mixie', 'Grinder', 'Stove', 'Induction', 'Kettle', 'Heater']},
    {'key': 'bottles', 'slug': 'bottles-flasks', 'icon': 'i-bottle',
     'title': 'Bottles, Flasks &amp; Casseroles with Prices',
     'h1': 'Bottles, flasks &amp; casseroles', 'h1_ta': 'பாட்டில், ஃபிளாஸ்க் & கேசரோல்',
     'label': 'Bottles & flasks', 'label_ta': 'பாட்டில் & ஃபிளாஸ்க்',
     'intro': 'Milton, Cello and steel water bottles, vacuum flasks, casseroles and hot boxes for home, school and office.',
     'intro_ta': 'மில்டன், செல்லோ மற்றும் ஸ்டீல் தண்ணீர் பாட்டில்கள், ஃபிளாஸ்க், கேசரோல், ஹாட் பாக்ஸ் – வீடு, பள்ளி, அலுவலகத்துக்கு.',
     'ex': 'Milton and Cello bottles, flasks, casseroles',
     'searches': ['Milton', 'Cello', 'Flask', 'Casserole', 'Steel bottle']},
    {'key': 'storage', 'slug': 'plastic-storage', 'icon': 'i-box',
     'title': 'Plastic Containers &amp; Buckets with Prices',
     'h1': 'Plastics &amp; storage', 'h1_ta': 'பிளாஸ்டிக் & சேமிப்புப் பொருட்கள்',
     'label': 'Plastics & storage', 'label_ta': 'பிளாஸ்டிக் & சேமிப்பு',
     'intro': 'Storage containers, buckets, baskets, kitchen racks, stands and laundry baskets to keep every corner of the home organised.',
     'intro_ta': 'சேமிப்பு டப்பாக்கள், பக்கெட், கூடைகள், சமையலறை ரேக், ஸ்டாண்டு மற்றும் துணிக் கூடைகள் – வீட்டை ஒழுங்காக வைக்க.',
     'ex': 'containers, buckets, baskets, racks',
     'searches': ['Container', 'Bucket', 'Basket', 'Rack', 'Stand']},
    {'key': 'home', 'slug': 'home-cleaning', 'icon': 'i-home',
     'title': 'Home &amp; Cleaning Products with Prices, Chennai',
     'h1': 'Home &amp; cleaning', 'h1_ta': 'வீடு & சுத்தம்',
     'label': 'Home & cleaning', 'label_ta': 'வீடு & சுத்தம்',
     'intro': 'Brooms, mops, brushes, cleaners, mosquito bats, bath accessories, chairs, stools and baby care items.',
     'intro_ta': 'துடைப்பம், மாப், பிரஷ், கிளீனர்கள், கொசு பேட், குளியலறைப் பொருட்கள், நாற்காலி, ஸ்டூல் மற்றும் குழந்தைப் பொருட்கள்.',
     'ex': 'mops, brushes, cleaners, chairs',
     'searches': ['Brush', 'Mop', 'Cleaner', 'Mosquito', 'Chair', 'Stool']},
    {'key': 'toys', 'slug': 'toys', 'icon': 'i-heart',
     'title': 'Toys &amp; Games with Prices, Chennai',
     'h1': 'Toys &amp; games', 'h1_ta': 'பொம்மைகள் & விளையாட்டுகள்',
     'label': 'Toys', 'label_ta': 'பொம்மைகள்',
     'intro': 'Kids’ toys, balls, cricket and tennis sets, chess and board games – small gifts for birthdays and return gifts.',
     'intro_ta': 'குழந்தைகள் பொம்மைகள், பந்துகள், கிரிக்கெட், டென்னிஸ், சதுரங்கம் மற்றும் போர்டு விளையாட்டுகள் – பிறந்தநாள் மற்றும் ரிட்டர்ன் கிஃப்டுக்கு.',
     'ex': 'kids’ toys, balls, chess, games',
     'searches': ['Ball', 'Chess', 'Kids', 'Cricket']},
    {'key': 'other', 'slug': 'household-items', 'icon': 'i-tag',
     'title': 'More Household Items with Prices, Chennai',
     'h1': 'More household items', 'h1_ta': 'மற்ற வீட்டுப் பொருட்கள்',
     'label': 'More items', 'label_ta': 'மற்றவை',
     'intro': 'Everything else on our shelves – drawers, patlas, coconut scrapers, pumps, barrels and other everyday household needs.',
     'intro_ta': 'எங்கள் கடையில் உள்ள மற்ற பொருட்கள் – டிராயர், பலகை, தேங்காய்த் துருவி, பம்ப், பேரல் மற்றும் அன்றாட வீட்டுத் தேவைகள்.',
     'ex': 'drawers, patlas, coconut scrapers, barrels',
     'searches': ['Drawer', 'Patla', 'Coconut', 'Barrel', 'Pump']},
]

PRICE_NOTE = ('<p class="price-notice"><svg class="ico"><use href="#i-tag"/></svg><span data-ta="விலைகள் மாறலாம். குறிப்பிட்ட விலைகள் தோராயமானவை – '
              'சரியான விலைக்கு கடையைத் தொடர்பு கொள்ளுங்கள்.">Prices may vary. Mentioned prices are approximate – contact the store for exact prices.</span></p>')


# ---------- one stylesheet ----------
def build_css():
    """Join CSS_FILES and strip comments and spare spaces (text inside quotes is left exactly as it is)."""
    css = '\n'.join(open(os.path.join(SITE, 'css', f), encoding='utf-8').read() for f in CSS_FILES)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    parts = re.split(r'''("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')''', css)   # odd items are quoted strings
    for i in range(0, len(parts), 2):
        t = re.sub(r'\s+', ' ', parts[i])
        t = re.sub(r' ?([{};,>]) ?', r'\1', t)
        parts[i] = t.replace(';}', '}')
    out = ''.join(parts).strip() + '\n'
    header = f'/* Built by tools/build_pages.py from css/{", css/".join(CSS_FILES)} – edit those, not this file. */\n'
    open(os.path.join(SITE, 'css', 'site.min.css'), 'w', encoding='utf-8').write(header + out)
    print(f'Wrote css/site.min.css ({len(out) // 1024} KB from {len(css) // 1024} KB)')


# ---------- helpers ----------
def esc(s):
    return html.escape(s, quote=True)


def rupees(n):
    """Indian digit grouping: 125000 -> ₹1,25,000"""
    s = str(int(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        head = re.sub(r'(\d)(?=(\d{2})+$)', r'\1,', head)
        s = f'{head},{tail}'
    return '₹' + s


def price_range(prices):
    lo, hi = min(prices), max(prices)
    return rupees(lo) if lo == hi else f'{rupees(lo)} – {rupees(hi)}'


def ld_json(data):
    return ('  <script type="application/ld+json">\n'
            + json.dumps(data, ensure_ascii=False, indent=1).replace('</', '<\\/')
            + '\n  </script>\n')


def crumbs_ld(trail):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': html.unescape(name), 'item': f'{DOMAIN}/{url}'}
        for i, (name, url) in enumerate(trail)]}


def load_catalogue():
    s = open(os.path.join(SITE, 'js', 'catalogue-data.js'), encoding='utf-8').read()
    data = json.loads(s[s.index('window.CATALOGUE = ') + len('window.CATALOGUE = '):].strip().rstrip(';'))
    by_cat = {c: [] for c in data['cats']}
    for it in data['items']:
        by_cat[data['cats'][it[1]]].append({
            'name': it[0], 'prices': it[2], 'new': bool(it[3]), 'info': it[4] if len(it) > 4 else ''})
    return data['built'], by_cat


# ---------- page shell (header, menu, footer from index.html) ----------
def write_page(name, title, description, content, index, extra_head='', main_class='', source=None):
    head = index[:index.index('<main id="top">')]
    tail = index[index.index('</main>'):]

    # Page title, descriptions and address
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head, flags=re.S)
    for attr in ('name="description"', 'property="og:description"', 'name="twitter:description"'):
        head = re.sub(rf'(<meta {attr} content=")[^"]*', lambda m: m.group(1) + description, head)
    for attr in ('property="og:title"', 'name="twitter:title"'):
        head = re.sub(rf'(<meta {attr} content=")[^"]*', lambda m: m.group(1) + title, head)
    head = head.replace(f'{DOMAIN}/"', f'{DOMAIN}/{name}.html"')   # canonical + og:url

    # Home-page-only parts: business details for Google, splash screen, hero photo preloads
    head = re.sub(r'\s*<!-- Business details for Google[^\n]*\n\s*<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
    head = re.sub(r'<!-- SPLASH SCREEN.*?(?=<!-- Icon sprite -->)', '', head, flags=re.S)
    head = re.sub(r'\n\s*<link rel="preload" as="image"[^>]*>', '', head)
    head = head.replace("skip ? 'is-back' : 'is-loading'", "skip ? 'is-back' : 'js'")
    if extra_head:
        head = head.replace('</head>', extra_head + '</head>', 1)

    # Photo viewer dialogs only exist on the home page
    tail = re.sub(r'<!-- Lightbox -->.*?(?=<!-- "My list")', '', tail, flags=re.S)

    # Links to home-page sections ("#stores") must now point at index.html
    def home_link(m):
        target = m.group(1)
        return 'href="index.html"' if target == 'top' else f'href="index.html#{target}"'
    # (icons are <use href="#i-…"> and stay as they are)
    head = re.sub(r'href="#(?!i-)([\w-]+)"', home_link, head)
    tail = re.sub(r'href="#(?!i-)([\w-]+)"', home_link, tail)

    # Highlight this page in the menu
    head = head.replace(f'<a href="{name}.html" data-ta=', f'<a href="{name}.html" aria-current="page" data-ta=', 1)
    tail = tail.replace(f'<li><a href="{name}.html" ', f'<li><a href="{name}.html" aria-current="page" ', 1)

    note = source or f'index.html + pages/{name}.html'
    out_html = head.replace('<!doctype html>\n', f'<!doctype html>\n<!-- Generated by tools/build_pages.py from {note} – edit those, not this file. -->\n', 1)
    out_html += f'<main id="top" class="subpage subpage-{main_class or name}">\n\n{content}\n'
    out_html += tail
    open(os.path.join(SITE, name + '.html'), 'w', encoding='utf-8').write(out_html)
    print(f'Wrote {name}.html ({len(out_html) // 1024} KB)')


# ---------- shared blocks ----------
def category_links(by_cat, current=None):
    cards = []
    for c in CATEGORIES:
        if c['key'] == current or not by_cat.get(c['key']):
            continue
        items = by_cat[c['key']]
        lo = min(min(i['prices']) for i in items)
        cards.append(
            f'''        <a class="seo-cat-card" href="{c['slug']}.html">
          <span class="seo-cat-ico"><svg class="ico"><use href="#{c['icon']}"/></svg></span>
          <span class="seo-cat-text"><strong data-ta="{esc(c['label_ta'])}">{esc(c['label'])}</strong>
          <small>{len(items)} items · from {rupees(lo)}</small></span>
          <svg class="ico seo-cat-arrow"><use href="#i-arrow"/></svg>
        </a>''')
    heading = ('<h2 class="seo-h2" data-ta="மற்ற வகைகள்">More categories</h2>' if current
               else '<h2 class="seo-h2" data-ta="வகை வாரியாகப் பாருங்கள் – விலையுடன்">Browse by category – with prices</h2>')
    return f'''      <nav class="seo-cats reveal" aria-label="Categories">
        {heading}
        <div class="seo-cat-grid">
{chr(10).join(cards)}
        </div>
      </nav>'''


def category_page(c, items, built, by_cat):
    n = len(items)
    lo = min(min(i['prices']) for i in items)
    key = c['key']

    # Items grouped by first letter, A–Z
    groups = {}
    for it in sorted(items, key=lambda i: i['name'].lower()):
        first = it['name'][:1].upper()
        groups.setdefault(first if first.isalpha() else '#', []).append(it)
    letters = sorted(groups, key=lambda l: (l == '#', l))

    def row(it):
        href = esc(f'catalogue.html?cat={key}&q={quote_plus(it["name"])}')
        sizes = it['info'] or (f'{len(it["prices"])} sizes' if len(it['prices']) > 1 else '')
        sizes = f'<span class="seo-i">{esc(sizes)}</span>' if sizes else ''
        new = '<em class="seo-new">New</em>' if it['new'] else ''
        return (f'<li><a href="{href}"><span class="seo-n">{esc(it["name"])}{new}</span>{sizes}'
                f'<span class="seo-p">{price_range(it["prices"])}</span></a></li>')

    az = ''.join(f'<a href="#l-{"0" if l == "#" else l.lower()}">{l}</a>' for l in letters)
    lists = '\n'.join(
        f'''        <section class="seo-group" id="l-{"0" if l == "#" else l.lower()}">
          <h3>{l}</h3>
          <ul>{''.join(row(it) for it in groups[l])}</ul>
        </section>''' for l in letters)
    chips = ''.join(f'<a class="fchip" href="catalogue.html?cat={key}&amp;q={quote_plus(s)}">{esc(s)}</a>'
                    for s in c['searches'])

    h1_plain = html.unescape(c['h1'])
    content = f'''  <section class="section shop-catalogue seo-page" id="catalogue">
    <div class="container">
      <nav class="seo-crumbs" aria-label="Breadcrumb">
        <a href="index.html" data-ta="முகப்பு">Home</a><span aria-hidden="true">/</span>
        <a href="catalogue.html" data-ta="பொருட்கள்">Catalogue</a><span aria-hidden="true">/</span>
        <span aria-current="page" data-ta="{esc(c['label_ta'])}">{esc(c['label'])}</span>
      </nav>
      <div class="section-head cat-hero reveal">
        <p class="kicker" data-ta="சென்னையில் – விலையுடன்">Prices in Chennai</p>
        <h1 data-ta="{esc(c['h1_ta'])}">{c['h1']}</h1>
        <span class="cat-ornament" aria-hidden="true"><i></i><b></b><i></i></span>
        <p class="section-sub" data-ta="{esc(c['intro_ta'])}">{esc(c['intro'])}</p>
        <ul class="cat-trust">
          <li><svg class="ico"><use href="#i-box"/></svg><span><b>{n}</b> items</span></li>
          <li><svg class="ico"><use href="#i-tag"/></svg><span>From <b>{rupees(lo)}</b></span></li>
          <li><svg class="ico"><use href="#i-pin"/></svg><span data-ta="மடிப்பாக்கம் & மேடவாக்கம்">Madipakkam &amp; Medavakkam</span></li>
        </ul>
        <div class="seo-actions">
          <a class="btn btn-primary" href="catalogue.html?cat={key}"><svg class="ico"><use href="#i-search"/></svg><span data-ta="தேடி பட்டியல் தயாரியுங்கள்">Search &amp; make a list</span></a>
          <a class="btn btn-outline" href="#" data-picker="whatsapp" data-occasion="{esc(h1_plain)}"><svg class="ico"><use href="#i-chat"/></svg><span data-ta="WhatsApp-ல் கேளுங்கள்">Ask on WhatsApp</span></a>
        </div>
      </div>
      <div class="cat-panel seo-panel reveal">
        <p class="cat-flabel" data-ta="பிரபலமான தேடல்கள்">Popular searches</p>
        <div class="fchips">{chips}</div>
        {PRICE_NOTE}
      </div>
      <h2 class="seo-h2 seo-list-title">All {esc(h1_plain.lower())} with prices <small>· {n} items, updated {date.fromisoformat(built).strftime('%d %b %Y')}</small></h2>
      <nav class="seo-az" aria-label="Jump to letter">{az}</nav>
      <div class="seo-list">
{lists}
      </div>
      <p class="cat-disclaimer" data-ta="விலைகள் மாறலாம். குறிப்பிட்ட விலைகள் தோராயமானவை – சரியான விலைக்கு கடையைத் தொடர்பு கொள்ளுங்கள். பட்டியலில் இல்லையா? கேளுங்கள் – பெரும்பாலும் எங்களிடம் இருக்கும்.">Prices may vary. Mentioned prices are approximate – contact the store for exact prices. Can’t find something? Just ask – we most likely have it.</p>
{category_links(by_cat, current=key)}
      <a class="page-crosslink reveal" href="gift-finder.html">
        <svg class="ico"><use href="#i-gift"/></svg>
        <span><strong data-ta="ஒரு விசேஷத்துக்குத் திட்டமிடுகிறீர்களா?">Planning an occasion?</strong>
        <span data-ta="சீர் & விசேஷப் பட்டியலை முயற்சி செய்யுங்கள் – பட்ஜெட்டுக்குள் தயார் பட்டியல்.">Try Seer &amp; Occasion Lists – a ready list within your budget.</span></span>
        <svg class="ico"><use href="#i-arrow"/></svg>
      </a>
    </div>
  </section>'''

    title = f'{c["title"]} | {BRAND}'
    description = (f'{n} {esc(html.unescape(c["label"]).lower())} items with prices, from {rupees(lo)} – {esc(c["ex"])}. '
                   f'{BRAND}, Madipakkam &amp; Medavakkam, Chennai. Since 1980.')
    url = f'{DOMAIN}/{c["slug"]}.html'
    ld = {'@context': 'https://schema.org', '@graph': [
        crumbs_ld([('Home', ''), ('Catalogue', 'catalogue.html'), (c['label'], f'{c["slug"]}.html')]),
        {'@type': 'CollectionPage', '@id': url, 'url': url, 'name': html.unescape(c['title']),
         'description': html.unescape(description), 'inLanguage': 'en-IN', 'dateModified': built,
         'isPartOf': {'@type': 'WebSite', 'name': BRAND, 'url': f'{DOMAIN}/'},
         'publisher': {'@id': f'{DOMAIN}/#organization'},
         'mainEntity': {'@type': 'ItemList', 'numberOfItems': n,
                        'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': it['name']}
                                            for i, it in enumerate(sorted(items, key=lambda i: i['name'].lower())[:30])]}},
    ]}
    return title, description, content, ld_json(ld)


# ---------- sitemap ----------
def file_date(path):
    return date.fromtimestamp(os.path.getmtime(os.path.join(SITE, path))).isoformat()


def write_sitemap(built, by_cat):
    images = ['madipakkam/1.jpg', 'medavakkam/1.jpg', 'medavakkam/10.jpg', 'medavakkam/3.jpg', 'madipakkam/4.jpg', 'madipakkam/13.jpg']
    rows = [('', file_date('index.html'), '1.0', ''.join(f'\n    <image:image><image:loc>{DOMAIN}/images/{i}</image:loc></image:image>' for i in images)),
            ('catalogue.html', max(built, file_date('pages/catalogue.html')), '0.9', ''),
            ('gift-finder.html', file_date('pages/gift-finder.html'), '0.8', '')]
    rows += [(f'{c["slug"]}.html', built, '0.8', '') for c in CATEGORIES if by_cat.get(c['key'])]
    body = '\n'.join(f'''  <url>
    <loc>{DOMAIN}/{loc}</loc>
    <lastmod>{mod}</lastmod>
    <priority>{prio}</priority>{img}
  </url>''' for loc, mod, prio, img in rows)
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by tools/build_pages.py – edit that, not this file. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
{body}
</urlset>
'''
    open(os.path.join(SITE, 'sitemap.xml'), 'w', encoding='utf-8').write(xml)
    print(f'Wrote sitemap.xml ({len(rows)} pages)')


def main():
    index = open(os.path.join(SITE, 'index.html'), encoding='utf-8').read()
    build_css()
    built, by_cat = load_catalogue()

    for name, meta in PAGES.items():
        content = open(os.path.join(SITE, 'pages', name + '.html'), encoding='utf-8').read()
        content = re.sub(r'^<!--.*?-->\n', '', content, count=1, flags=re.S)   # drop the editing note
        content = content.replace('      <!-- CATEGORY LINKS: filled in by tools/build_pages.py -->', category_links(by_cat))
        ld = {'@context': 'https://schema.org', '@graph': [
            crumbs_ld([('Home', ''), (meta['crumb'], f'{name}.html')]),
            {'@type': 'CollectionPage' if name == 'catalogue' else 'WebPage', '@id': f'{DOMAIN}/{name}.html',
             'url': f'{DOMAIN}/{name}.html', 'name': html.unescape(meta['title']),
             'description': html.unescape(meta['description']), 'inLanguage': 'en-IN',
             'isPartOf': {'@type': 'WebSite', 'name': BRAND, 'url': f'{DOMAIN}/'},
             'publisher': {'@id': f'{DOMAIN}/#organization'}},
        ]}
        if name == 'catalogue':
            ld['@graph'][1]['hasPart'] = [{'@type': 'CollectionPage', 'name': html.unescape(c['h1']), 'url': f'{DOMAIN}/{c["slug"]}.html'}
                                          for c in CATEGORIES if by_cat.get(c['key'])]
        write_page(name, meta['title'], meta['description'], content, index, extra_head=ld_json(ld))

    for c in CATEGORIES:
        items = by_cat.get(c['key'])
        if not items:
            continue
        title, description, content, extra = category_page(c, items, built, by_cat)
        write_page(c['slug'], title, description, content, index, extra_head=extra, main_class='category',
                   source='index.html + js/catalogue-data.js')

    write_sitemap(built, by_cat)


if __name__ == '__main__':
    main()
