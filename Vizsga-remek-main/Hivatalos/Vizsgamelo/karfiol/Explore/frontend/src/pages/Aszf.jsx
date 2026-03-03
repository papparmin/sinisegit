import React from "react";
import "./Legal.css";

export default function Aszf() {
  return (
    <div className="legal-page">
      <div className="legal-wrap">
        <div className="legal-head">
          <span className="legal-mark" aria-hidden="true" />
          <div>
            <h1>Általános Szerződési Feltételek (ÁSZF)</h1>
            <p>Hivatalos tájékoztató oldal. Ide kerülhet a teljes ÁSZF tartalom.</p>
          </div>
        </div>

        <div className="legal-card">
          <h2>Rövid váz</h2>
          <ol>
            <li>Szolgáltatás leírása</li>
            <li>Foglalás és fizetés</li>
            <li>Lemondás / módosítás</li>
            <li>Felelősség, biztonság</li>
            <li>Panaszkezelés</li>
          </ol>
          <p className="legal-note">
            (Placeholder) — majd bemásolod a hivatalos szöveget.
          </p>
        </div>
      </div>
    </div>
  );
}