import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Turak.css";
import { AuthContext } from "../components/AuthContext.jsx";

const Turak = ({ onOpenAuth }) => {
  const nav = useNavigate();
  const { user, token } = useContext(AuthContext);
  const authed = !!user && !!token;

  const tours = useMemo(
    () => [
      {
        id: "matra-tel",
        badge: "TÉL / PROFI",
        category: "Tél",
        level: "Profi",
        img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1400",
        title: "Téli Mátra Gerinctúra",
        desc: "Havas gerincek Kékes és Galyatető között. Hidegmenedzsment és tájékozódás.",
        dur: "2 Nap / 1 Éj",
        price: 85000,
      },
      {
        id: "gemenc",
        badge: "VÍZ / KEZDŐ",
        category: "Víz",
        level: "Kezdő",
        img: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=1400",
        title: "Gemenci Vízivilág",
        desc: "Kenuzás Európa egyik legnagyobb ártéri erdejében. Tábor a víz közelében.",
        dur: "3 Nap / 2 Éj",
        price: 125000,
      },
      {
        id: "bukk-oserd",
        badge: "ERDŐ / HALADÓ",
        category: "Erdő",
        level: "Haladó",
        img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400",
        title: "Bükki Őserdő",
        desc: "Rejtett ösvények a Bükk-fennsíkon, barlangszakaszok, tábor tűzzel.",
        dur: "2 Nap / 1 Éj",
        price: 79000,
      },
      {
        id: "alp-hajnal",
        badge: "ALPOK / PROFI",
        category: "Hegyek",
        level: "Profi",
        img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400",
        title: "Alpesi Hajnal Expedíció",
        desc: "Korai indulás, szintemelkedés, napfelkelte a csúcson. Tempós, technikás.",
        dur: "1 Nap",
        price: 69000,
      },
      {
        id: "koszalak",
        badge: "SZIKLA / HALADÓ",
        category: "Szikla",
        level: "Haladó",
        img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400",
        title: "Kőszálak & Gerincek",
        desc: "Gerinctúra kitettebb részekkel, stabil tempó, biztos lépéstechnika.",
        dur: "2 Nap / 1 Éj",
        price: 92000,
      },
      {
        id: "tavi-tabor",
        badge: "TÓ / KEZDŐ",
        category: "Tábor",
        level: "Kezdő",
        img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400",
        title: "Tavi Tábor & Túra",
        desc: "Kényelmes túra, tanulható táborozás, esti tűz és chill. Ideális első tábor.",
        dur: "2 Nap / 1 Éj",
        price: 59000,
      },
      {
        id: "dunakanyar",
        badge: "PANORÁMA / KEZDŐ",
        category: "Panoráma",
        level: "Kezdő",
        img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400",
        title: "Dunakanyar Naplemente Túra",
        desc: "Aranyóra a Duna felett. Laza tempó, nézelődés, fotópontok.",
        dur: "1 Nap",
        price: 39000,
      },
      {
        id: "balaton-kilato",
        badge: "KILÁTÓ / KEZDŐ",
        category: "Panoráma",
        level: "Kezdő",
        img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1400",
        title: "Balaton-felvidék Kilátók",
        desc: "Könnyed túra kilátókkal, tanúhegyekkel és balatoni panorámával.",
        dur: "1 Nap",
        price: 42000,
      },
      {
        id: "matra-esti",
        badge: "ERDŐ / KEZDŐ",
        category: "Erdő",
        level: "Kezdő",
        img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400",
        title: "Mátrai Esti Terep",
        desc: "Rövid tereptúra alkonyatban. Rétegezés, tempó, alap navigáció.",
        dur: "1 Nap",
        price: 45000,
      },
      {
        id: "bukk-kod",
        badge: "KÖD / HALADÓ",
        category: "Tél",
        level: "Haladó",
        img: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1400",
        title: "Ködös Bükk Tájékozódás",
        desc: "Haladó navigáció: iránytű, útvonal-korrekció, terepolvasás.",
        dur: "1 Nap",
        price: 52000,
      },
    ],
    []
  );

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("Összes");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tours.filter((t) => {
      const catOk = activeCat === "Összes" ? true : t.category === activeCat;
      if (!catOk) return false;
      if (!q) return true;

      return (
        t.title.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.level.toLowerCase().includes(q)
      );
    });
  }, [tours, query, activeCat]);

  const handleBookingClick = (tour) => {
    if (authed) {
      nav(`/foglalas/${tour.id}`, {
        state: {
          tourTitle: tour.title,
          tourPrice: tour.price,
          tourDur: tour.dur,
          tourBadge: tour.badge,
        },
      });
      return;
    }

    if (onOpenAuth) {
      onOpenAuth(`/foglalas/${tour.id}`);
    } else {
      alert("A foglaláshoz bejelentkezés szükséges!");
    }
  };

  const fmtFt = (n) => `${n.toLocaleString("hu-HU")} Ft`;

  return (
    <div className="turak-page">
      <section className="turak-hero">
        <div className="turak-container">
          <div className="turak-head">
            <h1>Túrák</h1>
            <p>Válassz a kínálatból. Foglaláshoz bejelentkezés szükséges.</p>
          </div>

          <div className="turak-grid">
            {filtered.map((t) => (
              <article className="turak-card glass" key={t.id}>
                <span className="turak-badge">{t.badge}</span>

                <div className="turak-img">
                  <img src={t.img} alt={t.title} />
                </div>

                <div className="turak-body">
                  <h3>{t.title}</h3>
                  <p className="turak-desc">{t.desc}</p>

                  <div className="turak-meta">
                    <span>{t.dur}</span>
                    <span className="turak-price">{fmtFt(t.price)}</span>
                  </div>

                  <div className="turak-actions">
                    <Link to={`/turak/${t.id}`} className="btn-mini ghost">
                      Megnézem
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleBookingClick(t)}
                      className="btn-mini"
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      Foglalom
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Turak;