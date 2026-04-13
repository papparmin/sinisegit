import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../components/AuthContext.jsx";
import "./Profil.css";

export default function JelszoCsere() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setMessage({ text: "", type: "" });
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.put("/api/profile/password", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({
        text: res.data.message || "Jelszó sikeresen módosítva.",
        type: "success",
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.error || "Nem sikerült módosítani a jelszót.",
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
              <p className="profil-eyebrow">Biztonság</p>
              <h1>Jelszó módosítása</h1>
              <p className="profil-sub">
                Add meg a jelenlegi jelszavadat, utána az újat kétszer.
              </p>
            </div>
          </div>

          {message.text ? (
            <div className={`profil-alert ${message.type}`}>{message.text}</div>
          ) : null}

          <form className="password-form" onSubmit={handleSubmit}>
            <div className="profil-field">
              <label htmlFor="currentPassword">Jelenlegi jelszó</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Jelenlegi jelszó"
                required
              />
            </div>

            <div className="profil-field">
              <label htmlFor="newPassword">Új jelszó</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Új jelszó"
                required
              />
            </div>

            <div className="profil-field">
              <label htmlFor="confirmPassword">Új jelszó újra</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Új jelszó újra"
                required
              />
            </div>

            <div className="password-actions">
              <button type="submit" className="profil-save-btn" disabled={loading}>
                {loading ? "Mentés..." : "Jelszó mentése"}
              </button>

              <Link to="/profil" className="profil-back-link">
                Vissza a profilhoz
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}