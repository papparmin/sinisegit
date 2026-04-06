import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Berles.css";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const PRODUCT_FALLBACKS = {
  "Hátizsák": {
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Osprey Atmos AG 50",
      "Deuter Aircontact Core 45+10",
      "Gregory Baltoro 65",
      "Fjällräven Kajka 55",
    ],
  },
  "Sátor": {
    image:
      "https://images.unsplash.com/photo-1504280390368-397dc1f76f8a?auto=format&fit=crop&w=1200&q=80",
    names: [
      "MSR Hubba Hubba 2",
      "Big Agnes Copper Spur HV UL2",
      "Marmot Tungsten 2P",
      "Nordisk Oppland 2",
    ],
  },
  "Hálózsák": {
    image:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Marmot Trestles Elite Eco 20",
      "Sea to Summit Trek TKII",
      "Mountain Hardwear Bishop Pass 15",
      "Deuter Orbit -5",
    ],
  },
  "Matrac": {
    image:
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Therm-a-Rest NeoAir XLite",
      "Sea to Summit Ether Light XT",
      "Exped Ultra 3R",
      "Nemo Tensor Trail",
    ],
  },
  "Ruházat": {
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Salomon X Ultra 4 GTX",
      "Mammut Ducan Mid GTX",
      "Patagonia Torrentshell 3L",
      "Arc'teryx Beta Jacket",
    ],
  },
  "Főzés": {
    image:
      "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Jetboil Flash Cooking System",
      "MSR PocketRocket Deluxe Kit",
      "Primus Lite Plus",
      "Trangia 27-3 UL",
    ],
  },
  "Navigáció": {
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Garmin eTrex Solar",
      "Garmin GPSMAP 67",
      "Suunto MC-2 Compass",
      "Komoot Premium Route Pack",
    ],
  },
  "Biztonság": {
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Petzl Actik Core",
      "Black Diamond Spot 400-R",
      "Lifesystems First Aid Pro",
      "Garmin inReach Mini 2",
    ],
  },
  "Víz": {
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
    names: [
      "HydraPak Flux 1L",
      "Nalgene Wide Mouth 1L",
      "Katadyn BeFree Filter",
      "CamelBak Crux Reservoir",
    ],
  },
  "Trekking": {
    image:
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Black Diamond Trail Cork",
      "Leki Makalu FX Carbon",
      "Komperdell Carbon C3",
      "Helinox Passport TL",
    ],
  },
  default: {
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    names: [
      "Prémium Outdoor Felszerelés",
      "Trail Essential Gear",
      "Expedition Ready Kit",
      "Explore Pro Equipment",
    ],
  },
};

const CATEGORY_DESCRIPTIONS = {
  "Hátizsák":
    "Kényelmes, hosszabb túrákra tervezett prémium hátizsák állítható hordrendszerrel.",
  "Sátor":
    "Stabil, időjárásálló sátor többnapos outdoor használatra, gyors felállítással.",
  "Hálózsák":
    "Kompakt, meleg hálózsák túrázáshoz és hűvösebb éjszakákhoz.",
  "Matrac":
    "Könnyű, kényelmes matrac jobb hőszigeteléssel és kis csomagmérettel.",
  "Ruházat":
    "Technikai outdoor ruházat és lábbeli változó terepre és időjárásra.",
  "Főzés":
    "Kompakt túrafőző szett gyors forraláshoz és megbízható kültéri használatra.",
  "Navigáció":
    "Navigációs eszközök pontos útvonalkövetéshez és biztos tájékozódáshoz.",
  "Biztonság":
    "Alapvető biztonsági felszerelés esti, nehéz vagy vészhelyzeti használatra.",
  "Víz":
    "Ivóvíz szállítására és szűrésére alkalmas praktikus felszerelés.",
  "Trekking":
    "Stabilitást és kényelmet adó trekking felszerelés nehezebb terepre is.",
};

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

function enhanceProduct(row, index = 0) {
  const category = row.kategoria || "Egyéb";
  const fallback = PRODUCT_FALLBACKS[category] || PRODUCT_FALLBACKS.default;
  const fallbackName =
    fallback.names[index % fallback.names.length] || fallback.names[0];

  return {
    id: Number(row.id),
    name:
      row.nev && String(row.nev).trim()
        ? row.nev
        : fallbackName,
    category,
    brand: row.marka || "Outdoor",
    pricePerDay: Number(row.ar_per_nap || 0),
    rating: Number(row.ertekeles || 0),
    weightKg: Number(row.suly_kg || 0),
    img:
      row.kep && String(row.kep).trim()
        ? row.kep
        : fallback.image,
    desc:
      row.leiras && String(row.leiras).trim()
        ? row.leiras
        : CATEGORY_DESCRIPTIONS[category] || CATEGORY_DESCRIPTIONS["Trekking"],
    darabszam: Number(row.darabszam || 0),
    aktiv: !!row.aktiv,
    fallbackImage: fallback.image,
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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [cart, setCart] = useState([]);
  const [kezd, setKezd] = useState(tomorrow);
  const [durationDays, setDurationDays] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const vege = useMemo(() => addDays(kezd, durationDays - 1), [kezd, durationDays]);

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

      setItems(Array.isArray(data) ? data.map((row, i) => enhanceProduct(row, i)) : []);
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
      const available = it.darabszam > 0;

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

  useEffect(() => {
    setPage(1);
  }, [q, cat, brand, onlyAvail, minPrice, maxPrice, sort, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

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
    () => cartDetailed.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [cartDetailed]
  );

  const reset = () => {
    setQ("");
    setCat("Összes");
    setBrand("Összes");
    setOnlyAvail(true);
    setSort("relevance");
    setPerPage(9);
    setPage(1);
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  };

  const openNativePicker = (event) => {
    if (typeof event.target.showPicker === "function") {
      event.target.showPicker();
    }
  };

  const addToCart = (item) => {
    if (item.darabszam <= 0) return;

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

  const visibleFrom = filtered.length ? (safePage - 1) * perPage + 1 : 0;
  const visibleTo = filtered.length
    ? Math.min(safePage * perPage, filtered.length)
    : 0;

  return (
    <div className="berles-page">
      <div className="berles-shell">
        <section className="berles-header">
          <div className="berles-header-text">
            <span className="berles-kicker">EXPLORE • Bérlés</span>
            <h1>Felszerelés bérlés</h1>
            <p>
              Valós outdoor termékek, normális képek, egyszerű időtartam-választás és tovább a fizetésre.
            </p>
          </div>

          <div className="berles-header-stats">
            <div className="mini-stat">
              <span>Találat</span>
              <strong>{filtered.length}</strong>
            </div>
            <div className="mini-stat">
              <span>Kosár</span>
              <strong>{cartCount} db</strong>
            </div>
            <div className="mini-stat">
              <span>Napok</span>
              <strong>{durationDays}</strong>
            </div>
            <div className="mini-stat">
              <span>Összesen</span>
              <strong>{fmtFt(totalPrice)}</strong>
            </div>
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

            <label className="field">
              <span>Termék / oldal</span>
              <select
                className="berles-select"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={9}>9 / oldal</option>
                <option value={12}>12 / oldal</option>
                <option value={18}>18 / oldal</option>
              </select>
            </label>
          </aside>

          <main className="products-area">
            <div className="products-topbar">
              <p>
                Mutatva: <strong>{visibleFrom}-{visibleTo}</strong> / {filtered.length}
              </p>

              <div className="pager">
                <button
                  className="pager-btn"
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  ←
                </button>
                <span className="pager-info">
                  {safePage} / {totalPages}
                </span>
                <button
                  className="pager-btn"
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                >
                  →
                </button>
              </div>
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
                {paged.map((it) => {
                  const available = it.darabszam > 0;

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
                            <strong>⭐ {it.rating.toFixed(1)}</strong>
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
                            onClick={() =>
                              Swal.fire({
                                title: it.name,
                                html: `
                                  <div style="text-align:left;line-height:1.7">
                                    <div><strong>Kategória:</strong> ${it.category}</div>
                                    <div><strong>Márka:</strong> ${it.brand}</div>
                                    <div><strong>Ár / nap:</strong> ${fmtFt(it.pricePerDay)}</div>
                                    <div><strong>Értékelés:</strong> ${it.rating.toFixed(1)}</div>
                                    <div><strong>Súly:</strong> ${it.weightKg} kg</div>
                                    <div><strong>Készlet:</strong> ${it.darabszam} db</div>
                                    <div style="margin-top:10px;"><strong>Leírás:</strong><br/>${it.desc}</div>
                                  </div>
                                `,
                              })
                            }
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
                  <div key={item.termekId} className="cart-item">
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