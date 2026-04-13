import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Turak.css";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
const FALLBACK_TOUR_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400";

const Turak = ({ onOpenAuth }) => {
  const nav = useNavigate();
  const { user, token } = useContext(AuthContext);
  const authed = !!user && !!token;

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Összes");

  useEffect(() => {
    let mounted = true;

    const fetchTours = async () => {
      setLoading(true);
      setErrorText("");

      try {
        const res = await axios.get(`${API_BASE}/api/tours`);
        if (mounted) {
          setTours(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setErrorText("Nem sikerült betölteni a túrákat.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTours();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "Összes",
      ...new Set(
        tours
          .map((t) => t.category)
          .filter(Boolean)
          .map((c) => c.trim())
      ),
    ];
  }, [tours]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tours.filter((t) => {
      const catOk = activeCat === "Összes" ? true : t.category === activeCat;
      if (!catOk) return false;
      if (!q) return true;

      return (
        (t.title || "").toLowerCase().includes(q) ||
        (t.desc || "").toLowerCase().includes(q) ||
        (t.badge || "").toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q) ||
        (t.level || "").toLowerCase().includes(q)
      );
    });
  }, [tours, query, activeCat]);

  const handleBookingClick = (tour) => {
    if (tour?.soldOut) {
      return;
    }

    const targetSlug = tour.slug || tour.id;

    if (authed) {
      nav(`/foglalas/${targetSlug}`);
      return;
    }

    if (onOpenAuth) {
      onOpenAuth(`/foglalas/${targetSlug}`);
    } else {
      alert("A foglaláshoz bejelentkezés szükséges!");
    }
  };

  const fmtFt = (n) => `${Number(n || 0).toLocaleString("hu-HU")} Ft`;

  const getTourImage = (img) => {
    if (!img) return FALLBACK_TOUR_IMAGE;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return img;
  };

  return (
    <div className="turak-page">
      <section className="turak-hero">
        <div className="turak-container">
          <div className="turak-head">
            <h1>Túrák</h1>
            <p>Válassz a kínálatból. Foglaláshoz bejelentkezés szükséges.</p>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <input
              type="text"
              placeholder="Keresés cím, kategória vagy nehézség alapján..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                borderRadius: 14,
                padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  style={{
                    border: "1px solid rgba(255,255,255,0.14)",
                    background:
                      activeCat === cat
                        ? "rgba(46, 204, 113, 0.22)"
                        : "rgba(255,255,255,0.06)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="turak-empty glass">Túrák betöltése...</div>
          ) : errorText ? (
            <div className="turak-empty glass">{errorText}</div>
          ) : filtered.length === 0 ? (
            <div className="turak-empty glass">Nincs találat.</div>
          ) : (
            <div className="turak-grid">
              {filtered.map((t) => (
                <article className="turak-card glass" key={t.id || t.slug}>
                  <span className="turak-badge">{t.badge || "EXPLORE"}</span>

                  <div className="turak-img">
                    <img src={getTourImage(t.img)} alt={t.title} />
                  </div>

                  <div className="turak-body">
                    <h3>{t.title}</h3>
                    <p className="turak-desc">{t.shortDesc || t.desc}</p>

                    <div className="turak-meta">
                      <span>{t.dur}</span>
                      <span className="turak-price">{fmtFt(t.price)}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 10,
                        fontSize: 13,
                        opacity: 0.82,
                      }}
                    >
                      <span>{t.category}</span>
                      <span>•</span>
                      <span>{t.level}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 14,
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {t.joinedCount} / {t.maxPeople} fő
                      </span>

                      {t.soldOut ? (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(255, 80, 80, 0.14)",
                            border: "1px solid rgba(255, 80, 80, 0.24)",
                          }}
                        >
                          Betelt
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(46, 204, 113, 0.12)",
                            border: "1px solid rgba(46, 204, 113, 0.24)",
                          }}
                        >
                          {t.remainingPlaces} szabad hely
                        </span>
                      )}
                    </div>

                    <div className="turak-actions">
                      <button
                        type="button"
                        onClick={() => handleBookingClick(t)}
                        className="btn-mini ghost"
                        style={{ cursor: t.soldOut ? "not-allowed" : "pointer" }}
                        disabled={t.soldOut}
                      >
                        {t.soldOut ? "Betelt" : "Részletek"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBookingClick(t)}
                        className="btn-mini"
                        style={{
                          cursor: t.soldOut ? "not-allowed" : "pointer",
                          border: "none",
                          opacity: t.soldOut ? 0.6 : 1,
                        }}
                        disabled={t.soldOut}
                      >
                        {t.soldOut ? "Betelt" : "Foglalom"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Turak;