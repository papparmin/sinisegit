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
            <p>
              A 2001. évi CVIII. törvény (Ektv.) és az Európai Unió
              e-kereskedelmi irányelve alapján.
            </p>
          </div>
        </div>

        <div className="legal-card">
          <h2>1. Az üzemeltető (Szolgáltató) neve és elérhetősége</h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Cégnév</strong>
                </td>
                <td>Explore Kft.</td>
              </tr>
              <tr>
                <td>
                  <strong>E-mail cím</strong>
                </td>
                <td>explore@gmail.com</td>
              </tr>
              <tr>
                <td>
                  <strong>Telefonszám</strong>
                </td>
                <td>+36 70 553 311</td>
              </tr>
              <tr>
                <td>
                  <strong>Postacím</strong>
                </td>
                <td>8360 Keszthely, Fő tér 10.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-card">
          <h2>2. Adószám és cégjegyzékszám</h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Adószám</strong>
                </td>
                <td>12345678-1-23</td>
              </tr>
              <tr>
                <td>
                  <strong>Cégjegyzékszám</strong>
                </td>
                <td>67-45-123456</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-card">
          <h2>3. Székhely címe</h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Székhely</strong>
                </td>
                <td>8360 Keszthely, Fő tér 10.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-card">
          <h2>4. Tárhelyszolgáltató adatai</h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Cégnév</strong>
                </td>
                <td>Explore Cloud</td>
              </tr>
              <tr>
                <td>
                  <strong>Cím</strong>
                </td>
                <td>8360 Keszthely, Kis Pál utca 8.</td>
              </tr>
              <tr>
                <td>
                  <strong>E-mail</strong>
                </td>
                <td>info@explorecloud.hu</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-card">
          <h2>5. Hatósági felügyeleti szerv</h2>
          <p>
            Az Explore Kft. tevékenysége nem minősül pénzügyi, biztosítási vagy
            egyéb hatósági engedélyköteles szolgáltatásnak. Ennek megfelelően
            külön hatósági felügyeleti szerv megadása nem szükséges.
          </p>
          <p>
            A fogyasztóvédelmi kérdésekben a <strong>Békéltető Testület</strong>{" "}
            és a <strong>Fogyasztóvédelmi Hatóság</strong> jár el.
          </p>
          <p>
            Amennyiben a későbbiekben a tevékenység hatósági
            engedélykötelessé válna, az Impresszum ennek megfelelően frissítésre
            kerül.
          </p>
        </div>

        <div className="legal-card">
          <h2>6. Szerzői jogokra vonatkozó információk</h2>
          <p>
            Az <strong>Explore Kft.</strong> által üzemeltetett weboldal
            (Explore) teljes tartalma – így különösen, de nem kizárólagosan:
          </p>

          <ul>
            <li>a szöveges anyagok,</li>
            <li>a túraleírások, bérlési feltételek,</li>
            <li>a grafikai elemek, logók, ikonok,</li>
            <li>a fotók, képek, illusztrációk,</li>
            <li>a videók, animációk,</li>
            <li>a forráskód (HTML, CSS, JavaScript, backend kód)</li>
          </ul>

          <p>
            szerzői jogi védelem alatt állnak a magyar szerzői jogi törvény
            (1999. évi LXXVI. törvény) és az Európai Unió vonatkozó irányelvei
            alapján.
          </p>

          <p>
            Tilos a fenti tartalmak bármely részének:
          </p>

          <ul>
            <li>másolása,</li>
            <li>terjesztése,</li>
            <li>módosítása,</li>
            <li>újrafelhasználása,</li>
            <li>kereskedelmi célú felhasználása</li>
          </ul>

          <p>
            az Explore Kft. előzetes, írásbeli engedélye nélkül.
          </p>

          <p>
            A kivételt képezik a jogszabály által engedélyezett felhasználási
            módok (pl. magáncélú másolás, idézés a forrás megjelölésével).
          </p>

          <p>
            <strong>© 2026 Explore Kft. Minden jog fenntartva.</strong>
          </p>
        </div>

        <div className="legal-card">
          <h2>7. Kapcsolat</h2>
          <p>
            Amennyiben az Impresszummal, a weboldal működésével vagy a szerzői
            jogi kérdésekkel kapcsolatban bármilyen kérdése van, kérjük, vegye
            fel velünk a kapcsolatot az alábbi elérhetőségek egyikén:
          </p>

          <p>
            <strong>E-mail:</strong> explore@gmail.com
          </p>
          <p>
            <strong>Telefon:</strong> +36 70 553 311
          </p>
          <p>
            <strong>Postacím:</strong> 8360 Keszthely, Fő tér 10.
          </p>
        </div>
      </div>
    </div>
  );
}