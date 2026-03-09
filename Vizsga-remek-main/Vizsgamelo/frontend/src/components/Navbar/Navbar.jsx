import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

import logo from "../../assets/logonk.png";
import { AuthContext } from "../AuthContext.jsx";

export default function Navbar({ onOpenAuth }) {
  const { user, token, logout } = useContext(AuthContext);
  const authed = !!token && !!user;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = useMemo(() => {
    if (!user) return "";
    return (
      user.firstName ||
      user.firstname ||
      user.name ||
      user.username ||
      (user.email ? user.email.split("@")[0] : "User")
    );
  }, [user]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const openAuth = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onOpenAuth?.();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout?.();
  };

  const navClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="Logo" className="brand-logo" />
          <span className="brand-title">Explore</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" className={navClass}>
            Főoldal
          </NavLink>
          <NavLink to="/turak" className={navClass}>
            Túrák
          </NavLink>
          <NavLink to="/berles" className={navClass}>
            Bérlés
          </NavLink>
          <NavLink to="/galeria" className={navClass}>
            Galéria
          </NavLink>
          <NavLink to="/uzemeltetok" className={navClass}>
            Üzemeltetők
          </NavLink>
          <NavLink to="/foglalas" className={navClass}>
            Foglalás
          </NavLink>
        </nav>

        <div className="nav-right">
          {!authed ? (
            <button type="button" className="nav-auth-btn" onClick={openAuth}>
              Belépés
            </button>
          ) : (
            <div className="userwrap" ref={menuRef}>
              <button
                type="button"
                className="userbtn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title={displayName}
              >
                <span className="usericon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="username">{displayName}</span>
                <span className="chev" aria-hidden="true">
                  ▾
                </span>
              </button>

              {menuOpen && (
                <div className="usermenu" role="menu">
                  <div className="usermenu-head">
                    <div className="usermenu-name">{displayName}</div>
                    {user?.email ? <div className="usermenu-sub">{user.email}</div> : null}
                  </div>

                  <div className="usermenu-sep" />

                  <Link
                    to="/profil"
                    className="usermenu-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profil
                  </Link>

                  <button
                    type="button"
                    className="usermenu-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Kijelentkezés
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}