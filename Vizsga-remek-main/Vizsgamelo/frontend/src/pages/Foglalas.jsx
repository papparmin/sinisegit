import React, { useMemo, useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./Foglalas.css";
import Swal from "sweetalert2";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

export default function Foglalas() {
  const { tourId } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { user, token } = useContext(AuthContext);

  const tourMap = useMemo(
    () => ({
      "matra-tel": {
        title: "Téli Mátra Gerinctúra",
        badge: "TÉL / PROFI",
        dur: "2 Nap / 1 Éj",
        price: 85000,
      },
      gemenc: {
        title: "Gemenci Vízivilág",
        badge: "VÍZ / KEZDŐ",
        dur: "3 Nap / 2 Éj",
        price: 125000,
      },
      "bukk-oserd": {
        title: "Bükki Őserdő",
        badge: "ERDŐ / HALADÓ",
        dur: "2 Nap / 1 Éj",
        price: 79000,
      },
      "alp-hajnal": {
        title: "Alpesi Hajnal Expedíció",
        badge: "ALPOK / PROFI",
        dur: "1 Nap",
        price: 69000,
      },
      koszalak: {
        title: "Kőszálak & Gerincek",
        badge: "SZIKLA / HALADÓ",
        dur: "2 Nap / 1 Éj",
        price: 92000,
      },
      "tavi-tabor": {
        title: "Tavi Tábor & Túra",
        badge: "TÓ / KEZDŐ",
        dur: "2 Nap / 1 Éj",
        price: 59000,
      },
      dunakanyar: {
        title: "Dunakanyar Naplemente Túra",
        badge: "PANORÁMA / KEZDŐ",
        dur: "1 Nap",
        price: 39000,
      },
      "balaton-kilato": {
        title: "Balaton-felvidék Kilátók",
        badge: "KILÁTÓ / KEZDŐ",
        dur: "1 Nap",
        price: 42000,
      },
      "matra-esti": {
        title: "Mátrai Esti Terep",
        badge: "ERDŐ / KEZDŐ",
        dur: "1 Nap",
        price: 45000,
      },
      "bukk-kod": {
        title: "Ködös Bükk Tájékozódás",
        badge: "KÖD / HALADÓ",
        dur: "1 Nap",
        price: 52000,
      },
    }),
    []
  );

  const routeTour = tourId ? tourMap[tourId] : null;
  const state = loc.state || {};

  const selectedTitle = state.tourTitle || routeTour?.title || "";
  const selectedBadge = state.tourBadge || routeTour?.badge || "KIVÁLASZTOTT";
  const selectedDur = state.tourDur || routeTour?.dur || "—";
  const selectedPrice =
    typeof state.tourPrice === "number" ? state.tourPrice : routeTour?.price;

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

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      name:
        prev.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const invalidTour = !tourId || !selectedTitle;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.accept) return;

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Bejelentkezés szükséges",
        text: "A foglaláshoz kérlek jelentkezz be a fiókodba!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/foglalas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourId,
          tourTitle: selectedTitle,
          tourBadge: selectedBadge,
          tourDur: selectedDur,
          tourPrice: selectedPrice,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Hiba a foglalás során");
      }

      Swal.fire({
        icon: "success",
        title: "Sikeres foglalás!",
        text: `Várunk sok szeretettel a(z) ${selectedTitle} túrán! A részleteket küldjük emailben.`,
        showConfirmButton: false,
        timer: 3000,
      });

      nav("/turak");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sikertelen foglalás",
        text: err.message || "Ismeretlen hiba történt.",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  if (invalidTour) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">
              Foglalni csak konkrét túrára lehet. Menj vissza a listára és
              kattints a „Foglalom” gombra.
            </p>
            <div className="actions">
              <Link className="btn-ghost" to="/turak">
                Vissza a túrákhoz
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="chip">{selectedBadge}</div>
            <div className="chip soft">{selectedDur}</div>
            <div className="chip soft">
              {typeof selectedPrice === "number"
                ? `${selectedPrice.toLocaleString("hu-HU")} Ft`
                : "—"}
            </div>
          </div>

          <div className="foglalas-grid">
            <form className="foglalas-form" onSubmit={onSubmit}>
              <div className="row2">
                <label>
                  Név *
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    placeholder="Teljes név"
                  />
                </label>

                <label>
                  Email *
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    type="email"
                    placeholder="email@cim.hu"
                  />
                </label>
              </div>

              <div className="row2">
                <label>
                  Telefon *
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    type="tel"
                    placeholder="+36 ..."
                  />
                </label>

                <label>
                  Dátum *
                  <input
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    required
                    type="date"
                  />
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
                  <select
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                    required
                  >
                    <option>Kezdő</option>
                    <option>Haladó</option>
                    <option>Profi</option>
                  </select>
                </label>
              </div>

              <label>
                Egészség / allergia / fontos infó
                <input
                  value={form.health}
                  onChange={(e) => set("health", e.target.value)}
                  placeholder="pl. allergia, sérülés, gyógyszer…"
                />
              </label>

              <div className="row2">
                <label>
                  Vészhelyzeti kontakt neve *
                  <input
                    value={form.emergencyName}
                    onChange={(e) => set("emergencyName", e.target.value)}
                    required
                    placeholder="Név"
                  />
                </label>

                <label>
                  Vészhelyzeti kontakt telefonszáma *
                  <input
                    value={form.emergencyPhone}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                    required
                    placeholder="+36 ..."
                  />
                </label>
              </div>

              <label>
                Felszerelés bérlés
                <select
                  value={form.rental}
                  onChange={(e) => set("rental", e.target.value)}
                >
                  <option>Nem</option>
                  <option>Igen</option>
                  <option>Nem tudom</option>
                </select>
              </label>

              <label>
                Üzenet
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Bármi extra kérés / kérdés"
                />
              </label>

              <label className="check">
                <input
                  type="checkbox"
                  checked={form.accept}
                  onChange={(e) => set("accept", e.target.checked)}
                />
                <span>
                  Elfogadom az <Link to="/aszf">ÁSZF</Link> és az{" "}
                  <Link to="/adatvedelem">Adatvédelem</Link> feltételeit *
                </span>
              </label>

              <div className="actions">
                <button className="btn" type="submit" disabled={!form.accept}>
                  Foglalás elküldése
                </button>

                <Link className="btn-ghost" to="/turak">
                  Vissza
                </Link>
              </div>
            </form>

            <aside className="foglalas-side">
              <h3>Kiválasztott túra</h3>

              <div className="side-box">
                <strong>{selectedTitle}</strong>
                <div className="side-sub">{selectedDur}</div>
                <div className="side-sub">
                  {typeof selectedPrice === "number"
                    ? `Ár: ${selectedPrice.toLocaleString("hu-HU")} Ft`
                    : "Ár: —"}
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