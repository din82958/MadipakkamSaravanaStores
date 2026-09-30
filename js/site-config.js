/* =========================================================
   SITE SETTINGS – edit this file to update the website.
   (No coding needed: change the text between the quotes.)
   ========================================================= */
window.SITE = {

  /* ---------- 1. Google Analytics ----------
     Paste your GA4 Measurement ID (looks like "G-AB12CD34EF").
     Leave empty ("") to turn analytics off. */
  analyticsId: '',

  /* ---------- 2. Google ratings & customer quotes ----------
     Copy these from each shop's Google Maps listing.
     - rating: the star rating shown on Google, e.g. 4.6
     - count:  the number of Google reviews, e.g. 812
     - quotes: real reviews, copied word for word, with the reviewer's first name.
     The Reviews section stays hidden until at least one shop has a rating or a quote. */
  reviews: {
    madipakkam: {
      rating: null,
      count: null,
      url: 'https://maps.app.goo.gl/Lc5Mn1nZLhLbLNLt5',
      quotes: [
        // { name: 'Lakshmi', stars: 5, text: 'Paste the review text exactly as written on Google.' },
      ],
    },
    medavakkam: {
      rating: null,
      count: null,
      url: 'https://maps.app.goo.gl/SWVrHgRHAYiuGCfy9',
      quotes: [
        // { name: 'Karthik', stars: 5, text: 'Paste the review text exactly as written on Google.' },
      ],
    },
  },

  /* ---------- 3. Festival & season banners ----------
     The site shows 2–3 banners in a swipeable row under "On now & coming up".
     Order: festivals whose banner is showing today (bigger "priority" first),
     then running seasons, then festivals coming up in the next few weeks,
     then the default banner.

     FESTIVALS – each has one date per year (2026–2036, checked against drikpanchang.com, Chennai).
       daysBefore: how many days before the festival the banner starts (it shows a "X days to go" countdown)
       priority:   1–10, bigger festivals win when several are on at once
       dates:      "YYYY-MM-DD", or ["YYYY-MM-DD", N] for a festival that lasts N days (Pongal, Navaratri)
     Eid dates depend on the moon sighting – check them each year and move by a day if needed.

     SEASONS – repeat every year, "MM-DD" ranges (a range may run over New Year, e.g. Dec–Jan).
       priority 1 = only used to fill an empty slot. */
  lookAheadDays: 45,

  festivals: [
    {
      key: "new-year", daysBefore: 10, priority: 3, image: "images/medavakkam/thumbs/11.jpg",
      en: {"tag": "New Year", "title": "New Year gift sets", "text": "Dinner sets, flasks and gift sets for New Year – bulk office orders ready in one day.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "புத்தாண்டு", "title": "புத்தாண்டு பரிசு செட்கள்", "text": "புத்தாண்டுக்கு டின்னர் செட், ஃபிளாஸ்க் மற்றும் கிஃப்ட் செட் – அலுவலக மொத்த ஆர்டர்கள் ஒரே நாளில்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-01-01", "2027-01-01", "2028-01-01", "2029-01-01", "2030-01-01", "2031-01-01", "2032-01-01", "2033-01-01", "2034-01-01", "2035-01-01", "2036-01-01"],
    },
    {
      key: "bhogi", daysBefore: 7, priority: 8, image: "images/madipakkam/thumbs/5.jpg",
      en: {"tag": "Bhogi", "title": "Out with the old, in with the new", "text": "Bhogi is the day to replace old vessels. Take home new steel and brass for Pongal – free same-day delivery.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "போகி", "title": "பழையன கழிதலும் புதியன புகுதலும்", "text": "போகி அன்று பழைய பாத்திரங்களுக்குப் பதில் புதியவை. பொங்கலுக்கு புதிய எவர்சில்வர் & பித்தளை – அதே நாளில் இலவச டெலிவரி.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-01-13", "2027-01-14", "2028-01-14", "2029-01-13", "2030-01-13", "2031-01-14", "2032-01-14", "2033-01-13", "2034-01-13", "2035-01-14", "2036-01-14"],
    },
    {
      key: "pongal", daysBefore: 18, priority: 9, image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Pongal & Sankranti", "title": "Pongal panai & festival vessels", "text": "Pongal pots, brass and steel vessels for Pongal, Makar Sankranti and Lohri – everything for the festival kitchen.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "பொங்கல் & சங்கராந்தி", "title": "பொங்கல் பானை & பண்டிகை பாத்திரங்கள்", "text": "பொங்கல், மகர சங்கராந்தி மற்றும் லோஹ்ரிக்கு பொங்கல் பானை, பித்தளை மற்றும் எவர்சில்வர் பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: [["2026-01-14", 3], ["2027-01-15", 3], ["2028-01-15", 3], ["2029-01-14", 3], ["2030-01-14", 3], ["2031-01-15", 3], ["2032-01-15", 3], ["2033-01-14", 3], ["2034-01-14", 3], ["2035-01-15", 3], ["2036-01-15", 3]],
    },
    {
      key: "thai-poosam", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Thai Poosam", "title": "Lamps & pooja items", "text": "Brass vilakku, pooja plates and pooja items for Thai Poosam.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "தைப்பூசம்", "title": "விளக்குகள் & பூஜை பொருட்கள்", "text": "தைப்பூசத்திற்கு பித்தளை விளக்கு, பூஜை தட்டு மற்றும் பூஜை பொருட்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-02-01", "2027-01-22", "2028-02-09", "2029-01-30", "2030-01-19", "2031-02-06", "2032-01-27", "2033-01-16", "2034-02-03", "2035-01-23", "2036-02-11"],
    },
    {
      key: "maha-shivaratri", daysBefore: 10, priority: 5, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Maha Shivaratri", "title": "Pooja items for Shivaratri", "text": "Brass lamps, abhishekam vessels, pooja plates and diyas.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "மகா சிவராத்திரி", "title": "சிவராத்திரி பூஜை பொருட்கள்", "text": "பித்தளை விளக்கு, அபிஷேக பாத்திரங்கள், பூஜை தட்டு மற்றும் தீபங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-02-15", "2027-03-06", "2028-02-23", "2029-02-11", "2030-03-02", "2031-02-20", "2032-03-10", "2033-02-27", "2034-02-17", "2035-03-08", "2036-02-25"],
    },
    {
      key: "masi-magam", daysBefore: 7, priority: 3, image: "images/madipakkam/thumbs/6.jpg",
      en: {"tag": "Masi Magam", "title": "Pooja & temple vessels", "text": "Brass and copper vessels, lamps and pooja sets for Masi Magam.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "மாசி மகம்", "title": "பூஜை & கோவில் பாத்திரங்கள்", "text": "மாசி மகத்திற்கு பித்தளை, செம்பு பாத்திரங்கள், விளக்குகள் மற்றும் பூஜை செட்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-03", "2027-02-20", "2028-03-10", "2029-02-28", "2030-02-18", "2031-03-08", "2032-02-26", "2033-02-14", "2034-03-04", "2035-02-22", "2036-03-11"],
    },
    {
      key: "karadaiyan-nombu", daysBefore: 7, priority: 3, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Karadaiyan Nombu", "title": "Nombu pooja items", "text": "Pooja plates, brass lamps and vessels for Karadaiyan Nombu.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "காரடையான் நோன்பு", "title": "நோன்பு பூஜை பொருட்கள்", "text": "காரடையான் நோன்புக்கு பூஜை தட்டு, பித்தளை விளக்கு மற்றும் பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-14", "2027-03-15", "2028-03-14", "2029-03-14", "2030-03-14", "2031-03-15", "2032-03-14", "2033-03-14", "2034-03-14", "2035-03-15", "2036-03-14"],
    },
    {
      key: "holi", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/13.jpg",
      en: {"tag": "Holi", "title": "Serving sets for Holi", "text": "Serving bowls, plates, tumblers and gift sets for Holi get-togethers.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஹோலி", "title": "ஹோலிக்கு பரிமாறும் செட்கள்", "text": "ஹோலி கொண்டாட்டத்திற்கு கிண்ணங்கள், தட்டுகள், டம்ளர்கள் மற்றும் கிஃப்ட் செட்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-04", "2027-03-22", "2028-03-11", "2029-03-01", "2030-03-20", "2031-03-09", "2032-03-27", "2033-03-16", "2034-03-05", "2035-03-24", "2036-03-12"],
    },
    {
      key: "ugadi", daysBefore: 14, priority: 6, image: "images/medavakkam/thumbs/10.jpg",
      en: {"tag": "Ugadi & Gudi Padwa", "title": "New year, new vessels", "text": "Start the Telugu, Kannada and Marathi new year with new brass and steel vessels.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "யுகாதி & குடி பட்வா", "title": "புத்தாண்டு, புதிய பாத்திரங்கள்", "text": "தெலுங்கு, கன்னட, மராத்தி புத்தாண்டை புதிய பித்தளை மற்றும் எவர்சில்வர் பாத்திரங்களுடன் தொடங்குங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-19", "2027-04-07", "2028-03-27", "2029-04-14", "2030-04-03", "2031-03-24", "2032-04-11", "2033-03-31", "2034-03-21", "2035-04-09", "2036-03-28"],
    },
    {
      key: "panguni-uthiram", daysBefore: 7, priority: 3, image: "images/madipakkam/thumbs/6.jpg",
      en: {"tag": "Panguni Uthiram", "title": "Pooja items for Panguni Uthiram", "text": "Lamps, pooja plates and brass vessels for the temple festival.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "பங்குனி உத்திரம்", "title": "பங்குனி உத்திர பூஜை பொருட்கள்", "text": "கோவில் திருவிழாவுக்கு விளக்குகள், பூஜை தட்டு மற்றும் பித்தளை பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-04-01", "2027-03-22", "2028-04-08", "2029-03-29", "2030-03-19", "2031-04-06", "2032-03-26", "2033-04-12", "2034-04-02", "2035-03-23", "2036-04-09"],
    },
    {
      key: "ram-navami", daysBefore: 7, priority: 3, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Ram Navami", "title": "Pooja sets for Ram Navami", "text": "Pooja plates, lamps and prasadam vessels.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ராம நவமி", "title": "ராம நவமி பூஜை செட்கள்", "text": "பூஜை தட்டு, விளக்குகள் மற்றும் பிரசாத பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-26", "2027-04-15", "2028-04-03", "2029-04-23", "2030-04-12", "2031-04-01", "2032-04-19", "2033-04-07", "2034-03-28", "2035-04-16", "2036-04-05"],
    },
    {
      key: "tamil-new-year", daysBefore: 18, priority: 8, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Tamil New Year & Vishu", "title": "Puthandu, Vishu & Baisakhi", "text": "An auspicious start: new brass, copper and steel vessels, and brass uruli for Vishu kani.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "தமிழ் புத்தாண்டு & விஷு", "title": "புத்தாண்டு, விஷு & பைசாகி", "text": "மங்களகரமான தொடக்கம் – புதிய பித்தளை, செம்பு, எவர்சில்வர் பாத்திரங்கள் மற்றும் விஷுக் கனிக்கு பித்தளை உருளி.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-04-14", "2027-04-14", "2028-04-14", "2029-04-14", "2030-04-14", "2031-04-14", "2032-04-14", "2033-04-14", "2034-04-14", "2035-04-14", "2036-04-14"],
    },
    {
      key: "easter", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/13.jpg",
      en: {"tag": "Easter", "title": "Dinner sets for Easter", "text": "Dinner sets, serving ware and bakeware for Easter lunch.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஈஸ்டர்", "title": "ஈஸ்டருக்கு டின்னர் செட்கள்", "text": "ஈஸ்டர் விருந்துக்கு டின்னர் செட், பரிமாறும் பாத்திரங்கள் மற்றும் பேக்கிங் பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-04-05", "2027-03-28", "2028-04-16", "2029-04-01", "2030-04-21", "2031-04-13", "2032-03-28", "2033-04-17", "2034-04-09", "2035-03-25", "2036-04-13"],
    },
    {
      key: "eid-al-fitr", daysBefore: 14, priority: 6, image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Ramzan", "title": "Biryani handis & serving sets", "text": "Big cooking vessels, biryani handis and serving sets for Eid – bulk orders ready in one day.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ரம்ஜான்", "title": "பிரியாணி அண்டா & பரிமாறும் செட்கள்", "text": "ரம்ஜானுக்கு பெரிய சமையல் பாத்திரங்கள், பிரியாணி அண்டா மற்றும் பரிமாறும் செட்கள் – மொத்த ஆர்டர் ஒரே நாளில்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-03-20", "2027-03-10", "2028-02-27", "2029-02-15", "2030-02-05", "2031-01-25", "2032-01-14", "2033-01-03", "2033-12-23", "2034-12-12", "2035-12-02", "2036-11-20"],
    },
    {
      key: "eid-al-adha", daysBefore: 14, priority: 6, image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Bakrid", "title": "Large cooking vessels for Bakrid", "text": "Big pots, handis and serving ware – any quantity, delivered in one day.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "பக்ரீத்", "title": "பக்ரீத்துக்கு பெரிய சமையல் பாத்திரங்கள்", "text": "பெரிய பாத்திரங்கள், அண்டா மற்றும் பரிமாறும் பாத்திரங்கள் – எந்த அளவும், ஒரே நாளில் டெலிவரி.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-05-27", "2027-05-17", "2028-05-05", "2029-04-24", "2030-04-14", "2031-04-03", "2032-03-22", "2033-03-12", "2034-03-01", "2035-02-18", "2036-02-08"],
    },
    {
      key: "akshaya-tritiya", daysBefore: 14, priority: 8, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Akshaya Tritiya", "title": "An auspicious day for new vessels", "text": "Buy brass, copper and steel vessels on Akshaya Tritiya – free same-day delivery.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "அட்சய திருதியை", "title": "புதிய பாத்திரங்கள் வாங்க உகந்த நாள்", "text": "அட்சய திருதியை அன்று பித்தளை, செம்பு, எவர்சில்வர் பாத்திரங்கள் – அதே நாளில் இலவச டெலிவரி.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-04-19", "2027-05-09", "2028-04-27", "2029-05-16", "2030-05-05", "2031-04-24", "2032-05-12", "2033-05-01", "2034-04-21", "2035-05-10", "2036-04-29"],
    },
    {
      key: "varalakshmi", daysBefore: 12, priority: 6, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Varalakshmi Vratham", "title": "Kalasam, lamps & pooja sets", "text": "Brass kalasam, kuthu vilakku and pooja plates for Varalakshmi Vratham.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "வரலட்சுமி விரதம்", "title": "கலசம், விளக்குகள் & பூஜை செட்கள்", "text": "வரலட்சுமி விரதத்திற்கு பித்தளை கலசம், குத்து விளக்கு மற்றும் பூஜை தட்டுகள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-08-28", "2027-08-13", "2028-08-04", "2029-08-24", "2030-08-09", "2031-08-01", "2032-08-20", "2033-08-05", "2034-08-25", "2035-08-17", "2036-08-01"],
    },
    {
      key: "aadi-perukku", daysBefore: 7, priority: 5, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Aadi Perukku", "title": "Brass kalasam & pooja items", "text": "Pooja items and brass vessels for Aadi Perukku.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஆடிப்பெருக்கு", "title": "பித்தளை கலசம் & பூஜை பொருட்கள்", "text": "ஆடிப்பெருக்குக்கு பூஜை பொருட்கள் மற்றும் பித்தளை பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-08-03", "2027-08-03", "2028-08-02", "2029-08-02", "2030-08-03", "2031-08-03", "2032-08-02", "2033-08-03", "2034-08-03", "2035-08-03", "2036-08-02"],
    },
    {
      key: "raksha-bandhan", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/11.jpg",
      en: {"tag": "Raksha Bandhan", "title": "Gift sets for Rakhi", "text": "Steel gift sets, flasks and tiffin sets – a useful gift for every brother and sister.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ரக்ஷா பந்தன்", "title": "ராக்கிக்கு பரிசு செட்கள்", "text": "எவர்சில்வர் கிஃப்ட் செட், ஃபிளாஸ்க் மற்றும் டிபன் செட் – சகோதர சகோதரிகளுக்கு பயனுள்ள பரிசு.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-08-28", "2027-08-17", "2028-08-05", "2029-08-23", "2030-08-13", "2031-08-02", "2032-08-20", "2033-08-10", "2034-08-29", "2035-08-18", "2036-08-06"],
    },
    {
      key: "krishna-jayanthi", daysBefore: 10, priority: 5, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Krishna Jayanthi", "title": "Gokulashtami & Janmashtami", "text": "Small brass vessels, pooja sets and uri-adi pots for Krishna Jayanthi.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "கிருஷ்ண ஜெயந்தி", "title": "கோகுலாஷ்டமி & ஜன்மாஷ்டமி", "text": "கிருஷ்ண ஜெயந்திக்கு சிறிய பித்தளை பாத்திரங்கள், பூஜை செட் மற்றும் உறியடி பானைகள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-09-04", "2027-08-25", "2028-08-13", "2029-09-01", "2030-08-21", "2031-08-09", "2032-08-28", "2033-08-17", "2034-09-05", "2035-08-26", "2036-08-14"],
    },
    {
      key: "onam", daysBefore: 14, priority: 6, image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Onam", "title": "Uruli & sadhya vessels", "text": "Brass uruli, big pots and serving vessels for the Onam sadhya.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஓணம்", "title": "உருளி & சத்யா பாத்திரங்கள்", "text": "ஓண சத்யாவுக்கு பித்தளை உருளி, பெரிய பானைகள் மற்றும் பரிமாறும் பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-08-26", "2027-09-12", "2028-09-01", "2029-08-22", "2030-09-09", "2031-08-30", "2032-08-20", "2033-09-06", "2034-08-28", "2035-09-14", "2036-09-03"],
    },
    {
      key: "vinayagar-chathurthi", daysBefore: 12, priority: 7, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Vinayagar Chathurthi", "title": "Pooja items & kozhukattai steamers", "text": "Pooja plates, lamps and idli/kozhukattai steamers for Vinayagar Chathurthi.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "விநாயகர் சதுர்த்தி", "title": "பூஜை பொருட்கள் & கொழுக்கட்டை ஸ்டீமர்", "text": "விநாயகர் சதுர்த்திக்கு பூஜை தட்டு, விளக்குகள் மற்றும் இட்லி/கொழுக்கட்டை ஸ்டீமர்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-09-14", "2027-09-04", "2028-08-23", "2029-09-11", "2030-09-01", "2031-09-20", "2032-09-08", "2033-08-28", "2034-09-16", "2035-09-05", "2036-08-24"],
    },
    {
      key: "navaratri-golu", daysBefore: 18, priority: 8, image: "images/medavakkam/thumbs/5.jpg",
      en: {"tag": "Navaratri Golu", "title": "Return gifts for Golu", "text": "Steel bowls, boxes and small vessels as Golu return gifts – any quantity, ready in one day.", "cta": "Send your return-gift list"},
      ta: {"tag": "நவராத்திரி கொலு", "title": "கொலுவுக்கு ரிட்டர்ன் கிஃப்ட்", "text": "கொலு ரிட்டர்ன் கிஃப்டாக எவர்சில்வர் கிண்ணம், டப்பா மற்றும் சிறிய பாத்திரங்கள் – எந்த அளவும், ஒரே நாளில் தயார்.", "cta": "பட்டியலை அனுப்புங்கள்"},
      dates: [["2026-10-11", 10], ["2027-09-30", 10], ["2028-09-19", 9], ["2029-10-08", 9], ["2030-09-28", 9], ["2031-10-17", 9], ["2032-10-05", 10], ["2033-09-24", 10], ["2034-10-13", 10], ["2035-10-02", 10], ["2036-09-20", 10]],
    },
    {
      key: "durga-puja", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Durga Puja", "title": "Pooja items for Durga Puja", "text": "Brass lamps, pooja plates and bhog vessels.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "துர்கா பூஜை", "title": "துர்கா பூஜை பொருட்கள்", "text": "பித்தளை விளக்கு, பூஜை தட்டு மற்றும் நைவேத்திய பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-10-19", "2027-10-07", "2028-09-26", "2029-10-14", "2030-10-04", "2031-10-23", "2032-10-12", "2033-10-02", "2034-10-20", "2035-10-09", "2036-09-27"],
    },
    {
      key: "ayudha-pooja", daysBefore: 10, priority: 7, image: "images/madipakkam/thumbs/6.jpg",
      en: {"tag": "Ayudha & Saraswathi Pooja", "title": "Pooja items & office orders", "text": "Pooja items and bulk orders for homes, shops and offices – ready in one day.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஆயுத & சரஸ்வதி பூஜை", "title": "பூஜை பொருட்கள் & அலுவலக ஆர்டர்கள்", "text": "வீடு, கடை மற்றும் அலுவலகங்களுக்கு பூஜை பொருட்கள் மற்றும் மொத்த ஆர்டர்கள் – ஒரே நாளில் தயார்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-10-20", "2027-10-09", "2028-09-27", "2029-10-15", "2030-10-05", "2031-10-24", "2032-10-13", "2033-10-03", "2034-10-21", "2035-10-10", "2036-09-28"],
    },
    {
      key: "karwa-chauth", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/13.jpg",
      en: {"tag": "Karwa Chauth", "title": "Karwa, thali & sieve", "text": "Karwa pots, pooja thalis and sieves for Karwa Chauth.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "கர்வா சௌத்", "title": "கர்வா, தாலி தட்டு & சல்லடை", "text": "கர்வா சௌத்துக்கு கர்வா பானை, பூஜை தட்டு மற்றும் சல்லடை.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-10-29", "2027-10-18", "2028-10-07", "2029-10-26", "2030-10-15", "2031-11-02", "2032-10-21", "2033-10-11", "2034-10-30", "2035-10-20", "2036-10-08"],
    },
    {
      key: "dhanteras", daysBefore: 12, priority: 9, image: "images/medavakkam/thumbs/10.jpg",
      en: {"tag": "Dhanteras", "title": "The day to buy new vessels", "text": "Buying new vessels on Dhanteras brings good luck – steel, brass and copper, delivered the same day.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "தன்தேரஸ்", "title": "புதிய பாத்திரங்கள் வாங்கும் நாள்", "text": "தன்தேரஸ் அன்று புதிய பாத்திரம் வாங்குவது சுபம் – எவர்சில்வர், பித்தளை, செம்பு, அதே நாளில் டெலிவரி.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-11-06", "2027-10-27", "2028-10-15", "2029-11-04", "2030-10-24", "2031-11-12", "2032-10-31", "2033-10-20", "2034-11-08", "2035-10-28", "2036-10-17"],
    },
    {
      key: "deepavali", daysBefore: 30, priority: 10, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Deepavali", "title": "Deepavali gifting & new vessels", "text": "Brass vilakku, dinner sets, gift sets and new vessels. Bulk gift orders for families and offices.", "cta": "WhatsApp your gift list"},
      ta: {"tag": "தீபாவளி", "title": "தீபாவளி பரிசுகள் & புதிய பாத்திரங்கள்", "text": "பித்தளை விளக்கு, டின்னர் செட், கிஃப்ட் செட் மற்றும் புதிய பாத்திரங்கள். குடும்பங்கள் மற்றும் அலுவலகங்களுக்கு மொத்த பரிசு ஆர்டர்கள்.", "cta": "பரிசுப் பட்டியலை WhatsApp செய்யுங்கள்"},
      dates: ["2026-11-08", "2027-10-28", "2028-10-17", "2029-11-05", "2030-10-26", "2031-11-13", "2032-11-02", "2033-10-22", "2034-11-09", "2035-10-30", "2036-10-18"],
    },
    {
      key: "chhath-puja", daysBefore: 10, priority: 4, image: "images/madipakkam/thumbs/13.jpg",
      en: {"tag": "Chhath Puja", "title": "Soop, lota & baskets", "text": "Brass lota, soop and baskets for Chhath Puja.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "சத் பூஜை", "title": "சூப், லோட்டா & கூடைகள்", "text": "சத் பூஜைக்கு பித்தளை லோட்டா, சூப் (முறம்) மற்றும் கூடைகள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-11-15", "2027-11-04", "2028-10-23", "2029-11-11", "2030-11-01", "2031-11-20", "2032-11-09", "2033-10-29", "2034-11-17", "2035-11-06", "2036-10-25"],
    },
    {
      key: "karthigai-deepam", daysBefore: 14, priority: 7, image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Karthigai Deepam", "title": "Agal vilakku & brass lamps", "text": "Clay and brass agal vilakku, kuthu vilakku and pooja items for Karthigai Deepam.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "கார்த்திகை தீபம்", "title": "அகல் விளக்கு & பித்தளை விளக்குகள்", "text": "கார்த்திகை தீபத்திற்கு அகல் விளக்கு, குத்து விளக்கு மற்றும் பூஜை பொருட்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-11-24", "2027-12-11", "2028-12-01", "2029-11-20", "2030-12-08", "2031-11-28", "2032-12-14", "2033-12-05", "2034-11-25", "2035-12-13", "2036-12-02"],
    },
    {
      key: "vaikunta-ekadasi", daysBefore: 10, priority: 4, image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Vaikunta Ekadasi", "title": "Lamps & pooja items", "text": "Brass lamps, pooja plates and prasadam vessels for Vaikunta Ekadasi.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "வைகுண்ட ஏகாதசி", "title": "விளக்குகள் & பூஜை பொருட்கள்", "text": "வைகுண்ட ஏகாதசிக்கு பித்தளை விளக்கு, பூஜை தட்டு மற்றும் பிரசாத பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-12-20", "2028-01-08", "2028-12-27", "2030-01-15", "2031-01-04", "2031-12-24", "2033-01-11", "2034-01-01", "2034-12-22", "2036-01-10", "2036-12-29"],
    },
    {
      key: "thiruvathirai", daysBefore: 7, priority: 4, image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Thiruvathirai", "title": "Vessels for Thiruvathirai kali", "text": "Pots and vessels for Arudra Darshan festival cooking.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "திருவாதிரை", "title": "திருவாதிரைக் களிக்கு பாத்திரங்கள்", "text": "ஆருத்ரா தரிசன பண்டிகை சமையலுக்கு பானைகள் மற்றும் பாத்திரங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-01-03", "2026-12-24", "2028-01-11", "2028-12-31", "2029-12-22", "2031-01-08", "2031-12-29", "2032-12-18", "2034-01-04", "2034-12-26", "2036-01-12"],
    },
    {
      key: "christmas", daysBefore: 18, priority: 5, image: "images/medavakkam/thumbs/13.jpg",
      en: {"tag": "Christmas", "title": "Cake tins, bakeware & dinner sets", "text": "Cake tins, baking trays, dinner sets and gift sets for Christmas.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "கிறிஸ்துமஸ்", "title": "கேக் டின், பேக்கிங் & டின்னர் செட்கள்", "text": "கிறிஸ்துமஸுக்கு கேக் டின், பேக்கிங் தட்டு, டின்னர் செட் மற்றும் கிஃப்ட் செட்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
      dates: ["2026-12-25", "2027-12-25", "2028-12-25", "2029-12-25", "2030-12-25", "2031-12-25", "2032-12-25", "2033-12-25", "2034-12-25", "2035-12-25", "2036-12-25"],
    },
  ],

  seasons: [
    {
      key: "thai-weddings-plan", priority: 2, ranges: [["12-01", "01-12"]], image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Thai wedding season", "title": "Plan your seer varisai early", "text": "Weddings in Thai? Book your seer vessels now – we prepare the full set and deliver it free nearby.", "cta": "Send your seer list"},
      ta: {"tag": "தை திருமண சீசன்", "title": "சீர் வரிசையை முன்கூட்டியே திட்டமிடுங்கள்", "text": "தை மாதத்தில் திருமணமா? சீர் பாத்திரங்களை இப்போதே பதிவு செய்யுங்கள் – முழு செட்டையும் தயார் செய்து இலவசமாக டெலிவரி செய்கிறோம்.", "cta": "சீர் பட்டியலை அனுப்புங்கள்"},
    },
    {
      key: "thai-weddings", priority: 2, ranges: [["01-16", "02-28"]], image: "images/medavakkam/thumbs/9.jpg",
      en: {"tag": "Wedding season", "title": "Complete seer varisai sets", "text": "From kudam to kuthu vilakku – full seer sets for weddings, prepared and delivered in one day.", "cta": "Send your seer list"},
      ta: {"tag": "திருமண சீசன்", "title": "முழு சீர் வரிசை செட்கள்", "text": "குடம் முதல் குத்து விளக்கு வரை – திருமணத்திற்கான முழு சீர் செட், ஒரே நாளில் தயார் செய்து டெலிவரி.", "cta": "சீர் பட்டியலை அனுப்புங்கள்"},
    },
    {
      key: "summer", priority: 2, ranges: [["04-01", "05-31"]], image: "images/madipakkam/thumbs/13.jpg",
      en: {"tag": "Summer", "title": "Water drums, pots & bottles", "text": "Beat the heat – water drums, steel water pots, bottles and big containers.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "கோடை காலம்", "title": "தண்ணீர் டிரம், குடம் & பாட்டில்கள்", "text": "கோடைக்கு தண்ணீர் டிரம், எவர்சில்வர் குடம், பாட்டில்கள் மற்றும் பெரிய கண்டெய்னர்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
    },
    {
      key: "school-reopening", priority: 3, ranges: [["05-20", "06-20"]], image: "images/medavakkam/thumbs/5.jpg",
      en: {"tag": "School reopening", "title": "Tiffin boxes & water bottles", "text": "Steel tiffin boxes, lunch carriers and water bottles for the new school year.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "பள்ளி திறப்பு", "title": "டிபன் பாக்ஸ் & தண்ணீர் பாட்டில்கள்", "text": "புதிய கல்வியாண்டுக்கு எவர்சில்வர் டிபன் பாக்ஸ், லஞ்ச் கேரியர் மற்றும் தண்ணீர் பாட்டில்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
    },
    {
      key: "vaikasi-weddings", priority: 2, ranges: [["05-15", "07-10"]], image: "images/medavakkam/thumbs/9.jpg",
      en: {"tag": "Vaikasi & Aani weddings", "title": "Seer varisai & return gifts", "text": "Wedding season again – seer sets and return gifts in any quantity, delivered in one day.", "cta": "Send your list"},
      ta: {"tag": "வைகாசி & ஆனி திருமணங்கள்", "title": "சீர் வரிசை & ரிட்டர்ன் கிஃப்ட்", "text": "மீண்டும் திருமண சீசன் – சீர் செட் மற்றும் ரிட்டர்ன் கிஃப்ட், எந்த அளவும் ஒரே நாளில் டெலிவரி.", "cta": "பட்டியலை அனுப்புங்கள்"},
    },
    {
      key: "aadi", priority: 3, ranges: [["07-17", "08-16"]], image: "images/madipakkam/thumbs/5.jpg",
      en: {"tag": "Aadi month", "title": "The Aadi vessel season", "text": "The traditional time to stock up on vessels and kitchenware – visit either store.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "ஆடி மாதம்", "title": "ஆடி பாத்திர சீசன்", "text": "பாத்திரங்கள் மற்றும் சமையலறை பொருட்கள் வாங்க பாரம்பரிய காலம் – எந்த கடைக்கும் வாருங்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
    },
    {
      key: "avani-weddings", priority: 2, ranges: [["08-17", "09-16"]], image: "images/medavakkam/thumbs/12.jpg",
      en: {"tag": "Avani wedding season", "title": "Seer varisai & bulk orders", "text": "Avani weddings – complete seer sets and bulk vessel orders, ready in one day.", "cta": "Send your seer list"},
      ta: {"tag": "ஆவணி திருமண சீசன்", "title": "சீர் வரிசை & மொத்த ஆர்டர்கள்", "text": "ஆவணி திருமணங்களுக்கு முழு சீர் செட் மற்றும் மொத்த பாத்திர ஆர்டர்கள் – ஒரே நாளில் தயார்.", "cta": "சீர் பட்டியலை அனுப்புங்கள்"},
    },
    {
      key: "margazhi", priority: 2, ranges: [["12-16", "01-13"]], image: "images/medavakkam/thumbs/3.jpg",
      en: {"tag": "Margazhi", "title": "Lamps & pooja for Margazhi", "text": "Brass lamps, pooja plates and kolam-season essentials for the holy month.", "cta": "Ask on WhatsApp"},
      ta: {"tag": "மார்கழி", "title": "மார்கழிக்கு விளக்குகள் & பூஜை", "text": "புனித மாதத்திற்கு பித்தளை விளக்கு, பூஜை தட்டு மற்றும் கோல சீசன் பொருட்கள்.", "cta": "WhatsApp-ல் கேளுங்கள்"},
    },
    {
      key: "housewarming", priority: 1, ranges: [["01-15", "07-16"], ["08-17", "09-16"], ["10-18", "12-15"]], image: "images/medavakkam/thumbs/7.jpg",
      en: {"tag": "Housewarming", "title": "Housewarming sets & starter kitchens", "text": "Brass vilakku, pooja sets, new pots and a complete kitchen for your new home.", "cta": "Send your list"},
      ta: {"tag": "கிரகப்பிரவேசம்", "title": "கிரகப்பிரவேச செட் & புதிய சமையலறை", "text": "புதிய வீட்டுக்கு பித்தளை விளக்கு, பூஜை செட், புதிய பானைகள் மற்றும் முழு சமையலறை.", "cta": "பட்டியலை அனுப்புங்கள்"},
    },
  ],

  // Shown only when fewer than two banners are on
  defaultSeason: {"key": "default", "image": "images/madipakkam/thumbs/1.jpg", "showYear": false, "en": {"tag": "Weddings & functions", "title": "Bulk orders, prepared for you", "text": "Seer vessels, return gifts and housewarming sets – any quantity, ready and delivered in one day.", "cta": "WhatsApp your list"}, "ta": {"tag": "திருமணம் & விழாக்கள்", "title": "மொத்த ஆர்டர்கள், உங்களுக்காக தயார்", "text": "சீர் பாத்திரங்கள், ரிட்டர்ன் கிஃப்ட் மற்றும் கிரகப்பிரவேச செட்கள் – எந்த அளவும், ஒரே நாளில் தயார் செய்து டெலிவரி.", "cta": "பட்டியலை WhatsApp செய்யுங்கள்"}},
};
