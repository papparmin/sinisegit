import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Uzemeltetok.css";

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

export default function Uzemeltetok() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("active")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const people = [
    {
      name: "Németh Gergő",
      role: "Alapító",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80&auto=format&fit=crop",
      intro:
        "Németh Gergő vagyok az Explore cég egyik megálmodója és alapítója. A természet közelsége illetve a mozgás mindig fontos volt számomra, ezért is esett a választásom egy ilyen cégre.",
      answer:
        "Az Explore ötlete onnan jött, hogy láttuk, mennyire könnyű beleragadni a mindennapok pörgésébe. Nekem a túrázás mindig egyfajta újraindítás volt: mozgás, levegő, csend, és az az érzés, hogy végre nem minden rohan körülöttem. Ezt az élményt szeretném másoknak is átadni.",
    },
    {
      name: "Papp Ármin",
      role: "Alapító",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80&auto=format&fit=crop",
      intro:
        "Papp Ármin vagyok az Explore cég egyik alapítója valamint megálmodója. A természet és a mozgás mindig fontos volt számomra, ezért is esett a választásom egy ilyen cégre mint az Explore.",
      answer:
        "Az Explore létrehozásában az motivált, hogy ne csak magunknak tartsuk meg azt, amit a túrák és a természet adni tudnak. A stresszoldás, a kiszakadás, a valódi élmények és az egyszerűbb, tisztább jelenlét szerintem mindenkinek jót tesz. Ezt akartuk egy olyan formába rakni, amit mások is megélhetnek velünk.",
    },
  ];

  return (
    <div className="uzem-page">
      <section className="uzem-intro">
        <div className="container">
          <SectionHead
            title="Kik vagyunk mi?"
            subtitle="Ketten állunk az Explore mögött, és mindkettőnknek ugyanaz a fontos: a természet, a feltöltődés és a valódi élmény."
          />

          <div className="founders-grid">
            {people.map((person) => (
              <article className="founder-card glass reveal" key={person.name}>
                <div className="founder-image-wrap">
                  <img src={person.image} alt={person.name} className="founder-image" />
                </div>

                <div className="founder-body">
                  <div className="founder-top">
                    <h3>{person.name}</h3>
                    <span className="founder-role">{person.role}</span>
                  </div>
                  <p className="founder-intro">{person.intro}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section className="uzem-section">
        <div className="container">
          <SectionHead
            title="Miért hoztuk létre az Explore-t?"
            subtitle="Röviden: mert úgy gondoltuk az embereknek szükségük van több időt a természetben tölteni a mozgással összekapcsolva."
          />

          <div className="interview-wrap">
            {people.map((person) => (
              <article className="interview-card glass reveal" key={`${person.name}-interview`}>
                <div className="interview-head">
                  <div className="interview-avatar-wrap">
                    <img src={person.image} alt={person.name} className="interview-avatar" />
                  </div>
                  <div>
                    <div className="interview-name">{person.name}</div>
                    <div className="interview-role">{person.role}</div>
                  </div>
                </div>

                <div className="interview-question">
                  Miért volt fontos számotokra, hogy létrehozzátok az Explore-t?
                </div>

                <p className="interview-answer">“{person.answer}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section className="uzem-section">
        <div className="container">
          <SectionHead
            title="Mit is szeretnénk átadni a kalandvágyóknak?"
            subtitle="A természet adta csodát és örömöt a mozgással összeboronálva."
          />

          <div className="uzem-about-card glass reveal">
            <p>
              Nekünk az Explore nem csak túrákról szól. Inkább arról, hogy az
              ember néha végre kiszakadjon a napi pörgésből, mozduljon egyet,
              levegőt vegyen, és visszataláljon egy nyugodtabb ritmushoz.
            </p>

            <p>
              Hisszük, hogy a természetben töltött idő tényleg tud segíteni:
              csökkenti a stresszt, kitisztítja a fejet, és ad egy olyan élményt,
              ami után nemcsak fizikailag érzed magad jobban, hanem mentálisan is.
            </p>

            <p>
              Ezt szeretnénk másoknak is megmutatni. Nem túltolva, nem műen,
              hanem őszintén és normálisan.
            </p>
          </div>
        </div>
      </section>

      <div className="black-sep" />

      <section className="uzem-section" id="kapcsolat">
        <div className="container">
          <SectionHead
            title="Kapcsolatfelvétel"
            subtitle="Ha kérdésed van, írj nyugodtan."
          />

          <div className="uzem-contact-grid">
            <div className="uzem-contact-card glass reveal">
              <div className="uzem-contact-head">
                <span className="section-logo" aria-hidden="true">
                  <span className="brand-mark small" />
                  <span className="section-logo-text">EXPLORE.</span>
                </span>
                <span className="uzem-badge">Kapcsolat</span>
              </div>

              <form className="uzem-form" onSubmit={(e) => e.preventDefault()}>
                <label>
                  Név
                  <input type="text" placeholder="Pl. Papp Ármin" />
                </label>

                <label>
                  Email
                  <input type="email" placeholder="email@pelda.hu" />
                </label>

                <label>
                  Üzenet
                  <textarea
                    rows="5"
                    placeholder="Írd meg nyugodtan, miben segíthetünk."
                  />
                </label>

                <div className="contact-actions">
                  <button className="btn" type="submit">
                    Küldés
                  </button>
                  <Link to="/" className="btn btn-ghost">
                    Vissza a főoldalra
                  </Link>
                </div>
              </form>
            </div>

            <div className="uzem-side glass reveal">
              <h3>Elérhetőség</h3>
              <p className="uzem-muted">
                Ha egyszerűbb, itt is elérsz minket.
              </p>

              <div className="uzem-info">
                <div className="uzem-row">
                  <span className="uzem-ico">✉️</span>
                  <span>hello@explore.hu</span>
                </div>
                <div className="uzem-row">
                  <span className="uzem-ico">📞</span>
                  <span>+36 30 123 4567</span>
                </div>
                <div className="uzem-row">
                  <span className="uzem-ico">📍</span>
                  <span>Keszthely</span>
                </div>
              </div>

              <div className="uzem-mini">
                Írj bátran, ha kérdésed van a túrákkal, az Explore-ral vagy velünk kapcsolatban.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}