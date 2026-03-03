import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

import logoImg from "../../assets/logonk.png";
import AuthModal from "../AuthModal";

// ... (a korábban küldött teljes Navbar.jsx, ami jó)
const Icon = ({ type }) => {
  switch (type) {
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10C22 6.477 17.523 2 12 2zm4.58 14.54a.86.86 0 0 1-1.18.28c-3.24-1.98-7.32-2.43-12.12-1.34a.86.86 0 0 1-.38-1.68c5.24-1.2 9.75-.68 13.37 1.53.4.24.53.78.31 1.21zM17.8 13a1.02 1.02 0 0 1-1.4.33c-3.7-2.27-9.35-2.93-13.74-1.6a1.02 1.02 0 1 1-.6-1.95c4.98-1.52 11.17-.78 15.42 1.84.48.29.63.93.32 1.38zm.1-3.72c-4.43-2.63-11.74-2.88-15.97-1.6a1.2 1.2 0 1 1-.7-2.3c4.86-1.48 12.94-1.2 18.06 1.84a1.2 1.2 0 0 1-1.39 2.06z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.4-2.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.8v8h2.7z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3v10.2a3.2 3.2 0 1 1-2.2-3.05V7.1a6.5 6.5 0 1 0 4.2 6.1V8.2c1.1 1 2.6 1.6 4.2 1.6V6.6c-2 0-3.6-1.6-3.6-3.6H14z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Link to="/" className="brand" aria-label="EXPLORE">
              <img className="brand-logo" src={logoImg} alt="EXPLORE logo" />
            </Link>
          </div>

          <nav className="topbar-center" aria-label="Fő navigáció">
            <NavLink to="/turak" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
              Túrák
            </NavLink>
            <NavLink to="/berles" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
              Bérlés
            </NavLink>
            <a className="navlink" href="/#gallery">
              Galéria
            </a>

            <span className="nav-sep" aria-hidden="true" />

            <div className="nav-social" aria-label="Social media">
              <a
                className="sico spotify"
                href="https://open.spotify.com/playlist/19xgY84p5kystYNTi75v5v?si=a6ab22d572c041e4"
                target="_blank"
                rel="noreferrer"
                aria-label="Spotify"
                title="Spotify"
              >
                <Icon type="spotify" />
              </a>
              <a className="sico instagram" href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
                <Icon type="instagram" />
              </a>
              <a className="sico facebook" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
                <Icon type="facebook" />
              </a>
              <a className="sico tiktok" href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok">
                <Icon type="tiktok" />
              </a>
            </div>
          </nav>

          <div className="topbar-right">
            <button className="apple-auth-btn" type="button" onClick={() => setAuthOpen(true)}>
              Belépés
            </button>

            <Link to="/turak" className="book-btn">
              Foglalás
            </Link>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}