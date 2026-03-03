import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthModal.css";

const BG_URL = "https://images.pexels.com/photos/23692399/pexels-photo-23692399/free-photo-of-scenic-view-of-a-mountain-range.jpeg";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const digits = (s) => String(s || "").replace(/[^\d+]/g, "");

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export default function AuthModal({ open = true, onClose, onLogin, onRegister }) {
  const nav = useNavigate();
  const firstRef = useRef(null);
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    firstName: "", lastName: "", email: "", phone: "", birthDate: "", gender: "",
    country: "Magyarország", city: "", zip: "", address: "", address2: "",
    billingName: "", password: "", password2: "", terms: false, privacy: false
  });

  const regReady = useMemo(() => {
    return reg.firstName.trim().length >= 2 && reg.lastName.trim().length >= 2 && 
           emailOk(reg.email) && digits(reg.phone).length >= 9 && reg.birthDate && 
           reg.gender && reg.city.trim().length >= 2 && reg.zip.trim().length >= 3 && 
           reg.address.trim().length >= 5 && reg.password.length >= 8 && 
           reg.password === reg.password2 && reg.terms && reg.privacy;
  }, [reg]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose ? onClose() : nav("/"); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => firstRef.current?.focus(), 50);
    return () => { document.body.style.overflow = "auto"; window.removeEventListener("keydown", onKey); };
  }, [open, onClose, nav]);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!emailOk(login.email)) return setError("Érvénytelen email cím.");
    try {
      setBusy(true);
      if (onLogin) await onLogin(login);
      if (onClose) onClose();
      nav("/");
    } catch (err) { setError(err.message || "Hiba a belépésnél."); }
    finally { setBusy(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!regReady) return setError("Kérjük, töltsd ki az összes kötelező mezőt!");
    try {
      setBusy(true);
      if (onRegister) await onRegister(reg);
      if (onClose) onClose();
      nav("/");
    } catch (err) { setError(err.message || "Hiba a regisztrációnál."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page" role="dialog" aria-modal="true">
      <div className="auth-page-bg" style={{ "--auth-bg": `url("${BG_URL}")` }} />
      <div className="auth-page-vignette" />

      <div className="auth-shell">
        <section className="auth-hero">
          <div>
            <img className="auth-brand-logo" src="/logoj.jpg" alt="Logo" />
            <div className="auth-hero-title">Üdvözlünk!</div>
            <div className="auth-hero-sub">Lépj be a fiókodba a foglaláshoz, vagy regisztrálj az új élményekért.</div>
          </div>
          <div className="auth-hero-badges">
            <span className="auth-badge">Gyors és biztonságos checkout</span>
            <span className="auth-badge">Teljes GDPR megfelelés</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Belépés</button>
              <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Regisztráció</button>
            </div>
            <button className="auth-x" onClick={onClose || (() => nav("/"))}><CloseIcon /></button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {mode === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-scrollable-content">
                <label className="auth-label">E-mail <input ref={firstRef} className="auth-input" type="email" placeholder="pelda@email.com" value={login.email} onChange={e => setLogin({...login, email: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Jelszó 
                  <div className="auth-pwrow">
                    <input className="auth-input" type={showPw ? "text" : "password"} placeholder="••••••••" value={login.password} onChange={e => setLogin({...login, password: e.target.value})} disabled={busy} />
                    <button type="button" className="auth-eye" onClick={() => setShowPw(!showPw)}><EyeIcon open={showPw} /></button>
                  </div>
                </label>
              </div>
              <div className="auth-actions-sticky">
                <button className="auth-primary" type="submit" disabled={busy}>Bejelentkezés</button>
                <div className="auth-links">
                  <Link to="/aszf" className="auth-link">ÁSZF</Link>
                  <Link to="/adatvedelem" className="auth-link">Adatvédelem</Link>
                </div>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-scrollable-content">
                <div className="auth-section">Személyes adatok</div>
                <label className="auth-label">Keresztnév * <input className="auth-input" value={reg.firstName} onChange={e => setReg({...reg, firstName: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Vezetéknév * <input className="auth-input" value={reg.lastName} onChange={e => setReg({...reg, lastName: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Email * <input className="auth-input" type="email" value={reg.email} onChange={e => setReg({...reg, email: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Telefon * <input className="auth-input" value={reg.phone} onChange={e => setReg({...reg, phone: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Születési dátum * <input className="auth-input" type="date" value={reg.birthDate} onChange={e => setReg({...reg, birthDate: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Nem * <select className="auth-input" value={reg.gender} onChange={e => setReg({...reg, gender: e.target.value})} disabled={busy}><option value="">Válassz...</option><option value="male">Férfi</option><option value="female">Nő</option></select></label>
                
                <div className="auth-section">Cím adatok</div>
                <label className="auth-label">Város * <input className="auth-input" value={reg.city} onChange={e => setReg({...reg, city: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Irányítószám * <input className="auth-input" value={reg.zip} onChange={e => setReg({...reg, zip: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Utca, házszám * <input className="auth-input" value={reg.address} onChange={e => setReg({...reg, address: e.target.value})} disabled={busy} /></label>
                
                <div className="auth-section">Biztonság</div>
                <label className="auth-label">Jelszó * <input className="auth-input" type="password" value={reg.password} onChange={e => setReg({...reg, password: e.target.value})} disabled={busy} /></label>
                <label className="auth-label">Jelszó újra * <input className="auth-input" type="password" value={reg.password2} onChange={e => setReg({...reg, password2: e.target.value})} disabled={busy} /></label>
                
                <div className="auth-legal">
                  <label className="auth-check"><input type="checkbox" checked={reg.terms} onChange={e => setReg({...reg, terms: e.target.checked})} /> Elfogadom az ÁSZF-et *</label>
                  <label className="auth-check"><input type="checkbox" checked={reg.privacy} onChange={e => setReg({...reg, privacy: e.target.checked})} /> Elfogadom az adatkezelést *</label>
                </div>
              </div>
              <div className="auth-actions-sticky">
                <button className="auth-primary" type="submit" disabled={!regReady || busy}>Regisztráció</button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}