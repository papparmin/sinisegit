import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Components
import Navbar from "./components/Navbar/Navbar.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { AuthContext } from "./components/AuthContext.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Turak from "./pages/Turak.jsx";
import Berles from "./pages/Berles.jsx";
import Foglalas from "./pages/Foglalas.jsx";
import Uzemeltetok from "./pages/Uzemeltetok.jsx";
import Galeria from "./pages/Galeria.jsx";
import Profil from "./pages/Profil.jsx";
import JelszoCsere from "./pages/JelszoCsere.jsx";
import HelyszinekTerkep from "./pages/HelyszinekTerkep.jsx";
import Admin from "./pages/Admin.jsx";

// Legal
import Aszf from "./pages/Aszf.jsx";
import Adatvedelem from "./pages/Adatvedelem.jsx";
import Impresszum from "./pages/Impresszum.jsx";

function RequireAuth({ authed, onNeedAuth, children }) {
  const location = useLocation();

  if (!authed) {
    onNeedAuth?.(location.pathname);
    return <Navigate to="/" replace />;
  }

  return children;
}

function RequireAdmin({ authed, user, onNeedAuth, children }) {
  const location = useLocation();

  if (!authed) {
    onNeedAuth?.(location.pathname);
    return <Navigate to="/" replace />;
  }

  if (user?.szerepkor !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) return;

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    const raf1 = requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    const raf2 = requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, hash]);

  return null;
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

  useEffect(() => {
    if (!authed) return;
    if (!authOpen && !afterLoginPath) return;

    if (authOpen) setAuthOpen(false);

    if (afterLoginPath) {
      const target = afterLoginPath;
      setAfterLoginPath("");
      navigate(target, { replace: true });
      return;
    }

    if (user?.szerepkor === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [authed, authOpen, afterLoginPath, navigate, user]);

  const handleNeedAuth = (path) => {
    if (!authOpen) openAuth(path);
  };

  return (
    <>
      <ScrollHandler />

      <Navbar onOpenAuth={() => openAuth("")} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/turak" element={<Turak />} />
        <Route path="/berles" element={<Berles />} />
        <Route path="/uzemeltetok" element={<Uzemeltetok />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/helyszinek-terkep" element={<HelyszinekTerkep />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin authed={authed} user={user} onNeedAuth={handleNeedAuth}>
              <Admin />
            </RequireAdmin>
          }
        />

        <Route
          path="/profil"
          element={
            <RequireAuth authed={authed} onNeedAuth={handleNeedAuth}>
              <Profil />
            </RequireAuth>
          }
        />

        <Route
          path="/jelszocsere"
          element={
            <RequireAuth authed={authed} onNeedAuth={handleNeedAuth}>
              <JelszoCsere />
            </RequireAuth>
          }
        />

        <Route
          path="/foglalas"
          element={
            <RequireAuth authed={authed} onNeedAuth={handleNeedAuth}>
              <Foglalas />
            </RequireAuth>
          }
        />

        <Route
          path="/foglalas/:tourId"
          element={
            <RequireAuth authed={authed} onNeedAuth={handleNeedAuth}>
              <Foglalas />
            </RequireAuth>
          }
        />

        <Route path="/aszf" element={<Aszf />} />
        <Route path="/adatvedelem" element={<Adatvedelem />} />
        <Route path="/impresszum" element={<Impresszum />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}