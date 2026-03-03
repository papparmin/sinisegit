// frontend/src/App.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { AuthContext } from "./components/AuthContext.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Turak from "./pages/Turak.jsx";
import Berles from "./pages/Berles.jsx";
import Foglalas from "./pages/Foglalas.jsx";

// Legal
import Aszf from "./pages/Aszf.jsx";
import Adatvedelem from "./pages/Adatvedelem.jsx";
import Impresszum from "./pages/Impresszum.jsx";

// ------------------------------
// Route Guard
// ------------------------------
function RequireAuth({ authed, onNeedAuth, children }) {
  const location = useLocation();

  if (!authed) {
    // Nyissuk meg a belépést és mentsük el, hova akart menni
    onNeedAuth?.(location.pathname);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { user, token } = useContext(AuthContext);
  const authed = useMemo(() => !!token && !!user, [token, user]);

  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(false);
  const [afterLoginPath, setAfterLoginPath] = useState("");

  const openAuth = (redirectTo = "") => {
    setAfterLoginPath(redirectTo);
    setAuthOpen(true);
  };

  // Ha sikerült belépni, zárjuk a modalt és dobjuk oda, ahova akart menni
  useEffect(() => {
    if (!authed) return;
    if (!authOpen && !afterLoginPath) return;

    // ha épp nyitva volt, csukjuk be
    if (authOpen) setAuthOpen(false);

    // redirect ha volt cél
    if (afterLoginPath) {
      const target = afterLoginPath;
      setAfterLoginPath("");
      navigate(target, { replace: true });
    }
  }, [authed, authOpen, afterLoginPath, navigate]);

  const handleNeedAuth = (path) => {
    // Ne nyitogassa újra végtelenül ugyanarra
    if (!authOpen) openAuth(path);
  };

  return (
    <>
      <Navbar onOpenAuth={() => openAuth("")} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/turak" element={<Turak />} />
        <Route path="/berles" element={<Berles />} />

        {/* Protected */}
        <Route
          path="/foglalas"
          element={
            <RequireAuth authed={authed} onNeedAuth={handleNeedAuth}>
              <Foglalas />
            </RequireAuth>
          }
        />

        {/* Legal */}
        <Route path="/aszf" element={<Aszf />} />
        <Route path="/adatvedelem" element={<Adatvedelem />} />
        <Route path="/impresszum" element={<Impresszum />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}