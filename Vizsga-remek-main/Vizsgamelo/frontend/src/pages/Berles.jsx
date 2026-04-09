import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Berles.css";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const CURATED_PRODUCTS = [
  {
    match: ["deuter", "aircontact"],
    name: "Deuter Aircontact Core 45+10 SL",
    brand: "Deuter",
    image: "/berles/deuter-aircontact-core-45-10-sl.jpg",
    desc:
      "Prémium többnapos trekking hátizsák állítható hordrendszerrel és kényelmes súlyelosztással.",
    weightKg: 2.03,
    rating: 4.8,
    category: "Hátizsák",
  },
  {
    match: ["osprey", "atmos"],
    name: "Osprey Atmos AG 50",
    brand: "Osprey",
    image: "/berles/osprey-atmos-ag-50.jpg",
    desc:
      "Kényelmes, jól szellőző trekking hátizsák hosszabb túrákra és nagyobb terheléshez.",
    weightKg: 1.96,
    rating: 4.9,
    category: "Hátizsák",
  },
  {
    match: ["gregory", "baltoro"],
    name: "Gregory Baltoro 65",
    brand: "Gregory",
    image: "/berles/gregory-baltoro-65.jpg",
    desc:
      "Masszív túrahátizsák nagyobb felszereléshez, többnapos és nehezebb utakra.",
    weightKg: 2.2,
    rating: 4.8,
    category: "Hátizsák",
  },
  {
    match: ["fjallraven", "kajka"],
    name: "Fjällräven Kajka 55",
    brand: "Fjällräven",
    image: "/berles/fjallraven-kajka-55.jpg",
    desc:
      "Erős, tartós prémium hátizsák kiváló hordkényelemmel hosszabb túrákra.",
    weightKg: 3.1,
    rating: 4.7,
    category: "Hátizsák",
  },

  {
    match: ["msr", "hubba"],
    name: "MSR Hubba Hubba 2",
    brand: "MSR",
    image: "/berles/msr-hubba-hubba-2.jpg",
    desc:
      "Könnyű, gyorsan felállítható két személyes sátor outdoor és trekking használatra.",
    weightKg: 1.7,
    rating: 4.8,
    category: "Sátor",
  },
  {
    match: ["big agnes", "copper spur"],
    name: "Big Agnes Copper Spur HV UL2",
    brand: "Big Agnes",
    image: "/berles/big-agnes-copper-spur-hv-ul2.jpg",
    desc:
      "Ultrakönnyű prémium sátor nagy belső térrel és kiváló pakolhatósággal.",
    weightKg: 1.5,
    rating: 4.9,
    category: "Sátor",
  },
  {
    match: ["marmot", "tungsten"],
    name: "Marmot Tungsten 2P",
    brand: "Marmot",
    image: "/berles/marmot-tungsten-2p.jpg",
    desc:
      "Stabil két személyes sátor, többnapos túrákra és változékony időjárásra.",
    weightKg: 2.6,
    rating: 4.7,
    category: "Sátor",
  },
  {
    match: ["nordisk", "oppland"],
    name: "Nordisk Oppland 2",
    brand: "Nordisk",
    image: "/berles/nordisk-oppland-2.jpg",
    desc:
      "Prémium, aerodinamikus sátor jó időjárásállósággal és kényelmes belső térrel.",
    weightKg: 2.9,
    rating: 4.8,
    category: "Sátor",
  },

  {
    match: ["marmot", "trestles"],
    name: "Marmot Trestles Elite Eco 20",
    brand: "Marmot",
    image: "/berles/marmot-trestles-elite-eco-20.jpg",
    desc:
      "Meleg, jól pakolható hálózsák hűvösebb éjszakákra és általános outdoor használatra.",
    weightKg: 1.5,
    rating: 4.6,
    category: "Hálózsák",
  },
  {
    match: ["sea to summit", "trek"],
    name: "Sea to Summit Trek TKII",
    brand: "Sea to Summit",
    image: "/berles/sea-to-summit-trek-tkii.jpg",
    desc:
      "Kényelmes, valós túrahálózsák jó szigeteléssel és kis csomagmérettel.",
    weightKg: 1.3,
    rating: 4.8,
    category: "Hálózsák",
  },
  {
    match: ["mountain hardwear", "bishop"],
    name: "Mountain Hardwear Bishop Pass 15",
    brand: "Mountain Hardwear",
    image: "/berles/mountain-hardwear-bishop-pass-15.jpg",
    desc:
      "Hidegebb körülményekhez is megfelelő, minőségi hálózsák túrázáshoz.",
    weightKg: 1.2,
    rating: 4.7,
    category: "Hálózsák",
  },
  {
    match: ["deuter", "orbit"],
    name: "Deuter Orbit -5",
    brand: "Deuter",
    image: "/berles/deuter-orbit-5.jpg",
    desc:
      "Kompakt, meleg hálózsák hosszabb túrákhoz és hűvösebb időre.",
    weightKg: 1.6,
    rating: 4.6,
    category: "Hálózsák",
  },

  {
    match: ["therm-a-rest", "neoair"],
    name: "Therm-a-Rest NeoAir XLite",
    brand: "Therm-a-Rest",
    image: "/berles/thermarest-neoair-xlite.jpg",
    desc:
      "Könnyű, prémium túramatrac kiváló hőszigeteléssel és kis csomagmérettel.",
    weightKg: 0.37,
    rating: 4.8,
    category: "Matrac",
  },
  {
    match: ["sea to summit", "ether light"],
    name: "Sea to Summit Ether Light XT",
    brand: "Sea to Summit",
    image: "/berles/sea-to-summit-ether-light-xt.jpg",
    desc:
      "Kényelmes, vastag matrac túrázáshoz és könnyű táborozáshoz.",
    weightKg: 0.49,
    rating: 4.7,
    category: "Matrac",
  },
  {
    match: ["exped", "ultra"],
    name: "Exped Ultra 3R",
    brand: "Exped",
    image: "/berles/exped-ultra-3r.jpg",
    desc:
      "Jó szigetelésű, könnyű túramatrac három évszakos használatra.",
    weightKg: 0.46,
    rating: 4.7,
    category: "Matrac",
  },
  {
    match: ["nemo", "tensor"],
    name: "Nemo Tensor Trail",
    brand: "Nemo",
    image: "/berles/nemo-tensor-trail.jpg",
    desc:
      "Kompakt, kényelmes matrac trekkinghez és könnyebb felszereléshez.",
    weightKg: 0.42,
    rating: 4.6,
    category: "Matrac",
  },

  {
    match: ["salomon", "x ultra"],
    name: "Salomon X Ultra 4 GTX",
    brand: "Salomon",
    image: "/berles/salomon-x-ultra-4-gtx.jpg",
    desc:
      "Valós túracipő stabilitással, jó tapadással és vízálló kialakítással.",
    weightKg: 0.39,
    rating: 4.8,
    category: "Ruházat",
  },
  {
    match: ["mammut", "ducan"],
    name: "Mammut Ducan Mid GTX",
    brand: "Mammut",
    image: "/berles/mammut-ducan-mid-gtx.jpg",
    desc:
      "Kényelmes, magas szárú túrabakancs hosszabb terepes használatra.",
    weightKg: 0.47,
    rating: 4.7,
    category: "Ruházat",
  },
  {
    match: ["patagonia", "torrentshell"],
    name: "Patagonia Torrentshell 3L",
    brand: "Patagonia",
    image: "/berles/patagonia-torrentshell-3l.jpg",
    desc:
      "Időjárásálló héjkabát túrázáshoz és változékony kültéri körülményekhez.",
    weightKg: 0.4,
    rating: 4.7,
    category: "Ruházat",
  },
  {
    match: ["arcteryx", "beta"],
    name: "Arc'teryx Beta Jacket",
    brand: "Arc'teryx",
    image: "/berles/arcteryx-beta-jacket.jpg",
    desc:
      "Prémium outdoor kabát megbízható időjárásvédelemmel és tartós kialakítással.",
    weightKg: 0.38,
    rating: 4.8,
    category: "Ruházat",
  },

  {
    match: ["jetboil", "flash"],
    name: "Jetboil Flash Cooking System",
    brand: "Jetboil",
    image: "/berles/jetboil-flash.jpg",
    desc:
      "Gyors forralásra tervezett kompakt főzőrendszer túrázáshoz és kempinghez.",
    weightKg: 0.37,
    rating: 4.7,
    category: "Főzés",
  },
  {
    match: ["msr", "pocketrocket"],
    name: "MSR PocketRocket Deluxe Kit",
    brand: "MSR",
    image: "/berles/msr-pocketrocket-deluxe-kit.jpg",
    desc:
      "Könnyű, megbízható túrafőző rendszer gyors vízforraláshoz és főzéshez.",
    weightKg: 0.28,
    rating: 4.8,
    category: "Főzés",
  },
  {
    match: ["primus", "lite plus"],
    name: "Primus Lite Plus",
    brand: "Primus",
    image: "/berles/primus-lite-plus.jpg",
    desc:
      "Kompakt főzőszett outdoor használatra, gyors forralással és jó csomagolhatósággal.",
    weightKg: 0.4,
    rating: 4.7,
    category: "Főzés",
  },
  {
    match: ["trangia", "27"],
    name: "Trangia 27-3 UL",
    brand: "Trangia",
    image: "/berles/trangia-27-3-ul.jpg",
    desc:
      "Klasszikus, strapabíró túrafőző szett egyszerű kültéri használathoz.",
    weightKg: 0.82,
    rating: 4.6,
    category: "Főzés",
  },

  {
    match: ["garmin", "etrex"],
    name: "Garmin eTrex Solar",
    brand: "Garmin",
    image: "/berles/garmin-etrex-solar.jpg",
    desc:
      "Valós kézi GPS pontos útvonalkövetéshez, hosszú üzemidővel és kültéri használatra.",
    weightKg: 0.14,
    rating: 4.8,
    category: "Navigáció",
  },
  {
    match: ["garmin", "gpsmap"],
    name: "Garmin GPSMAP 67",
    brand: "Garmin",
    image: "/berles/garmin-gpsmap-67.jpg",
    desc:
      "Prémium kézi navigációs eszköz megbízható útvonalkövetéshez és outdoor használatra.",
    weightKg: 0.23,
    rating: 4.8,
    category: "Navigáció",
  },
  {
    match: ["suunto", "mc-2"],
    name: "Suunto MC-2 Compass",
    brand: "Suunto",
    image: "/berles/suunto-mc-2-compass.jpg",
    desc:
      "Tartós és pontos tájoló klasszikus navigációhoz, túrázáshoz és tájfutáshoz.",
    weightKg: 0.075,
    rating: 4.6,
    category: "Navigáció",
  },
  {
    match: ["komoot"],
    name: "Komoot Premium Route Pack",
    brand: "Komoot",
    image: "/berles/komoot-premium-route-pack.jpg",
    desc:
      "Útvonaltervezéshez és outdoor navigációhoz hasznos digitális csomag.",
    weightKg: 0,
    rating: 4.5,
    category: "Navigáció",
  },

  {
    match: ["petzl", "actik"],
    name: "Petzl Actik Core",
    brand: "Petzl",
    image: "/berles/petzl-actik-core.jpg",
    desc:
      "Fejlámpa esti túrákhoz, kempingezéshez és biztonsági tartaléknak.",
    weightKg: 0.088,
    rating: 4.8,
    category: "Biztonság",
  },
  {
    match: ["black diamond", "spot"],
    name: "Black Diamond Spot 400-R",
    brand: "Black Diamond",
    image: "/berles/black-diamond-spot-400-r.jpg",
    desc:
      "Erős fejlámpa jó fényerővel, kültéri és esti használatra.",
    weightKg: 0.073,
    rating: 4.7,
    category: "Biztonság",
  },
  {
    match: ["lifesystems", "first aid"],
    name: "Lifesystems First Aid Pro",
    brand: "Lifesystems",
    image: "/berles/lifesystems-first-aid-pro.jpg",
    desc:
      "Alapvető elsősegély csomag túrázáshoz és vészhelyzeti használatra.",
    weightKg: 0.5,
    rating: 4.6,
    category: "Biztonság",
  },
  {
    match: ["inreach", "garmin"],
    name: "Garmin inReach Mini 2",
    brand: "Garmin",
    image: "/berles/garmin-inreach-mini-2.jpg",
    desc:
      "Kommunikációs és biztonsági eszköz távolabbi túrákhoz és outdoor helyzetekhez.",
    weightKg: 0.1,
    rating: 4.8,
    category: "Biztonság",
  },

  {
    match: ["hydrapak", "flux"],
    name: "HydraPak Flux 1L",
    brand: "HydraPak",
    image: "/berles/hydrapak-flux-1l.jpg",
    desc:
      "Könnyű, összenyomható kulacs túrázáshoz és gyors csomagoláshoz.",
    weightKg: 0.102,
    rating: 4.7,
    category: "Víz",
  },
  {
    match: ["nalgene", "wide mouth"],
    name: "Nalgene Wide Mouth 1L",
    brand: "Nalgene",
    image: "/berles/nalgene-wide-mouth-1l.jpg",
    desc:
      "Strapabíró klasszikus kulacs mindennapi és outdoor használatra.",
    weightKg: 0.18,
    rating: 4.7,
    category: "Víz",
  },
  {
    match: ["katadyn", "befree"],
    name: "Katadyn BeFree Filter",
    brand: "Katadyn",
    image: "/berles/katadyn-befree-filter.jpg",
    desc:
      "Praktikus vízszűrő kültéri vízkezeléshez és túrázáshoz.",
    weightKg: 0.063,
    rating: 4.7,
    category: "Víz",
  },
  {
    match: ["camelbak", "crux"],
    name: "CamelBak Crux Reservoir",
    brand: "CamelBak",
    image: "/berles/camelbak-crux-reservoir.jpg",
    desc:
      "Hydration rendszer hosszabb túrákhoz és folyamatos vízutánpótláshoz.",
    weightKg: 0.21,
    rating: 4.6,
    category: "Víz",
  },

  {
    match: ["black diamond", "trail cork"],
    name: "Black Diamond Trail Cork",
    brand: "Black Diamond",
    image: "/berles/black-diamond-trail-cork.jpg",
    desc:
      "Állítható túrabot stabilitáshoz, kényelmes markolattal és jó terhelhetőséggel.",
    weightKg: 0.49,
    rating: 4.7,
    category: "Trekking",
  },
  {
    match: ["leki", "makalu"],
    name: "Leki Makalu FX Carbon",
    brand: "Leki",
    image: "/berles/leki-makalu-fx-carbon.jpg",
    desc:
      "Könnyű karbon túrabot technikás terepre és hosszabb túrákra.",
    weightKg: 0.51,
    rating: 4.8,
    category: "Trekking",
  },
  {
    match: ["komperdell", "carbon c3"],
    name: "Komperdell Carbon C3",
    brand: "Komperdell",
    image: "/berles/komperdell-carbon-c3.jpg",
    desc:
      "Masszív, prémium trekking bot jó csillapítással és stabil fogással.",
    weightKg: 0.48,
    rating: 4.7,
    category: "Trekking",
  },
  {
    match: ["helinox", "passport"],
    name: "Helinox Passport TL",
    brand: "Helinox",
    image: "/berles/helinox-passport-tl.jpg",
    desc:
      "Könnyű, kompakt túrabot utazáshoz és általános outdoor használatra.",
    weightKg: 0.44,
    rating: 4.6,
    category: "Trekking",
  },
];

const CATEGORY_FALLBACKS = {
  Hátizsák: [
    {
      name: "Deuter Aircontact Core 45+10 SL",
      brand: "Deuter",
      image: "/berles/deuter-aircontact-core-45-10-sl.jpg",
      desc:
        "Prémium trekking hátizsák állítható hordrendszerrel és kényelmes súlyelosztással.",
      weightKg: 2.03,
      rating: 4.8,
    },
    {
      name: "Osprey Atmos AG 50",
      brand: "Osprey",
      image: "/berles/osprey-atmos-ag-50.jpg",
      desc:
        "Kényelmes, jól szellőző trekking hátizsák hosszabb túrákra.",
      weightKg: 1.96,
      rating: 4.9,
    },
  ],
  Sátor: [
    {
      name: "MSR Hubba Hubba 2",
      brand: "MSR",
      image: "/berles/msr-hubba-hubba-2.jpg",
      desc:
        "Könnyű, gyorsan felállítható két személyes sátor outdoor használatra.",
      weightKg: 1.7,
      rating: 4.8,
    },
    {
      name: "Marmot Tungsten 2P",
      brand: "Marmot",
      image: "/berles/marmot-tungsten-2p.jpg",
      desc: "Stabil két személyes sátor többnapos túrákra.",
      weightKg: 2.6,
      rating: 4.7,
    },
  ],
  Hálózsák: [
    {
      name: "Sea to Summit Trek TKII",
      brand: "Sea to Summit",
      image: "/berles/sea-to-summit-trek-tkii.jpg",
      desc:
        "Kényelmes, valós túrahálózsák jó szigeteléssel és kis csomagmérettel.",
      weightKg: 1.3,
      rating: 4.8,
    },
    {
      name: "Marmot Trestles Elite Eco 20",
      brand: "Marmot",
      image: "/berles/marmot-trestles-elite-eco-20.jpg",
      desc: "Meleg hálózsák hűvösebb éjszakákra.",
      weightKg: 1.5,
      rating: 4.6,
    },
  ],
  Matrac: [
    {
      name: "Therm-a-Rest NeoAir XLite",
      brand: "Therm-a-Rest",
      image: "/berles/thermarest-neoair-xlite.jpg",
      desc: "Könnyű túramatrac kiváló hőszigeteléssel.",
      weightKg: 0.37,
      rating: 4.8,
    },
    {
      name: "Sea to Summit Ether Light XT",
      brand: "Sea to Summit",
      image: "/berles/sea-to-summit-ether-light-xt.jpg",
      desc: "Kényelmes, vastag matrac trekkinghez és táborozáshoz.",
      weightKg: 0.49,
      rating: 4.7,
    },
  ],
  Ruházat: [
    {
      name: "Salomon X Ultra 4 GTX",
      brand: "Salomon",
      image: "/berles/salomon-x-ultra-4-gtx.jpg",
      desc: "Valós túracipő stabilitással és jó tapadással.",
      weightKg: 0.39,
      rating: 4.8,
    },
    {
      name: "Patagonia Torrentshell 3L",
      brand: "Patagonia",
      image: "/berles/patagonia-torrentshell-3l.jpg",
      desc: "Időjárásálló outdoor kabát változékony körülményekhez.",
      weightKg: 0.4,
      rating: 4.7,
    },
  ],
  Főzés: [
    {
      name: "Jetboil Flash Cooking System",
      brand: "Jetboil",
      image: "/berles/jetboil-flash.jpg",
      desc: "Gyors forralásra tervezett kompakt főzőrendszer.",
      weightKg: 0.37,
      rating: 4.7,
    },
    {
      name: "MSR PocketRocket Deluxe Kit",
      brand: "MSR",
      image: "/berles/msr-pocketrocket-deluxe-kit.jpg",
      desc: "Könnyű túrafőző rendszer gyors forraláshoz.",
      weightKg: 0.28,
      rating: 4.8,
    },
  ],
  Navigáció: [
    {
      name: "Garmin eTrex Solar",
      brand: "Garmin",
      image: "/berles/garmin-etrex-solar.jpg",
      desc: "Valós kézi GPS kültéri navigációhoz.",
      weightKg: 0.14,
      rating: 4.8,
    },
    {
      name: "Suunto MC-2 Compass",
      brand: "Suunto",
      image: "/berles/suunto-mc-2-compass.jpg",
      desc: "Pontos és tartós tájoló klasszikus navigációhoz.",
      weightKg: 0.075,
      rating: 4.6,
    },
  ],
  Biztonság: [
    {
      name: "Petzl Actik Core",
      brand: "Petzl",
      image: "/berles/petzl-actik-core.jpg",
      desc: "Fejlámpa esti túrákhoz és biztonsági tartaléknak.",
      weightKg: 0.088,
      rating: 4.8,
    },
    {
      name: "Lifesystems First Aid Pro",
      brand: "Lifesystems",
      image: "/berles/lifesystems-first-aid-pro.jpg",
      desc: "Alap elsősegély csomag túrázáshoz.",
      weightKg: 0.5,
      rating: 4.6,
    },
  ],
  Víz: [
    {
      name: "HydraPak Flux 1L",
      brand: "HydraPak",
      image: "/berles/hydrapak-flux-1l.jpg",
      desc: "Könnyű, összenyomható kulacs outdoor használatra.",
      weightKg: 0.102,
      rating: 4.7,
    },
    {
      name: "Nalgene Wide Mouth 1L",
      brand: "Nalgene",
      image: "/berles/nalgene-wide-mouth-1l.jpg",
      desc: "Strapabíró kulacs mindennapi túrázáshoz.",
      weightKg: 0.18,
      rating: 4.7,
    },
  ],
  Trekking: [
    {
      name: "Black Diamond Trail Cork",
      brand: "Black Diamond",
      image: "/berles/black-diamond-trail-cork.jpg",
      desc: "Állítható túrabot stabilitáshoz és kényelmes fogáshoz.",
      weightKg: 0.49,
      rating: 4.7,
    },
    {
      name: "Leki Makalu FX Carbon",
      brand: "Leki",
      image: "/berles/leki-makalu-fx-carbon.jpg",
      desc: "Könnyű karbon túrabot technikás terepre.",
      weightKg: 0.51,
      rating: 4.8,
    },
  ],
  default: [
    {
      name: "Prémium outdoor felszerelés",
      brand: "EXPLORE",
      image: "/berles/default-outdoor-gear.jpg",
      desc:
        "Minőségi outdoor felszerelés túrához, természetjáráshoz és táborozáshoz.",
      weightKg: 1,
      rating: 4.6,
    },
  ],
};

const CATEGORY_DESCRIPTIONS = {
  Hátizsák:
    "Kényelmes, hosszabb túrákra tervezett prémium hátizsák állítható hordrendszerrel.",
  Sátor:
    "Stabil, időjárásálló sátor többnapos outdoor használatra, gyors felállítással.",
  Hálózsák:
    "Kompakt, meleg hálózsák túrázáshoz és hűvösebb éjszakákhoz.",
  Matrac:
    "Könnyű, kényelmes matrac jobb hőszigeteléssel és kis csomagmérettel.",
  Ruházat:
    "Technikai outdoor ruházat és lábbeli változó terepre és időjárásra.",
  Főzés:
    "Kompakt túrafőző szett gyors forraláshoz és megbízható kültéri használatra.",
  Navigáció:
    "Navigációs eszközök pontos útvonalkövetéshez és biztos tájékozódáshoz.",
  Biztonság:
    "Alapvető biztonsági felszerelés esti, nehéz vagy vészhelyzeti használatra.",
  Víz:
    "Ivóvíz szállítására és szűrésére alkalmas praktikus felszerelés.",
  Trekking:
    "Stabilitást és kényelmet adó trekking felszerelés nehezebb terepre is.",
};

const GENERIC_NAME_PATTERNS = [
  /^prémium outdoor/i,
  /^trail essential/i,
  /^expedition ready/i,
  /^explore pro/i,
  /^outdoor felszerelés$/i,
  /^felszerelés$/i,
  /^termék$/i,
  /^hátizsák$/i,
  /^sátor$/i,
  /^hálózsák$/i,
  /^matrac$/i,
  /^ruházat$/i,
  /^főzés$/i,
  /^navigáció$/i,
  /^biztonság$/i,
  /^víz$/i,
  /^trekking$/i,
];

const fmtFt = (n) =>
  `${new Intl.NumberFormat("hu-HU").format(Number(n || 0))} Ft`;

function formatHuDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("hu-HU");
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function looksLikeUrl(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  return raw.startsWith("http://") || raw.startsWith("https://");
}

function normalizeImage(src) {
  if (!src) return "";
  const value = String(src).trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE}/${value}`;
  if (value.startsWith("/")) return value;

  return value;
}

function isGenericName(name) {
  if (!name || !String(name).trim()) return true;
  return GENERIC_NAME_PATTERNS.some((pattern) =>
    pattern.test(String(name).trim())
  );
}

function getCategoryFallback(category, index = 0) {
  const list = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
  return list[index % list.length];
}

function findCuratedProduct(row, index = 0) {
  const haystack = normalizeText(
    `${row?.nev || ""} ${row?.marka || ""} ${row?.kategoria || ""} ${
      row?.leiras || ""
    }`
  );

  const exact = CURATED_PRODUCTS.find((product) =>
    product.match.every((part) => haystack.includes(normalizeText(part)))
  );

  if (exact) return exact;

  return getCategoryFallback(row?.kategoria || "default", index);
}

function enhanceProduct(row, index = 0) {
  const category = row.kategoria || "Egyéb";
  const curated = findCuratedProduct(row, index);

  const rawName =
    row.nev && String(row.nev).trim() ? String(row.nev).trim() : "";
  const rawBrand =
    row.marka && String(row.marka).trim() ? String(row.marka).trim() : "";
  const rawDesc =
    row.leiras && String(row.leiras).trim() ? String(row.leiras).trim() : "";
  const rawImage =
    row.kep && String(row.kep).trim() ? String(row.kep).trim() : "";

  const cleanedDesc = rawDesc && !looksLikeUrl(rawDesc) ? rawDesc : "";
  const resolvedImage = normalizeImage(rawImage) || curated.image;

  return {
    id: Number(row.id),
    name: isGenericName(rawName) ? curated.name : rawName,
    category,
    brand: rawBrand || curated.brand || "Outdoor",
    pricePerDay: Number(row.ar_per_nap || 0),
    rating: Number(row.ertekeles || curated.rating || 0),
    weightKg: Number(row.suly_kg || curated.weightKg || 0),
    img: resolvedImage,
    desc:
      cleanedDesc ||
      curated.desc ||
      CATEGORY_DESCRIPTIONS[category] ||
      CATEGORY_DESCRIPTIONS.Trekking,
    darabszam: Number(row.darabszam || 0),
    aktiv: row.aktiv === undefined ? true : !!row.aktiv,
    fallbackImage: curated.image,
  };
}

export default function Berles() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const tomorrow = useMemo(() => getTomorrow(), []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Összes");
  const [brand, setBrand] = useState("Összes");
  const [onlyAvail, setOnlyAvail] = useState(true);
  const [sort, setSort] = useState("relevance");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [cart, setCart] = useState([]);
  const [kezd, setKezd] = useState(tomorrow);
  const [durationDays, setDurationDays] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const vege = useMemo(
    () => addDays(kezd, durationDays - 1),
    [kezd, durationDays]
  );

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await fetch(`${API_BASE}/api/berles-termekek`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Nem sikerült betölteni a bérlési termékeket."
        );
      }

      setItems(
        Array.isArray(data) ? data.map((row, i) => enhanceProduct(row, i)) : []
      );
    } catch (err) {
      setItems([]);
      setLoadError(
        err.message || "Nem sikerült betölteni a bérlési termékeket."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(items.map((i) => i.category).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "hu")
    );
  }, [items]);

  const brands = useMemo(() => {
    return [...new Set(items.map((i) => i.brand).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "hu")
    );
  }, [items]);

  const priceBounds = useMemo(() => {
    if (!items.length) return { min: 0, max: 0 };
    const prices = items.map((i) => i.pricePerDay);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);

  useEffect(() => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let out = items.filter((it) => {
      const available = it.aktiv && it.darabszam > 0;

      if (onlyAvail && !available) return false;
      if (cat !== "Összes" && it.category !== cat) return false;
      if (brand !== "Összes" && it.brand !== brand) return false;
      if (it.pricePerDay < minPrice || it.pricePerDay > maxPrice) return false;

      if (query) {
        const hay = `${it.name} ${it.category} ${it.brand} ${it.desc}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });

    const score = (it) => {
      const qScore = query
        ? it.name.toLowerCase().includes(query)
          ? 5
          : `${it.category} ${it.brand} ${it.desc}`.toLowerCase().includes(query)
          ? 2
          : 0
        : 0;

      return qScore + it.rating * 2 + Math.min(it.darabszam, 5) * 0.2;
    };

    out = [...out];

    if (sort === "relevance") out.sort((a, b) => score(b) - score(a));
    if (sort === "price_asc") out.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price_desc") out.sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === "rating_desc") out.sort((a, b) => b.rating - a.rating);
    if (sort === "stock_desc") out.sort((a, b) => b.darabszam - a.darabszam);

    return out;
  }, [items, q, cat, brand, onlyAvail, minPrice, maxPrice, sort]);

  const cartDetailed = useMemo(() => {
    return cart
      .map((cartItem) => {
        const product = items.find((i) => i.id === cartItem.termekId);
        if (!product) return null;

        return {
          ...cartItem,
          product,
          lineTotal: product.pricePerDay * cartItem.mennyiseg * durationDays,
        };
      })
      .filter(Boolean);
  }, [cart, items, durationDays]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.mennyiseg || 0), 0),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cartDetailed.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [cartDetailed]
  );

  const reset = () => {
    setQ("");
    setCat("Összes");
    setBrand("Összes");
    setOnlyAvail(true);
    setSort("relevance");
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  };

  const openNativePicker = (event) => {
    if (typeof event.target.showPicker === "function") {
      event.target.showPicker();
    }
  };

  const addToCart = (item) => {
    if (item.darabszam <= 0 || !item.aktiv) return;

    setCart((prev) => {
      const existing = prev.find((x) => x.termekId === item.id);

      if (!existing) {
        return [...prev, { termekId: item.id, mennyiseg: 1 }];
      }

      const nextQty = existing.mennyiseg + 1;

      if (nextQty > item.darabszam) {
        Swal.fire({
          icon: "warning",
          title: "Nincs több készleten",
          text: `${item.name} termékből maximum ${item.darabszam} db tehető a kosárba.`,
        });
        return prev;
      }

      return prev.map((x) =>
        x.termekId === item.id ? { ...x, mennyiseg: nextQty } : x
      );
    });
  };

  const decreaseCartItem = (termekId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.termekId === termekId
            ? { ...item, mennyiseg: item.mennyiseg - 1 }
            : item
        )
        .filter((item) => item.mennyiseg > 0)
    );
  };

  const increaseCartItem = (termekId) => {
    const product = items.find((i) => i.id === termekId);
    if (!product) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.termekId !== termekId) return item;

        if (item.mennyiseg + 1 > product.darabszam) {
          Swal.fire({
            icon: "warning",
            title: "Nincs több készleten",
            text: `${product.name} termékből maximum ${product.darabszam} db érhető el.`,
          });
          return item;
        }

        return { ...item, mennyiseg: item.mennyiseg + 1 };
      })
    );
  };

  const removeCartItem = (termekId) => {
    setCart((prev) => prev.filter((item) => item.termekId !== termekId));
  };

  const clearCart = () => setCart([]);

  const openProductDetails = (it) => {
    const safeName = escapeHtml(it.name);
    const safeCategory = escapeHtml(it.category);
    const safeBrand = escapeHtml(it.brand);
    const safeDesc = escapeHtml(it.desc);
    const safeImg = escapeHtml(it.img || it.fallbackImage);

    Swal.fire({
      title: safeName,
      width: 760,
      html: `
        <div style="display:grid;grid-template-columns:220px 1fr;gap:18px;align-items:start;text-align:left;">
          <div>
            <img
              src="${safeImg}"
              alt="${safeName}"
              style="width:100%;height:220px;object-fit:cover;border-radius:16px;display:block;background:#09110d;"
            />
          </div>
          <div style="line-height:1.75;">
            <div><strong>Kategória:</strong> ${safeCategory}</div>
            <div><strong>Márka:</strong> ${safeBrand}</div>
            <div><strong>Ár / nap:</strong> ${fmtFt(it.pricePerDay)}</div>
            <div><strong>Értékelés:</strong> ${Number(it.rating || 0).toFixed(1)}</div>
            <div><strong>Súly:</strong> ${Number(it.weightKg || 0)} kg</div>
            <div><strong>Készlet:</strong> ${it.darabszam} db</div>
            <div style="margin-top:10px;"><strong>Leírás:</strong><br/>${safeDesc}</div>
          </div>
        </div>
      `,
      confirmButtonText: "Bezárás",
    });
  };

  const handleCheckout = async () => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Bejelentkezés szükséges",
        text: "A bérléshez előbb jelentkezz be.",
      });
      return;
    }

    if (!cart.length) {
      Swal.fire({
        icon: "warning",
        title: "Üres a kosár",
        text: "Előbb tegyél a kosárba legalább egy terméket.",
      });
      return;
    }

    if (!kezd || kezd < tomorrow) {
      Swal.fire({
        icon: "warning",
        title: "Hibás kezdőnap",
        text: "Bérelni csak a következő naptól lehet.",
      });
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/berles/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          kezd,
          vege,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Nem sikerült rögzíteni a bérlést.");
      }

      const paymentPayload = {
        tipus: "berles",
        kezd,
        vege,
        napok: Number(data?.napok || durationDays),
        vegosszeg: Number(data?.vegosszeg || totalPrice),
        items: cartDetailed.map((item) => ({
          termekId: item.termekId,
          nev: item.product.name,
          mennyiseg: item.mennyiseg,
          napiAr: item.product.pricePerDay,
          lineTotal: item.lineTotal,
          kep: item.product.img,
          marka: item.product.brand,
          kategoria: item.product.category,
        })),
      };

      setCart([]);
      await fetchProducts();

      navigate("/fizetes", {
        state: paymentPayload,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sikertelen bérlés",
        text: err.message || "Ismeretlen hiba történt.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const visibleFrom = filtered.length ? 1 : 0;
  const visibleTo = filtered.length;

  return (
    <div className="berles-page">
      <div className="berles-shell">
        <section className="berles-header">
          <div className="berles-header-text">
            <span className="berles-kicker">EXPLORE • Bérlés</span>
            <h1>Felszerelés bérlés</h1>
            <p>
              Valós outdoor termékek, termékhez tartozó képek, egyszerű időtartam-választás
              és tovább a fizetésre.
            </p>
          </div>
        </section>

        <section className="berles-toolbar">
          <input
            className="berles-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keresés termékre, kategóriára vagy márkára..."
          />

          <select
            className="berles-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevance">Rendezés: relevancia</option>
            <option value="price_asc">Ár szerint: olcsóbb elöl</option>
            <option value="price_desc">Ár szerint: drágább elöl</option>
            <option value="rating_desc">Legjobbra értékelt</option>
            <option value="stock_desc">Legnagyobb készlet</option>
          </select>

          <button className="btn btn-secondary" type="button" onClick={reset}>
            Szűrők nullázása
          </button>
        </section>

        <section className="berles-layout">
          <aside className="panel filters-panel">
            <div className="panel-head">
              <h3>Szűrés</h3>
            </div>

            <label className="field">
              <span>Kategória</span>
              <select
                className="berles-select"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option>Összes</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Márka</span>
              <select
                className="berles-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option>Összes</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={onlyAvail}
                onChange={(e) => setOnlyAvail(e.target.checked)}
              />
              <span>Csak elérhető termékek</span>
            </label>

            <div className="range-group">
              <div className="range-head">
                <span>Minimum ár / nap</span>
                <strong>{fmtFt(minPrice)}</strong>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max || priceBounds.min}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
            </div>

            <div className="range-group">
              <div className="range-head">
                <span>Maximum ár / nap</span>
                <strong>{fmtFt(maxPrice)}</strong>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max || priceBounds.min}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </aside>

          <main className="products-area">
            <div className="products-topbar">
              <p>
                Mutatva: <strong>{visibleFrom}-{visibleTo}</strong> / {filtered.length}
              </p>
            </div>

            {loading ? (
              <div className="state-box">Termékek betöltése...</div>
            ) : loadError ? (
              <div className="state-box error-box">
                <p>{loadError}</p>
                <button className="btn" type="button" onClick={fetchProducts}>
                  Újrapróbálás
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map((it) => {
                  const available = it.aktiv && it.darabszam > 0;

                  return (
                    <article
                      key={it.id}
                      className={`product-card ${!available ? "sold-out" : ""}`}
                    >
                      <div className="product-image-wrap">
                        <img
                          src={it.img}
                          alt={it.name}
                          className="product-image"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = it.fallbackImage;
                          }}
                        />
                        <span className={`stock-badge ${available ? "ok" : "no"}`}>
                          {available ? "Elérhető" : "Elfogyott"}
                        </span>
                      </div>

                      <div className="product-body">
                        <div className="product-meta">
                          <span>{it.category}</span>
                          <span>{it.brand}</span>
                        </div>

                        <h3>{it.name}</h3>
                        <p className="product-desc">{it.desc}</p>

                        <div className="product-info-row">
                          <div>
                            <small>Ár / nap</small>
                            <strong>{fmtFt(it.pricePerDay)}</strong>
                          </div>
                          <div>
                            <small>Értékelés</small>
                            <strong>⭐ {Number(it.rating || 0).toFixed(1)}</strong>
                          </div>
                          <div>
                            <small>Készlet</small>
                            <strong>{available ? `${it.darabszam} db` : "0 db"}</strong>
                          </div>
                        </div>

                        <div className="product-actions">
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => openProductDetails(it)}
                          >
                            Részletek
                          </button>

                          <button
                            className="btn"
                            type="button"
                            disabled={!available}
                            onClick={() => addToCart(it)}
                          >
                            {available ? "Kosárba" : "Elfogyott"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>

          <aside className="panel cart-panel">
            <div className="panel-head">
              <h3>Kosár</h3>
              <span>{cartCount} db</span>
            </div>

            <label className="field">
              <span>Kezdés napja</span>
              <input
                className="berles-select"
                type="date"
                min={tomorrow}
                value={kezd}
                onChange={(e) => setKezd(e.target.value)}
                onFocus={openNativePicker}
                onClick={openNativePicker}
              />
            </label>

            <label className="field">
              <span>Időtartam</span>
              <select
                className="berles-select"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              >
                <option value={1}>1 nap</option>
                <option value={2}>2 nap</option>
                <option value={3}>3 nap</option>
                <option value={4}>4 nap</option>
                <option value={5}>5 nap</option>
                <option value={6}>6 nap</option>
                <option value={7}>7 nap</option>
              </select>
            </label>

            <div className="cart-summary-top">
              <div>
                <small>Kezdés</small>
                <strong>{formatHuDate(kezd)}</strong>
              </div>
              <div>
                <small>Vége</small>
                <strong>{formatHuDate(vege)}</strong>
              </div>
              <div>
                <small>Napok száma</small>
                <strong>{durationDays}</strong>
              </div>
              <div>
                <small>Végösszeg</small>
                <strong>{fmtFt(totalPrice)}</strong>
              </div>
            </div>

            {!cartDetailed.length ? (
              <div className="empty-cart">
                A kosár üres. Válassz ki egy terméket a listából.
              </div>
            ) : (
              <div className="cart-items">
                {cartDetailed.map((item) => (
                  <div
                    key={item.termekId}
                    className="cart-item"
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <img
                      src={item.product.img}
                      alt={item.product.name}
                      onError={(e) => {
                        e.currentTarget.src = item.product.fallbackImage;
                      }}
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        flexShrink: 0,
                        background: "#08110d",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cart-item-top">
                        <strong>{item.product.name}</strong>
                        <button
                          type="button"
                          className="remove-link"
                          onClick={() => removeCartItem(item.termekId)}
                        >
                          Törlés
                        </button>
                      </div>

                      <div className="cart-item-meta">
                        {item.product.brand} • {fmtFt(item.product.pricePerDay)} / nap
                      </div>

                      <div className="cart-qty-row">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => decreaseCartItem(item.termekId)}
                        >
                          −
                        </button>
                        <span>{item.mennyiseg} db</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => increaseCartItem(item.termekId)}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-line-total">{fmtFt(item.lineTotal)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-footer">
              <button
                className="btn cart-main-btn"
                type="button"
                disabled={checkoutLoading || !cart.length}
                onClick={handleCheckout}
              >
                {checkoutLoading ? "Feldolgozás..." : "Tovább fizetésre"}
              </button>

              <button
                className="btn btn-secondary cart-secondary-btn"
                type="button"
                onClick={clearCart}
                disabled={!cart.length}
              >
                Kosár ürítése
              </button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}