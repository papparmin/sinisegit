import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Foglalas.css";
import Swal from "sweetalert2";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

function getUserKey(user) {
  return user?.id || user?.email || "guest";
}

function getBookingDraftStorageKey(user) {
  return `explore_booking_draft_${getUserKey(user)}`;
}

function getGuestProfilesStorageKey(user) {
  return `explore_guest_profiles_${getUserKey(user)}`;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTomorrowSqlDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function Foglalas() {
  const { tourId } = useParams();
  const nav = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [toursError, setToursError] = useState("");

  const [selectedTourId, setSelectedTourId] = useState(tourId || "");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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
  const [savedGuestProfiles, setSavedGuestProfiles] = useState([]);
  const [selectedProfileByGuestIndex, setSelectedProfileByGuestIndex] = useState(
    []
  );

  useEffect(() => {
    let mounted = true;

    const fetchTours = async () => {
      setToursLoading(true);
      setToursError("");

      try {
        const res = await fetch(`${API_BASE}/api/tours`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Nem sikerült betölteni a túrákat.");
        }

        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];
        setTours(list);

        const requestedTourId = String(tourId || "").trim();

        if (requestedTourId) {
          const matched =
            list.find((t) => String(t.slug) === requestedTourId) ||
            list.find((t) => String(t.id) === requestedTourId);

          if (matched) {
            setSelectedTourId(matched.slug || String(matched.id));
          } else if (list[0]) {
            setSelectedTourId(list[0].slug || String(list[0].id));
          }
        } else if (list[0]) {
          setSelectedTourId(list[0].slug || String(list[0].id));
        }
      } catch (err) {
        if (!mounted) return;
        setTours([]);
        setToursError(err.message || "Nem sikerült betölteni a túrákat.");
      } finally {
        if (mounted) {
          setToursLoading(false);
        }
      }
    };

    fetchTours();

    return () => {
      mounted = false;
    };
  }, [tourId]);

  useEffect(() => {
    if (!user) return;

    const bookingDraft = readJson(getBookingDraftStorageKey(user), null);
    const profiles = readJson(getGuestProfilesStorageKey(user), []);

    setSavedGuestProfiles(Array.isArray(profiles) ? profiles : []);

    setForm((prev) => ({
      ...prev,
      name: bookingDraft?.name || user?.nev || prev.name || "",
      email: bookingDraft?.email || user?.email || prev.email || "",
      phone: bookingDraft?.phone || prev.phone || "",
      people: bookingDraft?.people || prev.people || 1,
      experience: bookingDraft?.experience || prev.experience || "Kezdő",
      health: bookingDraft?.health || prev.health || "",
      emergencyName: bookingDraft?.emergencyName || prev.emergencyName || "",
      emergencyPhone:
        bookingDraft?.emergencyPhone || prev.emergencyPhone || "",
      rental: bookingDraft?.rental || prev.rental || "Nem",
      note: bookingDraft?.note || prev.note || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    writeJson(getBookingDraftStorageKey(user), {
      name: form.name,
      email: form.email,
      phone: form.phone,
      people: form.people,
      experience: form.experience,
      health: form.health,
      emergencyName: form.emergencyName,
      emergencyPhone: form.emergencyPhone,
      rental: form.rental,
      note: form.note,
    });
  }, [
    user,
    form.name,
    form.email,
    form.phone,
    form.people,
    form.experience,
    form.health,
    form.emergencyName,
    form.emergencyPhone,
    form.rental,
    form.note,
  ]);

  useEffect(() => {
    const guestCount = Math.max(0, Number(form.people || 1) - 1);

    setGuests((prev) =>
      Array.from({ length: guestCount }, (_, i) => prev[i] || {
        name: "",
        email: "",
        phone: "",
      })
    );

    setSelectedProfileByGuestIndex((prev) =>
      Array.from({ length: guestCount }, (_, i) => prev[i] || "")
    );
  }, [form.people]);

  const selectedTour = useMemo(() => {
    return (
      tours.find(
        (t) =>
          String(t.slug || "") === String(selectedTourId || "") ||
          String(t.id) === String(selectedTourId || "")
      ) || null
    );
  }, [tours, selectedTourId]);

  const selectedTitle = selectedTour?.title || "";
  const selectedBadge = selectedTour?.badge || "KIVÁLASZTOTT";
  const selectedDur = selectedTour?.dur || "—";
  const selectedPrice = selectedTour?.price;
  const joinedCount = Number(selectedTour?.joinedCount || 0);
  const maxPeople = Number(selectedTour?.maxPeople || 20);
  const remainingPlaces = Number(selectedTour?.remainingPlaces || 0);
  const soldOut = !!selectedTour?.soldOut;

  const formattedPrice =
    typeof selectedPrice === "number"
      ? `${selectedPrice.toLocaleString("hu-HU")} Ft`
      : "—";

  const guestCount = useMemo(
    () => Math.max(0, Number(form.people || 1) - 1),
    [form.people]
  );

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setGuest = (index, key, value) => {
    setGuests((prev) =>
      prev.map((guest, i) =>
        i === index ? { ...guest, [key]: value } : guest
      )
    );
  };

  const saveGuestProfiles = (profiles) => {
    if (!user) return;
    writeJson(getGuestProfilesStorageKey(user), profiles);
    setSavedGuestProfiles(profiles);
  };

  const saveGuestAsProfile = (index) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Bejelentkezés szükséges",
        text: "Vendégprofil mentéshez jelentkezz be.",
      });
      return;
    }

    const guest = guests[index];
    const cleanName = String(guest?.name || "").trim();
    const cleanEmail = String(guest?.email || "").trim();
    const cleanPhone = String(guest?.phone || "").trim();

    if (!cleanName) {
      Swal.fire({
        icon: "warning",
        title: "Hiányzó név",
        text: "Előbb töltsd ki a vendég nevét.",
      });
      return;
    }

    const exists = savedGuestProfiles.some(
      (profile) =>
        String(profile.name || "").trim().toLowerCase() ===
          cleanName.toLowerCase() &&
        String(profile.email || "").trim().toLowerCase() ===
          cleanEmail.toLowerCase() &&
        String(profile.phone || "").trim() === cleanPhone
    );

    if (exists) {
      Swal.fire({
        icon: "info",
        title: "Már létezik",
        text: "Ez a vendégprofil már el van mentve.",
      });
      return;
    }

    const newProfile = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      label: cleanName,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    };

    saveGuestProfiles([newProfile, ...savedGuestProfiles]);

    Swal.fire({
      icon: "success",
      title: "Vendégprofil mentve",
      text: `${cleanName} elmentve.`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const loadGuestProfileIntoGuest = (index, profileId) => {
    setSelectedProfileByGuestIndex((prev) =>
      prev.map((value, i) => (i === index ? profileId : value))
    );

    const profile = savedGuestProfiles.find((p) => p.id === profileId);
    if (!profile) return;

    setGuests((prev) =>
      prev.map((guest, i) =>
        i === index
          ? {
              ...guest,
              name: profile.name || "",
              email: profile.email || "",
              phone: profile.phone || "",
            }
          : guest
      )
    );
  };

  const deleteGuestProfile = (profileId) => {
    const updated = savedGuestProfiles.filter((p) => p.id !== profileId);
    saveGuestProfiles(updated);

    setSelectedProfileByGuestIndex((prev) =>
      prev.map((value) => (value === profileId ? "" : value))
    );
  };

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
      });
      return;
    }

    if (!selectedTour) {
      Swal.fire({
        icon: "error",
        title: "Nincs kiválasztott túra",
        text: "Válassz egy túrát a listából.",
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
      if (!String(guests[i].name || "").trim()) {
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
          tourId: selectedTour.slug || selectedTour.id,
          date: getTomorrowSqlDate(),
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
      });
    }
  };

  if (toursLoading) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">Túrák betöltése...</p>
          </div>
        </div>
      </div>
    );
  }

  if (toursError || !tours.length) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-container">
          <div className="foglalas-card glass">
            <h1>Foglalás</h1>
            <p className="muted">
              {toursError || "Jelenleg nincs foglalható túra."}
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
              Válassz túrát, add meg az adatokat, és ments vendégprofilokat.
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
              <label>
                Túra kiválasztása *
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  required
                >
                  {tours.map((tour) => (
                    <option
                      key={tour.slug || tour.id}
                      value={tour.slug || String(tour.id)}
                    >
                      {tour.title} — {typeof tour.price === "number"
                        ? `${tour.price.toLocaleString("hu-HU")} Ft`
                        : "Ár nincs"} — {tour.remainingPlaces || 0} szabad hely
                    </option>
                  ))}
                </select>
              </label>

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
              </div>

              <div className="row2">
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
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {index + 1}. vendég
                        </div>

                        {user ? (
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => saveGuestAsProfile(index)}
                          >
                            Vendégprofil mentése
                          </button>
                        ) : null}
                      </div>

                      {user && savedGuestProfiles.length > 0 ? (
                        <label style={{ marginBottom: 10, display: "block" }}>
                          Mentett vendégprofil betöltése
                          <select
                            value={selectedProfileByGuestIndex[index] || ""}
                            onChange={(e) =>
                              loadGuestProfileIntoGuest(index, e.target.value)
                            }
                          >
                            <option value="">Kézi kitöltés</option>
                            {savedGuestProfiles.map((profile) => (
                              <option key={profile.id} value={profile.id}>
                                {profile.label || profile.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

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
                <strong>{selectedTitle || "Nincs kiválasztva"}</strong>
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
                  <li>Pontos találkozó és infók</li>
                  <li>Felszerelés lista</li>
                  <li>Utolsó update indulás előtt</li>
                </ul>
              </div>

              {user ? (
                <div className="side-box">
                  <h4>Mentett vendégprofilok</h4>
                  {!savedGuestProfiles.length ? (
                    <div className="side-sub">
                      Még nincs mentett vendégprofilod.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {savedGuestProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          style={{
                            padding: 10,
                            borderRadius: 12,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            {profile.label || profile.name}
                          </div>
                          <div className="side-sub">{profile.name}</div>
                          {profile.email ? (
                            <div className="side-sub">{profile.email}</div>
                          ) : null}
                          {profile.phone ? (
                            <div className="side-sub">{profile.phone}</div>
                          ) : null}

                          <div style={{ marginTop: 8 }}>
                            <button
                              type="button"
                              className="btn-ghost"
                              onClick={() => deleteGuestProfile(profile.id)}
                            >
                              Törlés
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}