import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HelyszinekTerkep.css";
import hungaryMap from "../assets/hungary-map.png";

const locations = [
  { id: 1, name: "Sopron", type: "Bicikli", x: 16.6, y: 35.6 },
  { id: 2, name: "Őrség", type: "Túra", x: 18.4, y: 55.0 },

  { id: 3, name: "Badacsony", type: "Túra", x: 31.0, y: 56.2 },
  { id: 4, name: "Tihany", type: "SUP", x: 36.0, y: 56.1 },
  { id: 5, name: "Balatonfüred", type: "SUP", x: 38.3, y: 54.9 },
  { id: 6, name: "Velencei-tó", type: "SUP", x: 43.2, y: 46.8 },

  { id: 7, name: "Dunakanyar", type: "Túra", x: 42.7, y: 30.6 },
  { id: 8, name: "Pilis", type: "Túra", x: 44.8, y: 32.8 },
  { id: 9, name: "Dobogókő", type: "Túra", x: 45.8, y: 31.5 },

  { id: 10, name: "Kékestető", type: "Túra", x: 54.8, y: 32.0 },
  { id: 11, name: "Bükk-fennsík", type: "Túra", x: 62.4, y: 31.1 },
  { id: 12, name: "Aggtelek", type: "Túra", x: 72.8, y: 27.8 },

  { id: 13, name: "Tisza-tó", type: "Horgászat", x: 59.0, y: 42.8 },
  { id: 14, name: "Hortobágy", type: "Futás", x: 68.8, y: 40.8 },
  { id: 15, name: "Debrecen", type: "Futás", x: 77.8, y: 42.3 },

  { id: 16, name: "Mecsek", type: "Túra", x: 40.8, y: 75.4 },
  { id: 17, name: "Pécs", type: "Bicikli", x: 38.5, y: 78.8 },
  { id: 18, name: "Szeged", type: "Futás", x: 62.0, y: 81.6 },
];

const legend = [
  { label: "Túra", cls: "trail" },
  { label: "SUP", cls: "sup" },
  { label: "Bicikli", cls: "bike" },
  { label: "Horgászat", cls: "fish" },
  { label: "Futás", cls: "run" },
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

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

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
          <h1>Magyarország térkép</h1>
          <p>
            Vidd rá az egeret a pontokra, és nézd meg, merre jártunk már
            túrázni, SUP-ozni, biciklizni, futni vagy horgászni.
          </p>
        </header>

        <section className="map-card">
          <div className="map-card-topline" />

          <div className="map-visual">
            <img
              src={hungaryMap}
              alt="Magyarország domborzati térképe"
              className="map-image"
              draggable="false"
            />

            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`map-pin ${getTypeClass(location.type)}`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                aria-label={`${location.name} - ${location.type}`}
              >
                <span className="map-pin-dot" />
                <span className="map-tooltip">
                  <strong>{location.name}</strong>
                  <small>{location.type}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="map-bottom-grid">
          <div className="map-info-card">
            <h2>Mit jelentenek a pontok?</h2>
            <p>
              Minden pötty egy korábbi helyszínt jelöl. Hovernél megjelenik a
              helyszín neve és a hozzá tartozó aktivitás.
            </p>
          </div>

          <div className="map-legend-card">
            <h3>Kategóriák</h3>
            <div className="map-legend-list">
              {legend.map((item) => (
                <div key={item.label} className="map-legend-item">
                  <span className={`map-legend-dot ${item.cls}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="map-stats-card">
            <div className="map-stat">
              <strong>18</strong>
              <span>helyszín</span>
            </div>
            <div className="map-stat">
              <strong>5</strong>
              <span>aktivitás</span>
            </div>
            <div className="map-stat">
              <strong>Explore</strong>
              <span>élmények</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}