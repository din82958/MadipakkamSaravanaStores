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

## Adding more photos
1. Photos are numbered `1.jpg`, `2.jpg`, `3.jpg` … in each store folder (`1.jpg` is the shop front). Add new ones with the next number.
2. Optional but recommended: put smaller copies (about 800 px wide) with the **same names** in that store's `thumbs/` folder. If there are no small copies, the site uses the full photos.
3. Add the new file name to that store's `photos` list at the top of `js/main.js`.

## Site settings: `js/site-config.js`
All the things you'll update regularly are in one file:

1. **Google Analytics.** Create a free GA4 property at analytics.google.com, copy the Measurement ID (`G-XXXXXXX`) and paste it as `analyticsId`. The site then also counts taps on Call, WhatsApp and Directions for each shop, as events named `click_call`, `click_whatsapp` and `click_directions`.
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
