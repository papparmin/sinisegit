import React, { useState } from "react";
import "./HelyszinekTerkep.css";
import hungaryMap from "../assets/hungary-map.png";

const locations = [
  { id: 1, name: "Sopron", type: "Bicikli", x: 16, y: 34 },
  { id: 2, name: "Őrség", type: "Túra", x: 18, y: 53 },
  { id: 3, name: "Badacsony", type: "Túra", x: 31, y: 55 },
  { id: 4, name: "Tihany", type: "SUP", x: 36, y: 55 },
  { id: 5, name: "Balatonfüred", type: "SUP", x: 38, y: 53.5 },
  { id: 6, name: "Velencei-tó", type: "SUP", x: 43, y: 45.5 },
  { id: 7, name: "Dunakanyar", type: "Túra", x: 41, y: 28 },
  { id: 8, name: "Pilis", type: "Túra", x: 43, y: 31 },
  { id: 9, name: "Dobogókő", type: "Túra", x: 44.5, y: 29.5 },
  { id: 10, name: "Kékestető", type: "Túra", x: 54.5, y: 30 },
  { id: 11, name: "Bükk-fennsík", type: "Túra", x: 62, y: 29 },
  { id: 12, name: "Aggtelek", type: "Túra", x: 72.5, y: 26 },
  { id: 13, name: "Tisza-tó", type: "Horgászat", x: 58.5, y: 41.5 },
  { id: 14, name: "Hortobágy", type: "Futás", x: 68, y: 37.5 },
  { id: 15, name: "Debrecen", type: "Futás", x: 77.5, y: 39.5 },
  { id: 16, name: "Mecsek", type: "Túra", x: 39.5, y: 76 },
  { id: 17, name: "Pécs", type: "Bicikli", x: 37, y: 79.5 },
  { id: 18, name: "Szeged", type: "Futás", x: 61.5, y: 82 },
];

const TYPE_CONFIG = {
  "Túra": { class: "trail", label: "Túra" },
  "SUP": { class: "sup", label: "SUP" },
  "Bicikli": { class: "bike", label: "Bicikli" },
  "Horgászat": { class: "fish", label: "Horgászat" },
  "Futás": { class: "run", label: "Futás" },
};

export default function HelyszinekTerkep() {
  const [activePin, setActivePin] = useState(null);

  // Dinamikus statisztikák számítása
  const totalLocations = locations.length;
  const uniqueTypes = new Set(locations.map(l => l.type)).size;

  return (
    <section className="map-page">
      <div className="map-bg-glow map-bg-glow-1" />
      <div className="map-bg-glow map-bg-glow-2" />

      <div className="map-shell">
        <header className="map-header">
          <span className="map-badge">Eddigi helyszíneink</span>
          <h1>Magyarország térkép</h1>
          <p>
            Vidd rá az egeret a pontokra, vagy koppints rájuk, és nézd meg, merre jártunk már 
            aktívan kikapcsolódni.
          </p>
        </header>

        <div className="map-layout">
          <div className="map-card">
            <div className="map-card-topline" />
            <div className="hungary-map-real">
              <img
                src={hungaryMap}
                alt="Magyarország domborzati térképe"
                className="hungary-map-image"
                loading="lazy"
              />

              {locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  className={`map-pin ${TYPE_CONFIG[loc.type]?.class || "trail"} ${activePin === loc.id ? "active" : ""}`}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  onMouseEnter={() => setActivePin(loc.id)}
                  onMouseLeave={() => setActivePin(null)}
                  onClick={() => setActivePin(activePin === loc.id ? null : loc.id)}
                  aria-label={`${loc.name} - ${loc.type}`}
                >
                  <span className="map-pin-core" />
                  <span className="map-tooltip">
                    <strong>{loc.name}</strong>
                    <small>{loc.type}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside className="map-sidepanel">
            <div className="map-info-card">
              <h2>Mit jelentenek a pontok?</h2>
              <p>
                Minden pötty egy korábbi kalandunkat jelöli. Az interaktív térképen 
                kategóriák szerint különítettük el a helyszíneket.
              </p>
            </div>

            <div className="map-legend-card">
              <h3>Kategóriák</h3>
              <div className="legend-list">
                {Object.entries(TYPE_CONFIG).map(([key, value]) => (
                  <div className="legend-item" key={key}>
                    <span className={`legend-dot ${value.class}`} />
                    <span>{value.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="map-stats-card">
              <div className="map-stat">
                <strong>{totalLocations}</strong>
                <span>helyszín</span>
              </div>
              <div className="map-stat">
                <strong>{uniqueTypes}</strong>
                <span>aktivitás</span>
              </div>
              <div className="map-stat">
                <strong>100%</strong>
                <span>élmény</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}