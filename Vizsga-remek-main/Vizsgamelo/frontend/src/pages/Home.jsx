import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const SectionHead = ({ title, subtitle }) => (
  <div className="section-head reveal">
    <div className="section-title-row">
      <span className="section-logo" aria-hidden="true">
        <span className="brand-mark small" />
        <span className="section-logo-text">EXPLORE.</span>
      </span>
      <h2>{title}</h2>
    </div>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
);

const Home = () => {
  useEffect(() => {
    console.log("EZ AZ UJ HOME FUT");

    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("active")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const featuredTours = [
    {
      badge: "TÉL / PROFI",
      img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600",
      title: "Téli Mátra Gerinctúra",
      desc: "Havas gerincek Kékes és Galyatető között. Hidegmenedzsment és tájékozódás.",
      dur: "2 Nap / 1 Éj",
      price: "85 000 Ft",
      place: "Mátra",
    },
    {
      badge: "VÍZ / KEZDŐ",
      img: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=1600",
      title: "Gemenci Vízivilág",
      desc: "Kenuzás Európa egyik legnagyobb ártéri erdejében. Tábor a víz közelében.",
      dur: "3 Nap / 2 Éj",
      price: "125 000 Ft",
      place: "Gemenc",
    },
    {
      badge: "ERDŐ / HALADÓ",
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600",
      title: "Bükki Őserdő",
      desc: "Rejtett ösvények a Bükk-fennsíkon, barlangszakaszok, tábor tűzzel.",
      dur: "2 Nap / 1 Éj",
      price: "79 000 Ft",
      place: "Bükk",
    },
    {
      badge: "ALPOK / PROFI",
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600",
      title: "Alpesi Hajnal Expedíció",
      desc: "Korai indulás, szintemelkedés, napfelkelte a csúcson. Tempós, technikás.",
      dur: "1 Nap",
      price: "69 000 Ft",
      place: "Alpok",
    },
    {
      badge: "SZIKLA / HALADÓ",
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600",
      title: "Kőszálak & Gerincek",
      desc: "Gerinctúra kitettebb részekkel, stabil tempó, biztos lépéstechnika.",
      dur: "2 Nap / 1 Éj",
      price: "92 000 Ft",
      place: "Gerinc",
    },
    {
      badge: "TÓ / KEZDŐ",
      img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600",
      title: "Tavi Tábor & Túra",
      desc: "Kényelmes túra, tanulható táborozás, esti tűz és chill. Ideális első tábor.",
      dur: "2 Nap / 1 Éj",
      price: "59 000 Ft",
      place: "Tópart",
    },
  ];

  const whyCards = [
    {
      title: "Letisztultság",
      front: "Egy útvonal, egy terv, tiszta keretek.",
      back: "Minden túra egy logikára épül: útvonal, tempó, pihenők. Nincs felesleges körítés.",
      review: {
        name: "Bence",
        rating: 5,
        avatar: "https://i.pravatar.cc/80?img=11",
        text: "Végre egy csapat, ahol nincs káosz. Minden percre pontos.",
      },
    },
    {
      title: "Szakmai vezetés",
      front: "Döntések terepre, nem elméletre.",
      back: "Útvonalterv, időjárás, kockázatkezelés — minden a terepen működjön.",
      review: {
        name: "Ádám",
        rating: 5,
        avatar: "https://i.pravatar.cc/80?img=12",
        text: "Vihar előtt profi döntések. Végig biztonságban voltunk.",
      },
    },
    {
      title: "Kis csoport",
      front: "Figyelem, ritmus, csapatélmény.",
      back: "Kis létszám mellett jobb tempó és jobb élmény. Nem szakad szét a brigád.",
      review: {
        name: "Zsófi",
        rating: 4,
        avatar: "https://i.pravatar.cc/80?img=5",
        text: "Mindenkire jutott figyelem, nem futószalag túra.",
      },
    },
    {
      title: "Minőség & felszerelés",
      front: "Nem sufni megoldások.",
      back: "Ajánlott lista, indulás előtti check, és ha kell: bérelhető profi cuccok.",
      review: {
        name: "Nóri",
        rating: 5,
        avatar: "https://i.pravatar.cc/80?img=44",
        text: "A cucc tényleg prémium, és segítettek a rétegezésben.",
      },
    },
    {
      title: "Biztonság",
      front: "Nem hősködünk.",
      back: "Kockázatelemzés, visszafordulási pontok, tartalékterv — nem a szerencsére építünk.",
      review: {
        name: "Gábor",
        rating: 5,
        avatar: "https://i.pravatar.cc/80?img=22",
        text: "Végig érezni lehetett, hogy biztonság az első.",
      },
    },
    {
      title: "Valódi élmény",
      front: "Nem Insta-túra.",
      back: "Tempó, csend, jelenlét. Nem pózolni megyünk, hanem átélni.",
      review: {
        name: "Eszter",
        rating: 5,
        avatar: "https://i.pravatar.cc/80?img=31",
        text: "Nem fotózás, hanem igazi élmény volt. Pont ezt kerestem.",
      },
    },
  ];

  const natureCols = useMemo(
    () => [
      {
        img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000",
        kicker: "• mentális reset •",
        title: "Kevesebb inger. Tisztább fej. Stabilabb tempó.",
        text: "A természet visszahoz fókuszba: ritmust ad, letisztítja a zajt, és rendbe rakja a döntéseket. Nem “pihenés” — inkább újrakalibrálás.",
      },
      {
        img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2000",
        kicker: "• fókusz •",
        title: "Letisztul a zaj. Visszajön a döntés.",
        text: "Kint kevesebb a mesterséges inger. Egyszerűbb gondolatmenet, stabilabb tempó — ettől te is stabilabb leszel.",
      },
      {
        img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000",
        kicker: "• ritmus •",
        title: "Rendszert ad. Nem csak “pihensz”.",
        text: "A jó túra összerak: ritmust ad, rendezi a fejet, és visszahoz egy normális belső tempót.",
      },
    ],
    []
  );

  const renderStars = (rating) => {
    const full = "★★★★★".slice(0, rating);
    const empty = "★★★★★".slice(rating);
    return (
      <span className="stars" aria-label={`${rating} csillag`}>
        {full}
        <span className="stars-muted">{empty}</span>
      </span>
    );
  };

  const gallery = useMemo(() => {
    const last3 = featuredTours.slice(-3).map((t) => ({
      title: t.title,
      place: t.place,
      img: t.img,
      badge: t.badge,
    }));
    const extra = [
      {
        title: "Ködös reggel",
        place: "Erdő",
        badge: "HANGULAT",
        img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2000",
      },
      {
        title: "Éjszakai ég",
        place: "Csend",
        badge: "ÉJSZAKA",
        img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=2000",
      },
      {
        title: "Hegyi tó",
        place: "Táj",
        badge: "PANORÁMA",
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000",
      },
      {
        title: "Gerinc",
        place: "Hegyek",
        badge: "ALPOK",
        img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000",
      },
    ];
    return [...last3, ...extra];
  }, [featuredTours]);

  const [gIndex, setGIndex] = useState(0);
  const prev = () => setGIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setGIndex((i) => (i + 1) % gallery.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery.length]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const spotifyRef = useRef(null);
  const [spotifyIn, setSpotifyIn] = useState(false);

  useEffect(() => {
    const el = spotifyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSpotifyIn(true)),
      { threshold: 0.22 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [contactForm, setContactForm] = useState({
    nev: "",
    email: "",
    targy: "",
    uzenet: "",
  });

  const [contactSending, setContactSending] = useState(false);
  const [contactMessage, setContactMessage] = useState({
    text: "",
    type: "",
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (
      !contactForm.nev.trim() ||
      !contactForm.email.trim() ||
      !contactForm.uzenet.trim()
    ) {
      setContactMessage({
        text: "Kérlek add meg a nevedet, az emailedet és az üzenetedet is.",
        type: "error",
      });
      return;
    }

    setContactSending(true);
    setContactMessage({ text: "", type: "" });

    try {
      console.log("CONTACT SEND TO:", "http://localhost:5050/api/contact");

      const res = await fetch("http://localhost:5050/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nev: contactForm.nev.trim(),
          email: contactForm.email.trim(),
          targy: contactForm.targy.trim(),
          uzenet: contactForm.uzenet.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setContactMessage({
          text: data?.error || "Nem sikerült elküldeni az üzenetet. Próbáld meg újra.",
          type: "error",
        });
        return;
      }

      setContactMessage({
        text:
          data?.message ||
          "Köszönjük az üzenetedet! Hamarosan jelentkezünk a megadott elérhetőségen.",
        type: "success",
      });

      setContactForm({
        nev: "",
        email: "",
        targy: "",
        uzenet: "",
      });
    } catch (error) {
      setContactMessage({
        text: "Hálózati hiba történt. Kérlek próbáld meg újra egy kicsit később.",
        type: "error",
      });
    } finally {
      setContactSending(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero" id="top">
        <div className="container content reveal">
          <h1>EXPLORE.</h1>
          <p>
            Nem csak nézni kell a természetet. Benne kell lenni. Prémium expedíciók,
            kis csoportok, valódi kihívások.
          </p>

          <div className="hero-actions">
            <Link to="/turak" className="btn">
              Túrák megtekintése
            </Link>
            <Link to="/berles" className="btn btn-ghost">
              Felszerelés
            </Link>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => scrollTo("nature")}
            >
              Miért jó kint?
            </button>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="tours">
        <div className="container">
          <SectionHead
            title="Ajánlott túráink"
            subtitle="Válogatott útvonalak, átlátható infó. Foglalj gyorsan, ha kell a hely."
          />

          <div className="grid grid-tight">
            {featuredTours.map((t, i) => (
              <article className="card tour reveal glass" key={i}>
                <span className="tour-badge">{t.badge}</span>

                <div className="tour-img">
                  <img src={t.img} alt={t.title} />
                </div>

                <div className="tour-body">
                  <h3>{t.title}</h3>
                  <p className="tour-desc">{t.desc}</p>

                  <div className="tour-meta">
                    <span>{t.dur}</span>
                    <span>{t.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="tours-cta reveal">
            <Link to="/turak" className="btn btn-wide">
              Összes túra listázása
            </Link>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="why">
        <div className="container">
          <SectionHead
            title="Miért EXPLORE"
            subtitle="Komoly, tömör. Nincs körítés. Alatta vélemény."
          />

          <div className="grid">
            {whyCards.map((c, idx) => (
              <article className="card why-card reveal glass" key={idx}>
                <div className="why-body">
                  <h3 className="why-title">{c.title}</h3>
                  <p className="why-front">{c.front}</p>
                  <p className="why-back">{c.back}</p>
                </div>

                <div className="card-reviews">
                  <div className="card-reviews-title">Vélemény</div>
                  <div className="card-review">
                    <div className="card-review-head">
                      <div className="review-user">
                        <img
                          className="review-avatar"
                          src={c.review.avatar}
                          alt={c.review.name}
                        />
                        <span className="card-review-name">{c.review.name}</span>
                      </div>
                      {renderStars(c.review.rating)}
                    </div>
                    <div className="card-review-text">“{c.review.text}”</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="nature">
        <div className="container">
          <SectionHead
            title="Miért jó kint a természetben"
            subtitle="Komoly, tömör. Nem regény."
          />

          <div className="nature-cols">
            {natureCols.map((c, i) => (
              <article className="nature-col glass reveal" key={i}>
                <div
                  className="nature-col-bg"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.82)), url("${c.img}")`,
                  }}
                />
                <div className="nature-col-body">
                  <div className="nature-kicker">{c.kicker}</div>
                  <h3 className="nature-title">{c.title}</h3>
                  <p className="nature-text">{c.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="nature-cta reveal">
            <button className="btn" type="button" onClick={() => scrollTo("tours")}>
              Válassz túrát
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => scrollTo("contact")}>
              Írj nekünk
            </button>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="spotify" className="spotify-section">
        <div className="container">
          <SectionHead
            title="Hangulat: túra mód"
            subtitle="Stabil ritmus, tiszta fej, jó tempó. Nem motivációs cringe."
          />

          <div ref={spotifyRef} className={`spotify-card glass ${spotifyIn ? "in" : ""}`}>
            <div className="spotify-copy">
              <div className="spotify-kicker">SPOTIFY · PLAYLIST</div>
              <h3>EXPLORE — Outdoor Focus</h3>
              <p>
                Ez a lista arra van, hogy <strong>ne szétesve</strong> menj végig.
                Aláfekszik a tempónak, nem viszi el a figyelmet.
              </p>
              <p className="spotify-mini">
                Tipp: indulás előtt nyomd be, és hagyd menni. A döntések meg jönnek
                maguktól.
              </p>
            </div>

            <div className="spotify-embed">
              <iframe
                style={{ borderRadius: 16 }}
                src="https://open.spotify.com/embed/playlist/19xgY84p5kystYNTi75v5v?utm_source=generator"
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify playlist"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section className="gallery-pro" id="gallery">
        <div className="container">
          <SectionHead
            title="Galéria"
            subtitle="Nagy preview, jobb navigáció, tisztább thumb sor. ← → billentyűvel is megy."
          />

          <div
            className="gallery-pro-head reveal"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                color: "rgba(255,255,255,.72)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(255,255,255,.04)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {String(gIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </span>

              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(46, 204, 113, .24)",
                  background: "rgba(46, 204, 113, .10)",
                  color: "rgba(255,255,255,.88)",
                }}
              >
                {gallery[gIndex].badge}
              </span>
            </div>

            <div className="gallery-actions" style={{ display: "flex", gap: 10 }}>
              <button
                className="g-nav"
                type="button"
                onClick={prev}
                aria-label="Előző"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(10,14,16,.72)",
                  color: "#fff",
                  fontSize: 26,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ‹
              </button>
              <button
                className="g-nav"
                type="button"
                onClick={next}
                aria-label="Következő"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.12)",
                  background: "rgba(10,14,16,.72)",
                  color: "#fff",
                  fontSize: 26,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ›
              </button>
            </div>
          </div>

          <div
            className="gallery-stage glass reveal"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              minHeight: 520,
              border: "1px solid rgba(255,255,255,.10)",
              boxShadow: "0 24px 80px rgba(0,0,0,.35)",
            }}
          >
            <img
              src={gallery[gIndex].img}
              alt={`${gallery[gIndex].title} - ${gallery[gIndex].place}`}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 520,
                objectFit: "cover",
                display: "block",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.18) 35%, rgba(0,0,0,.72) 100%)",
                pointerEvents: "none",
              }}
            />

            <div
              className="gallery-stage-meta"
              style={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 22,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 20,
                zIndex: 2,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.62)",
                    marginBottom: 8,
                  }}
                >
                  Explore Gallery
                </div>
                <strong
                  style={{
                    display: "block",
                    fontSize: 30,
                    lineHeight: 1.05,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {gallery[gIndex].title}
                </strong>
                <small
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "rgba(255,255,255,.78)",
                  }}
                >
                  {gallery[gIndex].place}
                </small>
              </div>

              <div
                style={{
                  maxWidth: 280,
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: "rgba(8,12,14,.42)",
                  border: "1px solid rgba(255,255,255,.10)",
                  backdropFilter: "blur(12px)",
                  color: "rgba(255,255,255,.82)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Válogatott pillanatok az utolsó túrákból és hangulatképek a terepről.
              </div>
            </div>
          </div>

          <div
            className="gallery-thumbs reveal"
            role="list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 12,
              marginTop: 18,
            }}
          >
            {gallery.map((g, i) => (
              <button
                key={`${g.title}-${i}`}
                type="button"
                className={`g-thumb ${i === gIndex ? "active" : ""}`}
                onClick={() => setGIndex(i)}
                aria-label={`${g.title} – ${g.place}`}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 18,
                  border:
                    i === gIndex
                      ? "2px solid rgba(46, 204, 113, .95)"
                      : "1px solid rgba(255,255,255,.08)",
                  padding: 0,
                  background: "rgba(255,255,255,.03)",
                  cursor: "pointer",
                  boxShadow:
                    i === gIndex
                      ? "0 0 0 3px rgba(46, 204, 113, .10)"
                      : "none",
                  transform: i === gIndex ? "translateY(-2px)" : "none",
                  transition: "all .18s ease",
                }}
              >
                <img
                  src={g.img}
                  alt={g.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    display: "block",
                    opacity: i === gIndex ? 1 : 0.78,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    padding: "8px 10px",
                    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.84) 100%)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(255,255,255,.94)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="contact" className="contact-section">
        <div className="container">
          <SectionHead
            title="Kapcsolat"
            subtitle="Kérdésed van egy túrával, felszereléssel vagy egyedi csapatprogrammal kapcsolatban? Írj nekünk, és igyekszünk minél hamarabb válaszolni."
          />

          <div className="contact-grid">
            <div className="contact-card glass reveal">
              <div className="contact-card-head">
                <span className="contact-logo" aria-hidden="true">
                  <span className="brand-mark small" />
                  <span className="section-logo-text">EXPLORE.</span>
                </span>
                <span className="contact-badge">Üzenetküldés</span>
              </div>

              <form className="contact-form" onSubmit={handleContactSubmit}>
                <label>
                  Név
                  <input
                    type="text"
                    name="nev"
                    placeholder="Add meg a neved"
                    value={contactForm.nev}
                    onChange={handleContactChange}
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="email@pelda.hu"
                    value={contactForm.email}
                    onChange={handleContactChange}
                  />
                </label>

                <label>
                  Tárgy
                  <input
                    type="text"
                    name="targy"
                    placeholder="Például: túrafoglalás, céges csapatépítő, felszerelés bérlés"
                    value={contactForm.targy}
                    onChange={handleContactChange}
                  />
                </label>

                <label>
                  Üzenet
                  <textarea
                    rows="5"
                    name="uzenet"
                    placeholder="Írd meg nyugodtan, miben segíthetünk. Például mikorra terveztek, hány fővel jönnétek, és milyen nehézségű túra érdekel."
                    value={contactForm.uzenet}
                    onChange={handleContactChange}
                  />
                </label>

                {contactMessage.text ? (
                  <div
                    style={{
                      marginTop: 4,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border:
                        contactMessage.type === "success"
                          ? "1px solid rgba(46,204,113,.28)"
                          : "1px solid rgba(255,90,90,.28)",
                      background:
                        contactMessage.type === "success"
                          ? "rgba(46,204,113,.10)"
                          : "rgba(255,90,90,.10)",
                      color: "rgba(255,255,255,.92)",
                      fontSize: 14,
                      lineHeight: 1.45,
                    }}
                  >
                    {contactMessage.text}
                  </div>
                ) : null}

                <div className="contact-actions">
                  <button className="btn" type="submit" disabled={contactSending}>
                    {contactSending ? "Küldés..." : "Üzenet elküldése"}
                  </button>

                  <Link className="btn btn-ghost" to="/turak">
                    Inkább megnézem a túrákat
                  </Link>
                </div>
              </form>
            </div>

            <div className="contact-side glass reveal">
              <h3>Elérhetőségeink</h3>
              <p className="contact-muted">
                Ha egyszerűbb, közvetlenül is kereshetsz minket. Szívesen segítünk
                túraválasztásban, felszerelésben vagy egyedi kérdésekben is.
              </p>

              <div className="contact-info">
                <div className="contact-row">
                  <span className="contact-ico" aria-hidden="true">
                    ✉️
                  </span>
                  <span>hello@explore.hu</span>
                </div>
                <div className="contact-row">
                  <span className="contact-ico" aria-hidden="true">
                    📞
                  </span>
                  <span>+36 30 123 4567</span>
                </div>
                <div className="contact-row">
                  <span className="contact-ico" aria-hidden="true">
                    📍
                  </span>
                  <span>Keszthely</span>
                </div>
              </div>

              <div className="contact-mini">
                <strong>Tipp:</strong> ha tudod, írd meg az üzenetben a tervezett dátumot,
                a létszámot és azt is, milyen szintű túra érdekel. Így gyorsabban tudunk
                pontos választ adni.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <footer className="footer-pro">
        <div className="container footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="brand-mark" aria-hidden="true" />
              <strong>EXPLORE.</strong>
              <span className="footer-ourlogo">logónk</span>
            </div>
            <p>Prémium túrák, kis csoportok. Valódi terep, valódi élmény.</p>
          </div>

          <div className="footer-col">
            <h4>Navigáció</h4>
            <Link to="/turak">Túrák</Link>
            <Link to="/berles">Bérlés</Link>
            <a href="#gallery">Galéria</a>
            <a href="#contact">Írj nekünk</a>
          </div>

          <div className="footer-col">
            <h4>Kapcsolat</h4>
            <p>hello@explore.hu</p>
            <p>+36 30 123 4567</p>
            <p>Keszthely</p>
          </div>

          <div className="footer-col">
            <h4>Jogi</h4>
            <Link to="/aszf">Általános Szerződési Feltételek (ÁSZF)</Link>
            <Link to="/adatvedelem">Adatvédelmi tájékoztató</Link>
            <Link to="/impresszum">Impresszum</Link>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 EXPLORE · Minden jog fenntartva</span>
          <div className="footer-legal">
            <Link to="/aszf">ÁSZF</Link>
            <Link to="/adatvedelem">Adatvédelem</Link>
            <Link to="/impresszum">Impresszum</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;