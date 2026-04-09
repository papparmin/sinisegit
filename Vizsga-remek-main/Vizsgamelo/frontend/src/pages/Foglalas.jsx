import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Foglalas.css";
import Swal from "sweetalert2";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const PAYMENT_METHODS = [
  {
    value: "helyszinen",
    title: "Helyszíni fizetés",
    desc: "A részvételi díjat a túra előtt vagy induláskor rendezed.",
    badge: "Egyszerű",
  },
  {
    value: "atutalas",
    title: "Banki átutalás",
    desc: "A foglalás után azonnal megkapod az utalási adatokat, és emailben is elküldjük.",
    badge: "Biztonságos",
  },
  {
    value: "online",
    title: "Online fizetés",
    desc: "Bankkártya / Apple Pay / Google Pay integrációhoz előkészített mód.",
    badge: "Modern",
  },
];

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

function toLocalSqlDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowSqlDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalSqlDate(d);
}

function formatPrice(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("hu-HU")} Ft`;
}

function formatDateHu(value) {
  if (!value) return "—";

  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function getPaymentMethodMeta(value) {
  return (
    PAYMENT_METHODS.find((item) => item.value === value) || PAYMENT_METHODS[0]
  );
}

function getPaymentStatusText(paymentMethod) {
  if (paymentMethod === "atutalas") return "Utalásra vár";
  if (paymentMethod === "online") return "Online fizetésre előkészítve";
  return "Helyszínen fizetendő";
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
    paymentMethod: "helyszinen",
    accept: false,
  });

  const [guests, setGuests] = useState([]);
  const [savedGuestProfiles, setSavedGuestProfiles] = useState([]);
  const [selectedProfileByGuestIndex, setSelectedProfileByGuestIndex] = useState(
    []
  );
  const [bookingResult, setBookingResult] = useState(null);

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
      paymentMethod:
        bookingDraft?.paymentMethod || prev.paymentMethod || "helyszinen",
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
      paymentMethod: form.paymentMethod,
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
    form.paymentMethod,
  ]);

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
  const selectedBadge = selectedTour?.badge || "EXPLORE";
  const selectedDur = selectedTour?.dur || "—";

  const selectedPrice =
    typeof selectedTour?.price === "number"
      ? selectedTour.price
      : Number(selectedTour?.price);

  const joinedCount = Math.max(0, Number(selectedTour?.joinedCount || 0));
  const maxPeople = Math.max(1, Number(selectedTour?.maxPeople || 20));
  const remainingPlaces = Math.max(
    0,
    Number(
      selectedTour?.remainingPlaces ?? Math.max(0, maxPeople - joinedCount)
    )
  );
  const soldOut = !!selectedTour?.soldOut || remainingPlaces <= 0;

  const occupancyPercent = Math.min(
    100,
    maxPeople > 0 ? Math.round((joinedCount / maxPeople) * 100) : 0
  );

  useEffect(() => {
    const currentPeople = Math.max(1, Number(form.people || 1));

    if (soldOut) return;

    const maxAllowed = Math.max(1, remainingPlaces);

    if (currentPeople > maxAllowed) {
      setForm((prev) => ({ ...prev, people: maxAllowed }));
    }
  }, [remainingPlaces, soldOut, form.people]);

  const guestCount = useMemo(
    () => Math.max(0, Number(form.people || 1) - 1),
    [form.people]
  );

  useEffect(() => {
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
  }, [guestCount]);

  const totalEstimatedPrice =
    typeof selectedPrice === "number" && !Number.isNaN(selectedPrice)
      ? selectedPrice * Math.max(1, Number(form.people || 1))
      : null;

  const paymentMeta = getPaymentMethodMeta(form.paymentMethod);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setGuest = (index, key, value) => {
    setGuests((prev) =>
      prev.map((guest, i) =>
        i === index ? { ...guest, [key]: value } : guest
      )
    );
  };

  const handlePeopleChange = (value) => {
    const numeric = Number(value);

    if (!numeric || Number.isNaN(numeric)) {
      set("people", 1);
      return;
    }

    const hardMax = soldOut ? 1 : Math.max(1, remainingPlaces);
    set("people", Math.max(1, Math.min(numeric, hardMax)));
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
        text: "Vendégprofil mentéséhez előbb jelentkezz be.",
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
        title: "Már el van mentve",
        text: "Ez a vendégprofil már szerepel a mentettek között.",
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
      text: `${cleanName} elmentve a későbbi foglalásokhoz.`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const loadGuestProfileIntoGuest = (index, profileId) => {
    setSelectedProfileByGuestIndex((prev) =>
      prev.map((value, i) => (i === index ? profileId : value))
    );

    if (!profileId) return;

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

  const copyText = async (label, value) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      Swal.fire({
        icon: "success",
        title: "Kimásolva",
        text: `${label} kimásolva.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Nem sikerült",
        text: "A másolás nem sikerült ezen az eszközön.",
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.accept) {
      Swal.fire({
        icon: "warning",
        title: "El kell fogadnod a feltételeket",
        text: "Az ÁSZF és az Adatvédelem elfogadása kötelező a foglaláshoz.",
      });
      return;
    }

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Bejelentkezés szükséges",
        text: "A foglalás elküldéséhez kérlek jelentkezz be.",
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
        title: "Betelt a túra",
        text: "Erre a túrára jelenleg már nincs szabad hely.",
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
          paymentMethod: form.paymentMethod,
          guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Hiba a foglalás során");
      }

      setBookingResult({
        tourTitle: data?.booking?.tourTitle || selectedTitle,
        bookingId: data?.booking?.id || null,
        people: data?.booking?.people || parsedPeople,
        payment: data?.payment || null,
        bankTransfer: data?.bankTransfer || null,
        emailSent: !!data?.emailSent,
        emailWarning: data?.emailWarning || "",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="foglalas-shell">
          <div className="foglalas-state glass-panel">
            <h1>Foglalás</h1>
            <p>Túrák betöltése folyamatban...</p>
          </div>
        </div>
      </div>
    );
  }

  if (toursError || !tours.length) {
    return (
      <div className="foglalas-page">
        <div className="foglalas-shell">
          <div className="foglalas-state glass-panel">
            <h1>Foglalás</h1>
            <p>{toursError || "Jelenleg nincs foglalható túra."}</p>
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

  if (bookingResult) {
    const paymentMethodLabel =
      bookingResult?.payment?.methodLabel || paymentMeta.title;
    const paymentStatusLabel =
      bookingResult?.payment?.statusLabel ||
      getPaymentStatusText(form.paymentMethod);
    const paymentAmount = bookingResult?.payment?.amount ?? totalEstimatedPrice;
    const bankTransfer = bookingResult?.bankTransfer;

    return (
      <div className="foglalas-page">
        <div className="foglalas-shell">
          <section className="foglalas-hero glass-panel">
            <div className="hero-copy">
              <div className="hero-eyebrow">EXPLORE · Sikeres foglalás</div>
              <h1>Minden rendben, a foglalás bekerült a rendszerbe.</h1>
              <p>
                Az adatok rögzítve lettek. Lent látod a foglalás összegzését,
                és ha átutalást választottál, az utalási adatokat is.
              </p>

              <div className="hero-pills">
                <span className="hero-pill">
                  Foglalás #{bookingResult.bookingId || "—"}
                </span>
                <span className="hero-pill soft">
                  {bookingResult.tourTitle || "EXPLORE túra"}
                </span>
                <span className="hero-pill soft">
                  {typeof paymentAmount === "number"
                    ? formatPrice(paymentAmount)
                    : "—"}
                </span>
                <span className="hero-pill success">{paymentMethodLabel}</span>
              </div>
            </div>

            <div className="hero-tour-card">
              <div className="hero-tour-label">Visszaigazolás</div>
              <div className="hero-tour-title">
                {bookingResult.tourTitle || "Sikeres foglalás"}
              </div>

              <div className="hero-tour-meta">
                <div>
                  <span>Foglalás azonosító</span>
                  <strong>#{bookingResult.bookingId || "—"}</strong>
                </div>
                <div>
                  <span>Fizetési állapot</span>
                  <strong>{paymentStatusLabel}</strong>
                </div>
              </div>

              <div className="places-caption" style={{ marginTop: 18 }}>
                {bookingResult.emailSent
                  ? "A visszaigazolást emailben is elküldtük."
                  : bookingResult.emailWarning
                  ? `A foglalás sikeres, de az email nem ment ki: ${bookingResult.emailWarning}`
                  : "A foglalás rögzítve lett."}
              </div>
            </div>
          </section>

          <div className="foglalas-layout">
            <div className="foglalas-main glass-panel">
              <section className="form-section">
                <div className="section-heading">
                  <div>
                    <div className="section-kicker">Foglalás összegzés</div>
                    <h2>Sikeres rögzítés</h2>
                    <p className="section-help">
                      Itt látod a foglalás legfontosabb adatait.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  }}
                >
                  <div className="saved-profile-card">
                    <div className="saved-profile-name">Túra</div>
                    <div className="saved-profile-meta">
                      {bookingResult.tourTitle || "—"}
                    </div>
                  </div>

                  <div className="saved-profile-card">
                    <div className="saved-profile-name">Létszám</div>
                    <div className="saved-profile-meta">
                      {bookingResult.people || 1} fő
                    </div>
                  </div>

                  <div className="saved-profile-card">
                    <div className="saved-profile-name">Fizetési mód</div>
                    <div className="saved-profile-meta">{paymentMethodLabel}</div>
                  </div>

                  <div className="saved-profile-card">
                    <div className="saved-profile-name">Végösszeg</div>
                    <div className="saved-profile-meta">
                      {typeof paymentAmount === "number"
                        ? formatPrice(paymentAmount)
                        : "—"}
                    </div>
                  </div>
                </div>
              </section>

              {bankTransfer ? (
                <section className="form-section">
                  <div className="section-heading">
                    <div>
                      <div className="section-kicker">Banki átutalás</div>
                      <h2>Utalási adatok</h2>
                      <p className="section-help">
                        Az utalás közleményét pontosan így írd be, különben
                        nehezebb lesz azonosítani a befizetést.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                    }}
                  >
                    <div className="saved-profile-card">
                      <div className="saved-profile-name">Kedvezményezett</div>
                      <div className="saved-profile-meta">
                        {bankTransfer.accountName || "—"}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div className="saved-profile-name">Bank</div>
                      <div className="saved-profile-meta">
                        {bankTransfer.bankName || "—"}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div className="saved-profile-name">Számlaszám</div>
                          <div className="saved-profile-meta">
                            {bankTransfer.accountNumber || "—"}
                          </div>
                        </div>
                        {bankTransfer.accountNumber ? (
                          <button
                            type="button"
                            className="btn-ghost small"
                            onClick={() =>
                              copyText("Számlaszám", bankTransfer.accountNumber)
                            }
                          >
                            Másolás
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div className="saved-profile-name">IBAN</div>
                          <div className="saved-profile-meta">
                            {bankTransfer.iban || "—"}
                          </div>
                        </div>
                        {bankTransfer.iban ? (
                          <button
                            type="button"
                            className="btn-ghost small"
                            onClick={() => copyText("IBAN", bankTransfer.iban)}
                          >
                            Másolás
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div className="saved-profile-name">SWIFT</div>
                      <div className="saved-profile-meta">
                        {bankTransfer.swift || "—"}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div className="saved-profile-name">Közlemény</div>
                          <div className="saved-profile-meta">
                            {bankTransfer.reference || "—"}
                          </div>
                        </div>
                        {bankTransfer.reference ? (
                          <button
                            type="button"
                            className="btn-ghost small"
                            onClick={() =>
                              copyText("Közlemény", bankTransfer.reference)
                            }
                          >
                            Másolás
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div className="saved-profile-name">Határidő</div>
                      <div className="saved-profile-meta">
                        {bankTransfer.dueDateLabel ||
                          formatDateHu(bankTransfer.dueDate)}
                      </div>
                    </div>

                    <div className="saved-profile-card">
                      <div className="saved-profile-name">Megjegyzés</div>
                      <div className="saved-profile-meta">
                        {bankTransfer.notice ||
                          "Kérlek, a közleménybe pontosan írd be a kapott azonosítót."}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="form-section">
                <div className="actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => nav("/turak")}
                  >
                    Vissza a túrákhoz
                  </button>

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setBookingResult(null);
                      setForm((prev) => ({
                        ...prev,
                        note: "",
                        accept: false,
                      }));
                      setGuests([]);
                    }}
                  >
                    Új foglalás indítása
                  </button>
                </div>
              </section>
            </div>

            <aside className="foglalas-side">
              <div className="summary-card glass-panel">
                <div className="summary-kicker">Mi történik most?</div>
                <ul className="clean-list">
                  <li>A foglalás már rögzítve van.</li>
                  <li>Ha átutalást választottál, az utalási adatokat fent látod.</li>
                  <li>A rendszer emailben is próbált visszaigazolást küldeni.</li>
                  <li>A további információkat később kapod meg.</li>
                </ul>
              </div>

              <div className="summary-card glass-panel">
                <div className="summary-kicker">Kapcsolattartás</div>
                <p className="side-text">
                  Ellenőrizd az email fiókodat is. Ha nem jött meg a levél,
                  nézd meg a spam / promóciók mappát is.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="foglalas-page">
      <div className="foglalas-shell">
        <section className="foglalas-hero glass-panel">
          <div className="hero-copy">
            <div className="hero-eyebrow">EXPLORE · Foglalás és fizetés</div>
            <h1>Foglalj és válaszd ki a fizetési módot egy helyen.</h1>
            <p>
              Itt rögtön kiválaszthatod a túrát, megadhatod a résztvevők adatait,
              beállíthatod a fizetési módot, és a rendszer visszaigazolást is küld
              a sikeres foglalásról.
            </p>

            <div className="hero-pills">
              <span className="hero-pill">{selectedBadge}</span>
              <span className="hero-pill soft">{selectedDur}</span>
              <span className="hero-pill soft">
                {formatPrice(selectedPrice)}
              </span>
              <span className={`hero-pill ${soldOut ? "danger" : "success"}`}>
                {soldOut ? "Betelt" : `${remainingPlaces} szabad hely`}
              </span>
            </div>
          </div>

          <div className="hero-tour-card">
            <div className="hero-tour-label">Kiválasztott túra</div>
            <div className="hero-tour-title">
              {selectedTitle || "Nincs kiválasztva"}
            </div>

            <div className="hero-tour-meta">
              <div>
                <span>Csatlakozott</span>
                <strong>
                  {joinedCount} / {maxPeople} fő
                </strong>
              </div>
              <div>
                <span>Becsült végösszeg</span>
                <strong>
                  {totalEstimatedPrice !== null
                    ? formatPrice(totalEstimatedPrice)
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="places-bar">
              <div
                className="places-bar-fill"
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>

            <div className="places-caption">
              Foglaltság: {occupancyPercent}% · Maradt {remainingPlaces} hely
            </div>
          </div>
        </section>

        <div className="foglalas-layout">
          <form className="foglalas-main glass-panel" onSubmit={onSubmit}>
            <section className="form-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">1. Túra kiválasztása</div>
                  <h2>Melyik programra foglalsz?</h2>
                  <p className="section-help">
                    Ha a túrák oldaláról jöttél, a rendszer már megpróbálta
                    előre kiválasztani a megfelelő túrát.
                  </p>
                </div>

                <div className={`tour-status ${soldOut ? "danger" : "ok"}`}>
                  {soldOut ? "Betelt" : `${remainingPlaces} hely maradt`}
                </div>
              </div>

              <label className="form-label">
                <span>Túra *</span>
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
                      {tour.title} —{" "}
                      {typeof tour.price === "number"
                        ? `${tour.price.toLocaleString("hu-HU")} Ft`
                        : "Ár nincs"}{" "}
                      — {tour.remainingPlaces || 0} szabad hely
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">2. Foglaló adatai</div>
                  <h2>Kapcsolattartási adatok</h2>
                  <p className="section-help">
                    Ezek kellenek a visszaigazoláshoz és a további egyeztetéshez.
                  </p>
                </div>
              </div>

              <div className="form-grid two">
                <label className="form-label">
                  <span>Foglaló neve *</span>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    placeholder="Teljes név"
                  />
                </label>

                <label className="form-label">
                  <span>Foglaló email *</span>
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    type="email"
                    placeholder="email@cim.hu"
                  />
                </label>
              </div>

              <div className="form-grid two">
                <label className="form-label">
                  <span>Foglaló telefon *</span>
                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    type="tel"
                    placeholder="+36 ..."
                  />
                </label>

                <label className="form-label">
                  <span>Létszám *</span>
                  <input
                    value={form.people}
                    onChange={(e) => handlePeopleChange(e.target.value)}
                    type="number"
                    min={1}
                    max={Math.max(1, remainingPlaces)}
                    required
                    disabled={soldOut}
                  />
                </label>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">3. Túra részletei</div>
                  <h2>Fontos tudnivalók</h2>
                  <p className="section-help">
                    Ezek az információk segítenek abban, hogy a szervezés tényleg
                    gördülékeny legyen.
                  </p>
                </div>
              </div>

              <div className="form-grid two">
                <label className="form-label">
                  <span>Tapasztalat *</span>
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

                <label className="form-label">
                  <span>Felszerelés bérlés</span>
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

              <label className="form-label">
                <span>Egészség / allergia / fontos infó</span>
                <input
                  value={form.health}
                  onChange={(e) => set("health", e.target.value)}
                  placeholder="Pl. allergia, sérülés, gyógyszer..."
                />
              </label>

              <div className="form-grid two">
                <label className="form-label">
                  <span>Vészhelyzeti kontakt neve *</span>
                  <input
                    value={form.emergencyName}
                    onChange={(e) => set("emergencyName", e.target.value)}
                    required
                    placeholder="Név"
                  />
                </label>

                <label className="form-label">
                  <span>Vészhelyzeti kontakt telefonszáma *</span>
                  <input
                    value={form.emergencyPhone}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                    required
                    placeholder="+36 ..."
                  />
                </label>
              </div>
            </section>

            {guestCount > 0 && (
              <section className="form-section">
                <div className="section-heading">
                  <div>
                    <div className="section-kicker">4. Vendégek</div>
                    <h2>További résztvevők adatai</h2>
                    <p className="section-help">
                      A foglaló mellett még {guestCount} fő adatait kell megadnod.
                    </p>
                  </div>
                </div>

                <div className="guest-list">
                  {guests.map((guest, index) => (
                    <div key={index} className="guest-card">
                      <div className="guest-card-head">
                        <div>
                          <div className="guest-index">
                            {index + 1}. vendég
                          </div>
                          <div className="guest-sub">
                            Töltsd ki a résztvevő alapadatait.
                          </div>
                        </div>

                        {user ? (
                          <button
                            type="button"
                            className="btn-ghost small"
                            onClick={() => saveGuestAsProfile(index)}
                          >
                            Profil mentése
                          </button>
                        ) : null}
                      </div>

                      {user && savedGuestProfiles.length > 0 ? (
                        <label className="form-label">
                          <span>Mentett vendégprofil betöltése</span>
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

                      <div className="form-grid two">
                        <label className="form-label">
                          <span>Név *</span>
                          <input
                            value={guest.name}
                            onChange={(e) =>
                              setGuest(index, "name", e.target.value)
                            }
                            required
                            placeholder="Vendég neve"
                          />
                        </label>

                        <label className="form-label">
                          <span>Email</span>
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

                      <label className="form-label">
                        <span>Telefon</span>
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
              </section>
            )}

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">5. Fizetés</div>
                  <h2>Válassz fizetési módot</h2>
                  <p className="section-help">
                    A foglalással együtt a fizetési mód is rögzítésre kerül, és
                    erről visszaigazolást kapsz.
                  </p>
                </div>
              </div>

              <div className="payment-options">
                {PAYMENT_METHODS.map((item) => {
                  const active = form.paymentMethod === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`payment-card ${active ? "active" : ""}`}
                      onClick={() => set("paymentMethod", item.value)}
                    >
                      <div className="payment-card-top">
                        <div className="payment-card-title">{item.title}</div>
                        <div className="payment-card-badge">{item.badge}</div>
                      </div>

                      <div className="payment-card-desc">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div className="payment-info-box">
                <div className="payment-info-title">
                  Kiválasztott fizetési mód: {paymentMeta.title}
                </div>
                <div className="payment-info-text">{paymentMeta.desc}</div>
                <div className="payment-info-status">
                  Állapot: {getPaymentStatusText(form.paymentMethod)}
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">6. Megjegyzés</div>
                  <h2>Extra kérés vagy üzenet</h2>
                  <p className="section-help">
                    Ide jöhet minden plusz infó, amit szerinted jó, ha a
                    szervező lát.
                  </p>
                </div>
              </div>

              <label className="form-label">
                <span>Üzenet</span>
                <textarea
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Pl. később érkezek, külön kérés, egyéb tudnivaló..."
                />
              </label>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.accept}
                  onChange={(e) => set("accept", e.target.checked)}
                />
                <span>
                  Elfogadom az <Link to="/aszf">ÁSZF</Link> és az{" "}
                  <Link to="/adatvedelem">Adatvédelem</Link> feltételeit. *
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
                  Vissza a túrákhoz
                </Link>
              </div>
            </section>
          </form>

          <aside className="foglalas-side">
            <div className="summary-card glass-panel">
              <div className="summary-kicker">Összegzés</div>
              <h3>{selectedTitle || "Nincs kiválasztott túra"}</h3>

              <div className="summary-list">
                <div className="summary-row">
                  <span>Időtartam</span>
                  <strong>{selectedDur}</strong>
                </div>
                <div className="summary-row">
                  <span>Ár / fő</span>
                  <strong>{formatPrice(selectedPrice)}</strong>
                </div>
                <div className="summary-row">
                  <span>Létszám</span>
                  <strong>{Math.max(1, Number(form.people || 1))} fő</strong>
                </div>
                <div className="summary-row">
                  <span>Szabad hely</span>
                  <strong>{remainingPlaces} fő</strong>
                </div>
                <div className="summary-row">
                  <span>Fizetési mód</span>
                  <strong>{paymentMeta.title}</strong>
                </div>
              </div>

              <div className="summary-total">
                <span>Becsült végösszeg</span>
                <strong>
                  {totalEstimatedPrice !== null
                    ? formatPrice(totalEstimatedPrice)
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="summary-card glass-panel">
              <div className="summary-kicker">Mi történik ezután?</div>
              <ul className="clean-list">
                <li>A foglalás bekerül a rendszerbe.</li>
                <li>A választott fizetési mód is rögzül.</li>
                <li>Megy visszaigazolás a megadott email címre.</li>
                <li>A szervezési információkat később szintén megkapod.</li>
              </ul>
            </div>

            {user ? (
              <div className="summary-card glass-panel">
                <div className="summary-kicker">Mentett állapot</div>
                <p className="side-text">
                  A megadott foglalási adatok automatikusan mentődnek ennél a
                  profilnál ezen az eszközön.
                </p>
              </div>
            ) : null}

            {user ? (
              <div className="summary-card glass-panel">
                <div className="summary-kicker">Mentett vendégprofilok</div>

                {!savedGuestProfiles.length ? (
                  <p className="side-text">
                    Még nincs mentett vendégprofilod. Ha gyakran ugyanazokkal
                    jössz, ez később sok időt spórol.
                  </p>
                ) : (
                  <div className="saved-profiles">
                    {savedGuestProfiles.map((profile) => (
                      <div key={profile.id} className="saved-profile-card">
                        <div className="saved-profile-name">
                          {profile.label || profile.name}
                        </div>

                        {profile.email ? (
                          <div className="saved-profile-meta">
                            {profile.email}
                          </div>
                        ) : null}

                        {profile.phone ? (
                          <div className="saved-profile-meta">
                            {profile.phone}
                          </div>
                        ) : null}

                        <button
                          type="button"
                          className="btn-ghost small danger"
                          onClick={() => deleteGuestProfile(profile.id)}
                        >
                          Törlés
                        </button>
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
  );
}