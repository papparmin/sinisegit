import React, { useEffect, useMemo, useState } from "react";
import "./Berles.css";

const CATEGORIES = [
  "Hátizsák",
  "Sátor",
  "Hálózsák",
  "Matrac",
  "Ruházat",
  "Főzés",
  "Navigáció",
  "Biztonság",
  "Víz",
  "Trekking",
];

const BRANDS = [
  "EXPLORE",
  "NordPeak",
  "TrailForge",
  "AlpineEdge",
  "RiverRun",
  "StoneWolf",
  "SummitLab",
];

const makeImg = (seed) =>
  `https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1400&q=80&sig=${seed}`;

const INITIAL_ITEMS = Array.from({ length: 50 }).map((_, idx) => {
  const id = idx + 1;
  const category = CATEGORIES[idx % CATEGORIES.length];
  const brand = BRANDS[idx % BRANDS.length];

  const base = 1500 + (idx % 10) * 700;
  const price =
    base +
    (category === "Sátor" ? 2500 : 0) +
    (category === "Hálózsák" ? 1200 : 0);

  const rating = Math.min(
    5,
    Math.round((3.9 + (idx % 12) * 0.1) * 10) / 10
  );

  const weightKg = Math.round((0.6 + (idx % 8) * 0.18) * 10) / 10;

  const tags =
    category === "Sátor"
      ? ["2-3 személy", "vízálló", "könnyű"]
      : category === "Hálózsák"
      ? ["-5°C", "kompressz", "meleg"]
      : category === "Főzés"
      ? ["gáz", "könnyű", "gyors"]
      : category === "Navigáció"
      ? ["GPS", "térkép", "iránytű"]
      : category === "Biztonság"
      ? ["elsősegély", "fejlámpa", "túlélő"]
      : category === "Víz"
      ? ["kulacs", "szűrő", "hydration"]
      : category === "Trekking"
      ? ["bot", "stabil", "rezgéscsill."]
      : category === "Ruházat"
      ? ["rétegezés", "szélálló", "meleg"]
      : category === "Matrac"
      ? ["kényelmes", "R-érték", "pack"]
      : ["strapabíró", "könnyű", "profi"];

  const darabszam = idx % 9 === 0 ? 0 : (idx % 5) + 1;

  return {
    id,
    name: `${brand} ${category} ${id}`,
    category,
    brand,
    pricePerDay: price,
    rating,
    weightKg,
    darabszam,
    img: makeImg(100 + id),
    tags,
    desc:
      category === "Sátor"
        ? "Stabil, gyorsan felállítható sátor. Túrákhoz optimalizálva."
        : category === "Hátizsák"
        ? "Kényelmes hordrendszer, jó súlyelosztás, túrára kész."
        : category === "Hálózsák"
        ? "Meleg, jól kompresszálható, hűvös estékhez is."
        : "Prémium felszerelés, terepre kitalálva. Nincs sufni.",
  };
});

const fmtFt = (n) => new Intl.NumberFormat("hu-HU").format(n) + " Ft";

export default function Berles() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Összes");
  const [brand, setBrand] = useState("Összes");
  const [onlyAvail, setOnlyAvail] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const priceBounds = useMemo(() => {
    const prices = INITIAL_ITEMS.map((i) => i.pricePerDay);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, []);

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
      if (it.rating < minRating) return false;

      if (query) {
        const hay =
          `${it.name} ${it.category} ${it.brand} ${it.tags.join(" ")} ${it.desc}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      return true;
    });

    const score = (it) => {
      const queryBoost = query ? 1 : 0;
      const matchBoost = query
        ? it.name.toLowerCase().includes(query)
          ? 1.2
          : 1
        : 1;
      const availBoost = it.darabszam > 0 ? 1.1 : 0.8;
      const priceBoost = 1 - Math.min(0.35, it.pricePerDay / 60000);

      return (
        (it.rating * 0.55 + priceBoost * 0.45 + queryBoost * 0.2) *
        matchBoost *
        availBoost
      );
    };

    out = out.slice();

    if (sort === "relevance") out.sort((a, b) => score(b) - score(a));
    if (sort === "price_asc") out.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price_desc") out.sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === "rating_desc") out.sort((a, b) => b.rating - a.rating);
    if (sort === "weight_asc") out.sort((a, b) => a.weightKg - b.weightKg);

    return out;
  }, [items, q, cat, brand, onlyAvail, minPrice, maxPrice, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  useEffect(() => {
    setPage(1);
  }, [q, cat, brand, onlyAvail, minPrice, maxPrice, minRating, sort, perPage]);

  const reset = () => {
    setQ("");
    setCat("Összes");
    setBrand("Összes");
    setOnlyAvail(true);
    setMinRating(0);
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setSort("relevance");
    setPerPage(12);
    setPage(1);
  };

  const handleBooking = (item) => {
    if (item.darabszam <= 0) return;

    const ujDarabszam = item.darabszam - 1;

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? {
              ...it,
              darabszam: Math.max(0, it.darabszam - 1),
            }
          : it
      )
    );

    alert(
      `Foglalás (demo): ${item.name}\nÁr: ${fmtFt(item.pricePerDay)}/nap\nMaradék készlet: ${ujDarabszam} db`
    );
  };

  const visibleFrom = filtered.length ? (safePage - 1) * perPage + 1 : 0;
  const visibleTo = filtered.length
    ? Math.min(safePage * perPage, filtered.length)
    : 0;

  return (
    <div className="berles-page">
      <section className="berles-hero">
        <div className="berles-container">
          <div className="berles-hero-card glass">
            <div className="berles-hero-kicker">FELSZERELÉS BÉRLÉS</div>
            <h1>Bérelj profi cuccot.</h1>
            <p>Válogass, szűrj, foglalj. Letisztult és gyors rendszer.</p>

            <div className="berles-hero-bar glass">
              <input
                className="berles-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Keresés: sátor, hálózsák, GPS, fejlámpa…"
              />

              <select
                className="berles-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="relevance">Rendezés: relevancia</option>
                <option value="price_asc">Ár: növekvő</option>
                <option value="price_desc">Ár: csökkenő</option>
                <option value="rating_desc">Értékelés: legjobb</option>
                <option value="weight_asc">Súly: könnyű</option>
              </select>

              <button
                className="btn btn-ghost berles-reset"
                type="button"
                onClick={reset}
              >
                Reset
              </button>
            </div>

            <div className="berles-stats">
              <span className="chip">
                Találat: <strong>{filtered.length}</strong>
              </span>
              <span className="chip">
                Kategória: <strong>{cat}</strong>
              </span>
              <span className="chip">
                Márka: <strong>{brand}</strong>
              </span>
              <span className="chip">
                Csak elérhető: <strong>{onlyAvail ? "igen" : "nem"}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="berles-main">
        <div className="berles-container berles-grid">
          <aside className="berles-filters glass">
            <div className="filters-head">
              <h3>Szűrők</h3>
              <span className="muted">{filtered.length} találat</span>
            </div>

            <label className="f-row">
              <span>Kategória</span>
              <select
                className="berles-select"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option>Összes</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="f-row">
              <span>Márka</span>
              <select
                className="berles-select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option>Összes</option>
                {BRANDS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>

            <label className="f-check">
              <input
                type="checkbox"
                checked={onlyAvail}
                onChange={(e) => setOnlyAvail(e.target.checked)}
              />
              <span>Csak elérhető cuccok</span>
            </label>

            <div className="f-block">
              <div className="f-title">Ár / nap</div>

              <div className="f-range">
                <div className="f-mini">
                  <span>Min</span>
                  <strong>{fmtFt(minPrice)}</strong>
                </div>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
              </div>

              <div className="f-range">
                <div className="f-mini">
                  <span>Max</span>
                  <strong>{fmtFt(maxPrice)}</strong>
                </div>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="f-block">
              <div className="f-title">Min. értékelés</div>
              <div className="rating-row">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`chip-btn ${minRating === r ? "active" : ""}`}
                    onClick={() => setMinRating(r)}
                  >
                    {r === 0 ? "mind" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="f-block">
              <div className="f-title">Oldalméret</div>
              <select
                className="berles-select"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={12}>12 / oldal</option>
                <option value={24}>24 / oldal</option>
                <option value={50}>50 / oldal</option>
              </select>
            </div>

            <div className="filters-foot">
              <button className="btn btn-wide" type="button" onClick={reset}>
                Reset mindent
              </button>
            </div>
          </aside>

          <div className="berles-list">
            <div className="berles-topline">
              <div className="muted">
                Oldal <strong>{safePage}</strong> / {totalPages}
              </div>

              <div className="pager">
                <button
                  className="pager-btn"
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                >
                  ←
                </button>
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

            <div className="berles-cards">
              {paged.map((it) => {
                const available = it.darabszam > 0;

                return (
                  <article
                    key={it.id}
                    className={`berles-card glass ${available ? "" : "disabled"}`}
                  >
                    <div className="berles-img">
                      <img src={it.img} alt={it.name} loading="lazy" />
                      <div className={`badge ${available ? "ok" : "no"}`}>
                        {available ? "ELÉRHETŐ" : "ELFOGYOTT"}
                      </div>
                    </div>

                    <div className="berles-body">
                      <div className="berles-row">
                        <h3 className="berles-name">{it.name}</h3>
                        <div className="berles-price">
                          {fmtFt(it.pricePerDay)}
                          <span>/nap</span>
                        </div>
                      </div>

                      <div className="berles-sub">
                        <span className="chip small">{it.category}</span>
                        <span className="chip small">{it.brand}</span>
                        <span className="chip small">⭐ {it.rating}</span>
                        <span className="chip small">{it.weightKg} kg</span>
                        <span className="chip small">
                          {available ? `${it.darabszam} db` : "0 db"}
                        </span>
                      </div>

                      <p className="berles-desc">{it.desc}</p>

                      <div
                        style={{
                          marginBottom: 12,
                          fontSize: 14,
                          fontWeight: 700,
                          color: available ? "#9fe3b5" : "#ff8b8b",
                        }}
                      >
                        {available
                          ? `Készleten: ${it.darabszam} db`
                          : "Elfogyott"}
                      </div>

                      <div className="berles-tags">
                        {it.tags.slice(0, 3).map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="berles-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => alert(`Részletek (demo): ${it.name}`)}
                        >
                          Részletek
                        </button>

                        <button
                          className="btn btn-sm"
                          type="button"
                          disabled={!available}
                          onClick={() => handleBooking(it)}
                        >
                          {available ? "Foglalom" : "Elfogyott"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="berles-bottomline glass">
              <div className="muted">
                Mutatva: <strong>{visibleFrom}-{visibleTo}</strong> /{" "}
                {filtered.length}
              </div>

              <div className="pager">
                {Array.from({ length: totalPages })
                  .slice(0, 7)
                  .map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        className={`pager-page ${p === safePage ? "active" : ""}`}
                        type="button"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                {totalPages > 7 ? <span className="muted">…</span> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}