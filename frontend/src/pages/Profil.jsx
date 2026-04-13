import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext.jsx";
import "./Profil.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export default function Profil() {
  const { user, token, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (token === null) {
      navigate("/");
    }
  }, [token, navigate]);

  const currentAvatar = useMemo(() => {
    if (!profile?.profilkep) return "";
    if (profile.profilkep.startsWith("http")) return profile.profilkep;
    return `${API_BASE}${profile.profilkep}`;
  }, [profile]);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mounted) return;

        setProfile(res.data || null);
        login(token, res.data || {});
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);
        if (!mounted) return;

        setMessage({
          text:
            err.response?.data?.error ||
            "Nem sikerült betölteni a profiladatokat.",
          type: "error",
        });
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(currentAvatar || "");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, currentAvatar]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage({ text: "", type: "" });

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Csak képfájlt válassz.", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "A kép maximum 5 MB lehet.", type: "error" });
      return;
    }

    setAvatarFile(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setMessage({ text: "Előbb válassz ki egy képet.", type: "error" });
      return;
    }

    if (!token) {
      setMessage({ text: "Lejárt a bejelentkezés. Lépj be újra.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);

      const res = await axios.post(`${API_BASE}/api/profile/avatar`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const refreshedProfileRes = await axios.get(`${API_BASE}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const refreshedProfile = refreshedProfileRes.data || {
        ...(profile || {}),
        profilkep: res.data?.profilkep || null,
      };

      setProfile(refreshedProfile);
      login(token, refreshedProfile);
      setAvatarFile(null);

      setMessage({
        text: "Profilkép sikeresen frissítve.",
        type: "success",
      });
    } catch (err) {
      console.error("AVATAR UPLOAD ERROR:", err);

      setMessage({
        text:
          err.response?.data?.error ||
          err.message ||
          "Nem sikerült feltölteni a képet.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="profil-page">
        <div className="profil-shell">
          <section className="profil-card">
            <div className="profil-header">
              <div>
                <p className="profil-eyebrow">Fiók</p>
                <h1>Profilkép</h1>
                <p className="profil-sub">Profil betöltése...</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="profil-page">
      <div className="profil-shell">
        <section className="profil-card">
          <div className="profil-header">
            <div>
              <p className="profil-eyebrow">Fiók</p>
              <h1>Profilkép</h1>
              <p className="profil-sub">
                Itt csak a profilképedet tudod cserélni.
              </p>
            </div>
          </div>

          {message.text ? (
            <div className={`profil-alert ${message.type}`}>{message.text}</div>
          ) : null}

          <div className="profil-avatar-wrap">
            <div className="profil-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profilkép" />
              ) : (
                <span>{(profile?.nev || user?.nev || "+").trim().charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="profil-actions">
              <label className="profil-file-btn">
                Kép kiválasztása
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </label>

              <button
                type="button"
                className="profil-save-btn"
                onClick={uploadAvatar}
                disabled={!avatarFile || loading}
              >
                {loading ? "Mentés..." : "Profilkép mentése"}
              </button>
            </div>
          </div>
        </section>

        <section className="profil-card secondary">
          <div className="profil-header">
            <div>
              <p className="profil-eyebrow">Biztonság</p>
              <h2>Jelszó</h2>
              <p className="profil-sub">
                Az új jelszót külön oldalon tudod beállítani.
              </p>
            </div>
          </div>

          <Link to="/jelszocsere" className="profil-password-link">
            Jelszó módosítása
          </Link>
        </section>
      </div>
    </main>
  );
}