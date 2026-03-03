import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";

// Pages
import Home from "./pages/Home";
import Turak from "./pages/Turak";
import Foglalas from "./pages/Foglalas";
import Berles from "./pages/Berles";

// Legal
import Aszf from "./pages/Aszf";
import Adatvedelem from "./pages/Adatvedelem";
import Impresszum from "./pages/Impresszum";

// FONTOS: nálad itt van
import AuthModal from "./components/AuthModal";

const LS_TOKEN = "auth_token";
const LS_USER = "auth_user";

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

// Route védelem külön file nélkül
function RequireAuth({ authed, onNeedAuth, children }) {
  const loc = useLocation();

  if (!authed) {
    onNeedAuth?.(loc.pathname);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [afterLoginPath, setAfterLoginPath] = useState("");

  const [token, setToken] = useState(
    () => localStorage.getItem(LS_TOKEN) || ""
  );
  const [user, setUser] = useState(
    () => safeParse(localStorage.getItem(LS_USER)) || null
  );

  const authed = !!token && !!user;

  // Token mentése
  useEffect(() => {
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);
  }, [token]);

  // User mentése
  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  const openAuth = (redirectTo = "") => {
    setAfterLoginPath(redirectTo);
    setAuthOpen(true);
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  // DEMO login (backend nélkül)
  const handleLogin = async ({ email, password }) => {
    if (!password) throw new Error("Add meg a jelszót.");

    const tok = "demo_" + Math.random().toString(16).slice(2);

    setToken(tok);
    setUser({
      email,
      name: email.split("@")[0],
      role: "user",
    });

    return true;
  };

  // DEMO register
  const handleRegister = async (reg) => {
    const tok = "demo_" + Math.random().toString(16).slice(2);

    setToken(tok);
    setUser({
      email: reg.email,
      name: reg.firstName + " " + reg.lastName,
      role: "user",
    });

    return true;
  };

  return (
    <BrowserRouter>
      <Navbar
        onOpenAuth={() => openAuth("")}
        authed={authed}
        user={user}
        onLogout={logout}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        afterLoginPath={afterLoginPath}
        onDone={() => setAuthOpen(false)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/turak" element={<Turak />} />
        <Route path="/berles" element={<Berles />} />

        <Route
          path="/foglalas/:tourId"
          element={
            <RequireAuth
              authed={authed}
              onNeedAuth={(path) => openAuth(path)}
            >
              <Foglalas />
            </RequireAuth>
          }
        />

        <Route path="/aszf" element={<Aszf />} />
        <Route path="/adatvedelem" element={<Adatvedelem />} />
        <Route path="/impresszum" element={<Impresszum />} />
      </Routes>
    </BrowserRouter>
  );
}