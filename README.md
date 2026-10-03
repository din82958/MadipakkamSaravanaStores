# Madipakkam Saravana Stores – Website (Version 2)

This is Version 2. The original site is still in the `Website` folder next to this one and has not been changed.

**What's new in v2**
- Red highlight bar at the very top: free same-day home delivery, bulk orders of any quantity in one day, trusted since 1980.
- Round photo shortcuts under the header for the 4 categories and 6 occasions.
- "Everything in store" category cards near the top. Tap any item to ask about it on WhatsApp.
- Red "store promise" band with the delivery and bulk-order terms.
- "Our legacy" section with a 1980 → today timeline. The years counter updates itself every year.
- New styles are in `css/v2.css`; `css/style.css` is unchanged.

**Please confirm:** if same-day delivery has an order cut-off time (for example "order before 5 PM"), add it to the "Our store promise" section in `index.html`.

This is a simple static website. You don't need any software to run it: double-click `index.html` to open it in a browser.

## Files
| File | What it is |
|---|---|
| `index.html` | All the page text (English + Tamil) |
| `css/style.css` | Colours, fonts and layout (red + charcoal/grey/white theme) |
| `js/main.js` | Tamil/English switch, menu, store picker, gallery, photo viewer |
| `images/medavakkam/` | Medavakkam store photos (full size) |
| `images/medavakkam/thumbs/` | Small copies (~800 px) that load fast on phones |
| `images/madipakkam/` | Madipakkam store photos (full size, small copies in `thumbs/`) |
| `catalogue.html`, `gift-finder.html` | The catalogue and gift finder pages – **generated**, don't edit by hand (see below) |
| `pages/catalogue.html`, `pages/gift-finder.html` | The content of those two pages – edit these |
| `tools/build_pages.py` | Builds the two pages from `index.html` (header, menu, footer) + `pages/*.html` |
| `js/catalogue.js` | Product catalogue (search, filters, "My list") and the gift / occasion finder |
| `js/catalogue-data.js` | The product list – **generated** from the billing stock export, don't edit by hand |
| `css/catalogue.css` | Styles for the catalogue, gift finder and "My list" |
| `tools/build_catalogue.py` | Turns the billing CSV into `js/catalogue-data.js` |
| `css/mobile.css` | Phone tuning (most visitors use phones): bigger tap targets, compact sections, lighter fonts |
| `tools/optimize_images.py` | Makes light WebP copies of the store photos (`<n>.webp`, `thumbs/<n>.webp`, `mini/<n>.webp`) |

## The catalogue and gift finder pages
The home page shows two cards that open **catalogue.html** and **gift-finder.html**. The menu links, the "See all with prices" links on the category cards, the "Build a list" links on the occasion cards and **Search** in the phone bar all open these pages too. "My list" works on all three pages and keeps its items when moving between them.

The two pages use the same header, menu, footer and phone bar as `index.html`. After changing any of those in `index.html`, or the page content in `pages/`, run:
```
python tools/build_pages.py
```

## Updating the product catalogue
The "Find it before you visit" catalogue and the gift finder use real items and prices from the billing software. There is no stock count or ordering on the site: customers send their list to the store on WhatsApp.

1. In the billing software, export **Current Stock Detail** as CSV.
2. Put the CSV next to this folder (in the parent folder), or anywhere you like.
3. Run (needs Python 3, nothing else):
   ```
   python tools/build_catalogue.py                       # uses the newest stock CSV in the parent folder
   python tools/build_catalogue.py "C:\path\to\file.csv"  # or name the file
   ```
4. It prints how many items went into each category and rewrites `js/catalogue-data.js`. Upload the site as usual.

What the script does:
- **Item names:** removes the price from them ("Tope Rs 170" becomes "Tope"), expands short forms (SS = Stainless Steel, AL = Aluminium, BR = Brass, CO/CU = Copper), and merges sizes with the same name into one card with a price range.
- **Which items are kept:** items that show stock, or that were received in the last 12 months. Change this with `KEEP_MONTHS`.
- **"New" badge:** items received within 45 days of the export (`NEW_DAYS`).
- **Categories:** picked from keywords in the name. If an item lands in "More items", add a keyword to `CATEGORY_RULES` at the top of the script and run it again.

**Fixing product names:** the billing names are left untouched; the website fixes them as it builds. The rules are near the top of `tools/build_catalogue.py`:
- `WORD_FIXES`: spelling fixes for single words, e.g. `'watter': 'Water'`.
- `RENAMES`: renames a whole name, e.g. `'container': 'Plastic Container Box'`.
- `SIZES_AS_INFO`: lists a product once with its sizes shown under the name, e.g. "Can · 2.5 L · 5 L · 10 L · 20 L".
- `PREFIX_WORDS`: expands one-letter codes at the start of a name: W. → Wooden, M-/M. → Milton, C- → Cello.
- `PREFIX_CODE_RE` / `SUFFIX_CODE_RE`: remove other short codes at the start (Sw, Sq, B.h, Bf, Ex) and billing codes at the end (Ra, R, Ptd, Prt, Ind, Rs).
- Litres are always written as "3 L".

To see what still needs fixing, run `python tools/review_names.py`. It writes `tools/name_review.csv`, which opens in Excel.

**Prices are always shown as a range, never one exact figure.** Each price is shown about 10% either side of the billing price, rounded (₹460 shows as "₹410 – ₹510"). Items with several sizes run from the smallest size's low end to the biggest size's high end. This applies to the product cards, My list, the gift finder and the WhatsApp messages. To make the ranges wider or narrower, change `BAND` near the top of `js/catalogue.js` (0.1 = 10%).

**Gift finder lists:** at the top of `js/catalogue.js`, `KITS` defines each occasion: the items, a search phrase for each, how many pieces, and what share of the budget it gets. Edit the phrases or add items there. The finder always picks from whatever is in the current catalogue.

**Links for ads:** these open the site straight on a search, a category or a ready-made list:
- `https://madipakkamsaravanastores.in/catalogue.html?q=idly+pot` (search)
- `catalogue.html?cat=pooja` (category: `brass`, `pooja`, `cookware`, `steel`, `bottles`, `storage`, `appliances`, `home`, `toys`)
- `gift-finder.html?kit=housewarming&budget=10000` (kits: `housewarming`, `seer`, `festivals`, `kitchen`, `weddings`)
- `gift-finder.html?kit=gifts&per=100&guests=50` (return gifts: price per piece and number of guests)

## Adding more photos
1. Photos are numbered `1.jpg`, `2.jpg`, `3.jpg` … in each store folder (`1.jpg` is the shop front). Add new ones with the next number.
2. Optional but recommended: put smaller copies (about 800 px wide) with the **same names** in that store's `thumbs/` folder. If there are no small copies, the site uses the full photos.
3. Add the new file name to that store's `photos` list at the top of `js/main.js`.
4. Run `python tools/optimize_images.py` (needs `pip install pillow` once). It makes the light WebP copies that phones actually download: about 10 KB icons and 50–80 KB thumbnails instead of 200 KB+ JPGs. Keep the JPGs too; they are the fallback.

## Site settings: `js/site-config.js`
All the things you'll update regularly are in one file:

1. **Google Analytics.** The Google tag in the `<head>` of `index.html` loads Google Ads (`AW-18484151582`); `js/main.js` adds GA4 (`analyticsId`, `G-E55J9Y15PK`) to the same tag. The site sends these events:

   | Event | When | Details sent |
   |---|---|---|
   | `view_category` | a category card is scrolled into view | `category` |
   | `select_category` | a category shortcut is tapped (menu, quick links) | `category`, `link_location` |
   | `select_product` | a product line in a category card is tapped | `category`, `product` |
   | `select_occasion` | an occasion or festival "Ask on WhatsApp" is tapped | `occasion` |
   | `select_location` | a store is looked at (Visit link, photo tab, map opened) | `store`, `action` |
   | `open_store_picker` | the "Which store?" sheet opens | `contact_method` + context |
   | `picker_dismissed` | the sheet is closed without choosing a store | `contact_method` + context |
   | `click_call` / `click_whatsapp` / `click_directions` | the customer calls, WhatsApps or asks for directions | `store`, `contact_method`, `via_picker` + context |
   | `view_section` | the visitor scrolls to a section (its top passes the middle of the screen) | `section` |
   | `view_store` | a store card (Madipakkam / Medavakkam) is scrolled into view | `store` |
   | `view_photo` | a store photo is opened | `store` |
   | `faq_open` | an FAQ question is opened | `question` |
   | `change_language` | English / Tamil switched | `language` |
   | `open_menu` | the menu is opened | `link_location` |
   | `ui_click` | any other tap (section links, banners, arrows, sheet Cancel…) | `element` (button text, in English), `link_location`, `link_url` |
   | **Catalogue page** | | |
   | `view_item_list` | a product list settles (search, category or price filter) | `item_list_name` (search / category / all_items), `category`, `price_band`, `search_term`, `results` |
   | `search` | a search is typed | `search_term`, `results` |
   | `search_no_results` | a search finds nothing – items people want that aren't listed | `search_term` |
   | `catalogue_filter` | a category or price button is tapped | `filter`, `value` |
   | `sort_change` | "Sort by" changed | `sort` |
   | `show_more` | "Show more" tapped | `shown`, `results`, `item_list_name` |
   | `add_to_list` | "Add to list" tapped (catalogue or lists page) | `product`, `category`, `link_location` |
   | `select_product` | a product's WhatsApp button is tapped (category = `catalogue_<category>`) | `category`, `product` |
   | **My list** | | |
   | `view_list` | My list opened | `items`, `pieces`, `value`, `currency` |
   | `list_qty_change` / `list_remove` / `list_clear` | the list is edited | `product`, `qty` / `items`, `value` |
   | `send_list_whatsapp` | "Send list on WhatsApp" tapped | `items`, `pieces`, `value` (₹), `currency` |
   | **Seer & Occasion Lists** | | |
   | `gift_finder_build` | a list is made (occasion or budget chosen) | `occasion`, `budget` |
   | `kit_change_item` / `kit_change_size` / `kit_change_qty` / `kit_remove` / `kit_restart` | the suggested list is edited | `occasion`, `kit_item`, `from_product`, `to_product`, `product`, `size`, `qty`, `budget` |
   | `gift_finder_send` | the list is sent on WhatsApp | `occasion`, `budget`, `items`, `value` (₹), `currency` |
   | **Home page** | | |
   | `select_category_item` | a category item ("Stainless steel vessels") opens the catalogue | `category`, `category_item` |
   | `select_promotion` | a seer / new home panel, budget button, occasion card or catalogue card is tapped | `promotion_name`, `occasion`, `budget`, `creative_name` |
   | `view_offer` | the old-vessels exchange card is seen on screen | `offer` |
   | `return_to_home` | the visitor comes back to the home page from the catalogue or lists | `from_page`, `method` (back / link) |

   *Context* means `link_location` (which part of the page was tapped) plus the last `category`, `product` and `occasion` the visitor tapped, so each lead shows what they were interested in. `store` is `madipakkam` or `medavakkam`.

   **Setup for the catalogue, lists and offer events** (do this once, after the steps below):
   - *Admin → Custom definitions → Create custom dimension* (scope **Event**), one for each of: `search_term`, `results`, `item_list_name`, `category`, `price_band`, `product`, `occasion`, `budget`, `kit_item`, `size`, `from_product`, `to_product`, `promotion_name`, `category_item`, `offer`, `from_page`, `link_location`, `store`, `contact_method`. (`results`, `budget`, `items`, `pieces`, `qty` can also be added as **custom metrics**.)
   - *Admin → Events → mark as key event*: `click_call`, `click_whatsapp`, `click_directions`, `send_list_whatsapp`, `gift_finder_send`. The two "send" events carry the estimated list value in ₹, so GA4 and Google Ads can show the value of enquiries, not only the count.
   - *Google Ads → Goals → Conversions → Import → Google Analytics (GA4)*: import `click_whatsapp`, `send_list_whatsapp` and `gift_finder_send` (in addition to `click_call`). Set *Value* to "Use the value from Google Analytics".
   - **Check it works**: open the site with `?ga_debug` added to the address (for example `catalogue.html?ga_debug`) and watch *Admin → DebugView* while you search, add to the list and send.

   **One-time setup in GA4** (analytics.google.com):
   - *Admin → Custom definitions → Create custom dimension* (scope **Event**), one for each of: `category`, `product`, `occasion`, `store`, `contact_method`, `link_location`, `action`, `via_picker`, `section`, `question`, `language`, `element`, `link_url`. Until these exist, the reports can't show the details (they only fill in from the day you create them).
   - *Admin → Events*: mark `click_call`, `click_whatsapp` and `click_directions` as **key events** (leads).
   - **Funnel: visit → lead.** *Explore → Funnel exploration*, leave *Make open funnel* off, steps (add several events to one step with **Or**):
     1. *Visited*: `session_start`
     2. *Browsed*: `view_category`, or `view_section` where `section` = `categories` / `occasions` / `stores`
     3. *Showed interest*: `select_category` or `select_product` or `select_occasion` or `select_location` or `view_photo` or `view_store` or `open_store_picker`
     4. *Lead*: `click_call` or `click_whatsapp` or `click_directions`

     Visitors who call straight from the top of the page skip steps 2–3, so they don't show in this funnel; the key-event count has every lead.
     *Breakdown*: `store`, `ad_click` or *Device category*. Each step shows how many dropped off before the next.
   - **Funnel: "Which store?" sheet.** 1 `open_store_picker` → 2 `click_call` or `click_whatsapp` or `click_directions`; the drop-off is people who closed the sheet (also counted as `picker_dismissed`).
   - **Funnel: which store.** 1 `view_store` → 2 `select_location` → 3 `click_call` or `click_whatsapp` or `click_directions`, with breakdown `store`.
   - **Leads by store and method.** *Explore → Free form*: rows `store`, columns `contact_method`, value *Event count*, filtered to the three `click_*` events. This shows Madipakkam vs Medavakkam by call, WhatsApp and directions.
   - **Everything people tap.** *Explore → Free form*: rows `element`, then `link_location`, value *Event count*, filtered to `ui_click`.
   - **Who contacted.** GA4 doesn't name people (that's not allowed). *Explore → User explorer* shows each anonymous visitor's taps in order, for example *view_store → select_location → click_directions*.
   - To test, open the site with `?ga_debug` at the end of the address and watch *Admin → DebugView*.

   **Ads: which leads came from an advertisement**

   When someone arrives from an ad, the site remembers it for 30 days, and every event above also carries:

   | Detail | What it holds |
   |---|---|
   | `ad_click` | `yes` if the visitor came from an ad (now or in the last 30 days), otherwise `no` |
   | `ad_source` | `google` (Google Ads), `facebook` (Meta), or the `utm_source` you set |
   | `ad_campaign` | the `utm_campaign` you set, or `google_ads` |
   | `ad_sitelink` | which sitelink was tapped (from `?sl=…`), or `(none)` |

   There is also an `ad_landing` event when the visitor arrives from an ad, with `landing_section` (for example `occ-seer`).

   One-time setup:
   - GA4 *Admin → Custom definitions*: add event-scope dimensions `ad_click`, `ad_source`, `ad_campaign`, `ad_sitelink`, `landing_section`.
   - **Count leads as Google Ads conversions:** in Google Ads, *Tools → Data manager → Google Analytics (GA4)*, then link this GA4 property. Make sure **auto-tagging** is on (*Admin → Account settings*). Then *Goals → Conversions → Import → Google Analytics (GA4) → Web* and pick `click_call`, `click_whatsapp` and `click_directions`. Google Ads then shows which ad, keyword and sitelink produced each call or WhatsApp.
   - Only if you create conversions directly in Google Ads instead of importing them: put the `AW-…` ID and labels in `adsConversion` in `js/site-config.js`. Don't import the same events as well, or each lead is counted twice.
   - **Sitelink addresses:** give each sitelink its own address with `?sl=` before the `#`, for example `https://your-domain.com/?sl=steel#cat-steel`, `?sl=seer#occ-seer`, `?sl=delivery#delivery`, `?sl=repair#services`, `?sl=stores#stores`.
   - **Facebook / Instagram ads:** add tags to the ad's website link, for example `?utm_source=facebook&utm_campaign=diwali_2026`.
   - Report: *Explore → Free form*, rows `ad_click` (or `ad_sitelink`), columns `contact_method`, value *Event count*, filtered to the `click_*` events. This shows the leads from ads against the rest.
2. **Google ratings and customer quotes.** Open each shop on Google Maps and copy:
   - the star rating and number of reviews, into `rating` and `count`
   - 2–3 real reviews, word for word, with the reviewer's first name, into `quotes`

   The "What our customers say" section stays hidden until you add these. Only use real reviews: made-up ones break Google's rules.
3. **Festival & season banners.** The site shows 2–3 banners in a swipeable row ("On now & coming up"). It picks them by today's date, so no one needs to switch them manually. `festivals` has 33 festivals with one date per year from 2026 to 2036, checked against drikpanchang.com (Chennai). Each festival has `daysBefore` (when its banner starts) and `priority` (bigger festivals win). `seasons` repeat every year (wedding seasons, Aadi, summer, school reopening, Margazhi, housewarming). **Eid dates** depend on the moon sighting, so check them each year. In 2036, add the dates for 2037 onwards.

Every WhatsApp message sent from the website starts with "Hi, I saw your website…", so you can tell which enquiries came from the site.

## Editing text
Each piece of text in `index.html` looks like this:
```html
<h3 data-ta="பித்தளை விளக்கு">Brass vilakku</h3>
```
The English text sits between the tags and the Tamil text is inside `data-ta="..."`. Change both.

**Still to confirm:** the Madipakkam address (marked `<!-- TODO -->` in `index.html`). Opening hours are set to 10:30 AM – 9:30 PM for both stores.

## Publishing for free
**Netlify (easiest):** go to https://app.netlify.com/drop and drag this whole `Website` folder onto the page. You get a free link at once, and you can connect your own domain later.

**GitHub Pages:** create a GitHub repository, upload these files, then go to *Settings → Pages → Deploy from branch → main*.

After publishing, add the website link to both stores' Google Business Profiles.

## Search engine optimisation (SEO)

**Already done in this version**
- Page title and description written for local searches ("vessel shop Madipakkam", "Medavakkam", "Chennai"), sized so Google shows them in full.
- Business details for Google (structured data in `index.html`): both stores with address, phone, map pin, opening hours, the full product list, free same-day delivery, bulk orders, mixie repair, founded 1980, plus the FAQ.
- A visible **FAQ** section (English + Tamil). Google can show these questions in search results.
- Footer lists both full addresses, phone numbers and hours, matching the Google Business Profiles exactly.
- A Tamil line in the footer that is always visible, so the shop can also be found by Tamil searches.
- Descriptive photo text (alt text) for Google Images.
- Site icon (`icons/`), link-preview image for WhatsApp/Facebook (`images/share.jpg`), `site.webmanifest`, `robots.txt`, `sitemap.xml`.

**To do after publishing (these matter most)**
1. **Web address:** replace `YOUR-DOMAIN` with the real address in `robots.txt` and `sitemap.xml`. In `index.html`, remove the comment marks around the `canonical` / `og:url` lines and put the address in.
2. **Google Search Console** (search.google.com/search-console): add the site, then submit `sitemap.xml`.
3. **Google Business Profile** for both stores: add the website link. Check that the name, address, phone and hours match the website exactly. Add photos and ask happy customers for reviews. This is the biggest factor for "near me" searches.
4. **Opening days:** the business details say both stores open 10:30 AM – 9:30 PM **every day**. If a store closes on any day, change `dayOfWeek` in `index.html`.
5. Test at search.google.com/test/rich-results by pasting the published web address.
6. **When the FAQ text changes,** update the matching FAQ answers in the business-details block at the top of `index.html`, so they match what customers see.
