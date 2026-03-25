import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext.jsx";
import "./Profil.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

export default function Profil() {
  const { user, token, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const currentAvatar = useMemo(() => {
    if (!user?.profilkep) return "";
    if (user.profilkep.startsWith("http")) return user.profilkep;
    return `${API_BASE}${user.profilkep}`;
  }, [user]);

  useEffect(() => {
    setAvatarPreview(currentAvatar || "");
  }, [currentAvatar]);

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
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setMessage({ text: "Előbb válassz ki egy képet.", type: "error" });
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

      const updatedUser = {
        ...(user || {}),
        profilkep: res.data.profilkep,
      };

      login(token, updatedUser);
      setAvatarPreview(`${API_BASE}${res.data.profilkep}`);
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
                <span>+</span>
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