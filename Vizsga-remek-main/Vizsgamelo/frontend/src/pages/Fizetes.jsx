import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Fizetes.css";

const fmtFt = (n) =>
  `${new Intl.NumberFormat("hu-HU").format(Number(n || 0))} Ft`;

function ApplePayLogo() {
  return (
    <div className="wallet-logo apple-logo">
      <span className="apple-icon"></span>
      <span>Pay</span>
    </div>
  );
}

function GooglePayLogo() {
  return (
    <div className="wallet-logo google-logo">
      <span className="g-blue">G</span>
      <span className="g-red">o</span>
      <span className="g-yellow">o</span>
      <span className="g-blue">g</span>
      <span className="g-green">l</span>
      <span className="g-red">e</span>
      <span className="google-pay-text">Pay</span>
    </div>
  );
}

export default function Fizetes() {
  const location = useLocation();
  const navigate = useNavigate();

  const paymentData = location.state || null;

  const [method, setMethod] = useState("applepay");
  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const hasData = !!paymentData?.items?.length;

  const itemCount = useMemo(() => {
    return (paymentData?.items || []).reduce(
      (sum, item) => sum + Number(item.mennyiseg || 0),
      0
    );
  }, [paymentData]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (!hasData) {
      Swal.fire({
        icon: "warning",
        title: "Nincs fizetési adat",
        text: "Előbb válassz termékeket a bérlés oldalon.",
      });
      return;
    }

    if (method === "card") {
      if (!form.cardName || !form.cardNumber || !form.expiry || !form.cvc) {
        Swal.fire({
          icon: "warning",
          title: "Hiányzó adatok",
          text: "Tölts ki minden kártyaadatot.",
        });
        return;
      }
    }

    const methodLabel =
      method === "applepay"
        ? "Apple Pay"
        : method === "googlepay"
        ? "Google Pay"
        : "bankkártya";

    await Swal.fire({
      icon: "success",
      title: "Sikeres fizetés",
      text: `Fizetési mód: ${methodLabel}.`,
      timer: 1800,
      showConfirmButton: false,
    });

    navigate("/berles");
  };

  if (!hasData) {
    return (
      <div className="fizetes-page">
        <div className="fizetes-shell">
          <div className="fizetes-card">
            <h1>Fizetés</h1>
            <p>Nincs aktív fizetési adat.</p>
            <Link className="fizetes-btn secondary" to="/berles">
              Vissza a bérléshez
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fizetes-page">
      <div className="fizetes-shell">
        <div className="fizetes-grid">
          <section className="fizetes-card">
            <div className="fizetes-kicker">EXPLORE • Fizetés</div>
            <h1>Fizetés</h1>
            <p className="fizetes-sub">
              Válassz fizetési módot, majd fejezd be a bérlést.
            </p>

            <div className="pay-methods">
              <button
                type="button"
                className={`pay-method ${method === "applepay" ? "active" : ""}`}
                onClick={() => setMethod("applepay")}
              >
                <ApplePayLogo />
                <div className="pay-method-copy">
                  <strong>Apple Pay</strong>
                  <span>Gyors fizetés Apple eszközről</span>
                </div>
              </button>

              <button
                type="button"
                className={`pay-method ${method === "googlepay" ? "active" : ""}`}
                onClick={() => setMethod("googlepay")}
              >
                <GooglePayLogo />
                <div className="pay-method-copy">
                  <strong>Google Pay</strong>
                  <span>Gyors fizetés Google fiókkal</span>
                </div>
              </button>

              <button
                type="button"
                className={`pay-method ${method === "card" ? "active" : ""}`}
                onClick={() => setMethod("card")}
              >
                <div className="wallet-logo card-logo">💳</div>
                <div className="pay-method-copy">
                  <strong>Bankkártya</strong>
                  <span>Hagyományos kártyás fizetés</span>
                </div>
              </button>
            </div>

            <form className="fizetes-form" onSubmit={handlePay}>
              {method === "applepay" && (
                <div className="wallet-box">
                  <div className="wallet-cta apple-wallet">
                    <ApplePayLogo />
                  </div>
                  <p>
                    A gomb megjelenik rendesen. Éles Apple Pay működéshez Stripe vagy más payment provider kell backend oldalon is.
                  </p>
                </div>
              )}

              {method === "googlepay" && (
                <div className="wallet-box">
                  <div className="wallet-cta google-wallet">
                    <GooglePayLogo />
                  </div>
                  <p>
                    A gomb megjelenik rendesen. Éles Google Pay működéshez Stripe vagy más payment provider kell backend oldalon is.
                  </p>
                </div>
              )}

              {method === "card" && (
                <>
                  <label>
                    Kártyatulajdonos neve
                    <input
                      value={form.cardName}
                      onChange={(e) => set("cardName", e.target.value)}
                      placeholder="Teszt Elek"
                    />
                  </label>

                  <label>
                    Kártyaszám
                    <input
                      value={form.cardNumber}
                      onChange={(e) => set("cardNumber", e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </label>

                  <div className="fizetes-row2">
                    <label>
                      Lejárat
                      <input
                        value={form.expiry}
                        onChange={(e) => set("expiry", e.target.value)}
                        placeholder="12/28"
                      />
                    </label>

                    <label>
                      CVC
                      <input
                        value={form.cvc}
                        onChange={(e) => set("cvc", e.target.value)}
                        placeholder="123"
                      />
                    </label>
                  </div>
                </>
              )}

              <div className="fizetes-actions">
                <button className="fizetes-btn" type="submit">
                  Fizetés most
                </button>

                <Link className="fizetes-btn secondary" to="/berles">
                  Vissza
                </Link>
              </div>
            </form>
          </section>

          <aside className="fizetes-card summary">
            <h2>Összegzés</h2>

            <div className="summary-box">
              <div>
                <span>Kezdés</span>
                <strong>{paymentData.kezd}</strong>
              </div>
              <div>
                <span>Vége</span>
                <strong>{paymentData.vege}</strong>
              </div>
              <div>
                <span>Napok</span>
                <strong>{paymentData.napok}</strong>
              </div>
              <div>
                <span>Tételek</span>
                <strong>{itemCount} db</strong>
              </div>
            </div>

            <div className="summary-items">
              {paymentData.items.map((item, index) => (
                <div key={`${item.termekId}-${index}`} className="summary-item">
                  <img src={item.kep} alt={item.nev} />
                  <div>
                    <strong>{item.nev}</strong>
                    <span>
                      {item.mennyiseg} db × {fmtFt(item.napiAr)} / nap
                    </span>
                  </div>
                  <b>{fmtFt(item.lineTotal)}</b>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <span>Fizetendő</span>
              <strong>{fmtFt(paymentData.vegosszeg)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}