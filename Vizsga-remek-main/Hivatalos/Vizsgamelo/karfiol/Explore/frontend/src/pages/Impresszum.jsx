import React from "react";
import "./Legal.css";

export default function Impresszum() {
  return (
    <div className="legal-page">
      <div className="legal-wrap">
        <div className="legal-head">
          <span className="legal-mark" aria-hidden="true" />
          <div>
            <h1>Impresszum</h1>
            <p>Hivatalos információk placeholder — majd kitöltöd valós adatokkal.</p>
          </div>
        </div>

        <div className="legal-card">
          <h2>Alap adatok</h2>
          <div className="legal-grid">
            <div><strong>Név:</strong> EXPLORE</div>
            <div><strong>Email:</strong> hello@explore.hu</div>
            <div><strong>Telefon:</strong> +36 30 123 4567</div>
            <div><strong>Székhely:</strong> Keszthely</div>
          </div>
          <p className="legal-note">(Placeholder) — szolgáltató, tárhely, felelős stb.</p>
        </div>
      </div>
    </div>
  );
}