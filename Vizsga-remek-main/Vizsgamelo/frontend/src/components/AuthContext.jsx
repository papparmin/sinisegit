import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("exploree_token") || null
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("exploree_user");
    const storedToken = localStorage.getItem("exploree_token");

    if (storedUser && storedUser !== "undefined" && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Hiba a user beolvasásakor:", e);
        localStorage.removeItem("exploree_user");
        localStorage.removeItem("exploree_token");
        setUser(null);
        setToken(null);
      }
    }
  }, []);

  const login = (newToken, newUser) => {
    console.log("=== AUTH-CONTEXT LOGIN FÜGGVÉNY ELINDULT ===");
    console.log("Kapott token a backendtől:", newToken);
    console.log("Kapott user a backendtől:", newUser);

    if (!newToken) {
      console.error("❌ HIBA: Nem érkezett token a backendtől!");
      return;
    }

    try {
      localStorage.setItem("exploree_token", newToken);
      localStorage.setItem("exploree_user", JSON.stringify(newUser || {}));
      setToken(newToken);
      setUser(newUser || {});
      console.log("✅ Sikeresen elmentve a LocalStorage-ba!");
    } catch (error) {
      console.error("❌ HIBA a LocalStorage mentés során:", error);
    }
  };

  const logout = () => {
    console.log("=== KIJELENTKEZÉS ===");
    localStorage.removeItem("exploree_token");
    localStorage.removeItem("exploree_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};