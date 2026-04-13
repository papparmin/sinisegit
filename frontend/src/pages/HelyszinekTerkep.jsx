import React from "react";
import { useNavigate } from "react-router-dom";
import "./HelyszinekTerkep.css";
import hungaryMap from "../assets/hungary-map.png";

const domesticHeatspots = [
  { id: 1, name: "Sopron", type: "Bicikli", x: 16.8, y: 35.8, size: 110, intensity: 0.92 },
  { id: 2, name: "Őrség", type: "Túra", x: 18.7, y: 55.2, size: 132, intensity: 1.06 },

  { id: 3, name: "Badacsony", type: "Túra", x: 31.2, y: 56.3, size: 138, intensity: 1.08 },
  { id: 4, name: "Tihany", type: "SUP", x: 35.8, y: 56.1, size: 168, intensity: 1.20 },
  { id: 5, name: "Balatonfüred", type: "SUP", x: 38.3, y: 55.0, size: 158, intensity: 1.18 },
  { id: 6, name: "Velencei-tó", type: "SUP", x: 43.5, y: 46.9, size: 116, intensity: 0.94 },

  { id: 7, name: "Dunakanyar", type: "Túra", x: 42.8, y: 30.8, size: 154, intensity: 1.18 },
  { id: 8, name: "Dobogókő", type: "Túra", x: 45.8, y: 31.5, size: 142, intensity: 1.06 },

  { id: 9, name: "Kékestető", type: "Túra", x: 54.8, y: 32.0, size: 150, intensity: 1.16 },
  { id: 10, name: "Bükk-fennsík", type: "Túra", x: 62.2, y: 31.4, size: 162, intensity: 1.2 },
  { id: 11, name: "Aggtelek", type: "Túra", x: 72.8, y: 28.3, size: 124, intensity: 0.92 },

  { id: 12, name: "Tisza-tó", type: "Horgászat", x: 58.9, y: 42.9, size: 112, intensity: 0.86 },
  { id: 13, name: "Hortobágy", type: "Futás", x: 69.0, y: 41.0, size: 118, intensity: 0.88 },

  { id: 14, name: "Pécs", type: "Bicikli", x: 38.7, y: 78.2, size: 118, intensity: 0.88 },
  { id: 15, name: "Szeged", type: "Futás", x: 61.9, y: 81.2, size: 128, intensity: 0.94 },
];

const foreignTrips = [
  { id: 16, name: "Hallstatt", country: "Ausztria", type: "Bicikli", year: 2025 },
  { id: 17, name: "Bled", country: "Szlovénia", type: "SUP", year: 2026 },
  { id: 18, name: "Zakopane", country: "Lengyelország", type: "Túra", year: 2026 },
];

const activityMeta = [
  { label: "Túra", cls: "trail" },
  { label: "SUP", cls: "sup" },
  { label: "Bicikli", cls: "bike" },
  { label: "Horgászat", cls: "fish" },
  { label: "Futás", cls: "run" },
];

const regionStrengths = [
  { label: "Balaton és környéke", value: 94 },
  { label: "Északi-középhegység", value: 97 },
  { label: "Dunakanyar", value: 91 },
  { label: "Dél-Alföld", value: 68 },
];

const seasonStats = [
  {
    year: "2026",
    trips: 11,
    km: 620,
    countries: 3,
    note: "aktuális szezon",
  },
  {
    year: "2025",
    trips: 7,
    km: 410,
    countries: 2,
    note: "előző szezon",
  },
];

function getTypeClass(type) {
  switch (type) {
    case "Túra":
      return "trail";
    case "SUP":
      return "sup";
    case "Bicikli":
      return "bike";
    case "Horgászat":
      return "fish";
    case "Futás":
      return "run";
    default:
      return "trail";
  }
}

export default function HelyszinekTerkep() {
  const navigate = useNavigate();

  const allTrips = [...domesticHeatspots, ...foreignTrips];

  const activityCounts = activityMeta.map((item) => ({
    ...item,
    count: allTrips.filter((trip) => trip.type === item.label).length,
  }));

  return (
    <section className="map-page">
      <div className="map-glow map-glow-left" />
      <div className="map-glow map-glow-right" />

      <div className="map-wrap">
        <div className="map-topbar">
          <button
            type="button"
            className="map-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Vissza
          </button>
        </div>

        <header className="map-header">
          <span className="map-badge">Eddigi helyszíneink</span>
          <h1>Merre jártunk eddig?</h1>
          <p>
            A térkép hőtérkép-szerű nézetben mutatja, hol volt a legerősebb
            Explore-aktivitás. A legforróbb zónák a Balaton környékén,
            a Dunakanyarban és az Északi-középhegység térségében vannak.
          </p>
        </header>

        <section className="map-hero-card">
          <div className="map-card-topline" />

          <div className="map-visual">
            <img
              src={hungaryMap}
              alt="Magyarország térkép"
              className="map-image"
              draggable="false"
            />

            <div className="map-grid" />
            <div className="map-overlay-vignette" />
            <div className="map-contrast-overlay" />

            <div className="map-heat-layer" aria-hidden="true">
              {domesticHeatspots.map((spot) => (
                <div
                  key={spot.id}
                  className={`map-hotspot ${getTypeClass(spot.type)}`}
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    "--spot-size": `${spot.size}px`,
                    "--spot-opacity": spot.intensity,
                  }}
                >
                  <span className="map-hotspot-heat one" />
                  <span className="map-hotspot-heat two" />
                  <span className="map-hotspot-heat three" />
                  <span className="map-hotspot-core" />
                </div>
              ))}
            </div>

            <div className="map-hero-overlay">
              <div className="map-hero-copy">
                <span className="map-hero-chip">Hőtérkép nézet</span>
                <h2>Explore aktivitási zónák</h2>
                <p>
                  Minél intenzívebb a szín és a fénylés, annál sűrűbben jártunk
                  arra. A vízi programok főleg a Balaton körül, a klasszikus túrák
                  inkább az északi régióban erősek.
                </p>
              </div>

              <div className="map-heat-legend">
                <span>gyengébb</span>
                <div className="map-heat-scale" />
                <span>erősebb</span>
              </div>
            </div>
          </div>
        </section>

        <section className="map-stats-grid">
          <article className="map-stat-card">
            <span className="map-stat-kicker">Összes helyszín</span>
            <strong>18</strong>
            <small>15 belföld + 3 külföld</small>
          </article>

          <article className="map-stat-card">
            <span className="map-stat-kicker">Aktív ország</span>
            <strong>4</strong>
            <small>HU, AT, SI, PL</small>
          </article>

          <article className="map-stat-card">
            <span className="map-stat-kicker">Terepi nap</span>
            <strong>31</strong>
            <small>2025–2026 összesen</small>
          </article>

          <article className="map-stat-card">
            <span className="map-stat-kicker">Becsült táv</span>
            <strong>~1030 km</strong>
            <small>két szezon alapján</small>
          </article>
        </section>

        <section className="map-panels-grid">
          <article className="map-panel">
            <div className="map-panel-head">
              <h3>Legerősebb régiók</h3>
              <span>heat index</span>
            </div>

            <div className="map-meter-list">
              {regionStrengths.map((item) => (
                <div key={item.label} className="map-meter-row">
                  <div className="map-meter-head">
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>

                  <div className="map-meter-track">
                    <div
                      className="map-meter-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="map-panel">
            <div className="map-panel-head">
              <h3>Aktivitásmix</h3>
              <span>összes helyszín alapján</span>
            </div>

            <div className="map-activity-list">
              {activityCounts.map((item) => (
                <div key={item.label} className="map-activity-row">
                  <div className="map-activity-label">
                    <span className={`map-activity-dot ${item.cls}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="map-activity-bar">
                    <div
                      className={`map-activity-fill ${item.cls}`}
                      style={{ width: `${(item.count / allTrips.length) * 100}%` }}
                    />
                  </div>

                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="map-panel">
            <div className="map-panel-head">
              <h3>Külföldi túrák</h3>
              <span>külön kiemelve</span>
            </div>

            <div className="map-foreign-list">
              {foreignTrips.map((item) => (
                <div key={item.id} className="map-foreign-item">
                  <span className={`map-foreign-dot ${getTypeClass(item.type)}`} />
                  <div className="map-foreign-copy">
                    <strong>{item.name}</strong>
                    <small>
                      {item.country} • {item.type} • {item.year}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="map-panel">
            <div className="map-panel-head">
              <h3>Szezon összevetés</h3>
              <span>csak 2026 és 2025</span>
            </div>

            <div className="map-season-list">
              {seasonStats.map((item, index) => (
                <div
                  key={item.year}
                  className={`map-season-card ${index === 0 ? "current" : ""}`}
                >
                  <div className="map-season-top">
                    <strong>{item.year}</strong>
                    <span>{item.note}</span>
                  </div>

                  <div className="map-season-metrics">
                    <div>
                      <b>{item.trips}</b>
                      <small>túra</small>
                    </div>
                    <div>
                      <b>{item.km} km</b>
                      <small>becsült táv</small>
                    </div>
                    <div>
                      <b>{item.countries}</b>
                      <small>ország</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}