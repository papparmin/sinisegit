import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../components/AuthContext.jsx";
import "./Admin.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export default function Admin() {
  const { user, token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    normalUserCount: 0,
    avatarCount: 0,
  });

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchDashboard = async (withRefreshState = false) => {
    if (!token) return;

    if (withRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage({ text: "", type: "" });

    try {
      const res = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data.stats || {});
      setUsers(res.data.users || []);
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
  };

  useEffect(() => {
    fetchDashboard(false);
  }, [token]);

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
          String(u.id).includes(q)
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data.user;

      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );

      setStats((prev) => {
        const nextUsers = users.map((u) =>
          u.id === updated.id ? { ...u, ...updated } : u
        );

        return {
          totalUsers: nextUsers.length,
          adminCount: nextUsers.filter((u) => u.szerepkor === "admin").length,
          normalUserCount: nextUsers.filter((u) => u.szerepkor !== "admin").length,
          avatarCount: nextUsers.filter((u) => !!u.profilkep).length,
        };
      });

      setMessage({
        text: res.data.message || "Szerepkör frissítve.",
        type: "success",
      });
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

  const getAvatar = (profilkep) => {
    if (!profilkep) return "";
    if (profilkep.startsWith("http")) return profilkep;
    return `${API_BASE}${profilkep}`;
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
                Itt már tényleg hasznos dolgokat látsz: user statok, keresés,
                szűrés és szerepkör kezelés.
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
        </section>

        <section className="admin-toolbar">
          <div className="admin-search-wrap">
            <input
              type="text"
              placeholder="Keresés név, email vagy ID alapján..."
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
                        disabled={
                          updatingUserId === u.id ||
                          !isAdmin ||
                          isSelf
                        }
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
      </div>
    </main>
  );
}