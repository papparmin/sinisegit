import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./Foglalas.css";

export default function Foglalas() {
  const { tourId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();

  // ✅ fallback: ha valaki direkt ír be URL-t, akkor is legyen cím (opcionális)
  const tourMap = useMemo(
    () => ({
      "matra-tel": { title: "Téli Mátra Gerinctúra" },
      gemenc: { title: "Gemenci Vízivilág" },
      "bukk-oserd": { title: "Bükki Őserdő" },
      "alp-hajnal": { title: "Alpesi Hajnal Expedíció" },
      koszalak: { title: "Kőszálak & Gerincek" },
      "tavi-tabor": { title: "Tavi Tábor & Túra" },
      dunakanyar: { title: "Dunakanyar Naplemente Túra" },
      "balaton-kilato": { title: "Balaton-felvidék Kilátók" },
      "matra-esti": { title: "Mátrai Esti Terep" },
      "bukk-kod": { title: "Ködös Bükk Tájékozódás" },
    }),
    []
  );

  const state = loc.state || {};
  const selectedTitle = state.tourTitle || tourMap[tourId]?.title;

  // ✅ ha nincs érvényes túra: vissza a túrákra
  if (!tourId || !selectedTitle) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">Foglalni csak konkrét túrára lehet. Menj vissza a listára és kattints a “Foglalom”-ra.</p>
            <div className="actions">
              <Link className="btn-ghost" to="/turak">Vissza a túrákhoz</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    people: 1,
    experience: "Kezdő",
    health: "",
    emergencyName: "",
    emergencyPhone: "",
    rental: "Nem",
    note: "",
    accept: false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.accept) return;
    // demo submit: később küldheted backendnek
    alert(
      `Foglalás (DEMO)\nTúra: ${selectedTitle}\nDátum: ${form.date}\nNév: ${form.name}\nEmail: ${form.email}`
    );
    nav("/turak");
  };

  return (
    <div className="foglalas-page">
      <div className="foglalas-container">
        <div className="foglalas-head">
          <span className="foglalas-mark" aria-hidden="true" />
          <div>
            <h1>Foglalás</h1>
            <p className="muted">
              Foglalás erre: <strong className="strong">{selectedTitle}</strong>
            </p>
          </div>
        </div>

        <div className="foglalas-card glass">
          <div className="foglalas-topline">
            <div className="chip">{state.tourBadge || "KIVÁLASZTOTT"}</div>
            <div className="chip soft">{state.tourDur || "—"}</div>
            <div className="chip soft">
              {typeof state.tourPrice === "number" ? `${state.tourPrice.toLocaleString("hu-HU")} Ft` : "—"}
            </div>
          </div>

          <div className="foglalas-grid">
            <form className="foglalas-form" onSubmit={onSubmit}>
              <div className="row2">
                <label>
                  Név *
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Teljes név" />
                </label>
                <label>
                  Email *
                  <input value={form.email} onChange={(e) => set("email", e.target.value)} required type="email" placeholder="email@cim.hu" />
                </label>
              </div>

              <div className="row2">
                <label>
                  Telefon *
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required type="tel" placeholder="+36 ..." />
                </label>
                <label>
                  Dátum *
                  <input value={form.date} onChange={(e) => set("date", e.target.value)} required type="date" />
                </label>
              </div>

              <div className="row2">
                <label>
                  Létszám *
                  <input
                    value={form.people}
                    onChange={(e) => set("people", Number(e.target.value))}
                    type="number"
                    min={1}
                    max={20}
                    required
                  />
                </label>

                <label>
                  Tapasztalat *
                  <select value={form.experience} onChange={(e) => set("experience", e.target.value)} required>
                    <option>Kezdő</option>
                    <option>Haladó</option>
                    <option>Profi</option>
                  </select>
                </label>
              </div>

              <label>
                Egészség / allergia / fontos infó
                <input value={form.health} onChange={(e) => set("health", e.target.value)} placeholder="pl. allergia, sérülés, gyógyszer…" />
              </label>

              <div className="row2">
                <label>
                  Vészhelyzeti kontakt neve *
                  <input value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} required placeholder="Név" />
                </label>
                <label>
                  Vészhelyzeti kontakt telefonszáma *
                  <input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} required placeholder="+36 ..." />
                </label>
              </div>

              <label>
                Felszerelés bérlés
                <select value={form.rental} onChange={(e) => set("rental", e.target.value)}>
                  <option>Nem</option>
                  <option>Igen</option>
                  <option>Nem tudom</option>
                </select>
              </label>

              <label>
                Üzenet
                <textarea value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="Bármi extra kérés / kérdés"></textarea>
              </label>

              <label className="check">
                <input type="checkbox" checked={form.accept} onChange={(e) => set("accept", e.target.checked)} />
                <span>
                  Elfogadom az <Link to="/aszf">ÁSZF</Link> és az <Link to="/adatvedelem">Adatvédelem</Link> feltételeit *
                </span>
              </label>

              <div className="actions">
                <button className="btn" type="submit" disabled={!form.accept}>
                  Foglalás elküldése
                </button>
                <Link className="btn-ghost" to="/turak">Vissza</Link>
              </div>
            </form>

            <aside className="foglalas-side">
              <h3>Kiválasztott túra</h3>
              <div className="side-box">
                <strong>{selectedTitle}</strong>
                <div className="side-sub">{state.tourDur || "Időtartam: —"}</div>
                <div className="side-sub">
                  {typeof state.tourPrice === "number" ? `Ár: ${state.tourPrice.toLocaleString("hu-HU")} Ft` : "Ár: —"}
                </div>
              </div>

              <div className="side-box">
                <h4>Mi lesz ezután?</h4>
                <ul>
                  <li>Visszaigazolás emailben</li>
                  <li>Pontos találkozó és idő</li>
                  <li>Felszerelés lista</li>
                  <li>Utolsó update indulás előtt</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}