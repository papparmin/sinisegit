import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Foglalas.css";
import Swal from "sweetalert2";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export default function Foglalas() {
  const { tourId } = useParams();
  const nav = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [tour, setTour] = useState(null);
  const [tourLoading, setTourLoading] = useState(true);
  const [tourError, setTourError] = useState("");

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

  const [guests, setGuests] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchTour = async () => {
      if (!tourId) {
        setTourLoading(false);
        setTourError("Hiányzik a túra azonosító.");
        return;
      }

      setTourLoading(true);
      setTourError("");

      try {
        const res = await fetch(`${API_BASE}/api/tours/${encodeURIComponent(tourId)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Nem sikerült betölteni a túrát.");
        }

        if (mounted) {
          setTour(data);
        }
      } catch (err) {
        if (mounted) {
          setTour(null);
          setTourError(err.message || "Nem sikerült betölteni a túrát.");
        }
      } finally {
        if (mounted) {
          setTourLoading(false);
        }
      }
    };

    fetchTour();

    return () => {
      mounted = false;
    };
  }, [tourId]);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      name: prev.name || user.nev || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    const guestCount = Math.max(0, Number(form.people || 1) - 1);

    setGuests((prev) =>
      Array.from({ length: guestCount }, (_, i) => prev[i] || {
        name: "",
        email: "",
        phone: "",
      })
    );
  }, [form.people]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setGuest = (index, key, value) => {
    setGuests((prev) =>
      prev.map((guest, i) =>
        i === index ? { ...guest, [key]: value } : guest
      )
    );
  };

  const selectedTitle = tour?.title || "";
  const selectedBadge = tour?.badge || "KIVÁLASZTOTT";
  const selectedDur = tour?.dur || "—";
  const selectedPrice = tour?.price;
  const joinedCount = Number(tour?.joinedCount || 0);
  const maxPeople = Number(tour?.maxPeople || 20);
  const remainingPlaces = Number(tour?.remainingPlaces || 0);
  const soldOut = !!tour?.soldOut;

  const formattedPrice =
    typeof selectedPrice === "number"
      ? `${selectedPrice.toLocaleString("hu-HU")} Ft`
      : "—";

  const guestCount = useMemo(
    () => Math.max(0, Number(form.people || 1) - 1),
    [form.people]
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.accept) {
      Swal.fire({
        icon: "warning",
        title: "Fogadd el a feltételeket",
        text: "Az ÁSZF és az Adatvédelem elfogadása kötelező.",
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Bejelentkezés szükséges",
        text: "A foglaláshoz kérlek jelentkezz be a fiókodba!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!tour) {
      Swal.fire({
        icon: "error",
        title: "Nincs betöltött túra",
        text: "Próbáld meg újra a túra kiválasztását.",
      });
      return;
    }

    if (soldOut || remainingPlaces <= 0) {
      Swal.fire({
        icon: "error",
        title: "Betelt",
        text: "Erre a túrára már nincs szabad hely.",
      });
      return;
    }

    const parsedPeople = Number(form.people);

    if (!parsedPeople || Number.isNaN(parsedPeople) || parsedPeople < 1) {
      Swal.fire({
        icon: "error",
        title: "Hibás létszám",
        text: "Adj meg legalább 1 főt.",
      });
      return;
    }

    if (parsedPeople > remainingPlaces) {
      Swal.fire({
        icon: "error",
        title: "Nincs elég hely",
        text: `Erre a túrára már csak ${remainingPlaces} főnek van hely.`,
      });
      return;
    }

    for (let i = 0; i < guests.length; i += 1) {
      if (!guests[i].name.trim()) {
        Swal.fire({
          icon: "error",
          title: "Hiányzó vendégnév",
          text: `A(z) ${i + 1}. vendég nevét töltsd ki.`,
        });
        return;
      }
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
          date: form.date,
          people: parsedPeople,
          name: form.name,
          email: form.email,
          phone: form.phone,
          experience: form.experience,
          health: form.health,
          emergencyName: form.emergencyName,
          emergencyPhone: form.emergencyPhone,
          rental: form.rental,
          note: form.note,
          guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Hiba a foglalás során");
      }

      Swal.fire({
        icon: "success",
        title: "Sikeres foglalás!",
        text: `${selectedTitle} – ${parsedPeople} fő sikeresen rögzítve.`,
        showConfirmButton: false,
        timer: 2600,
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

  if (tourLoading) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">Túra betöltése...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour || tourError) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">
              {tourError || "Foglalni csak érvényes túrára lehet."}
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
            <div className="chip soft">{formattedPrice}</div>
            <div className="chip soft">
              {joinedCount} / {maxPeople} fő
            </div>
            {soldOut ? <div className="chip">Betelt</div> : null}
          </div>

          <div className="foglalas-grid">
            <form className="foglalas-form" onSubmit={onSubmit}>
              <div className="row2">
                <label>
                  Foglaló neve *
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    placeholder="Teljes név"
                  />
                </label>

                <label>
                  Foglaló email *
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
                  Foglaló telefon *
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
                    onChange={(e) =>
                      set("people", Math.max(1, Number(e.target.value) || 1))
                    }
                    type="number"
                    min={1}
                    max={Math.max(1, remainingPlaces)}
                    required
                    disabled={soldOut}
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

              {guestCount > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ marginBottom: 12 }}>Vendégek</h3>

                  {guests.map((guest, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: 14,
                        marginBottom: 12,
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 10,
                          color: "#fff",
                        }}
                      >
                        {index + 1}. vendég
                      </div>

                      <div className="row2">
                        <label>
                          Név *
                          <input
                            value={guest.name}
                            onChange={(e) =>
                              setGuest(index, "name", e.target.value)
                            }
                            required
                            placeholder="Vendég neve"
                          />
                        </label>

                        <label>
                          Email
                          <input
                            value={guest.email}
                            onChange={(e) =>
                              setGuest(index, "email", e.target.value)
                            }
                            type="email"
                            placeholder="email@cim.hu"
                          />
                        </label>
                      </div>

                      <label>
                        Telefon
                        <input
                          value={guest.phone}
                          onChange={(e) =>
                            setGuest(index, "phone", e.target.value)
                          }
                          type="tel"
                          placeholder="+36 ..."
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}

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
                <button
                  className="btn"
                  type="submit"
                  disabled={!form.accept || soldOut}
                >
                  {soldOut ? "Betelt" : "Foglalás elküldése"}
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
                <div className="side-sub">Ár: {formattedPrice}</div>
                <div className="side-sub">
                  Csatlakozott: {joinedCount} / {maxPeople} fő
                </div>
                <div className="side-sub">
                  Szabad hely: {remainingPlaces} fő
                </div>
              </div>

              <div className="side-box">
                <h4>Mi lesz ezután?</h4>
                <ul>
                  <li>Foglalás rögzítése a rendszerben</li>
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