import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

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

const natureColsData = [
  {
    img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2000",
    kicker: "• mentális reset •",
    title: "Kevesebb inger. Tisztább fej. Stabilabb tempó.",
    text: "A természet visszahoz fókuszba: ritmust ad, letisztítja a zajt, és rendbe rakja a döntéseket. Nem pihenés — inkább újrakalibrálás.",
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
    title: "Rendszert ad. Nem csak pihensz.",
    text: "A jó túra összerak: ritmust ad, rendezi a fejet, és visszahoz egy normális belső tempót.",
  },
];

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

export default function Home() {
  const [gIndex, setGIndex] = useState(0);
  const galleryRailRef = useRef(null);
  const spotifyRef = useRef(null);
  const [spotifyIn, setSpotifyIn] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("active");
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const natureCols = useMemo(() => natureColsData, []);

  const gallery = useMemo(() => {
    const last3 = featuredTours.slice(-3).map((t) => ({
      title: t.title,
      place: t.place,
      img: t.img,
    }));

    const extra = [
      {
        title: "Ködös reggel",
        place: "Erdő",
        img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=2000",
      },
      {
        title: "Éjszakai ég",
        place: "Csend",
        img: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=2000",
      },
      {
        title: "Hegyi tó",
        place: "Táj",
        img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000",
      },
      {
        title: "Gerinc",
        place: "Hegyek",
        img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2000",
      },
    ];

    return [...last3, ...extra];
  }, []);

  const prev = () => {
    setGIndex((i) => (i - 1 + gallery.length) % gallery.length);
  };

  const next = () => {
    setGIndex((i) => (i + 1) % gallery.length);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        setGIndex((i) => (i - 1 + gallery.length) % gallery.length);
      }
      if (e.key === "ArrowRight") {
        setGIndex((i) => (i + 1) % gallery.length);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery.length]);

  useEffect(() => {
    const rail = galleryRailRef.current;
    if (!rail) return;

    const activeThumb = rail.querySelector(".gallery-thumb.active");
    if (!activeThumb) return;

    activeThumb.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [gIndex]);

  useEffect(() => {
    const el = spotifyRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSpotifyIn(true);
        });
      },
      { threshold: 0.22 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <button className="btn btn-ghost" type="button" onClick={() => scrollTo("nature")}>
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

                  <div className="tour-actions">
                    <Link to="/turak" className="btn btn-ghost btn-sm">
                      Részletek
                    </Link>
                    <Link to="/foglalas" className="btn btn-sm">
                      Foglalom
                    </Link>
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
                        <img className="review-avatar" src={c.review.avatar} alt={c.review.name} />
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
                Ez a lista arra van, hogy <strong>ne szétesve</strong> menj végig. Aláfekszik a
                tempónak, nem viszi el a figyelmet.
              </p>
              <p className="spotify-mini">
                Tipp: indulás előtt nyomd be, és hagyd menni. A döntések meg jönnek maguktól.
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
          <SectionHead title="Galéria" subtitle="Utolsó képek a túráinkról." />

          <div className="gallery-frame glass reveal">
            <div className="gallery-stage">
              <img
                src={gallery[gIndex].img}
                alt={`${gallery[gIndex].title} - ${gallery[gIndex].place}`}
              />

              <button
                className="gallery-arrow left"
                type="button"
                onClick={prev}
                aria-label="Előző kép"
              >
                ‹
              </button>

              <button
                className="gallery-arrow right"
                type="button"
                onClick={next}
                aria-label="Következő kép"
              >
                ›
              </button>

              <div className="gallery-stage-overlay">
                <div className="gallery-stage-copy">
                  <span className="gallery-chip">{gallery[gIndex].place}</span>
                  <h3>{gallery[gIndex].title}</h3>
                  <p>
                    {gIndex + 1} / {gallery.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="gallery-rail" ref={galleryRailRef} role="list">
              {gallery.map((g, i) => (
                <button
                  key={`${g.title}-${i}`}
                  type="button"
                  className={`gallery-thumb ${i === gIndex ? "active" : ""}`}
                  onClick={() => setGIndex(i)}
                  aria-label={`${g.title} – ${g.place}`}
                >
                  <img src={g.img} alt={g.title} loading="lazy" />
                  <span className="gallery-thumb-fade" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section id="contact" className="contact-section">
        <div className="container">
          <SectionHead
            title="Írj nekünk"
            subtitle="Gyors válasz, normális hang. Mondd meg mit szeretnél és összerakjuk."
          />

          <div className="contact-grid">
            <div className="contact-card glass reveal">
              <div className="contact-card-head">
                <span className="contact-logo" aria-hidden="true">
                  <span className="brand-mark small" />
                  <span className="section-logo-text">EXPLORE.</span>
                </span>
                <span className="contact-badge">Kapcsolat</span>
              </div>

              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <label>
                  Név
                  <input type="text" placeholder="Pl. Ármin" />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="email@pelda.hu" />
                </label>
                <label>
                  Üzenet
                  <textarea rows="5" placeholder="Mikor, hány fő, milyen szint, mi érdekel?" />
                </label>

                <div className="contact-actions">
                  <button className="btn" type="submit">
                    Küldés
                  </button>
                  <Link className="btn btn-ghost" to="/turak">
                    Inkább túrát választok
                  </Link>
                </div>
              </form>
            </div>

            <div className="contact-side glass reveal">
              <h3>Elérhetőség</h3>
              <p className="contact-muted">
                Ha gyorsabb: írj vagy csörögj. Nem robot, ember válaszol.
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
                <strong>Pro tipp:</strong> írd bele az üzenetbe a dátumot + szintet, és 2 körrel
                kevesebb pingpong lesz.
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
}