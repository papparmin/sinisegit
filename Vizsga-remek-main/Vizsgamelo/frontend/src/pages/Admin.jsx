import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext.jsx";
import "./Admin.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const EMPTY_TOUR_FORM = {
  title: "",
  shortDesc: "",
  desc: "",
  category: "",
  level: "",
  dur: "",
  badge: "",
  price: "",
  img: "",
};

export default function Admin() {
  const { user, token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    normalUserCount: 0,
    avatarCount: 0,
    totalTours: 0,
    activeTours: 0,
    inactiveTours: 0,
    totalRentalOrders: 0,
    pendingRentalOrders: 0,
    totalRentalRevenue: 0,
    averageAge: 0,
    youngestAge: 0,
    oldestAge: 0,
    knownCityCount: 0,
  });

  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [togglingTourId, setTogglingTourId] = useState(null);
  const [submittingTour, setSubmittingTour] = useState(false);
  const [tourForm, setTourForm] = useState(EMPTY_TOUR_FORM);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingReplyId, setSavingReplyId] = useState(null);
  const [updatingMessageStatusId, setUpdatingMessageStatusId] = useState(null);

  const fetchDashboard = useCallback(
    async (withRefreshState = false) => {
      if (!token) return;

      if (withRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage({ text: "", type: "" });

      try {
        const [dashboardRes, contactRes] = await Promise.all([
          axios.get(`${API_BASE}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/admin/contact-messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(dashboardRes.data.stats || {});
        setUsers(dashboardRes.data.users || []);
        setTours(dashboardRes.data.tours || []);
        setCityStats(dashboardRes.data.cityStats || []);
        setAgeGroups(dashboardRes.data.ageGroups || []);
        setContactMessages(contactRes.data || []);

        setReplyDrafts((prev) => {
          const next = { ...prev };
          for (const row of contactRes.data || []) {
            if (typeof next[row.id] === "undefined") {
              next[row.id] = row.admin_valasz || "";
            }
          }
          return next;
        });
      } catch (err) {
        console.error(err);
        setMessage({
          text: err.response?.data?.error || "Nem sikerült betölteni az admin adatokat.",
          type: "error",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  const filteredUsers = useMemo(() => {
    let list = [...users];

    if (roleFilter === "admin") {
      list = list.filter((u) => u.szerepkor === "admin");
    }

    if (roleFilter === "user") {
      list = list.filter((u) => u.szerepkor !== "admin");
    }

    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((u) => {
        return (
          (u.nev || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.varos || "").toLowerCase().includes(q) ||
          String(u.id).includes(q) ||
          String(u.eletkor || "").includes(q)
        );
      });
    }

    return list;
  }, [users, search, roleFilter]);

  const handleRoleChange = async (targetUser, nextRole) => {
    if (!targetUser?.id) return;

    setUpdatingUserId(targetUser.id);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/users/${targetUser.id}/role`,
        { szerepkor: nextRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: res.data.message || "Szerepkör frissítve.",
        type: "success",
      });

      await fetchDashboard(true);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült módosítani a szerepkört.",
        type: "error",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleTourChange = (e) => {
    const { name, value } = e.target;
    setTourForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();

    setSubmittingTour(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/tours`,
        {
          ...tourForm,
          price: Number(tourForm.price || 0),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        text: res.data.message || "Túra sikeresen létrehozva.",
        type: "success",
      });

      setTourForm(EMPTY_TOUR_FORM);
      await fetchDashboard(true);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült létrehozni a túrát.",
        type: "error",
      });
    } finally {
      setSubmittingTour(false);
    }
  };

  const handleToggleTour = async (tour) => {
    if (!tour?.id) return;

    setTogglingTourId(tour.id);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/tours/${tour.id}/status`,
        { aktiv: !tour.active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        text: res.data.message || "Túra frissítve.",
        type: "success",
      });

      await fetchDashboard(true);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült frissíteni a túrát.",
        type: "error",
      });
    } finally {
      setTogglingTourId(null);
    }
  };

  const handleReplyDraftChange = (id, value) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveReply = async (contactId) => {
    const adminValasz = String(replyDrafts[contactId] || "").trim();

    if (!adminValasz) {
      setMessage({
        text: "Az admin válasz nem lehet üres.",
        type: "error",
      });
      return;
    }

    setSavingReplyId(contactId);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/contact-messages/${contactId}/reply`,
        { adminValasz },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: res.data.message || "Válasz elmentve és elküldve.",
        type: "success",
      });

      await fetchDashboard(true);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült elmenteni vagy elküldeni a választ.",
        type: "error",
      });
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleContactStatusChange = async (contactId, status) => {
    setUpdatingMessageStatusId(contactId);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.put(
        `${API_BASE}/api/admin/contact-messages/${contactId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({
        text: res.data.message || "Státusz frissítve.",
        type: "success",
      });

      await fetchDashboard(true);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült frissíteni a státuszt.",
        type: "error",
      });
    } finally {
      setUpdatingMessageStatusId(null);
    }
  };

  const getAvatar = (profilkep) => {
    if (!profilkep) return "";
    if (profilkep.startsWith("http")) return profilkep;
    return `${API_BASE}${profilkep}`;
  };

  const getTourImage = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return img;
  };

  const fmtFt = (n) => `${Number(n || 0).toLocaleString("hu-HU")} Ft`;

  const formatBirthDate = (value) => {
    if (!value) return "Nincs megadva";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Nincs megadva";
    return d.toLocaleDateString("hu-HU");
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("hu-HU");
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <section className="admin-hero">
          <div className="admin-hero-top">
            <div>
              <p className="admin-eyebrow">Admin</p>
              <h1>Rendszerkezelő felület</h1>
              <p className="admin-sub">
                User kezelés, statisztikák, túra létrehozás és láthatóság kezelés
                egy helyen.
              </p>
            </div>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
            >
              {refreshing ? "Frissítés..." : "Frissítés"}
            </button>
          </div>

          <div className="admin-current-user">
            <div className="admin-current-label">Belépett admin</div>
            <div className="admin-current-name">{user?.nev || "Admin"}</div>
            <div className="admin-current-email">{user?.email || ""}</div>
          </div>
        </section>

        {message.text ? (
          <div className={`admin-alert ${message.type}`}>{message.text}</div>
        ) : null}

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Összes user</div>
            <div className="admin-stat-value">{stats.totalUsers || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Adminok</div>
            <div className="admin-stat-value">{stats.adminCount || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Sima userek</div>
            <div className="admin-stat-value">{stats.normalUserCount || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Profilképes userek</div>
            <div className="admin-stat-value">{stats.avatarCount || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Ismert várossal</div>
            <div className="admin-stat-value">{stats.knownCityCount || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Átlagéletkor</div>
            <div className="admin-stat-value">
              {stats.averageAge ? `${stats.averageAge} év` : "-"}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Legfiatalabb</div>
            <div className="admin-stat-value">
              {stats.youngestAge ? `${stats.youngestAge} év` : "-"}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Legidősebb</div>
            <div className="admin-stat-value">
              {stats.oldestAge ? `${stats.oldestAge} év` : "-"}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Összes túra</div>
            <div className="admin-stat-value">{stats.totalTours || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Aktív túrák</div>
            <div className="admin-stat-value">{stats.activeTours || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Rejtett túrák</div>
            <div className="admin-stat-value">{stats.inactiveTours || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Bérlés rendelés</div>
            <div className="admin-stat-value">{stats.totalRentalOrders || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Új rendelések</div>
            <div className="admin-stat-value">{stats.pendingRentalOrders || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Bérlés bevétel</div>
            <div className="admin-stat-value">{fmtFt(stats.totalRentalRevenue || 0)}</div>
          </div>
        </section>

        <section className="admin-users-section" style={{ marginBottom: 28 }}>
          <div className="admin-section-head">
            <h2>Kapcsolati üzenetek</h2>
            <span>{contactMessages.length} db</span>
          </div>

          {loading ? (
            <div className="admin-empty">Betöltés...</div>
          ) : contactMessages.length === 0 ? (
            <div className="admin-empty">Még nincs egyetlen üzenet sem.</div>
          ) : (
            <div className="admin-users-grid">
              {contactMessages.map((row) => (
                <article className="admin-user-card" key={row.id}>
                  <div className="admin-user-main" style={{ paddingLeft: 0 }}>
                    <div className="admin-user-name-row">
                      <h3>{row.nev || "Ismeretlen"}</h3>
                      <span
                        className={`role-badge ${
                          row.status === "megvalaszolva" ? "admin" : "user"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>

                    <p>{row.email}</p>
                    <small>ID: {row.id}</small>
                    <br />
                    <small>Tárgy: {row.targy || "Nincs megadva"}</small>
                    <br />
                    <small>Beérkezett: {formatDateTime(row.letrehozva)}</small>
                    <br />
                    <small>Válaszolt admin: {row.admin_nev || "Még nincs"}</small>
                    <br />
                    <small>Válasz ideje: {formatDateTime(row.valaszolva_ekkor)}</small>

                    <div
                      style={{
                        marginTop: 12,
                        padding: "12px 14px",
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.88)",
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {row.uzenet}
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: 8,
                          fontSize: 13,
                          opacity: 0.75,
                        }}
                      >
                        Admin válasz
                      </label>

                      <textarea
                        rows={5}
                        value={replyDrafts[row.id] || ""}
                        onChange={(e) => handleReplyDraftChange(row.id, e.target.value)}
                        placeholder="Ide írhatod az admin választ..."
                        style={{
                          width: "100%",
                          resize: "vertical",
                          borderRadius: 14,
                          padding: 12,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#fff",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="admin-user-actions"
                    style={{ marginTop: 16, display: "grid", gap: 10 }}
                  >
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="make-admin"
                        onClick={() => handleContactStatusChange(row.id, "folyamatban")}
                        disabled={updatingMessageStatusId === row.id}
                      >
                        Folyamatban
                      </button>

                      <button
                        type="button"
                        className="make-user"
                        onClick={() => handleContactStatusChange(row.id, "lezarva")}
                        disabled={updatingMessageStatusId === row.id}
                      >
                        Lezárás
                      </button>
                    </div>

                    <button
                      type="button"
                      className="admin-refresh-btn"
                      onClick={() => handleSaveReply(row.id)}
                      disabled={savingReplyId === row.id}
                    >
                      {savingReplyId === row.id ? "Küldés..." : "Válasz mentése és küldése"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-users-section" style={{ marginBottom: 28 }}>
          <div className="admin-section-head">
            <h2>Felhasználók város szerint</h2>
            <span>{cityStats.length} város</span>
          </div>

          {loading ? (
            <div className="admin-empty">Betöltés...</div>
          ) : cityStats.length === 0 ? (
            <div className="admin-empty">Még nincs város adat.</div>
          ) : (
            <div className="admin-users-grid">
              {cityStats.map((city) => (
                <article className="admin-user-card" key={city.city}>
                  <div className="admin-user-main" style={{ paddingLeft: 0 }}>
                    <div className="admin-user-name-row">
                      <h3>{city.city}</h3>
                      <span className="role-badge user">{city.count} fő</span>
                    </div>
                    <p>Regisztrált felhasználók ebből a városból.</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-users-section" style={{ marginBottom: 28 }}>
          <div className="admin-section-head">
            <h2>Korosztály szerinti bontás</h2>
            <span>{ageGroups.length} csoport</span>
          </div>

          {loading ? (
            <div className="admin-empty">Betöltés...</div>
          ) : ageGroups.length === 0 ? (
            <div className="admin-empty">Még nincs születési dátum adat.</div>
          ) : (
            <div className="admin-users-grid">
              {ageGroups.map((group) => (
                <article className="admin-user-card" key={group.label}>
                  <div className="admin-user-main" style={{ paddingLeft: 0 }}>
                    <div className="admin-user-name-row">
                      <h3>{group.label}</h3>
                      <span className="role-badge admin">{group.count} fő</span>
                    </div>
                    <p>Felhasználók ebben a korcsoportban.</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-users-section" style={{ marginBottom: 28 }}>
          <div className="admin-section-head">
            <h2>Új túra létrehozása</h2>
            <span>Adminból azonnal publikálható</span>
          </div>

          <form
            onSubmit={handleCreateTour}
            style={{ display: "grid", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <input
                type="text"
                name="title"
                placeholder="Túra címe"
                value={tourForm.title}
                onChange={handleTourChange}
              />
              <input
                type="text"
                name="badge"
                placeholder="Badge pl. TÉL / PROFI"
                value={tourForm.badge}
                onChange={handleTourChange}
              />
              <input
                type="text"
                name="category"
                placeholder="Kategória"
                value={tourForm.category}
                onChange={handleTourChange}
              />
              <input
                type="text"
                name="level"
                placeholder="Nehézség pl. Kezdő"
                value={tourForm.level}
                onChange={handleTourChange}
              />
              <input
                type="text"
                name="dur"
                placeholder="Időtartam pl. 2 Nap / 1 Éj"
                value={tourForm.dur}
                onChange={handleTourChange}
              />
              <input
                type="number"
                name="price"
                placeholder="Ár"
                value={tourForm.price}
                onChange={handleTourChange}
                min="0"
              />
            </div>

            <input
              type="text"
              name="img"
              placeholder="Kép URL (egyelőre URL)"
              value={tourForm.img}
              onChange={handleTourChange}
            />
            <input
              type="text"
              name="shortDesc"
              placeholder="Rövid leírás"
              value={tourForm.shortDesc}
              onChange={handleTourChange}
            />
            <textarea
              name="desc"
              placeholder="Teljes leírás"
              value={tourForm.desc}
              onChange={handleTourChange}
              rows={5}
            />

            <div>
              <button
                type="submit"
                className="admin-refresh-btn"
                disabled={submittingTour}
              >
                {submittingTour ? "Mentés..." : "Túra létrehozása"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-toolbar">
          <div className="admin-search-wrap">
            <input
              type="text"
              placeholder="Keresés név, email, város, életkor vagy ID alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-filter-wrap">
            <button
              type="button"
              className={roleFilter === "all" ? "active" : ""}
              onClick={() => setRoleFilter("all")}
            >
              Összes
            </button>
            <button
              type="button"
              className={roleFilter === "admin" ? "active" : ""}
              onClick={() => setRoleFilter("admin")}
            >
              Adminok
            </button>
            <button
              type="button"
              className={roleFilter === "user" ? "active" : ""}
              onClick={() => setRoleFilter("user")}
            >
              Userek
            </button>
          </div>
        </section>

        <section className="admin-users-section">
          <div className="admin-section-head">
            <h2>Felhasználók</h2>
            <span>{filteredUsers.length} találat</span>
          </div>

          {loading ? (
            <div className="admin-empty">Betöltés...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty">Nincs találat.</div>
          ) : (
            <div className="admin-users-grid">
              {filteredUsers.map((u) => {
                const avatarSrc = getAvatar(u.profilkep);
                const isSelf = user?.id === u.id;
                const isAdmin = u.szerepkor === "admin";

                return (
                  <article className="admin-user-card" key={u.id}>
                    <div className="admin-user-top">
                      <div className="admin-user-avatar">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={u.nev || "User"} />
                        ) : (
                          <span>
                            {(u.nev || u.email || "?").trim().charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="admin-user-main">
                        <div className="admin-user-name-row">
                          <h3>{u.nev || "Névtelen user"}</h3>
                          <span className={`role-badge ${isAdmin ? "admin" : "user"}`}>
                            {isAdmin ? "admin" : "user"}
                          </span>
                        </div>

                        <p>{u.email}</p>
                        <small>ID: {u.id}</small>
                        <br />
                        <small>Város: {u.varos || "Nincs megadva"}</small>
                        <br />
                        <small>
                          Életkor: {u.eletkor ? `${u.eletkor} év` : "Nincs megadva"}
                        </small>
                        <br />
                        <small>Születési dátum: {formatBirthDate(u.szuletesi_datum)}</small>
                      </div>
                    </div>

                    <div className="admin-user-actions">
                      <button
                        type="button"
                        className="make-admin"
                        onClick={() => handleRoleChange(u, "admin")}
                        disabled={updatingUserId === u.id || isAdmin}
                      >
                        {updatingUserId === u.id ? "Mentés..." : "Adminná tesz"}
                      </button>

                      <button
                        type="button"
                        className="make-user"
                        onClick={() => handleRoleChange(u, "user")}
                        disabled={updatingUserId === u.id || !isAdmin || isSelf}
                        title={isSelf ? "Saját magadat nem rakhatod userre." : ""}
                      >
                        {updatingUserId === u.id ? "Mentés..." : "Userré tesz"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-users-section" style={{ marginTop: 28 }}>
          <div className="admin-section-head">
            <h2>Túrák kezelése</h2>
            <span>{tours.length} db</span>
          </div>

          {loading ? (
            <div className="admin-empty">Betöltés...</div>
          ) : tours.length === 0 ? (
            <div className="admin-empty">Még nincs egyetlen túra sem.</div>
          ) : (
            <div className="admin-users-grid">
              {tours.map((tour) => {
                const image = getTourImage(tour.img);

                return (
                  <article className="admin-user-card" key={tour.id}>
                    {image ? (
                      <div
                        style={{
                          width: "100%",
                          height: 180,
                          borderRadius: 16,
                          overflow: "hidden",
                          marginBottom: 14,
                        }}
                      >
                        <img
                          src={image}
                          alt={tour.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                    ) : null}

                    <div className="admin-user-main" style={{ paddingLeft: 0 }}>
                      <div className="admin-user-name-row">
                        <h3>{tour.title}</h3>
                        <span className={`role-badge ${tour.active ? "admin" : "user"}`}>
                          {tour.active ? "látható" : "rejtett"}
                        </span>
                      </div>

                      <p style={{ marginBottom: 8 }}>{tour.shortDesc || tour.desc}</p>

                      <small>
                        {tour.category} • {tour.level} • {tour.dur}
                      </small>
                      <br />
                      <small>{fmtFt(tour.price)}</small>
                      <br />
                      <small>Slug: {tour.slug}</small>
                    </div>

                    <div className="admin-user-actions" style={{ marginTop: 16 }}>
                      <button
                        type="button"
                        className="make-admin"
                        onClick={() => handleToggleTour(tour)}
                        disabled={togglingTourId === tour.id}
                      >
                        {togglingTourId === tour.id
                          ? "Mentés..."
                          : tour.active
                          ? "Elrejtés"
                          : "Publikálás"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}