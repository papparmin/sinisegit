export const TOURS = [
  {
    id: 1,
    slug: "mati-gereg-csirke-tura",
    title: "Téli Mátra Gerinctúra",
    region: "Mátra, Magyarország",
    duration: "2 nap / 1 éj",
    difficulty: "Közepes",
    priceFt: 85000,
    tag: "Téli / Fagyos",
    cover:
      "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?cs=srgb&dl=pexels-pixabay-417173.jpg&fm=jpg",
    shortDesc:
      "Havas gerincek, kilátók és forró teázás a menedékháznál. Tapasztalt vezetővel, biztonságosan.",
    longDesc: [
      "Ez a túra a Mátra legszebb gerincszakaszaira visz fel: kilátók, panorámák, havas ösvények – mindezt úgy, hogy a tempó tartható legyen egy átlagos állóképességgel rendelkező túrázónak is.",
      "A programot úgy rakjuk össze, hogy a napsütéses szakaszok és a védettebb erdei részek váltakozzanak. Estére meleg szállás és vacsora, reggel pedig korai indulás a legjobb fényekért.",
      "A túra vezetett, útvonaltervvel és biztonsági protokollal. Télen különösen figyelünk a réteges öltözködésre, a csúszásgátlásra és a várható időjárásra.",
    ],
    highlights: [
      "Mátrai panoráma gerincszakaszok",
      "Kilátópontok fotózáshoz",
      "Meleg szállás / menedékház hangulat",
      "Kis csoport, vezetett tempó",
    ],
    itinerary: [
      {
        day: "1. nap",
        text:
          "Találkozó reggel, felszerelés-ellenőrzés, gerinctúra fő panorámapontokkal. Délután leereszkedés, szállás elfoglalása, vacsora.",
      },
      {
        day: "2. nap",
        text:
          "Korai indulás, kilátó és erdei szakaszok, fotós megállók. Kora délután visszaérkezés a kiindulópontra.",
      },
    ],
    includes: [
      "Helyismerettel rendelkező túravezető",
      "Útvonalterv és biztonsági tájékoztató",
      "Szállás (1 éj) – csomagtól függően",
    ],
    notIncludes: [
      "Utazás a találkozópontra",
      "Egyéni biztosítás",
      "Étkezés (ha a csomag nem tartalmazza)",
    ],
    meetingPoint: "Mátrafüred (pontos helyszín foglalás után)",
    season: "Tél",
  },

  {
    id: 2,
    slug: "gemend-vizivilag",
    title: "Gemenc Vízivilág",
    region: "Gemenc, Magyarország",
    duration: "3 nap / 2 éj",
    difficulty: "Könnyű",
    priceFt: 125000,
    tag: "Víz / Kenu",
    cover:
      "https://images.pexels.com/photos/273886/pexels-photo-273886.jpeg?cs=srgb&dl=pexels-pixabay-273886.jpg&fm=jpg",
    shortDesc:
      "Kenuzás holtágakon, madárles, nyugodt vízi útvonalak. Kezdőknek is barátságos.",
    longDesc: [
      "Gemenc Európa egyik legkülönlegesebb ártéri erdeje. A vízi világ csendje és a madárhangok olyan élményt adnak, amit a városban nem kapsz meg.",
      "A túra úgy van felépítve, hogy a kenuzási szakaszok rövidek és élvezhetőek legyenek. Megállunk pihenni, fotózni, és megtanítjuk a biztos alapokat azoknak is, akik még sosem eveztek.",
      "A program része a természetismereti blokk: élőhelyek, nyomok, madarak – nem unalmasan, hanem élményként.",
    ],
    highlights: [
      "Kezdőbarát kenuzás",
      "Madárles és fotóstopok",
      "Ártéri erdei csatornák",
      "Nyugodt tempó, sok pihenő",
    ],
    itinerary: [
      { day: "1. nap", text: "Ismerkedés, alap evezéstechnika, rövid vízi kör." },
      { day: "2. nap", text: "Hosszabb túraszakasz, madárles, piknik megálló." },
      { day: "3. nap", text: "Levezető evezés, zárás, hazautazás." },
    ],
    includes: ["Túravezető", "Alap evezős oktatás", "Útvonal és szervezés"],
    notIncludes: ["Szállás", "Étkezés", "Utazás"],
    meetingPoint: "Baja (pontos helyszín foglalás után)",
    season: "Tavasz–Ősz",
  },

  {
    id: 3,
    slug: "bukk-oserdeje",
    title: "Bükk Őserdeje",
    region: "Bükk, Magyarország",
    duration: "2 nap / 1 éj",
    difficulty: "Haladó",
    priceFt: 79000,
    tag: "Erdő / Haladó",
    cover:
      "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?cs=srgb&dl=pexels-pixabay-167699.jpg&fm=jpg",
    shortDesc:
      "Ritkán járt ösvények, szurdokok és vadregényes erdei szakaszok – komolyabb túrázóknak.",
    longDesc: [
      "A Bükkben vannak olyan részek, ahol tényleg érzed, hogy erdőben vagy: mély völgyek, patakátkelések, sziklás kapaszkodók.",
      "Ez a túra haladóknak készült: hosszabb táv, több szint, több technikás rész. Cserébe olyan helyekre jutsz el, ahová a tömeg nem.",
      "A csoport tempója sportos, a megállók rövidek és célzottak. A cél: igazi erdei élmény, nem sétapark.",
    ],
    highlights: [
      "Vadregényes szurdokok",
      "Technikásabb emelkedők",
      "Tömegtől távoli útvonal",
      "Haladó tempó",
    ],
    itinerary: [
      { day: "1. nap", text: "Hosszú erdei etap, szurdokok, esti pihenés." },
      { day: "2. nap", text: "Gerinc és völgy váltakozás, záró panoráma." },
    ],
    includes: ["Túravezető", "Útvonalterv", "Biztonsági tájékoztató"],
    notIncludes: ["Szállás", "Étkezés", "Utazás"],
    meetingPoint: "Lillafüred környéke (foglalás után)",
    season: "Egész év",
  },

  {
    id: 4,
    slug: "alpesek-gerinctura",
    title: "Alpesi Gerinctúra",
    region: "Alpok (AT/IT)",
    duration: "4 nap / 3 éj",
    difficulty: "Haladó",
    priceFt: 210000,
    tag: "Hegy / Haladó",
    cover:
      "https://images.pexels.com/photos/552785/pexels-photo-552785.jpeg?cs=srgb&dl=pexels-pixabay-552785.jpg&fm=jpg",
    shortDesc:
      "Magashegyi panorámák, gerincek, biztosított szakaszok – erős állóképesség és stabil lépés kell.",
    longDesc: [
      "Ez már igazi magashegy: hosszabb napok, komolyabb szint, változó idő. A jutalom: brutális panorámák és olyan gerincszakaszok, amiket nem felejtesz el.",
      "A túra során figyelünk a biztonságra, az időjárás-ablakokra, és a csoport terhelhetőségére. Nem verseny, de nem is kirándulás.",
      "A programot úgy állítottuk össze, hogy minden napnak legyen csúcspontja: kilátó, gerinc, fotó, majd levezetés a szállásig.",
    ],
    highlights: [
      "Magashegyi gerincszakaszok",
      "Panoráma fotópontok",
      "Tapasztalt vezetés",
      "Sportos tempó",
    ],
    itinerary: [
      { day: "1. nap", text: "Érkezés, bemelegítő útvonal, akklimatizáció." },
      { day: "2. nap", text: "Gerinctúra fő panorámaszakaszokkal." },
      { day: "3. nap", text: "Csúcsnap – hosszú etap, sok szint." },
      { day: "4. nap", text: "Levezető túra, hazautazás." },
    ],
    includes: ["Túravezetés", "Útvonalterv", "Szervezés"],
    notIncludes: ["Szállás", "Utazás", "Biztosítás"],
    meetingPoint: "Helyszín egyeztetés foglalás után",
    season: "Nyár–Ősz",
  },

  {
    id: 5,
    slug: "balaton-felvidek-kilatok",
    title: "Balaton-felvidék Kilátók",
    region: "Balaton-felvidék",
    duration: "1 nap",
    difficulty: "Könnyű",
    priceFt: 29000,
    tag: "Panoráma",
    cover:
      "https://images.pexels.com/photos/355872/pexels-photo-355872.jpeg?cs=srgb&dl=pexels-pixabay-355872.jpg&fm=jpg",
    shortDesc:
      "Könnyed túra kilátókkal, tanúhegyekkel és balatoni panorámával. Családbarát.",
    longDesc: [
      "Tanúhegyek, bazaltos formák, és a Balaton. Ez a túra a látványról és a jó hangulatról szól.",
      "Sok rövid megálló, sok fotó, kényelmes tempó. Kezdőknek és “vasárnapi” túrázóknak tökéletes.",
    ],
    highlights: ["Kilátók", "Balatoni panoráma", "Laza tempó", "Fotóbarát útvonal"],
    itinerary: [{ day: "1 nap", text: "Körtúra kilátókkal, pihenőkkel, zárás délután." }],
    includes: ["Túravezető", "Útvonal és szervezés"],
    notIncludes: ["Utazás", "Étkezés"],
    meetingPoint: "Balaton-felvidék (foglalás után)",
    season: "Tavasz–Ősz",
  },

  {
    id: 6,
    slug: "dunakanyar-naplemente",
    title: "Dunakanyar Naplemente Túra",
    region: "Dunakanyar",
    duration: "1 nap (délután–este)",
    difficulty: "Közepes",
    priceFt: 34000,
    tag: "Naplemente",
    cover:
      "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?cs=srgb&dl=pexels-alex-azabache-1624438.jpg&fm=jpg",
    shortDesc:
      "Aranyóra a Dunakanyar felett: délutáni kapaszkodó, csúcson naplemente, majd leereszkedés fejlámpával.",
    longDesc: [
      "Késő délután indulunk, hogy a csúcson már a legszebb fények fogadjanak. A naplemente után kontrollált tempóban jövünk le.",
      "Nem extrém, de kell hozzá alap állóképesség. A fejlámpa kötelező – a hangulat meg garantált.",
    ],
    highlights: ["Naplemente csúcson", "Aranyórás fotók", "Laza, de sportos", "Kis csoport"],
    itinerary: [{ day: "1 nap", text: "Felfelé túra, naplemente, leereszkedés." }],
    includes: ["Túravezető", "Biztonsági tájékoztató"],
    notIncludes: ["Fejlámpa", "Utazás"],
    meetingPoint: "Dunakanyar (foglalás után)",
    season: "Egész év",
  },

  {
    id: 7,
    slug: "zemplen-vadvilag",
    title: "Zemplén Vadvilág",
    region: "Zemplén",
    duration: "2 nap / 1 éj",
    difficulty: "Közepes",
    priceFt: 99000,
    tag: "Vadles",
    cover:
      "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?cs=srgb&dl=pexels-pixabay-247431.jpg&fm=jpg",
    shortDesc:
      "Erdők, kilátók, vadvilág nyomai. Reggeli–esti aktív időszakokra optimalizált útvonal.",
    longDesc: [
      "Zemplénben a vadnyomok és a csend különleges élmény. A túrát úgy terveztük, hogy a legjobb időszakokban legyünk a terepen.",
      "Közepes nehézség, változatos terep. Több kilátó és gerincszakasz is belefér.",
    ],
    highlights: ["Vadnyom olvasás", "Kilátók", "Változatos terep", "Közepes szint"],
    itinerary: [
      { day: "1. nap", text: "Délutáni túra, kilátó, esti zárás." },
      { day: "2. nap", text: "Reggeli erdei etap, panoráma, visszaérkezés." },
    ],
    includes: ["Túravezető", "Természetismereti blokk"],
    notIncludes: ["Szállás", "Étkezés"],
    meetingPoint: "Zemplén (foglalás után)",
    season: "Tavasz–Ősz",
  },

  {
    id: 8,
    slug: "hortobagy-csillagos-eg",
    title: "Hortobágy – Csillagos Ég",
    region: "Hortobágy",
    duration: "1 éjszaka",
    difficulty: "Könnyű",
    priceFt: 39000,
    tag: "Csillagnézés",
    cover:
      "https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg?cs=srgb&dl=pexels-brady-knoll-1257860.jpg&fm=jpg",
    shortDesc:
      "Sötét égbolt, csillagnézés, könnyű esti séta – igazi chill program, fotósoknak is.",
    longDesc: [
      "A Hortobágy sötét égboltja brutálisan jó csillagnézéshez. Kora este könnyű séta, majd csillagos program.",
      "Ajánlott: meleg ruha, takaró, termosz. A tempó laza, az élmény nagy.",
    ],
    highlights: ["Sötét égbolt", "Csillagnézés", "Fotóbarát", "Könnyű séta"],
    itinerary: [{ day: "Este", text: "Séta, csillagnézés, zárás éjfél körül." }],
    includes: ["Vezetés", "Programvezetés"],
    notIncludes: ["Utazás", "Meleg ital"],
    meetingPoint: "Hortobágy (foglalás után)",
    season: "Tavasz–Ősz",
  },

  {
    id: 9,
    slug: "videki-bike-tura",
    title: "Vidéki Bike Túra",
    region: "Magyarország (változó)",
    duration: "1 nap",
    difficulty: "Közepes",
    priceFt: 32000,
    tag: "Kerékpár",
    cover:
      "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?cs=srgb&dl=pexels-pixabay-276517.jpg&fm=jpg",
    shortDesc:
      "Közepes tempójú bringázás szép vidéki útvonalakon, pihenőkkel és fotóstoppal.",
    longDesc: [
      "Nem verseny, de érezzük a távot. Közepes tempó, jó útvonal, sok élmény.",
      "Ha nincs bringád, a bérlés külön kérhető (később beköthető a rendszerbe).",
    ],
    highlights: ["Szép útvonal", "Közepes tempó", "Pihenők", "Fotóstopok"],
    itinerary: [{ day: "1 nap", text: "Körtúra, pihenők, zárás délután." }],
    includes: ["Vezetés", "Útvonal és szervezés"],
    notIncludes: ["Kerékpár", "Utazás"],
    meetingPoint: "Egyeztetés foglalás után",
    season: "Tavasz–Ősz",
  },

  {
    id: 10,
    slug: "tiszato-nadasok",
    title: "Tisza-tó Nádasok",
    region: "Tisza-tó",
    duration: "2 nap / 1 éj",
    difficulty: "Könnyű",
    priceFt: 88000,
    tag: "Víz / Chill",
    cover:
      "https://images.pexels.com/photos/132037/pexels-photo-132037.jpeg?cs=srgb&dl=pexels-pixabay-132037.jpg&fm=jpg",
    shortDesc:
      "Könnyű vízparti túra és élményprogram. Nádasok, naplemente, relax.",
    longDesc: [
      "A Tisza-tó egyik legjobb része a nyugi: vízpart, nádas, madarak. Laza tempó, sok megálló.",
      "Kifejezetten ajánlott kezdőknek és azoknak, akik nem szétizzadni, hanem feltöltődni akarnak.",
    ],
    highlights: ["Nádasok", "Naplemente", "Könnyű program", "Chill vibe"],
    itinerary: [
      { day: "1. nap", text: "Vízparti séta, program, naplemente." },
      { day: "2. nap", text: "Könnyű záró etap, hazautazás." },
    ],
    includes: ["Vezetés", "Program"],
    notIncludes: ["Szállás", "Utazás"],
    meetingPoint: "Tisza-tó (foglalás után)",
    season: "Tavasz–Ősz",
  },
];
