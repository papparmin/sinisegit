import React from "react";
import "./Legal.css";

export default function Adatvedelem() {
  return (
    <div className="legal-page">
      <div className="legal-wrap">
        <div className="legal-head">
          <span className="legal-mark" aria-hidden="true" />
          <div>
            <h1>Adatvédelmi tájékoztató</h1>
            <p>Hivatalos GDPR tájékoztató placeholder — hogy a link ne üresre vigyen.</p>
          </div>
        </div>

        <div className="legal-card">
          <h2>Rövid váz</h2>
          <ul>
            <li>Adatkezelő adatai</li>
            <li>Kezelt adatok köre</li>
            <li>Jogalap, célok</li>
            <li>Megőrzési idő</li>
            <li>Érintetti jogok</li>
          </ul>
          <p className="legal-note">(Placeholder) — később jöhet a részletes szöveg.</p>
        </div>
      </div>
    </div>
  );
}