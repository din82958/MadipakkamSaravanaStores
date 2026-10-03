// ===== Product catalogue + gift / occasion finder =====
// Items come from js/catalogue-data.js, generated from the billing stock export by
// tools/build_catalogue.py. It is loaded only when a visitor nears these sections.
// Uses helpers from main.js: $, $$, esc, lang, langHooks, track.
(function () {
  const PAGE = window.matchMedia('(max-width: 559px)').matches ? 12 : 24;   // products per "Show more" (fewer on phones)
  const LIST_KEY = 'myList';    // localStorage key for the enquiry list

  const CAT_INFO = {
    brass:      { en: 'Brass & copper',     ta: 'பித்தளை & செம்பு',       icon: 'i-pot' },
    pooja:      { en: 'Pooja & lamps',      ta: 'பூஜை & விளக்குகள்',      icon: 'i-lamp' },
    cookware:   { en: 'Cookware',           ta: 'சமையல் பாத்திரங்கள்',     icon: 'i-pan' },
    steel:      { en: 'Steel & dining',     ta: 'எவர்சில்வர் & டைனிங்',    icon: 'i-plate' },
    bottles:    { en: 'Bottles & flasks',   ta: 'பாட்டில் & ஃபிளாஸ்க்',     icon: 'i-bottle' },
    storage:    { en: 'Plastics & storage', ta: 'பிளாஸ்டிக் & சேமிப்பு',    icon: 'i-box' },
    appliances: { en: 'Appliances & stoves', ta: 'மின்சாதனங்கள் & அடுப்பு', icon: 'i-bolt' },
    home:       { en: 'Home & cleaning',    ta: 'வீடு & சுத்தம்',          icon: 'i-home' },
    toys:       { en: 'Toys',               ta: 'பொம்மைகள்',              icon: 'i-heart' },
    other:      { en: 'More items',         ta: 'மற்றவை',                 icon: 'i-tag' },
  };

  // ===== No product photos: each card gets a drawing for its type, a colour for its material and a short "what it's for" line =====
  // Product types, first match wins. [icon, words in the name (regex), use in English, use in Tamil]
  const TYPES = [
    // specific products, checked first
    ['p-cooker',    /^butterfly (2b|rhino)$/, 'For rice, dal and quick cooking', 'சாதம், பருப்பு விரைவாகச் சமைக்க'],
    ['p-perfume',   /\b(freshner|freshener|perfume|perfumes|attar|deodorant|room spray)\b/, 'For a fresh-smelling home', 'வீட்டை நறுமணமாக வைக்க'],
    ['p-clothstand', /\b(cloth stand|clothes stand|cloth dryer|cloth drying|drying stand|cloth rack|cloth hanger|dryer stand)\b/, 'For drying clothes', 'துணி உலர்த்த'],
    ['p-chimta',    /\b(chimta|cimta|chimpta|tong|tongs|pakkad|pakad|sandasi|sandasu)\b/, 'For holding hot vessels and rotis', 'சூடான பாத்திரம், ரொட்டியைப் பிடிக்க'],
    ['p-board',     /\b(cutting board|chopping board|chop board|chopping|board)\b/, 'For cutting vegetables', 'காய்கறி நறுக்க'],
    ['p-clock',     /\b(clock|clocks|alarm)\b/, 'For home and gifting', 'வீட்டுக்கும் பரிசுக்கும்'],
    ['p-cooker',     /\b(gasket|whistle)\b/, 'Spare part for pressure cookers', 'குக்கர் உதிரி பாகம்'],
    ['p-cooker',     /\b(svachh|svachh combi)\b/, 'For rice, dal and quick cooking', 'சாதம், பருப்பு விரைவாகச் சமைக்க'],
    ['p-stove',      /^premier (amiga|carina|flamma|fuchsia|glow|chic)/, 'For everyday cooking', 'தினசரி சமையலுக்கு'],
    ['p-agarbathi',  /\b(thubakkal|thubhakal|thubhakkal)\b/, 'For sambrani and dhoop', 'சாம்பிராணி, தூபத்துக்கு'],
    ['p-agal',       /\bpooja set\b/, 'For a complete pooja', 'முழுமையான பூஜைக்கு'],
    ['p-trishul',    /\b(shank|shanku|chakar|chakra)\b/, 'For pooja', 'பூஜைக்கு'],
    ['p-bucket',     /\b(thukku|thuku|sthuku)\b/, 'For carrying oil, milk and water', 'எண்ணெய், பால், தண்ணீர் எடுத்துச் செல்ல'],
    ['p-stool',      /\b(patla)\b/, 'For sitting and standing on', 'அமர, ஏறி நிற்க'],
    ['p-broom',      /\b(mopstic|smop|broomstick|dustar|scruber|scrubby|spong|steel pad|sink scrap|eazy clean)\b/, 'For cleaning', 'சுத்தம் செய்ய'],
    ['p-cover',      /\b(food cover|fruit cover|cling wrap|wrapping)\b/, 'Keeps food fresh and covered', 'உணவைப் புதிதாக, மூடி வைக்க'],
    ['p-cover',      /\b(cover|b\/cover|t\.cover)\b/, 'Protective cover', 'பாதுகாப்பு உறை'],
    ['p-handi',      /^(glass |dosa |kadai )?(lid|mudi)$|\bmudi$/, 'For covering vessels', 'பாத்திரங்களை மூட'],
    ['p-handi',      /\b(combo|silicon set|wonder chef|royal touch)\b/, 'Value combo set', 'சிக்கன காம்போ செட்'],
    ['p-handi',      /\b(aadukku|aaduku|adiukku)\b/, 'For cooking and serving', 'சமைக்க, பரிமாற'],
    ['p-dabbara',    /\bdabbra\b/, 'For filter coffee', 'ஃபில்டர் காபிக்கு'],
    ['p-basket',     /(washkudai|pookoodai)/, 'For storage and shopping', 'சேமிப்பு, கடைக்கு'],
    ['p-drum',       /\b(rice trum|trum)\b/, 'For storing rice and grains', 'அரிசி, தானியம் சேமிக்க'],
    ['p-container',  /container\d|\b(daba|sprout maker)\b/, 'For kitchen storage', 'சமையலறை சேமிப்புக்கு'],
    ['p-board',      /\bchoping\b/, 'For cutting vegetables', 'காய்கறி நறுக்க'],
    ['p-strainer',   /(vegfilter|paneer maker)/, 'For straining and draining', 'வடிகட்ட'],
    ['p-tawa',       /\bfulka\b/, 'For phulka and chapathi', 'புல்கா, சப்பாத்திக்கு'],
    ['p-mould',      /\bmodak\b/, 'For modak and sweets', 'மோதகம், இனிப்புகளுக்கு'],
    ['p-oilcan',     /\bvenus celo\b/, 'For drinking water', 'குடிநீருக்கு'],
    ['p-hanger',     /\b(key holder|ket holder)\b|^holder$/, 'For keys and small things', 'சாவி, சிறிய பொருட்களுக்கு'],
    ['p-shower',     /\b(hose|pipe)\b/, 'For the bathroom and washing machine', 'குளியலறை, சலவை இயந்திரத்துக்கு'],
    ['p-umbrella',   /\brain coat\b/, 'For rain', 'மழைக்கு'],
    ['p-tumbler',    /\b(straw|straws)\b/, 'For drinks', 'பானங்களுக்கு'],
    ['p-photo',      /\b(wall sticker|waall sticker|wll stickers|stickers?)\b/, 'For wall décor', 'சுவர் அலங்காரத்துக்கு'],
    ['p-rack',       /\bnovelty compact\b/, 'For organising your home', 'வீட்டை ஒழுங்குபடுத்த'],
    ['p-milkboiler', /\b(milk boiler|milk pot|milk cooker|milk cookr)\b/, 'For boiling milk without spilling', 'பால் பொங்காமல் காய்ச்ச'],
    ['p-towel',      /\b(table cloth|car towel)\b/, 'For wiping and drying', 'துடைக்க, உலர்த்த'],
    ['p-glove',      /\b(gloves?|glouse|mitt|apron)\b/, 'For safe handling in the kitchen', 'பாதுகாப்பாகக் கையாள'],
    ['p-iron',       /\b(dry iron|steam iron|steamy iron|iron box|ironbox|ironing)\b/, 'For ironing clothes', 'துணி அயர்ன் செய்ய'],
    ['p-hairdryer',  /\b(hair dryer|dryer|trimmer)\b/, 'For grooming', 'அழகுபடுத்த'],
    ['p-oven',       /\b(otg|oven|air fryer|airfryer|granite ot)\b/, 'For baking, grilling and air frying', 'பேக், கிரில், ஏர் ஃப்ரை செய்ய'],
    ['p-toaster',    /\b(toaster|sandwich|sandwitch|multi maker|vada maker)\b/, 'For toast and sandwiches', 'டோஸ்ட், சாண்ட்விச் செய்ய'],
    ['p-coffeefilter', /\b(coffee filter|coffee maker|percolator|perculator|perculatator)\b/, 'For filter coffee decoction', 'ஃபில்டர் காபி டிகாக்ஷனுக்கு'],
    ['p-fan',        /\b(fan|fans|ceiling|pedestal|exhaust|visiri|star drift|hi speed|high speed|hispeed)\b/, 'Keeps you cool', 'குளிர்ச்சியாக வைக்க'],
    ['p-heater',     /\b(heater|geyser|immersion)\b/, 'For hot water', 'சுடுநீருக்கு'],
    ['p-spray',      /\b(spray|sprayer|repellent|trap|ant powder|termite|cockroach)\b/, 'For pest control and cleaning', 'பூச்சி ஒழிப்பு, சுத்தம் செய்ய'],
    ['p-scale',      /\b(scale|scales|weighing)\b/, 'For weighing', 'எடை பார்க்க'],
    ['p-stove',      /\b(\d\s?\.?b{1,2}|kcp|cook ?top|indicook|ind express)\b/, 'For everyday cooking', 'தினசரி சமையலுக்கு'],
    ['p-mixie',      /\b(\dj|mini blend|nutrifit|nutri fit|mg)\b/, 'For grinding and blending', 'அரைக்க, கலக்க'],
    ['p-squeezer',   /\b(squeezer|sqeezer|citrus)\b/, 'For squeezing lemons and oranges', 'எலுமிச்சை, ஆரஞ்சு பிழிய'],
    ['p-cooker',     /\b(blue line|cute|standard|standart|spil free|spillfree|jiffy|curve|matchless|argent|cokker|cook n save)\b|^(prestige|triply \d|judge deluxe|butterfly (plus|stand|standard))/, 'For rice, dal and quick cooking', 'சாதம், பருப்பு விரைவாகச் சமைக்க'],
    ['p-paniyaram',  /(paniy|panitaram|paniniyarkal|\bkuli\b|kuzhi|kuzi|appampan|appakadai)/, 'For paniyaram and appam', 'பணியாரம், அப்பம் செய்ய'],
    ['p-pan',        /tadkapan/, 'For frying and tempering', 'வறுக்க, தாளிக்க'],
    ['p-tawa',       /\b(skilet|nstawa)/, 'For dosa and chapathi', 'தோசை, சப்பாத்திக்கு'],
    ['p-kolam',      /\bkolam\b/, 'For kolam designs', 'கோலம் போட'],
    ['p-strainer',   /\b(strainer|stainer|stariner|filter|jaladai|jalladai|colander|drainer|jali|vadi|vadikatti|vadikati|jara|jaara|annakudai|annakoodai|catridges)\b/, 'For straining and draining', 'வடிகட்ட'],
    ['p-press',      /\bpuri press\b/, 'For puri and chapathi', 'பூரி, சப்பாத்திக்கு'],
    ['p-knife',      /\b(garlic press|kathi|dicer|chipser|silcer|slicer|opener|breaker|scraper|scrapper|sharpener|greater|grater|cut & chop)\b/, 'For cutting and prep', 'நறுக்க, தயார் செய்ய'],
    ['p-press',      /(achu|\bachi\b|achchu|murukku|muruku|press|seva nazhi|sevai)/, 'For murukku and snacks', 'முறுக்கு, பலகாரத்துக்கு'],
    ['p-mould',      /\b(mould|mold|moulds|cake|kulfi)\b/, 'For cakes and sweets', 'கேக், இனிப்புகளுக்கு'],
    ['p-rolling',    /\b(polpat|puri manai|belan|balan|belon|belen|rolling)\b/, 'For rolling chapathi and puri', 'சப்பாத்தி, பூரி தேய்க்க'],
    ['p-arivalmanai', /\b(arival manai|arivalmanai|aruvamanai|aruval)\b/, 'Traditional vegetable cutter', 'பாரம்பரிய காய் நறுக்கி'],
    ['p-manai',      /\bmanai\b/, 'Low seat for pooja and functions', 'பூஜை, விசேஷங்களுக்கான மணை'],
    ['p-muram',      /\bmuram\b/, 'For cleaning rice and grains', 'அரிசி, தானியம் புடைக்க'],
    ['p-churner',    /\b(mathu|maththu|matthu|kalithuduppu|thuduppu|thudupu)\b/, 'For churning buttermilk', 'மோர் கடைய'],
    ['p-ural',       /\b(ural|pepper crush|crusher|mortar|ammi)\b/, 'For pounding and crushing', 'இடிக்க, நசுக்க'],
    ['p-lighter',    /\blighter\b/, 'For lighting the stove', 'அடுப்பைப் பற்ற வைக்க'],
    ['p-cylinder',   /\b(gas trolley|gas trolly|gas tube|gas refiler|lpg|cylinder)\b/, 'For your gas cylinder', 'கேஸ் சிலிண்டருக்கு'],
    ['p-grill',      /\b(grill|barbecue|roaster|skewer)\b/, 'For grilling and roasting', 'கிரில் செய்ய, சுட'],
    ['p-homa',       /\b(homa|oma|omakundam|kundam)\b/, 'For homam', 'ஹோமத்துக்கு'],
    ['p-panchapathram', /(pancha|panja|pacha)\s?pathiram|panjapathiram/, 'For pooja water (theertham)', 'பூஜை தீர்த்தத்துக்கு'],
    ['p-photo',      /\b(photo|picher|picture|frame)\b/, 'For the pooja room', 'பூஜை அறைக்கு'],
    ['p-lantern',    /\b(emergency|lantern|candle|serial lights|lights)\b/, 'For light at home', 'வீட்டில் வெளிச்சத்துக்கு'],
    ['p-agal',       /\b(deep(?! kadai)|depam|deepam|lamp|aarthi|arthi)\b/, 'For deepam and pooja', 'தீபம், பூஜைக்கு'],
    ['p-trishul',    /\b(tirisulam|trisulam|trishul|vel)\b/, 'For pooja', 'பூஜைக்கு'],
    ['p-idol',       /\b(vigraham|vikraham|vighraham|ashtalakshmi|amman|mugam|pillaiyar|pillayar|idol|statue)\b/, 'For the pooja room', 'பூஜை அறைக்கு'],
    ['p-chimil',     /\b(chimil|simizh|simiz|chimizh|pelen|sandana|vibuthi|vibothi|madal|kasu)\b|sandanapelen/, 'For kumkum, sandal and vibhuti', 'குங்குமம், சந்தனம், விபூதிக்கு'],
    ['p-undiyal',    /\b(undiyal|undial|hundi)\b/, 'For savings and offerings', 'சேமிப்பு, காணிக்கைக்கு'],
    ['p-plant',      /\b(tulasi|thulasi|maadam|plant|flower pot|planter)\b/, 'For plants and décor', 'செடி, அலங்காரத்துக்கு'],
    ['i-gift',       /\b(gift|show piece|showpiece)\b/, 'For gifting', 'பரிசளிக்க'],
    ['p-bell',       /\b(jalra|chanting|divine voice|horn)\b/, 'For pooja and bhajans', 'பூஜை, பஜனைக்கு'],
    ['p-shaker',     /\b(salt|pepper|shaker)\b/, 'For the dining table', 'சாப்பாட்டு மேசைக்கு'],
    ['p-jug',        /\b(juice set|juice|kindi)\b/, 'For water and juice', 'தண்ணீர், ஜூஸுக்கு'],
    ['p-ladle',      /\b(spone|spoon|beater|scoop|scoope|scoup|masher|mesar|meshar|separator|seprator|fork|forks|cutlery|whisker|laddel|leddle)\b/, 'For cooking and serving', 'சமைக்க, பரிமாற'],
    ['p-funnel',     /\b(punal|funnel|cone|con)\b/, 'For pouring without spills', 'சிந்தாமல் ஊற்ற'],
    ['p-kudam',      /\b(kooja|kuja|matka|mutka|smbu|somu|kubera paanai|kubera panai)\b/, 'For water, pooja and seer', 'தண்ணீர், பூஜை, சீர் வரிசைக்கு'],
    ['p-dabbara',    /\b(tabara|dabbarars)\b/, 'For filter coffee', 'ஃபில்டர் காபிக்கு'],
    ['p-bowl',       /\b(basin|parath)\b/, 'For washing and mixing', 'கழுவ, கலக்க'],
    ['p-tumbler',    /\bpadi\b/, 'For measuring grains', 'தானியம் அளக்க'],
    ['p-tumbler',    /\bglassware\b/, 'For water, juice and drinks', 'தண்ணீர், ஜூஸ், பானங்களுக்கு'],
    ['p-kettle',     /\b(quick boil|kattle)\b/, 'For boiling water, tea and coffee', 'தண்ணீர், டீ, காபிக்கு'],
    ['p-bottle',     /\b(sunpet|ringo|charmy|beverage|eco beach|eco stream|fame|kids zee|duro|easy style|flip style|life style|instyle|superb|bottlers)\b/, 'For water on the go', 'தண்ணீர் எடுத்துச் செல்ல'],
    ['p-casserole',  /\b(hot pot|hot bx|hotmate|hot stand)\b/, 'Keeps food hot', 'உணவைச் சூடாக வைக்க'],
    ['p-container',  /\b(tin|dabbi|dabba\d?|cont|magnum|stacko|max fresh|food fresh|screw|petti|dhara|klip|oppo|see thru|tiny wonder|jaggery|freeze)\b|jaadi/, 'For kitchen storage', 'சமையலறை சேமிப்புக்கு'],
    ['p-ball',       /\b(naphthalane|naphthalene|naphthlane|napthalene|napthalin|napthelene)\b/, 'Keeps insects away from clothes', 'துணிகளைப் பூச்சியிலிருந்து காக்க'],
    ['p-ball',       /\bwashing balls?\b/, 'For the washing machine', 'சலவை இயந்திரத்துக்கு'],
    ['p-racket',     /\bmosquito bat\b/, 'For swatting mosquitoes', 'கொசு அடிக்க'],
    ['p-racket',     /\b(bat|racket|shuttle|cock|cocks)\b/, 'For sports and play', 'விளையாட்டுக்கு'],
    ['p-game',       /\b(chess|ludo|uno|cards|puzzle|housie|games|pallagguli|pallagguly|pallanguli)\b/, 'For family games', 'குடும்ப விளையாட்டுக்கு'],
    ['p-soap',       /\b(soap|soaps)\b/, 'For washing', 'கழுவ'],
    ['p-mat',        /\b(mat|mats|carpet|paai|pai|korai|coir|rubber sheet|non slip|non flip)\b/, 'For floors and comfort', 'தரை, வசதிக்கு'],
    ['p-pillow',     /\b(pillow|pillows|pllow|cervical)\b/, 'For restful sleep', 'நிம்மதியான தூக்கத்துக்கு'],
    ['p-cradle',     /\b(thottil|thotil|thottle|cradle|rocker)\b/, 'For the baby to sleep', 'குழந்தை தூங்க'],
    ['p-baby',       /\b(baby|potty|feeder|walker|toilet seat)\b/, 'For babies', 'குழந்தைகளுக்கு'],
    ['p-net',        /\b(mosquito net|musquito net|net|tent)\b/, 'Keeps mosquitoes away', 'கொசுக்களைத் தடுக்க'],
    ['p-mirror',     /\bmirror\b/, 'For your dressing area', 'அலங்காரத்துக்கு'],
    ['p-comb',       /\b(comb|combs)\b/, 'For hair care', 'முடி பராமரிப்புக்கு'],
    ['p-ladder',     /\bladder\b/, 'For reaching high places', 'உயரத்தை எட்ட'],
    ['p-lock',       /\b(lock|key chain|padlock)\b/, 'For safety', 'பாதுகாப்புக்கு'],
    ['p-tape',       /\b(tape|glue)\b/, 'For fixing and measuring', 'ஒட்ட, அளக்க'],
    ['p-curtain',    /\b(curtain|screen)\b/, 'For windows and doors', 'ஜன்னல், கதவுகளுக்கு'],
    ['p-plunger',    /\bplunger\b/, 'For unblocking drains', 'அடைப்பை நீக்க'],
    ['p-hanger',     /\b(hanger|hook|hooks|s hook)\b|s\.hook/, 'For hanging clothes and things', 'துணி, பொருட்களைத் தொங்கவிட'],
    ['p-clip',       /\b(clip|clips|peg|pegs)\b/, 'For clipping and sealing', 'கிளிப் செய்ய'],
    ['p-stool',      /\b(teapoy|tea poy|desk)\b/, 'For home use', 'வீட்டு உபயோகத்துக்கு'],
    ['p-plug',       /\b(socket|plug|extension|battery)\b/, 'For electrical use', 'மின் உபயோகத்துக்கு'],
    ['p-pump',       /\bpump\b/, 'For pumping liquids', 'திரவம் இறைக்க'],
    ['p-cooker',    /\b(pressure|cooker|cookers)\b/, 'For rice, dal and quick cooking', 'சாதம், பருப்பு விரைவாகச் சமைக்க'],
    ['p-idly',      /\b(idly|idli|idy|idlypot|idiyappam|idiyappa|yappam|puttu|steamer)\b/, 'For idly and steaming', 'இட்லி, ஆவியில் வேகவைக்க'],
    ['p-mixie',     /\b(mixie|mixer|mixi|grinder|blender|juicer|nutriblender|chopper)\b/, 'For grinding and blending', 'அரைக்க, கலக்க'],
    ['p-stove',     /\b(stove|burner|induction|cooktop|hob)\b/, 'For everyday cooking', 'தினசரி சமையலுக்கு'],
    ['p-kettle',    /\b(kettle)\b/, 'For boiling water, tea and coffee', 'தண்ணீர், டீ, காபிக்கு'],
    ['p-tawa',      /\b(tawa|tava|dosa|skillet|griddle|roti)\b/, 'For dosa and chapathi', 'தோசை, சப்பாத்திக்கு'],
    ['p-pan',       /\b(fry ?pan|frypan|paniyaram|paniyarakal|kulipaniyaram|appam|appachetty|appachatty|tadka|sauce ?pan|saucepan|pan)\b/, 'For frying and tempering', 'வறுக்க, தாளிக்க'],
    ['p-kadai',       /\b(kadai|kadhai|karahi|wok|pawali)\b/, 'For frying and sabzi', 'பொரியல், வறுவலுக்கு'],
    ['p-agarbathi', /\b(agarbathi|agarpathi|agarbatti|bathi|baththi|incense)\b/, 'For incense and pooja', 'ஊதுபத்தி, பூஜைக்கு'],
    ['p-agarbathi', /\b(sambrani|dhoop|dhoopakkal|dhubakkal|dubakkal|dubbakkal)\b/, 'For sambrani and dhoop', 'சாம்பிராணி, தூபத்துக்கு'],
    ['p-vilakku',   /\b(kuthu|nilavilakku|kerala vilakku|vilakku)\b/, 'For pooja and festivals', 'பூஜை, பண்டிகைகளுக்கு'],
    ['p-agal',      /\b(agal|deepam|diya|kamatchi|kamachi|kamatch|arathi|aarathi)\b/, 'For deepam and pooja', 'தீபம், பூஜைக்கு'],
    ['p-bell',      /\b(bell|mani)\b/, 'For pooja', 'பூஜைக்கு'],
    ['p-urli',      /\b(urli|uruli|urly)\b/, 'For pooja and décor', 'பூஜை, அலங்காரத்துக்கு'],
    ['p-kudam',       /\b(kudam|sombu|chombu|lota|kalasam|kalash|panchapathram|panchapathiram)\b/, 'For water, pooja and seer', 'தண்ணீர், பூஜை, சீர் வரிசைக்கு'],
    ['p-drum',      /\b(anda|andaan|gundan|drum|barrel)\b/, 'For bulk cooking and storage', 'மொத்த சமையல், சேமிப்புக்கு'],
    ['p-handi',     /\b(tope|handi|handy|vessel|patila|degchi|biryani|sambadam|kundan|adukku|aduku|thavala|thavalai|tavala|tavalai|tawala|thava)\b/, 'For cooking and serving', 'சமைக்க, பரிமாற'],
    ['p-dabbara',   /\b(dabbara|davara|dabara|dabra)\b/, 'For filter coffee', 'ஃபில்டர் காபிக்கு'],
    ['p-tumbler',   /\b(tumbler|tumblers|glass)\b/, 'For water, coffee and tea', 'தண்ணீர், காபி, டீக்கு'],
    ['p-mug',       /\b(mug|cup|cups|saucer)\b/, 'For tea and coffee', 'டீ, காபிக்கு'],
    ['p-jug',       /\b(jug|carafe|pitcher)\b/, 'For water and juice', 'தண்ணீர், ஜூஸுக்கு'],
    ['p-casserole', /\b(casserole|casseroles|casse|hot ?box|hotbox|hotpot|hot pack|hotpack|hot case)\b/, 'Keeps food hot', 'உணவைச் சூடாக வைக்க'],
    ['p-tiffin',    /\b(tiffin|tiffins|lunch|carrier|bento|meal)\b/, 'For lunch and travel', 'மதிய உணவு, பயணத்துக்கு'],
    ['p-bottle',    /\b(bottle|bottles|flask|sipper|thermo|milton)\b/, 'For water on the go', 'தண்ணீர் எடுத்துச் செல்ல'],
    ['p-plate',     /\b(plate|plates|thali|thattu|dinner|tray)\b/, 'For dining and serving', 'சாப்பிட, பரிமாற'],
    ['p-bowl',      /\b(bowl|bowls|kinnam|katori)\b/, 'For serving and mixing', 'பரிமாற, கலக்க'],
    ['p-bucket',    /\b(bucket|vali|tub|tubs)\b/, 'For water and bathroom', 'தண்ணீர், குளியலறைக்கு'],
    ['p-basket',    /\b(basket|baskets|koodai|kudai|crate)\b/, 'For storage and shopping', 'சேமிப்பு, கடைக்கு'],
    ['p-container', /\b(container|containers|jar|jars|jaadi|jadi|dabba|canister|storewell|box)\b/, 'For kitchen storage', 'சமையலறை சேமிப்புக்கு'],
    ['p-ladle',     /\b(laddle|ladle|karandi|spoon|spoons|spatula|scoop|whisk|masher)\b/, 'For cooking and serving', 'சமைக்க, பரிமாற'],
    ['p-knife',     /\b(knife|knives|cutter|peeler|grater|slicer|scissor|scissors)\b/, 'For cutting and prep', 'நறுக்க, தயார் செய்ய'],
    ['p-stool',     /\b(chair|chairs|stool|table)\b/, 'For home seating', 'வீட்டில் அமர'],
    ['p-broom',     /\b(mop|broom|brush|wiper|duster|scrub|scrubber)\b/, 'For cleaning', 'சுத்தம் செய்ய'],
    ['p-umbrella',  /\b(umbrella)\b/, 'For rain and sun', 'மழை, வெயிலுக்கு'],
    // general words, checked last so the specific rules above win
    ['p-handi',      /\b(pot|pots|cookpot|cookware|chatti|chati|satti|panai|paanai|lagan|kundu|wana|vana|vanna|devsa|dewsa|dewasa|deksha|daksha|dope|thavali|biriyani|briyani|kumcha|kriva|anodised)\b/, 'For cooking and serving', 'சமைக்க, பரிமாற'],
    ['p-bed',        /\b(bedsheet|bed sheet|comforter|mattress|latex|fitted|katil|kattal|cot|bed)\b/, 'For a comfortable bed', 'வசதியான படுக்கைக்கு'],
    ['p-cleaner',    /\b(cleaner|liquid|detergent|phenyle|phenayle|pinail|sanitizer|polish|softner|conditioner|bleaching|acid|wash|powder|remover|shine|metklin|floorosol|dishwash)\b/, 'For cleaning and washing', 'சுத்தம், சலவைக்கு'],
    ['p-towel',      /\b(towel|towels|cloth|tissue|tissues|wipes|wipe|napkin|loofan|loofah)\b/, 'For wiping and drying', 'துடைக்க, உலர்த்த'],
    ['p-shower',     /\b(shower|tap|bath|bathroom)\b/, 'For the bathroom', 'குளியலறைக்கு'],
    ['p-plate',      /\b(dish|leaf plae|coaster)\b|plate\d+/, 'For dining and serving', 'சாப்பிட, பரிமாற'],
    ['p-car',        /\b(car|cars|truck|train|cycle|tricycle|plane|robot|jeep|bike|vandi|motor)\b/, 'For kids to play', 'குழந்தைகள் விளையாட'],
    ['p-ball',       /\b(ball|balls|bowling|cricket)\b/, 'For sports and play', 'விளையாட்டுக்கு'],
    ['p-toy',        /\b(toy|toys|duck|penguin|cactus|princess|yoyo|teddy|doll|fishing|avengers|warrior|terminator|monkey|crab|reptile|cartoon)\b/, 'For kids to play', 'குழந்தைகள் விளையாட'],
    ['p-bag',        /\b(bag|bags|pouch|case|jute)\b/, 'For carrying and storing', 'எடுத்துச் செல்ல, சேமிக்க'],
    ['p-dustbin',    /\b(dustbin|bin|waste|garbage|carbage|trash)\b/, 'For waste', 'குப்பைக்கு'],
    ['p-oilcan',     /\b(water can|watar can|watering can)\b/, 'For drinking water', 'குடிநீருக்கு'],
    ['p-oilcan',     /\b(oil can|oilcan|oil cane|can|dispenser|pourer|tea can)\b/, 'For oil and liquids', 'எண்ணெய், திரவங்களுக்கு'],
    ['p-rack',       /\b(rack|racks|shelf|self|stand|stands|stant|drawer|cupboard|trolley|organiser|organizer)\b/, 'For organising your home', 'வீட்டை ஒழுங்குபடுத்த'],
  ];
  // Material from the name: tile colour + label
  const MATERIALS = [
    ['triply',    /\btriply\b/, 'Triply', 'ட்ரைபிளை'],
    ['nonstick',  /\bnon[- ]?stick\b/, 'Non-stick', 'நான்-ஸ்டிக்'],
    ['castiron',  /\bcast iron\b/, 'Cast iron', 'வார்ப்பிரும்பு'],
    ['brass',     /\b(brass|pithalai)\b/, 'Brass', 'பித்தளை'],
    ['bronze',    /\b(bronze|vengala|vengalam|panchaloha)\b/, 'Bronze', 'வெண்கலம்'],
    ['copper',    /\b(copper|coppar)\b/, 'Copper', 'செம்பு'],
    ['steel',     /\b(stainless steel|steel)\b/, 'Stainless steel', 'எவர்சில்வர்'],
    ['aluminium', /\b(aluminium|aluminum)\b/, 'Aluminium', 'அலுமினியம்'],
    ['iron',      /\biron\b(?! box)/, 'Iron', 'இரும்பு'],
    ['wood',      /\b(wood|wooden|bamboo|neem)\b/, 'Wooden', 'மரம்'],
    ['clay',      /\b(clay|mud|mann|terracotta)\b/, 'Clay', 'மண்'],
    ['glass',     /\b(glassware|borosilicate|glass)\b/, 'Glass', 'கண்ணாடி'],
    ['ceramic',   /\b(ceramic|melamine|porcelain)\b/, 'Ceramic', 'பீங்கான்'],
    ['plastic',   /\b(plastic|pvc)\b/, 'Plastic', 'பிளாஸ்டிக்'],
  ];
  function describe(name, cat) {
    const n = name.toLowerCase();
    const type = TYPES.find(tp => tp[1].test(n));
    let mat = MATERIALS.find(m => m[1].test(n));
    if (!mat && cat === 'storage' && (!type || ['p-bucket', 'p-basket', 'p-container'].includes(type[0])))
      mat = MATERIALS.find(m => m[0] === 'plastic');   // buckets, tubs, baskets are mostly plastic
    // a few bright colours for plastic, so a list of buckets isn't all one colour
    const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 4;
    return { icon: type ? type[0] : null, use: type ? { en: type[2], ta: type[3] } : null, mat: mat ? { id: mat[0], en: mat[2], ta: mat[3] } : null, hue };
  }

  const PRICES = [
    { id: 'u99',   en: 'Under ₹100',      ta: '₹100-க்குள்',    lo: 0,    hi: 99 },
    { id: 'u500',  en: '₹100 – ₹499',     ta: '₹100 – ₹499',   lo: 100,  hi: 499 },
    { id: 'u2000', en: '₹500 – ₹1,999',   ta: '₹500 – ₹1,999', lo: 500,  hi: 1999 },
    { id: 'p2000', en: '₹2,000 & above',  ta: '₹2,000 மேல்',    lo: 2000, hi: Infinity },
  ];

  const SORTS = [
    { id: 'relevance', en: 'Best match',        ta: 'பொருத்தமானவை' },
    { id: 'new',       en: 'New arrivals first', ta: 'புதிய வரவுகள்' },
    { id: 'low',       en: 'Price: low to high', ta: 'விலை: குறைவு → அதிகம்' },
    { id: 'high',      en: 'Price: high to low', ta: 'விலை: அதிகம் → குறைவு' },
    { id: 'az',        en: 'Name: A to Z',       ta: 'பெயர்: A → Z' },
  ];

  const T = {
    placeholder: { en: 'Search “idly pot”, “vilakku”…', ta: 'தேடுங்கள்: “இட்லி”, “விளக்கு”…' },
    all:        { en: 'All', ta: 'அனைத்தும்' },
    anyPrice:   { en: 'Any price', ta: 'எந்த விலையும்' },
    loading:    { en: 'Loading our items…', ta: 'பொருட்கள் ஏற்றப்படுகின்றன…' },
    loadFail:   { en: 'Couldn’t load the item list. Please ask us on WhatsApp – we’ll help right away.', ta: 'பட்டியலை ஏற்ற முடியவில்லை. WhatsApp-ல் கேளுங்கள் – உடனே உதவுகிறோம்.' },
    count:      { en: (n, total) => `Showing ${n} of ${total} items`, ta: (n, total) => `${total} பொருட்களில் ${n} காட்டப்படுகின்றன` },
    found:      { en: (n) => `${n} item${n === 1 ? '' : 's'} found`, ta: (n) => `${n} பொருட்கள் கிடைத்தன` },
    none:       { en: 'No match in our list – but we probably have it. Ask us on WhatsApp!', ta: 'பட்டியலில் இல்லை – ஆனால் பெரும்பாலும் எங்களிடம் இருக்கும். WhatsApp-ல் கேளுங்கள்!' },
    askThis:    { en: 'Ask about it', ta: 'கேளுங்கள்' },
    more:       { en: (n) => `Show more (${n} left)`, ta: (n) => `மேலும் காட்டு (${n})` },
    clear:      { en: 'Clear filters', ta: 'வடிகட்டிகளை நீக்கு' },
    sizes:      { en: (n) => `${n} sizes`, ta: (n) => `${n} அளவுகள்` },
    isNew:      { en: 'New', ta: 'புதிது' },
    ask:        { en: 'Ask', ta: 'கேள்' },
    add:        { en: 'Add to list', ta: 'பட்டியலில் சேர்' },
    added:      { en: 'In your list', ta: 'பட்டியலில் உள்ளது' },
    from:       { en: 'from', ta: 'முதல்' },
    // list
    myList:     { en: 'My list', ta: 'என் பட்டியல்' },
    listNote:   { en: 'Send this list to the store on WhatsApp – we’ll confirm prices, stock and delivery.', ta: 'இந்தப் பட்டியலை WhatsApp-ல் கடைக்கு அனுப்புங்கள் – விலை, இருப்பு மற்றும் டெலிவரியை உறுதி செய்கிறோம்.' },
    listEmpty:  { en: 'Your list is empty. Tap “Add to list” on any item.', ta: 'பட்டியல் காலியாக உள்ளது. எந்தப் பொருளிலும் “பட்டியலில் சேர்” என்பதைத் தொடுங்கள்.' },
    estTotal:   { en: 'Estimated total', ta: 'தோராய மொத்தம்' },
    sendList:   { en: 'Send list on WhatsApp', ta: 'பட்டியலை WhatsApp-ல் அனுப்பு' },
    clearList:  { en: 'Clear list', ta: 'பட்டியலை அழி' },
    close:      { en: 'Close', ta: 'மூடு' },
    remove:     { en: 'Remove', ta: 'நீக்கு' },
    toastAdd:   { en: 'Added to your list', ta: 'பட்டியலில் சேர்க்கப்பட்டது' },
    toastAll:   { en: (n) => `${n} items added to your list`, ta: (n) => `${n} பொருட்கள் பட்டியலில் சேர்க்கப்பட்டன` },
    viewList:   { en: 'View list', ta: 'பட்டியலைப் பார்' },
    // gift finder
    budget:     { en: 'Your budget', ta: 'உங்கள் பட்ஜெட்' },
    perPiece:   { en: 'Price per gift & number of guests', ta: 'ஒரு பரிசின் விலை & விருந்தினர் எண்ணிக்கை' },
    custom:     { en: 'Other amount', ta: 'வேறு தொகை' },
    guests:     { en: 'Guests', ta: 'விருந்தினர்' },
    each:       { en: 'each', ta: 'ஒன்றுக்கு' },
    forGuests:  { en: (n, total) => `${n} pcs = ${total}`, ta: (n, total) => `${n} = ${total}` },
    pickFirst:  { en: 'Choose an occasion above to get a ready list from our shelves.', ta: 'மேலே ஒரு விசேஷத்தைத் தேர்ந்தெடுங்கள் – எங்கள் கடையிலிருந்து பட்டியல் தயார்.' },
    yourList:   { en: (k, b) => `Suggested ${k} list · budget ${b}`, ta: (k, b) => `${k} பட்டியல் · பட்ஜெட் ${b}` },
    total:      { en: 'Total', ta: 'மொத்தம்' },
    left:       { en: (b) => `Planned within your ${b} budget`, ta: (b) => `உங்கள் ${b} பட்ஜெட்டுக்குள் திட்டமிடப்பட்டது` },
    over:       { en: (b) => `Above your ${b} budget – choose a smaller size, lower the quantity or remove an item`, ta: (b) => `உங்கள் ${b} பட்ஜெட்டை விட அதிகம் – ஒரு பொருளை மாற்றுங்கள் அல்லது நீக்குங்கள்` },
    itemLbl:    { en: 'Change item', ta: 'பொருளை மாற்று' },
    sizeLbl:    { en: 'Size', ta: 'அளவு' },
    qtyLbl:     { en: 'Qty', ta: 'எண்ணிக்கை' },
    oneSize:    { en: 'One size', ta: 'ஒரே அளவு' },
    sizeN:      { en: (k, n) => `Size ${k} of ${n}${k === 1 ? ' (smallest)' : k === n ? ' (largest)' : ''}`,
                  ta: (k, n) => `அளவு ${k} / ${n}${k === 1 ? ' (சிறியது)' : k === n ? ' (பெரியது)' : ''}` },
    // size bands for products whose name has no size (priced from small to big)
    band:       { en: ['Extra small', 'Small', 'Medium', 'Large', 'Extra large'],
                  ta: ['மிகச் சிறியது', 'சிறியது', 'நடுத்தரம்', 'பெரியது', 'மிகப் பெரியது'] },
    lineTotal:  { en: (q, v) => `× ${q} = ${v}`, ta: (q, v) => `× ${q} = ${v}` },
    sortBy:     { en: 'Sort by', ta: 'வரிசைப்படுத்து' },
    filterPh:   { en: 'Type to filter…', ta: 'தேடுங்கள்…' },
    editHint:   { en: 'Change any item, its size or the quantity – the total updates as you go.', ta: 'எந்தப் பொருளையும், அதன் அளவையும், எண்ணிக்கையையும் மாற்றலாம் – மொத்தம் உடனே மாறும்.' },
    addAll:     { en: 'Add all to my list', ta: 'அனைத்தையும் பட்டியலில் சேர்' },
    sendKit:    { en: 'Send this list on WhatsApp', ta: 'இந்தப் பட்டியலை WhatsApp-ல் அனுப்பு' },
    reset:      { en: 'Start again', ta: 'மீண்டும் தொடங்கு' },
    skipped:    { en: (s) => `Didn’t fit this budget: ${s}. Raise the budget or ask us – we’ll suggest options.`, ta: (s) => `இந்த பட்ஜெட்டில் சேர்க்க முடியவில்லை: ${s}. பட்ஜெட்டை உயர்த்துங்கள் அல்லது எங்களிடம் கேளுங்கள்.` },
    giftOpts:   { en: (p) => `Return gift ideas around ${p} each`, ta: (p) => `ஒன்றுக்கு சுமார் ${p} – ரிட்டர்ன் கிஃப்ட் யோசனைகள்` },
    priceNote:  { en: 'Prices may vary. Mentioned prices are approximate – contact the store for exact prices.', ta: 'விலைகள் மாறலாம். குறிப்பிட்ட விலைகள் தோராயமானவை – சரியான விலைக்கு கடையைத் தொடர்பு கொள்ளுங்கள்.' },
    bulkNote:   { en: 'Bulk quantities are packed and delivered free, the same day. Ask us for bulk pricing.', ta: 'மொத்த அளவுகள் பேக் செய்து அதே நாளில் இலவசமாக டெலிவரி. மொத்த விலைக்கு கேளுங்கள்.' },
    noGifts:    { en: 'Nothing listed at this price – ask us on WhatsApp for ideas.', ta: 'இந்த விலையில் பட்டியலில் இல்லை – யோசனைகளுக்கு WhatsApp-ல் கேளுங்கள்.' },
    // WhatsApp messages (always sent with English item names, which match the shop's bills)
    waList:     { en: 'Hi, I saw your website. Please share price and availability for:', ta: 'வணக்கம், உங்கள் இணையதளத்தைப் பார்த்தேன். இவற்றின் விலை மற்றும் இருப்பைத் தெரிவிக்கவும்:' },
    waKit:      { en: "Hi, I saw your website. I'd like a quote for this list:", ta: 'வணக்கம், உங்கள் இணையதளத்தைப் பார்த்தேன். இந்தப் பட்டியலுக்கு விலை தெரிவிக்கவும்:' },
    waKitTitle: { en: (k) => `${k} list`, ta: (k) => `${k} பட்டியல்` },
    waGift:     { en: (n) => `Hi, I saw your website. I'd like return gifts for ${n} guests:`, ta: (n) => `வணக்கம், உங்கள் இணையதளத்தைப் பார்த்தேன். ${n} விருந்தினர்களுக்கு ரிட்டர்ன் கிஃப்ட் வேண்டும்:` },
    waListTitle: { en: 'My list', ta: 'என் பட்டியல்' },
    waBudget:   { en: 'Budget', ta: 'பட்ஜெட்' },
    waPrice:    { en: 'Price', ta: 'விலை' },
    waSizes:    { en: 'Sizes', ta: 'அளவுகள்' },
    waAvail:    { en: (n) => `Available in ${n} sizes`, ta: (n) => `${n} அளவுகளில் கிடைக்கும்` },
    waLooking:  { en: "Hi, I saw your website. I'm looking for this – do you have it?", ta: 'வணக்கம், உங்கள் இணையதளத்தைப் பார்த்தேன். இது உங்களிடம் கிடைக்குமா?' },
    waTotal:    { en: 'Estimated total', ta: 'தோராய மொத்தம்' },
    waNote:     { en: 'Prices are approximate – please confirm price and availability.', ta: 'விலைகள் தோராயமானவை – விலையும் இருப்பும் உறுதி செய்யவும்.' },
  };
  const t = (key, ...args) => { const v = T[key][lang]; return typeof v === 'function' ? v(...args) : v; };
  const L = (o) => o[lang] || o.en;
  const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  // Prices are never shown as one exact figure: every price is a from–to band, about 10% either
  // side of the billing price (lowest size to highest size for items with several sizes), rounded.
  const BAND = 0.1;
  const stepOf = (p) => p < 100 ? 5 : p < 1000 ? 10 : p < 5000 ? 50 : 100;
  const bandLo = (p) => Math.max(1, Math.floor(p * (1 - BAND) / stepOf(p)) * stepOf(p));
  const bandHi = (p) => Math.max(bandLo(p) + stepOf(p), Math.ceil(p * (1 + BAND) / stepOf(p)) * stepOf(p));
  const range = (lo, hi = lo) => `${rupee(bandLo(lo))} – ${rupee(bandHi(hi))}`;
  // A size at the end of a name ("Mithra Cooker 3 L") is shown as extra info, not as part of the name
  const SIZE_TAIL = /\s+(\d+(?:\.\d+)?\s?(?:L|ml|kg|g|cm|mm|inch|pcs?)\.?)$/i;
  function splitSize(name) {
    const m = name.match(SIZE_TAIL);
    return m ? { base: name.slice(0, m.index), size: m[1] } : { base: name, size: '' };
  }
  // For sorting sizes smallest first: 500 ml < 1 L < 1.5 L
  function sizeValue(size) {
    const m = size.match(/([\d.]+)\s?([a-z]*)/i);
    if (!m) return 0;
    const unit = m[2].toLowerCase();
    return parseFloat(m[1]) * (unit === 'l' || unit === 'kg' ? 1000 : 1);
  }
  // Total of [{ lo, hi, qty }] as a band
  const rangeTotal = (rows) => `${rupee(rows.reduce((s, r) => s + bandLo(r.lo) * r.qty, 0))} – ${rupee(rows.reduce((s, r) => s + bandHi(r.hi) * r.qty, 0))}`;
  const report = (name, params) => { if (typeof track === 'function') track(name, params); };

  // ===== Gift / occasion kits =====
  // Each slot lists search words (all words of one phrase must appear in the item name; spelling
  // variants are handled by the search). w = share of the budget, qty = pieces of that item,
  // optional = only added while budget remains. Edit freely – items come from the live catalogue.
  const COOKER_NOT = ['cover', 'gasket', 'whistle', 'handle', 'idly', 'milk', 'rice', 'seprator', 'separator', 'plate', 'stand', 'weight', 'ring'];
  const KITS = {
    housewarming: {
      en: 'Housewarming', ta: 'கிரகப்பிரவேசம்', icon: 'i-home', budgets: [5000, 10000, 25000, 50000], def: 10000,
      slots: [
        { en: 'Kuthu vilakku (pair)', ta: 'குத்து விளக்கு (ஜோடி)', q: ['kuthu vilakku'], qty: 2, w: 16 },
        { en: 'Kamatchi vilakku', ta: 'காமாட்சி விளக்கு', q: ['kamatchi', 'kamatch', 'kamakshi'], w: 5 },
        { en: 'Milk-boiling pot', ta: 'பால் காய்ச்சும் பாத்திரம்', q: ['milk boiler', 'milk pan', 'milk cooker', 'paal'], w: 6 },
        { en: 'Kudam', ta: 'குடம்', q: ['brass kudam', 'copper kudam', 'kudam'], not: ['homa'], w: 12 },
        { en: 'Urli', ta: 'உருளி', q: ['brass urli', 'urli'], w: 8 },
        { en: 'Arathi / pooja plate', ta: 'ஆரத்தி / பூஜை தட்டு', q: ['arathi plate', 'pooja plate', 'abishega plate'], w: 5 },
        { en: 'Sombu', ta: 'சொம்பு', q: ['brass sombu', 'sombu'], w: 4 },
        { en: 'Pressure cooker', ta: 'பிரஷர் குக்கர்', q: ['cooker'], not: COOKER_NOT, w: 12 },
        { en: 'Idly pot', ta: 'இட்லி பானை', q: ['idly pot', 'idli pot', 'idly panai'], w: 7 },
        { en: 'Kadai', ta: 'கடாய்', q: ['kadai'], not: ['appa', 'appam', 'pottu'], w: 6 },
        { en: 'Dabbara set', ta: 'டபரா செட்', q: ['dabbara'], w: 4, optional: true },
        { en: 'Tumblers', ta: 'டம்ளர்', q: ['tumbler'], not: ['set'], qty: 4, w: 4, optional: true },
        { en: 'Bell', ta: 'மணி', q: ['brass bell', 'bell'], w: 3, optional: true },
      ],
    },
    seer: {
      en: 'Seer varisai', ta: 'சீர் வரிசை', icon: 'i-gift', budgets: [10000, 25000, 50000, 100000], def: 25000,
      slots: [
        { en: 'Kuthu vilakku (pair)', ta: 'குத்து விளக்கு (ஜோடி)', q: ['kuthu vilakku'], qty: 2, w: 14 },
        { en: 'Kudam', ta: 'குடம்', q: ['brass kudam', 'copper kudam', 'kudam'], not: ['homa'], w: 11 },
        { en: 'Anda', ta: 'அண்டா', q: ['brass anda', 'anda'], w: 13 },
        { en: 'Kamatchi vilakku', ta: 'காமாட்சி விளக்கு', q: ['kamatchi', 'kamatch', 'kamakshi'], w: 4 },
        { en: 'Sombu', ta: 'சொம்பு', q: ['brass sombu', 'sombu'], w: 4 },
        { en: 'Arathi plate', ta: 'ஆரத்தி தட்டு', q: ['arathi plate', 'pooja plate', 'abishega plate'], w: 4 },
        { en: 'Pressure cooker', ta: 'பிரஷர் குக்கர்', q: ['cooker'], not: COOKER_NOT, w: 9 },
        { en: 'Idly pot', ta: 'இட்லி பானை', q: ['idly pot', 'idli pot', 'idly panai'], w: 6 },
        { en: 'Dinner set', ta: 'டின்னர் செட்', q: ['dinner set'], w: 8 },
        { en: 'Kadai', ta: 'கடாய்', q: ['kadai'], not: ['appa', 'appam', 'pottu'], w: 5 },
        { en: 'Dabbara set', ta: 'டபரா செட்', q: ['dabbara'], w: 4 },
        { en: 'Tumblers', ta: 'டம்ளர்', q: ['tumbler'], not: ['set'], qty: 6, w: 4 },
        { en: 'Bucket', ta: 'வாளி', q: ['bucket'], w: 3, optional: true },
        { en: 'Urli', ta: 'உருளி', q: ['brass urli', 'urli'], w: 5, optional: true },
        { en: 'Tope', ta: 'டோப்', q: ['tope'], w: 5, optional: true },
        { en: 'Flask', ta: 'ஃபிளாஸ்க்', q: ['flask'], w: 3, optional: true },
      ],
    },
    gifts: {
      en: 'Return gifts', ta: 'ரிட்டர்ன் கிஃப்ட்', icon: 'i-gift', perPiece: [50, 100, 150, 250, 500], def: 100, guests: 25,
      // gift ideas in order of preference – the finder shows the best size of each, closest to the price per piece
      q: ['tiffin', 'lunch box', 'kamatchi', 'kamatch', 'brass sombu', 'tumbler', 'bowl', 'dabbara', 'water bottle', 'agal', 'deepam',
          'kunguma', 'kumkuma', 'pooja kudai', 'pooja basket', 'brass plate', 'casserole', 'flask', 'bento', 'stainless steel glass', 'sombu'],
      not: ['brush', 'opener', 'stand', 'cover', 'holder', 'cleaner', 'cooker', 'lid', 'wiper'],
    },
    festivals: {
      en: 'Festivals & pooja', ta: 'பண்டிகை & பூஜை', icon: 'i-lamp', budgets: [1000, 2500, 5000, 10000], def: 2500,
      slots: [
        { en: 'Agal vilakku (set of 12)', ta: 'அகல் விளக்கு (12)', q: ['agal'], qty: 12, w: 10 },
        { en: 'Deepam', ta: 'தீபம்', q: ['deepam'], not: ['stand'], w: 8 },
        { en: 'Kamatchi vilakku', ta: 'காமாட்சி விளக்கு', q: ['kamatchi', 'kamatch', 'kamakshi'], w: 10 },
        { en: 'Kuthu vilakku', ta: 'குத்து விளக்கு', q: ['kuthu vilakku'], w: 20 },
        { en: 'Arathi plate', ta: 'ஆரத்தி தட்டு', q: ['arathi plate', 'karpura arathi', 'pooja plate'], w: 8 },
        { en: 'Bell', ta: 'மணி', q: ['brass bell', 'bell'], w: 6 },
        { en: 'Kunguma chimil', ta: 'குங்குமச் சிமிழ்', q: ['kunguma', 'kumkuma', 'kungumam'], w: 3 },
        { en: 'Pooja basket', ta: 'பூஜை கூடை', q: ['pooja kudai', 'pooja basket', 'pooja koodai'], w: 5 },
        { en: 'Panchapathram / sombu', ta: 'பஞ்சபாத்திரம் / சொம்பு', q: ['panchapathram', 'brass sombu', 'sombu'], w: 6, optional: true },
        { en: 'Urli', ta: 'உருளி', q: ['brass urli', 'urli'], w: 10, optional: true },
        { en: 'Abishegam plate', ta: 'அபிஷேக தட்டு', q: ['abishega plate', 'abiseha plate'], w: 8, optional: true },
      ],
    },
    kitchen: {
      en: 'New home kitchen', ta: 'புதிய வீட்டு சமையலறை', icon: 'i-pan', budgets: [5000, 10000, 20000, 40000], def: 10000,
      slots: [
        { en: 'Pressure cooker', ta: 'பிரஷர் குக்கர்', q: ['cooker'], not: COOKER_NOT, w: 14 },
        { en: 'Kadai', ta: 'கடாய்', q: ['kadai'], not: ['appa', 'appam', 'pottu'], w: 8 },
        { en: 'Dosa tawa', ta: 'தோசைக் கல்', q: ['dosa tawa', 'tawa'], not: ['roti'], w: 7 },
        { en: 'Idly pot', ta: 'இட்லி பானை', q: ['idly pot', 'idli pot', 'idly panai'], w: 7 },
        { en: 'Topes (set of 3)', ta: 'டோப் (3)', q: ['stainless steel tope', 'tope'], qty: 3, w: 8 },
        { en: 'Laddles (3)', ta: 'கரண்டி (3)', q: ['laddle'], not: ['stand'], qty: 3, w: 3 },
        { en: 'Dabbaras (4)', ta: 'டபரா (4)', q: ['dabbara'], qty: 4, w: 5 },
        { en: 'Plates (4)', ta: 'தட்டு (4)', q: ['stainless steel plate', 'plate'], not: ['arathi', 'pooja', 'abish', 'hot'], qty: 4, w: 5 },
        { en: 'Tumblers (4)', ta: 'டம்ளர் (4)', q: ['tumbler'], not: ['set'], qty: 4, w: 3 },
        { en: 'Knife', ta: 'கத்தி', q: ['knife'], w: 2 },
        { en: 'Cutting board', ta: 'காய் வெட்டும் பலகை', q: ['cutting board'], w: 2 },
        { en: 'Coffee / tea filter', ta: 'காபி / டீ ஃபில்டர்', q: ['coffee filter', 'coffe filter', 'tea filter'], w: 3 },
        { en: 'Gas stove', ta: 'கேஸ் அடுப்பு', q: ['gas stove'], not: ['stand', 'lighter'], w: 20, optional: true },
        { en: 'Mixie', ta: 'மிக்ஸி', q: ['mixie', 'mixer grinder'], not: ['jar', 'tray', 'cover'], w: 22, optional: true },
        { en: 'Storage containers', ta: 'சேமிப்பு டப்பா', q: ['container'], qty: 3, w: 4, optional: true },
      ],
    },
    weddings: {
      en: 'Wedding kitchen', ta: 'திருமண சமையல்', icon: 'i-pot', budgets: [10000, 25000, 50000, 100000], def: 25000,
      slots: [
        { en: 'Anda (2)', ta: 'அண்டா (2)', q: ['aluminium anda', 'anda'], qty: 2, w: 18 },
        { en: 'Big kadai', ta: 'பெரிய கடாய்', q: ['aluminium kadai', 'iron kadai', 'kadai'], not: ['appa', 'appam', 'pottu'], w: 12 },
        { en: 'Idly pot', ta: 'இட்லி பானை', q: ['idly pot', 'idli pot', 'idly panai'], w: 10 },
        { en: 'Topes (3)', ta: 'டோப் (3)', q: ['aluminium tope', 'tope'], qty: 3, w: 10 },
        { en: 'Sambadam', ta: 'சம்படம்', q: ['sambadam'], w: 6 },
        { en: 'Serving buckets (4)', ta: 'பரிமாறும் வாளி (4)', q: ['stainless steel bucket', 'aluminium bucket', 'bucket'], qty: 4, w: 8 },
        { en: 'Laddles & karandi (4)', ta: 'கரண்டி (4)', q: ['laddle', 'karandi'], not: ['stand'], qty: 4, w: 4 },
        { en: 'Trays (2)', ta: 'தட்டு (2)', q: ['aluminium tray', 'tray'], not: ['egg', 'cake', 'ice', 'mixer'], qty: 2, w: 5 },
        { en: 'Dosa tawa', ta: 'தோசைக் கல்', q: ['dosa tawa', 'tawa'], not: ['roti'], w: 6 },
        { en: 'Pressure cooker', ta: 'பிரஷர் குக்கர்', q: ['cooker'], not: COOKER_NOT, w: 10, optional: true },
        { en: 'Dinner sets', ta: 'டின்னர் செட்', q: ['dinner set'], w: 8, optional: true },
        { en: 'Casseroles', ta: 'கேசரோல்', q: ['casserole'], qty: 2, w: 5, optional: true },
      ],
    },
  };
  const KIT_ORDER = ['housewarming', 'seer', 'gifts', 'festivals', 'kitchen', 'weddings'];

  // ===== Search: spelling-tolerant matching for Tanglish names =====
  // "Kuthu Vilaku", "Kuthu Villaku" and "kuthu vilakku" all reduce to the same key.
  const phon = (w) => w.toLowerCase()
    .replace(/ph/g, 'f').replace(/zh/g, 'l').replace(/z/g, 'l')
    .replace(/([kgcjtdpbs])h/g, '$1').replace(/w/g, 'v')
    .replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/y$/, 'i').replace(/ie$/, 'i')
    .replace(/(.)\1+/g, '$1');
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9஀-௿]+/g, ' ').trim().split(' ').filter(Boolean);
  const keyOf = (s) => ' ' + words(s).map(phon).join(' ');

  // Extra words to try for a typed word (English ↔ Tamil names, and Tamil script)
  const SYN = {
    lamp: ['vilakku', 'deepam', 'agal', 'diya'], vilakku: ['lamp'], diya: ['agal', 'deepam'],
    pot: ['kudam', 'panai', 'chatti', 'sombu'], kudam: ['pot'], wok: ['kadai'], kadai: ['wok', 'kadhai', 'karahi'],
    plate: ['thattu', 'thali'], thattu: ['plate'], glass: ['tumbler'], tumbler: ['glass'],
    box: ['dabbara', 'dabba', 'container'], dabara: ['dabbara', 'davara'], ladle: ['laddle', 'karandi'],
    spoon: ['karandi'], copper: ['coppar'], stove: ['gas', 'burner'], mixer: ['mixie', 'mixi', 'grinder'],
    mixie: ['mixer'], bottle: ['milton'], puja: ['pooja'], idli: ['idly'], idly: ['idli'], tawa: ['thava', 'tava', 'tavala'],
    cooker: ['pressure'], pan: ['tawa', 'kadai'], bucket: ['vali'], gift: ['tiffin', 'kamatchi'],
    'விளக்கு': ['vilakku', 'lamp'], 'குத்துவிளக்கு': ['kuthu'], 'குத்து': ['kuthu'], 'குடம்': ['kudam'], 'தட்டு': ['plate', 'thattu'],
    'டம்ளர்': ['tumbler'], 'கடாய்': ['kadai'], 'தோசை': ['dosa'], 'இட்லி': ['idly'], 'குக்கர்': ['cooker'],
    'பித்தளை': ['brass'], 'செம்பு': ['copper'], 'பூஜை': ['pooja'], 'அண்டா': ['anda'], 'சொம்பு': ['sombu'],
    'கரண்டி': ['karandi', 'laddle'], 'டப்பா': ['dabbara', 'container'], 'பானை': ['panai', 'pot'], 'தவா': ['tawa'],
    'கிண்ணம்': ['bowl'], 'ஃபிளாஸ்க்': ['flask'], 'பாட்டில்': ['bottle'], 'உருளி': ['urli'], 'அகல்': ['agal'],
    'காமாட்சி': ['kamatchi'], 'டிபன்': ['tiffin'], 'வாளி': ['bucket'], 'அடுப்பு': ['stove'], 'மிக்ஸி': ['mixie'],
    'கத்தி': ['knife'], 'மணி': ['bell'], 'டபரா': ['dabbara'],
  };

  // Score one search word against an item key: whole word 3, start of a word 2, inside a word 1
  function wordScore(key, w) {
    const alts = [phon(w), ...(SYN[w] || []).map(phon)];
    let best = 0;
    for (const a of alts) {
      if (!a) continue;
      if (key.includes(' ' + a + ' ') || key.endsWith(' ' + a)) return 3;
      if (key.includes(' ' + a)) best = Math.max(best, 2);
      else if (a.length >= 4 && key.includes(a)) best = Math.max(best, 1);
    }
    return best;
  }
  const hasWord = (key, w) => (key + ' ').includes(' ' + w + ' ') || (key + ' ').includes(' ' + w + 's ');
  const phraseMatch = (key, phrase) => words(phrase).every(w => hasWord(key, phon(w)));

  // ===== State =====
  let ITEMS = null;           // prepared catalogue
  let BUILT = '';
  const state = { q: '', cat: 'all', price: 'all', sort: 'relevance', shown: PAGE };
  let results = [];
  let dataPromise = null;
  let list = [];              // My list: [{ name, price, hi?, qty }]
  try { list = JSON.parse(localStorage.getItem(LIST_KEY) || '[]').filter(x => x && x.name && x.price > 0 && x.qty > 0); } catch (e) { list = []; }

  const els = {
    query: $('#catQuery'), sort: $('#catSort'), chips: $('#catChips'),
    prices: $('#priceChips'), status: $('#catStatus'), grid: $('#catGrid'), more: $('#catMore'),
    gfOcc: $('#gfOcc'), gfBudgetStep: $('#gfBudgetStep'), gfBudgetLabel: $('#gfBudgetLabel'),
    gfBudget: $('#gfBudget'), gfResult: $('#gfResult'),
    pill: $('#listPill'), pillLabel: $('#listPillLabel'), count: $('#listCount'), sheet: $('#listSheet'),
    listTitle: $('#listTitle'), listNote: $('#listNote'), listItems: $('#listItems'), listTotal: $('#listTotal'),
    listSend: $('#listSend'), listSendLabel: $('#listSendLabel'), listClear: $('#listClear'), listClose: $('#listClose'),
  };
  // The catalogue (catalogue.html) and gift finder (gift-finder.html) have their own pages;
  // "My list" works on every page.
  const onCatalogue = !!els.grid;
  const onFinder = !!els.gfOcc;
  const params = new URLSearchParams(location.search);
  // Older ad links pointed at the home page (index.html?q=… / ?kit=…) – send them to the right page
  if (!onCatalogue && (params.get('q') || params.get('cat'))) { location.replace('catalogue.html' + location.search); return; }
  if (!onFinder && params.get('kit')) { location.replace('gift-finder.html' + location.search); return; }
  if (!els.sheet) return;

  function loadData() {
    if (ITEMS) return Promise.resolve(ITEMS);
    if (!dataPromise) {
      dataPromise = new Promise((resolve, reject) => {
        if (window.CATALOGUE) return resolve(window.CATALOGUE);
        const s = document.createElement('script');
        s.src = 'js/catalogue-data.js';
        s.onload = () => window.CATALOGUE ? resolve(window.CATALOGUE) : reject(new Error('empty'));
        s.onerror = reject;
        document.head.appendChild(s);
      }).then(data => {
        BUILT = data.built || '';
        ITEMS = data.items.map(([name, ci, prices, isNew, info = ''], id) => ({
          id, name, cat: data.cats[ci] || 'other', prices, lo: prices[0], hi: prices[prices.length - 1],
          isNew: !!isNew, info, key: keyOf(name + ' ' + info), look: describe(name, data.cats[ci] || 'other'),
        }));
        return ITEMS;
      });
      dataPromise.catch(() => { dataPromise = null; });
    }
    return dataPromise;
  }

  // ===== Picker sheet (used instead of the browser's plain dropdowns) =====
  // A button shows the current choice; tapping it opens a sheet with one row per option.
  let choiceEl = null;
  let choicePick = null;
  function openChoice({ title, options, onPick }) {
    if (!choiceEl) {
      choiceEl = document.createElement('dialog');
      choiceEl.className = 'sheet choice-sheet';
      choiceEl.innerHTML = `<div class="sheet-grip"></div>
        <div class="choice-head"><p class="choice-title"></p>
          <button type="button" class="choice-close" data-cclose><svg class="ico"><use href="#i-x"/></svg></button></div>
        <label class="choice-filter"><svg class="ico"><use href="#i-search"/></svg><input type="search" autocomplete="off" enterkeyhint="search"></label>
        <div class="choice-list" role="listbox"></div>`;
      document.body.appendChild(choiceEl);
      choiceEl.addEventListener('click', e => {
        if (e.target === choiceEl || e.target.closest('[data-cclose]')) { choiceEl.close(); return; }
        const o = e.target.closest('[data-cval]');
        if (o) { choiceEl.close(); if (choicePick) choicePick(o.dataset.cval); }
      });
      choiceEl.querySelector('input').addEventListener('input', e => {
        const q = e.target.value.toLowerCase().trim();
        choiceEl.querySelectorAll('[data-cval]').forEach(b => { b.hidden = !!q && !b.dataset.ctext.includes(q); });
      });
    }
    choicePick = onPick;
    choiceEl.querySelector('.choice-title').textContent = title;
    choiceEl.querySelector('[data-cclose]').setAttribute('aria-label', t('close'));
    const filter = choiceEl.querySelector('.choice-filter');
    filter.hidden = options.length < 9;              // a filter box only for long lists
    filter.querySelector('input').value = '';
    filter.querySelector('input').placeholder = t('filterPh');
    choiceEl.querySelector('.choice-list').innerHTML = options.map(o => `
      <button type="button" class="choice-opt${o.selected ? ' is-on' : ''}" role="option" aria-selected="${!!o.selected}"
        data-cval="${esc(o.value)}" data-ctext="${esc(`${o.label} ${o.sub || ''}`.toLowerCase())}">
        <span class="choice-check"><svg class="ico"><use href="#i-check"/></svg></span>
        <span class="choice-text"><strong>${esc(o.label)}</strong>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>
        ${o.aside ? `<span class="choice-aside">${esc(o.aside)}</span>` : ''}
      </button>`).join('');
    choiceEl.showModal();
    const on = choiceEl.querySelector('.choice-opt.is-on');
    if (on) on.scrollIntoView({ block: 'center' });
  }
  // The button that opens the sheet
  const pickInner = (label, sub) => `<span class="pick-text">${sub ? `<small>${esc(sub)}</small>` : ''}<strong>${esc(label)}</strong></span>
    <span class="pick-chev"><svg class="ico"><use href="#i-down"/></svg></span>`;

  // ===== Catalogue =====
  // Score one group of words: every word must match, else 0
  function groupScore(it, ws) {
    let score = 0;
    for (const w of ws) {
      const s = wordScore(it.key, w);
      if (!s) return 0;
      score += s;
    }
    return score + (it.key.startsWith(' ' + phon(ws[0])) ? 1 : 0);
  }

  function filterItems() {
    // Commas mean "or": "tumbler, bowl, dabbara" finds tumblers, bowls and dabbaras
    const groups = state.q.split(',').map(words).filter(ws => ws.length);
    const qWords = groups.flat();
    const pr = PRICES.find(p => p.id === state.price);
    const out = [];
    for (const it of ITEMS) {
      if (state.cat !== 'all' && it.cat !== state.cat) continue;
      if (pr && !it.prices.some(p => p >= pr.lo && p <= pr.hi)) continue;
      let score = 0;
      if (groups.length) {
        score = Math.max(...groups.map(ws => groupScore(it, ws)));
        if (!score) continue;
      }
      out.push({ it, score });
    }
    const byName = (a, b) => a.it.name.localeCompare(b.it.name);
    const sorts = {
      relevance: (a, b) => (b.score - a.score) || (b.it.isNew - a.it.isNew) || (a.it.name.length - b.it.name.length) || byName(a, b),
      new: (a, b) => (b.it.isNew - a.it.isNew) || (b.score - a.score) || byName(a, b),
      low: (a, b) => (a.it.lo - b.it.lo) || byName(a, b),
      high: (a, b) => (b.it.hi - a.it.hi) || byName(a, b),
      az: byName,
    };
    // With nothing typed, "best match" shows new arrivals first, then A–Z
    const sortFn = state.sort === 'relevance' && !qWords.length ? sorts.new : sorts[state.sort];
    out.sort(sortFn);
    return out.map(r => r.it);
  }

  function renderControls() {
    if (!onCatalogue) return;
    els.query.placeholder = t('placeholder');
    els.sort.innerHTML = pickInner(L(SORTS.find(s => s.id === state.sort)), t('sortBy'));
    els.sort.setAttribute('aria-label', `${t('sortBy')}: ${L(SORTS.find(s => s.id === state.sort))}`);
    const counts = {};
    if (ITEMS) ITEMS.forEach(it => { counts[it.cat] = (counts[it.cat] || 0) + 1; });
    const cats = ['all', ...Object.keys(CAT_INFO).filter(c => !ITEMS || counts[c])];
    els.chips.innerHTML = cats.map(c => {
      const label = c === 'all' ? t('all') : L(CAT_INFO[c]);
      const n = c === 'all' ? (ITEMS ? ITEMS.length : '') : counts[c] || '';
      return `<button type="button" class="fchip${state.cat === c ? ' is-on' : ''}" data-fcat="${c}" aria-pressed="${state.cat === c}">${esc(label)}${n ? ` <small>${n}</small>` : ''}</button>`;
    }).join('');
    els.prices.innerHTML = [{ id: 'all', en: T.anyPrice.en, ta: T.anyPrice.ta }, ...PRICES].map(p =>
      `<button type="button" class="fchip fchip-sm${state.price === p.id ? ' is-on' : ''}" data-fprice="${p.id}" aria-pressed="${state.price === p.id}">${esc(L(p))}</button>`).join('');
  }

  function cardHtml(it) {
    const info = CAT_INFO[it.cat];
    const inList = list.some(x => x.name === it.name);
    const price = range(it.lo, it.hi);
    const { base, size } = splitSize(it.name);
    const extra = [size, it.info].filter(Boolean).join(' · ');
    const look = it.look;
    // "Brass · For pooja and festivals" (the material is left out when the name already starts with it)
    const matText = look.mat && !base.toLowerCase().startsWith(look.mat.en.toLowerCase()) ? L(look.mat) : '';
    const desc = [matText, look.use ? L(look.use) : ''].filter(Boolean).join(' · ');
    return `<article class="pcard" data-id="${it.id}">
      <div class="pcard-tile" data-cat="${it.cat}"${look.mat ? ` data-mat="${look.mat.id}" data-hue="${look.hue}"` : ''}>
        <span class="pcard-medal"><svg class="ico"><use href="#${look.icon || info.icon}"/></svg></span>
        <span class="pcard-cat">${esc(look.mat ? L(look.mat) : L(info))}</span>
        ${it.isNew ? `<span class="pcard-new">${esc(t('isNew'))}</span>` : ''}
      </div>
      <div class="pcard-body">
        <h3 class="pcard-name">${esc(base)}</h3>
        ${extra ? `<p class="pcard-info">${esc(extra)}</p>` : ''}
        ${desc ? `<p class="pcard-desc">${esc(desc)}</p>` : ''}
        <p class="pcard-price">${price}${it.prices.length > 1 && !it.info ? ` <small>· ${esc(t('sizes', it.prices.length))}</small>` : ''}</p>
        <div class="pcard-actions">
          <button type="button" class="pcard-add${inList ? ' is-in' : ''}" data-add="${it.id}" aria-label="${esc(t(inList ? 'added' : 'add'))}: ${esc(it.name)}">
            <svg class="ico"><use href="#${inList ? 'i-check' : 'i-plus'}"/></svg><span>${esc(t(inList ? 'added' : 'add'))}</span></button>
          <a href="#" class="pcard-wa" data-picker="whatsapp" data-occasion="${esc(`${it.name}${it.info ? ` – ${it.info}` : ''} (${price})`)}" data-wa-text="${esc(waProduct(it))}" data-category="${it.cat}" aria-label="${esc(t('ask'))}: ${esc(it.name)}">
            <svg class="ico"><use href="#i-chat"/></svg><span>${esc(t('ask'))}</span></a>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    if (!ITEMS || !onCatalogue) return;
    const shown = results.slice(0, state.shown);
    els.grid.innerHTML = shown.map(cardHtml).join('');
    const filtered = state.q || state.cat !== 'all' || state.price !== 'all';
    if (!results.length) {
      els.status.innerHTML = `${esc(t('none'))} <a href="#" class="link-arrow" data-picker="whatsapp" data-occasion="${esc(state.q || L(CAT_INFO[state.cat] || {}) || '')}" data-wa-text="${esc(waLookingFor(state.q || L(CAT_INFO[state.cat] || {}) || ''))}">${esc(t('askThis'))}<svg class="ico"><use href="#i-arrow"/></svg></a>
        ${filtered ? ` <button type="button" class="cat-reset" data-reset>${esc(t('clear'))}</button>` : ''}`;
    } else {
      els.status.innerHTML = `${esc(filtered ? t('found', results.length) : t('count', shown.length, results.length))}
        ${filtered ? ` <button type="button" class="cat-reset" data-reset>${esc(t('clear'))}</button>` : ''}`;
    }
    const left = results.length - shown.length;
    els.more.hidden = left <= 0;
    els.more.textContent = t('more', left);
  }

  function update(resetPage = true) {
    if (!ITEMS) return;
    if (resetPage) state.shown = PAGE;
    results = filterItems();
    renderControls();
    renderGrid();
    reportListView();
  }

  // Analytics: which product lists people look at (once the search / filters settle, not on every key)
  let listViewTimer = null;
  let lastListView = '';
  function reportListView() {
    clearTimeout(listViewTimer);
    listViewTimer = setTimeout(() => {
      const key = [state.q, state.cat, state.price].join('|');
      if (key === lastListView) return;
      lastListView = key;
      report('view_item_list', {
        item_list_name: state.q ? 'search' : state.cat !== 'all' ? 'category' : 'all_items',
        category: state.cat, price_band: state.price, search_term: state.q.slice(0, 60), results: results.length,
      });
    }, 1200);
  }

  let qTimer = null;
  let lastReported = '';
  if (onCatalogue) {
  els.query.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      state.q = els.query.value.trim();
      ensureCatalogue().then(() => update());
      if (state.q.length >= 3) {
        clearTimeout(els.query._rt);
        els.query._rt = setTimeout(() => {
          if (state.q && state.q !== lastReported) {
            lastReported = state.q;
            report('search', { search_term: state.q.slice(0, 60), results: results.length });
            // things people want that the catalogue doesn't show
            if (!results.length) report('search_no_results', { search_term: state.q.slice(0, 60) });
          }
        }, 1500);
      }
    }, 180);
  });
  els.query.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); els.query.blur(); } });
  els.sort.addEventListener('click', () => openChoice({
    title: t('sortBy'),
    options: SORTS.map(s => ({ value: s.id, label: L(s), selected: s.id === state.sort })),
    onPick: v => { state.sort = v; update(); report('sort_change', { sort: v }); },
  }));
  els.chips.addEventListener('click', e => {
    const b = e.target.closest('[data-fcat]'); if (!b) return;
    state.cat = b.dataset.fcat; update();
    report('catalogue_filter', { filter: 'category', value: state.cat });
  });
  els.prices.addEventListener('click', e => {
    const b = e.target.closest('[data-fprice]'); if (!b) return;
    state.price = b.dataset.fprice; update();
    report('catalogue_filter', { filter: 'price', value: state.price });
  });
  els.more.addEventListener('click', () => {
    state.shown += PAGE; renderGrid();
    report('show_more', { shown: Math.min(state.shown, results.length), results: results.length, item_list_name: state.q ? 'search' : state.cat });
  });
  $('#catalogue').addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) {
      Object.assign(state, { q: '', cat: 'all', price: 'all' });
      els.query.value = '';
      update();
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const it = ITEMS[+add.dataset.add];
      if (list.some(x => x.name === it.name)) { openList(); return; }
      addToList({ name: it.name, price: it.lo, hi: it.hi, qty: 1 });
      toast(t('toastAdd'));
      report('add_to_list', { product: it.name.slice(0, 100), category: it.cat, link_location: 'catalogue' });
      renderGrid();
    }
  });
  }

  let catalogueReady = null;
  function ensureCatalogue() {
    if (!catalogueReady) {
      els.status.textContent = t('loading');
      catalogueReady = loadData().then(() => { update(); }, () => {
        els.status.textContent = t('loadFail');
        catalogueReady = null;
      });
    }
    return catalogueReady;
  }

  // ===== My list (enquiry list, kept on this device) =====
  const saveList = () => { try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch (e) {} };

  function addToList(entry) {
    const found = list.find(x => x.name === entry.name && x.price === entry.price);
    if (found) found.qty += entry.qty;
    else list.push({ ...entry });
    saveList();
    renderList();
  }

  const listTotal = () => list.reduce((s, x) => s + x.price * x.qty, 0);   // for analytics only
  const itemRange = (x) => range(x.price, x.hi || x.price);
  const totalText = () => rangeTotal(list.map(x => ({ lo: x.price, hi: x.hi || x.price, qty: x.qty })));

  // ===== WhatsApp messages laid out for phones: one small card per item, WhatsApp *bold* / _italic_ =====
  //   *1. Kuthu Vilakku*
  //   Size: Medium · Qty: 2
  //   ₹410 – ₹510 each → ₹820 – ₹1,020
  const WA_RULE = '━━━━━━━━━━━━━━';
  function waItem(i, { name, size, qty, lo, hi }) {
    const lines = [`*${i + 1}. ${name}*`];
    const meta = [size ? `${t('sizeLbl')}: ${size}` : '', `${t('qtyLbl')}: ${qty}`].filter(Boolean).join(' · ');
    lines.push(meta);
    lines.push(qty > 1 ? `${range(lo, hi)} ${t('each')} → ${rangeTotal([{ lo, hi, qty }])}` : range(lo, hi));
    return lines.join('\n');
  }
  function waMessage({ greeting, title, subtitle, items, total }) {
    return [
      greeting, '',
      `*${title}*`, ...(subtitle ? [subtitle] : []), '',
      items.map((it, i) => waItem(i, it)).join('\n\n'), '',
      WA_RULE,
      `*${t('waTotal')}: ${total}*`,
      `_${t('waNote')}_`,
    ].join('\n');
  }
  // One product from the catalogue ("Ask" button)
  //   *Brass Kudam*
  //   Available in 30 sizes        (or "Sizes: 2.5 L · 5 L · 10 L" / "Size: 3 L")
  //   Price: ₹510 – ₹3,300
  function waProduct(it) {
    const { base, size } = splitSize(it.name);
    const lines = [t('waList'), '', `*${base}*`];
    if (it.info) lines.push(`${t('waSizes')}: ${it.info}`);
    else if (size) lines.push(`${t('sizeLbl')}: ${size}`);
    else if (it.prices.length > 1) lines.push(t('waAvail', it.prices.length));
    lines.push(`${t('waPrice')}: ${range(it.lo, it.hi)}`, '', `_${t('waNote')}_`);
    return lines.join('\n');
  }
  // Nothing found in the catalogue ("Ask about it")
  const waLookingFor = (what) => [t('waLooking'), '', `*${what}*`].join('\n');

  // "Brass Kudam (Medium)" in My list → name + size shown separately
  const splitListName = (name) => { const m = name.match(/^(.*) \(([^)]+)\)$/); return m ? [m[1], m[2]] : [name, '']; };
  const listMessage = () => waMessage({
    greeting: t('waList'),
    title: t('waListTitle'),
    items: list.map(x => { const [name, sz] = splitListName(x.name); const s = splitSize(name);
      return { name: s.base, size: sz || s.size, qty: x.qty, lo: x.price, hi: x.hi || x.price }; }),
    total: totalText(),
  });

  function renderList() {
    const n = list.reduce((s, x) => s + x.qty, 0);
    els.pill.hidden = n === 0;
    els.count.textContent = n;
    els.pillLabel.textContent = t('myList');
    els.listTitle.textContent = t('myList');
    els.listNote.textContent = list.length ? t('listNote') : t('listEmpty');
    els.listItems.innerHTML = list.map((x, i) => `<li class="list-item">
        <div class="list-name"><strong>${esc(x.name)}</strong><small>${itemRange(x)}</small></div>
        <div class="qty" role="group" aria-label="Quantity">
          <button type="button" data-qty="${i}" data-d="-1" aria-label="−"><svg class="ico"><use href="#i-minus"/></svg></button>
          <span>${x.qty}</span>
          <button type="button" data-qty="${i}" data-d="1" aria-label="+"><svg class="ico"><use href="#i-plus"/></svg></button>
        </div>
        <button type="button" class="list-remove" data-remove="${i}" aria-label="${esc(t('remove'))}"><svg class="ico"><use href="#i-trash"/></svg></button>
      </li>`).join('');
    els.listTotal.innerHTML = list.length ? `${esc(t('estTotal'))}: <strong>${esc(totalText())}</strong>
      <small class="price-note">${esc(t('priceNote'))}</small>` : '';
    els.listSend.hidden = !list.length;
    els.listSend.dataset.waText = listMessage();
    els.listSendLabel.textContent = t('sendList');
    els.listClear.textContent = t('clearList');
    els.listClear.hidden = !list.length;
    els.listClose.textContent = t('close');
  }

  function openList() {
    renderList(); els.sheet.showModal();
    report('view_list', { items: list.length, pieces: list.reduce((s, x) => s + x.qty, 0), value: Math.round(listTotal()), currency: 'INR' });
  }
  els.pill.addEventListener('click', openList);
  els.sheet.addEventListener('click', e => {
    if (e.target === els.sheet) return els.sheet.close();
    const q = e.target.closest('[data-qty]');
    if (q) {
      const x = list[+q.dataset.qty];
      x.qty = Math.max(1, x.qty + +q.dataset.d);
      saveList(); renderList();
      report('list_qty_change', { product: x.name.slice(0, 100), qty: x.qty });
      return;
    }
    const r = e.target.closest('[data-remove]');
    if (r) {
      const [gone] = list.splice(+r.dataset.remove, 1);
      saveList(); renderList(); renderGrid();
      report('list_remove', { product: gone.name.slice(0, 100) });
    }
  });
  els.listClear.addEventListener('click', () => {
    report('list_clear', { items: list.length, value: Math.round(listTotal()), currency: 'INR' });
    list = []; saveList(); renderList(); renderGrid();
  });
  els.listSend.addEventListener('click', () => {
    els.listSend.dataset.waText = listMessage();
    report('send_list_whatsapp', { items: list.length, pieces: list.reduce((s, x) => s + x.qty, 0), value: Math.round(listTotal()), currency: 'INR' });
  }, true);

  // Small confirmation toast with a shortcut to the list
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'cat-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
      toastEl.addEventListener('click', e => { if (e.target.closest('button')) openList(); });
    }
    toastEl.innerHTML = `<span>${esc(msg)}</span><button type="button">${esc(t('viewList'))}</button>`;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  }

  // ===== Gift / occasion finder =====
  const gf = { kit: null, budget: 0, per: 0, guests: 0, picks: [], skipped: [] };

  // Accessories ("Tope Cover", "Laddle Stand", "Mixie Jar") are not the item itself – leave them out
  const ACCESSORY = new Set(['cover', 'covers', 'stand', 'holder', 'handle', 'gasket', 'whistle', 'ring', 'clip', 'brush', 'cloth', 'jar', 'lid', 'spare']);

  // All (item, price) options for a slot
  function candidates(phrases, not) {
    const out = [];
    const seen = new Set();
    const asked = new Set(phrases.flatMap(words));
    for (const it of ITEMS) {
      if (!phrases.some(p => phraseMatch(it.key, p))) continue;
      if (not && not.some(n => hasWord(it.key, phon(n)))) continue;
      const last = words(splitSize(it.name).base).pop();
      if (ACCESSORY.has(last) && !asked.has(last)) continue;
      for (const p of it.prices) {
        const k = it.name + '|' + p;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ name: it.name, price: p });
      }
    }
    return out;
  }

  function buildKit() {
    const kit = KITS[gf.kit];
    const B = gf.budget / (1 + BAND);   // so the top of the shown price range stays within budget
    const slots = kit.slots.map(s => ({ s, qty: s.qty || 1, cands: candidates(s.q, s.not) })).filter(x => x.cands.length);
    const W = slots.reduce((a, x) => a + x.s.w, 0);
    let total = 0;
    gf.picks = [];
    gf.skipped = [];
    const order = [...slots.filter(x => !x.s.optional), ...slots.filter(x => x.s.optional)];
    for (const x of order) {
      const target = B * x.s.w / W / x.qty;
      // closest to this slot's share; going over the share counts a little worse than going under
      x.cands.sort((a, b) => dist(a.price, target) - dist(b.price, target));
      const pick = x.cands.find(c => total + c.price * x.qty <= B);
      if (!pick) { if (!x.s.optional) gf.skipped.push(slotName(x.s)); continue; }
      total += pick.price * x.qty;
      gf.picks.push({ slot: x, i: x.cands.indexOf(pick), qty: x.qty });
    }
    // Spend leftover budget: upgrade picks to the next better option that still fits
    for (let pass = 0; pass < 3; pass++) {
      for (const p of gf.picks) {
        const cur = p.slot.cands[p.i];
        const better = p.slot.cands
          .map((c, i) => ({ c, i }))
          .filter(o => o.c.price > cur.price && total - cur.price * p.qty + o.c.price * p.qty <= B)
          .sort((a, b) => a.c.price - b.c.price)[0];
        if (better && better.c.price <= cur.price * 2.5) {
          total += (better.c.price - cur.price) * p.qty;
          p.i = better.i;
        }
      }
    }
    // keep the kit's own order for display
    gf.picks.sort((a, b) => kit.slots.indexOf(a.slot.s) - kit.slots.indexOf(b.slot.s));
    gf.picks.forEach(p => groupSlot(p.slot));
  }
  const dist = (p, target) => p > target ? (p - target) * 1.3 : target - p;
  // Slot heading without the starting count ("Topes (set of 3)" -> "Topes"): the Qty control shows the real number
  const slotName = (s) => L(s).replace(/\s*\((?:set of\s*)?\d+\)|\s*\((?:pair|ஜோடி)\)/gi, '').trim();

  // Group a slot's options by product, so "Change item" lists different products and the same
  // product's other prices become sizes: "Mithra Cooker" → 2 L / 3 L / 5 L, or Size 1 of 4 … (by price)
  function groupSlot(slot) {
    if (slot.groups) return;
    const byBase = new Map();
    slot.cands.forEach((c, i) => {
      const { base, size } = splitSize(c.name);
      if (!byBase.has(base)) byBase.set(base, { base, opts: [] });
      byBase.get(base).opts.push({ i, price: c.price, size });
    });
    slot.groups = [...byBase.values()];       // best-fitting products first (cands are sorted by fit)
    slot.where = [];
    slot.groups.forEach((g, gi) => {
      const all = g.opts.sort((a, b) => (sizeValue(a.size) - sizeValue(b.size)) || (a.price - b.price));
      g.lo = Math.min(...all.map(o => o.price));
      g.hi = Math.max(...all.map(o => o.price));
      const sized = all.every(o => o.size) && new Set(all.map(o => o.size)).size === all.length;
      if (sized || all.length === 1) {
        // real sizes from the name: 2 L · 3 L · 5 L
        g.opts = all.map(o => ({ ...o, lo: o.price, hi: o.price, band: -1 }));
      } else {
        // no sizes in the name: up to 5 bands by price (Small · Medium · Large …), each priced at its middle
        const n = Math.min(5, all.length);
        const names = n === 2 ? [1, 3] : n === 3 ? [1, 2, 3] : n === 4 ? [1, 2, 3, 4] : [0, 1, 2, 3, 4];
        g.opts = [];
        for (let k = 0; k < n; k++) {
          const chunk = all.slice(Math.floor(k * all.length / n), Math.floor((k + 1) * all.length / n));
          const mid = chunk[Math.floor(chunk.length / 2)];
          g.opts.push({ i: mid.i, price: mid.price, size: '', band: names[k], lo: chunk[0].price, hi: chunk[chunk.length - 1].price, members: chunk });
        }
      }
      g.opts.forEach((o, oi) => (o.members || [o]).forEach(m => { slot.where[m.i] = [gi, oi]; }));
    });
  }
  const sizeName = (o) => o.band >= 0 ? L(T.band)[o.band] : o.size;
  const pickInfo = (p) => {
    const [gi, oi] = p.slot.where[p.i];
    const g = p.slot.groups[gi];
    const o = g.opts[oi];
    const size = sizeName(o);
    // sizeText goes into WhatsApp messages and My list (English names match the shop's bills)
    return { g, gi, oi, o, price: p.slot.cands[p.i].price, base: g.base, size, sizeText: o.band >= 0 ? T.band.en[o.band] : o.size };
  };

  const kitTotal = () => gf.picks.reduce((s, p) => s + p.slot.cands[p.i].price * p.qty, 0);
  const kitRange = () => rangeTotal(gf.picks.map(p => ({ lo: p.slot.cands[p.i].price, hi: p.slot.cands[p.i].price, qty: p.qty })));

  function kitMessage() {
    const kit = KITS[gf.kit];
    return waMessage({
      greeting: t('waKit'),
      title: t('waKitTitle', L(kit)),
      subtitle: `${t('waBudget')}: ${rupee(gf.budget)}`,
      items: gf.picks.map(p => { const x = pickInfo(p); return { name: x.base, size: x.size, qty: p.qty, lo: x.price, hi: x.price }; }),
      total: kitRange(),
    });
  }

  function renderOccasions() {
    if (!onFinder) return;
    els.gfOcc.innerHTML = KIT_ORDER.map(k => {
      const kit = KITS[k];
      return `<button type="button" class="gf-occ-btn${gf.kit === k ? ' is-on' : ''}" data-gkit="${k}" aria-pressed="${gf.kit === k}">
        <svg class="ico"><use href="#${kit.icon}"/></svg><span>${esc(L(kit))}</span></button>`;
    }).join('');
  }

  function renderBudget() {
    if (!onFinder) return;
    const kit = KITS[gf.kit];
    els.gfBudgetStep.hidden = !kit;
    if (!kit) return;
    if (kit.perPiece) {
      els.gfBudgetLabel.textContent = t('perPiece');
      els.gfBudget.innerHTML = `<div class="fchips">${kit.perPiece.map(v =>
        `<button type="button" class="fchip${gf.per === v ? ' is-on' : ''}" data-per="${v}" aria-pressed="${gf.per === v}">${rupee(v)} <small>${esc(t('each'))}</small></button>`).join('')}</div>
        <div class="gf-inputs">
          <label class="gf-field"><span>₹ ${esc(t('each'))}</span><input type="number" inputmode="numeric" min="10" step="10" id="gfPer" value="${gf.per}"></label>
          <label class="gf-field"><span>${esc(t('guests'))}</span><input type="number" inputmode="numeric" min="1" step="1" id="gfGuests" value="${gf.guests}"></label>
        </div>`;
    } else {
      els.gfBudgetLabel.textContent = t('budget');
      els.gfBudget.innerHTML = `<div class="fchips">${kit.budgets.map(v =>
        `<button type="button" class="fchip${gf.budget === v ? ' is-on' : ''}" data-budget="${v}" aria-pressed="${gf.budget === v}">${rupee(v)}</button>`).join('')}</div>
        <div class="gf-inputs">
          <label class="gf-field"><span>${esc(t('custom'))} (₹)</span><input type="number" inputmode="numeric" min="500" step="500" id="gfAmount" value="${gf.budget}"></label>
        </div>`;
    }
  }

  function renderKitResult() {
    if (!onFinder) return;
    const kit = KITS[gf.kit];
    if (!kit) { els.gfResult.innerHTML = `<p class="gf-hint">${esc(t('pickFirst'))}</p>`; return; }
    if (!ITEMS) { els.gfResult.innerHTML = `<p class="gf-hint">${esc(t('loading'))}</p>`; return; }
    if (kit.perPiece) return renderGifts();
    const total = kitTotal();
    const diff = gf.budget - total;
    els.gfResult.innerHTML = `
      <div class="gf-head">
        <h3>${esc(t('yourList', L(kit), rupee(gf.budget)))}</h3>
      </div>
      <p class="gf-hint-edit">${esc(t('editHint'))}</p>
      <ol class="gf-picks">${gf.picks.map((p, idx) => {
        const x = pickInfo(p);
        const groups = p.slot.groups.slice(0, 40);
        if (!groups.includes(x.g)) groups.unshift(x.g);
        return `<li class="gf-pick">
          <div class="gf-pick-head">
            <span class="gf-slot">${esc(slotName(p.slot.s))}</span>
            <button type="button" class="gf-remove" data-gremove="${idx}" aria-label="${esc(t('remove'))}: ${esc(x.base)}"><svg class="ico"><use href="#i-trash"/></svg><span>${esc(t('remove'))}</span></button>
          </div>
          ${groups.length > 1
            ? `<div class="gf-select"><span>${esc(t('itemLbl'))}</span>
                <button type="button" class="pick-btn pick-btn-lg" data-gitem="${idx}" aria-haspopup="dialog">${pickInner(x.base, `${groups.length} ${lang === 'ta' ? 'தேர்வுகள்' : 'options'}`)}</button></div>`
            : `<strong class="gf-pick-name">${esc(x.base)}</strong>`}
          <div class="gf-pick-row">
            ${x.g.opts.length > 1 ? `<div class="gf-select gf-size"><span>${esc(t('sizeLbl'))}</span>
                <button type="button" class="pick-btn" data-gsize="${idx}" aria-haspopup="dialog">${pickInner(x.size, range(x.o.lo, x.o.hi))}</button></div>`
              : `<p class="gf-size gf-one">${esc(t('sizeLbl'))}: <b>${esc(x.size || t('oneSize'))}</b></p>`}
            <div class="gf-qty"><span>${esc(t('qtyLbl'))}</span>
              <div class="qty" role="group" aria-label="${esc(t('qtyLbl'))}">
                <button type="button" data-gqty="${idx}" data-d="-1" aria-label="−"><svg class="ico"><use href="#i-minus"/></svg></button>
                <span>${p.qty}</span>
                <button type="button" data-gqty="${idx}" data-d="1" aria-label="+"><svg class="ico"><use href="#i-plus"/></svg></button>
              </div>
            </div>
          </div>
          <p class="gf-pick-price"><b>${range(x.price)}</b> <small>${esc(t('each'))}</small>${p.qty > 1 ? ` <span>${esc(t('lineTotal', p.qty, rangeTotal([{ lo: x.price, hi: x.price, qty: p.qty }])))}</span>` : ''}</p>
        </li>`;
      }).join('')}</ol>
      <div class="gf-total">
        <span>${esc(t('total'))}</span><strong>${kitRange()}</strong>
        <em class="${diff < 0 ? 'is-over' : ''}">${esc(t(diff < 0 ? 'over' : 'left', rupee(gf.budget)))}</em>
      </div>
      ${gf.skipped.length ? `<p class="gf-note">${esc(t('skipped', gf.skipped.join(', ')))}</p>` : ''}
      <div class="gf-actions">
        <a href="#" class="btn btn-whatsapp" data-picker="whatsapp" data-gsend data-occasion="${esc(kit.en)} list" data-wa-text="${esc(kitMessage())}"><svg class="ico"><use href="#i-chat"/></svg><span>${esc(t('sendKit'))}</span></a>
        <button type="button" class="btn btn-outline" data-gaddall><svg class="ico"><use href="#i-list"/></svg><span>${esc(t('addAll'))}</span></button>
        <button type="button" class="gf-rebuild" data-grebuild><svg class="ico"><use href="#i-swap"/></svg>${esc(t('reset'))}</button>
      </div>
      <p class="gf-note price-note">${esc(t('priceNote'))}</p>
      <p class="gf-note">${esc(t('bulkNote'))}</p>`;
  }

  function giftOptions() {
    const kit = KITS.gifts;
    const per = gf.per;
    const used = new Set();
    const out = [];
    // one pick per gift idea, in the kit's order: the item priced closest to ~85% of the per-piece budget
    for (const phrase of kit.q) {
      const best = candidates([phrase], kit.not)
        .filter(c => c.price <= per && c.price >= per * 0.4 && !used.has(c.name))
        .sort((a, b) => Math.abs(a.price - per * 0.85) - Math.abs(b.price - per * 0.85))[0];
      if (best) { used.add(best.name); out.push(best); }
      if (out.length === 8) break;
    }
    return out;
  }

  function renderGifts() {
    const opts = giftOptions();
    const n = gf.guests;
    els.gfResult.innerHTML = `
      <div class="gf-head"><h3>${esc(t('giftOpts', rupee(gf.per)))}</h3></div>
      ${opts.length ? `<ul class="gf-gifts">${opts.map((c, i) => `<li class="gf-gift">
          <strong>${esc(splitSize(c.name).base)}${splitSize(c.name).size ? ` <small class="gf-gift-size">${esc(splitSize(c.name).size)}</small>` : ''}</strong>
          <span class="gf-gift-price">${range(c.price)} <small>${esc(t('each'))}</small></span>
          <span class="gf-gift-total">${esc(t('forGuests', n, rangeTotal([{ lo: c.price, hi: c.price, qty: n }])))}</span>
          <div class="gf-gift-acts">
            <a href="#" class="pcard-wa" data-picker="whatsapp" data-gsend data-occasion="Return gifts"
               data-wa-text="${esc(waMessage({ greeting: t('waGift', n), title: L(KITS.gifts),
                 items: [{ name: splitSize(c.name).base, size: splitSize(c.name).size, qty: n, lo: c.price, hi: c.price }],
                 total: rangeTotal([{ lo: c.price, hi: c.price, qty: n }]) }))}"><svg class="ico"><use href="#i-chat"/></svg><span>${esc(t('ask'))}</span></a>
            <button type="button" class="pcard-add" data-gift="${i}"><svg class="ico"><use href="#i-plus"/></svg><span>${esc(t('add'))}</span></button>
          </div>
        </li>`).join('')}</ul>` : `<p class="gf-hint">${esc(t('noGifts'))}</p>`}
      <p class="gf-note price-note">${esc(t('priceNote'))}</p>
      <p class="gf-note">${esc(t('bulkNote'))}</p>`;
    els.gfResult._gifts = opts;
  }

  function rebuild(reportIt = true) {
    const kit = KITS[gf.kit];
    if (!kit || !ITEMS) return renderKitResult();
    if (!kit.perPiece) buildKit();
    renderKitResult();
    if (reportIt) report('gift_finder_build', { occasion: gf.kit, budget: kit.perPiece ? gf.per * gf.guests : gf.budget });
  }

  function selectKit(k, opts = {}) {
    const kit = KITS[k];
    if (!kit) return;
    gf.kit = k;
    if (kit.perPiece) {
      gf.per = opts.per || gf.per || kit.def;
      gf.guests = opts.guests || gf.guests || kit.guests;
    } else {
      gf.budget = opts.budget || kit.def;
    }
    renderOccasions();
    renderBudget();
    renderKitResult();
    loadData().then(() => rebuild(), () => { els.gfResult.innerHTML = `<p class="gf-hint">${esc(t('loadFail'))}</p>`; });
  }

  if (onFinder) {
  els.gfOcc.addEventListener('click', e => {
    const b = e.target.closest('[data-gkit]');
    if (b) selectKit(b.dataset.gkit);
  });
  els.gfBudget.addEventListener('click', e => {
    const b = e.target.closest('[data-budget], [data-per]');
    if (!b) return;
    if (b.dataset.budget) gf.budget = +b.dataset.budget;
    else gf.per = +b.dataset.per;
    renderBudget();
    rebuild();
  });
  let inputTimer = null;
  els.gfBudget.addEventListener('input', e => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      const v = Math.round(+e.target.value || 0);
      if (e.target.id === 'gfAmount' && v >= 100) gf.budget = v;
      else if (e.target.id === 'gfPer' && v >= 10) gf.per = v;
      else if (e.target.id === 'gfGuests' && v >= 1) gf.guests = Math.min(v, 5000);
      else return;
      // refresh chip highlight without re-rendering the input being typed in
      $$('[data-budget]', els.gfBudget).forEach(c => c.classList.toggle('is-on', +c.dataset.budget === gf.budget));
      $$('[data-per]', els.gfBudget).forEach(c => c.classList.toggle('is-on', +c.dataset.per === gf.per));
      rebuild();
    }, 400);
  });
  els.gfResult.addEventListener('click', e => {
    // "Change item": other products for this line
    const itemBtn = e.target.closest('[data-gitem]');
    if (itemBtn) {
      const p = gf.picks[+itemBtn.dataset.gitem];
      const x = pickInfo(p);
      const groups = p.slot.groups.slice(0, 40);
      if (!groups.includes(x.g)) groups.unshift(x.g);
      openChoice({
        title: `${t('itemLbl')} · ${slotName(p.slot.s)}`,
        options: groups.map(g => ({ value: p.slot.groups.indexOf(g), label: g.base, aside: range(g.lo, g.hi),
          sub: g.opts.length < 2 ? '' : g.opts[0].band >= 0 ? t('sizes', g.opts.length) : g.opts.map(sizeName).join(' · '),
          selected: g === x.g })),
        onPick: v => {
          const cur = p.slot.cands[p.i].price;
          const g = p.slot.groups[+v];
          // keep roughly the same price: the size of the new product closest to the current one
          p.i = g.opts.reduce((best, o) => Math.abs(o.price - cur) < Math.abs(best.price - cur) ? o : best).i;
          renderKitResult();
          report('kit_change_item', { occasion: gf.kit, kit_item: slotName(p.slot.s).slice(0, 60), from_product: x.base.slice(0, 80), to_product: g.base.slice(0, 80) });
        },
      });
      return;
    }
    // "Size": the same product, bigger or smaller
    const sizeBtn = e.target.closest('[data-gsize]');
    if (sizeBtn) {
      const p = gf.picks[+sizeBtn.dataset.gsize];
      const x = pickInfo(p);
      openChoice({
        title: `${t('sizeLbl')} · ${x.base}`,
        options: x.g.opts.map((o, oi) => ({ value: oi, label: sizeName(o), aside: range(o.lo, o.hi), selected: oi === x.oi })),
        onPick: v => {
          p.i = x.g.opts[+v].i; renderKitResult();
          report('kit_change_size', { occasion: gf.kit, kit_item: slotName(p.slot.s).slice(0, 60), product: x.base.slice(0, 80), size: x.g.opts[+v].band >= 0 ? T.band.en[x.g.opts[+v].band] : x.g.opts[+v].size });
        },
      });
      return;
    }
    const q = e.target.closest('[data-gqty]');
    if (q) {
      const p = gf.picks[+q.dataset.gqty];
      p.qty = Math.max(1, Math.min(999, p.qty + +q.dataset.d));
      renderKitResult();
      report('kit_change_qty', { occasion: gf.kit, kit_item: slotName(p.slot.s).slice(0, 60), qty: p.qty });
      return;
    }
    const rm = e.target.closest('[data-gremove]');
    if (rm) {
      const [gone] = gf.picks.splice(+rm.dataset.gremove, 1);
      renderKitResult();
      report('kit_remove', { occasion: gf.kit, kit_item: slotName(gone.slot.s).slice(0, 60) });
      return;
    }
    if (e.target.closest('[data-grebuild]')) { rebuild(false); report('kit_restart', { occasion: gf.kit, budget: gf.budget }); return; }
    if (e.target.closest('[data-gaddall]')) {
      gf.picks.forEach(p => {
        const x = pickInfo(p);
        addToList({ name: x.sizeText ? `${x.base} (${x.sizeText})` : x.base, price: x.price, qty: p.qty });
      });
      toast(t('toastAll', gf.picks.length));
      report('add_to_list', { product: `kit:${gf.kit}`, link_location: 'gift_finder' });
      renderGrid();
      return;
    }
    const gift = e.target.closest('[data-gift]');
    if (gift) {
      const c = els.gfResult._gifts[+gift.dataset.gift];
      addToList({ name: c.name, price: c.price, qty: gf.guests });
      toast(t('toastAdd'));
      report('add_to_list', { product: c.name.slice(0, 100), link_location: 'gift_finder' });
      return;
    }
    const send = e.target.closest('[data-gsend]');
    if (send) {
      const gifts = KITS[gf.kit].perPiece;
      report('gift_finder_send', {
        occasion: gf.kit, budget: gifts ? gf.per * gf.guests : gf.budget, items: gifts ? 1 : gf.picks.length, currency: 'INR',
        value: Math.round(gifts ? gf.per * gf.guests : kitTotal()),
      });
    }
  }, true);
  }

  // ===== Analytics on the home page =====
  // English label of a link (reports stay in one language even when the page is in Tamil)
  const enLabel = (el) => { const t2 = el.matches('[data-ta]') ? el : el.querySelector('[data-ta]'); return ((t2 && t2.dataset.en) || el.textContent).trim().slice(0, 80); };
  // Category items ("Stainless steel vessels" → catalogue)
  $$('.cat-card .chips a').forEach(a => a.addEventListener('click', () => report('select_category_item', {
    category: a.closest('.cat-card').id.replace('cat-', ''), category_item: enLabel(a), link_url: a.getAttribute('href').slice(0, 100),
  })));
  // Highlights that open the lists: seer / new home panels, their budget buttons, the occasion cards, the catalogue card
  $$('.occ-feature a, .occ-cta, .tool-card').forEach(a => a.addEventListener('click', () => {
    const url = new URL(a.getAttribute('href'), location.href);
    report('select_promotion', {
      promotion_name: a.closest('.occ-feature') ? `panel_${url.searchParams.get('kit')}` : a.classList.contains('occ-cta') ? `card_${url.searchParams.get('kit')}` : 'catalogue_card',
      occasion: url.searchParams.get('kit') || '', budget: +url.searchParams.get('budget') || 0, creative_name: enLabel(a),
    });
  }));
  // The old-vessels exchange offer actually seen on screen
  const offer = [...$$('.term')].find(el => /exchange/i.test(el.textContent));
  if (offer && 'IntersectionObserver' in window) {
    const seen = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting)) { seen.disconnect(); report('view_offer', { offer: 'old_vessels_exchange' }); } }, { threshold: 0.6 });
    seen.observe(offer);
  }
  // Came back to the home page from the catalogue / lists (Back button or a menu link)
  if ($('#hero, .hero') || $('#categories')) {
    let from = '';
    try { const r = new URL(document.referrer); if (r.host === location.host) from = (r.pathname.match(/(catalogue|gift-finder)\.html$/) || [])[1] || ''; } catch (e) {}
    const navType = (performance.getEntriesByType && (performance.getEntriesByType('navigation')[0] || {}).type) || '';
    if (from || navType === 'back_forward') report('return_to_home', { from_page: from || 'unknown', method: navType === 'back_forward' ? 'back' : 'link' });
    // Back can also restore the page from the browser's memory without reloading it
    window.addEventListener('pageshow', e => { if (e.persisted) report('return_to_home', { from_page: 'unknown', method: 'back' }); });
  }

  // ===== Start the page =====
  // Links for ads:  catalogue.html?q=idly+pot   catalogue.html?cat=pooja
  //                 gift-finder.html?kit=housewarming&budget=10000   gift-finder.html?kit=gifts&per=100&guests=50
  if (onCatalogue) {
    state.q = (params.get('q') || '').slice(0, 60);
    els.query.value = state.q;
    if (CAT_INFO[params.get('cat')]) state.cat = params.get('cat');
    ensureCatalogue();
  }
  if (onFinder) {
    if (KITS[params.get('kit')]) {
      selectKit(params.get('kit'), { budget: +params.get('budget') || 0, per: +params.get('per') || 0, guests: +params.get('guests') || 0 });
    } else {
      loadData().catch(() => {});   // fetch the items in the background, ready for the first tap
    }
  }

  // ===== Language =====
  function renderAllText() {
    renderControls();
    renderGrid();
    renderOccasions();
    renderBudget();
    renderKitResult();
    renderList();
    if (onCatalogue && !ITEMS && catalogueReady) els.status.textContent = t('loading');
  }
  langHooks.push(renderAllText);
  renderAllText();
})();
