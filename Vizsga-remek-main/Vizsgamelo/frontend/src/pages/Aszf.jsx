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
            <p>
              A 45/2014. (II. 26.) Korm. rendelet és a Polgári Törvénykönyvről
              szóló 2013. évi V. törvény alapján.
            </p>
          </div>
        </div>

        <div className="legal-card">
          <p>
            <strong>Verziószám:</strong> 1.0
          </p>
          <p>
            <strong>Hatálybalépés dátuma:</strong> 2026. április 10.
          </p>
        </div>

        <div className="legal-card">
          <h2>1. Preambulum</h2>
          <p>
            Jelen Általános Szerződési Feltételek (továbbiakban: ÁSZF)
            szabályozzák az <strong>Explore Kft.</strong> (továbbiakban:
            Szolgáltató) által üzemeltetett <strong>Explore</strong> weboldalon
            (továbbiakban: Weboldal) elérhető szolgáltatások (túrafoglalás,
            túrafelszerelés bérlés, kapcsolatfelvétel) igénybevételének
            feltételeit.
          </p>
          <p>
            Az ÁSZF minden olyan <strong>Felhasználóra</strong> kötelező
            érvényű, aki a Weboldalt bármilyen módon használja, beleértve a
            regisztrált és nem regisztrált látogatókat, valamint a foglalást
            vagy bérlést végző személyeket.
          </p>
          <p>
            A szolgáltatások igénybevételével a Felhasználó automatikusan
            elfogadja jelen ÁSZF rendelkezéseit.
          </p>
        </div>

        <div className="legal-card">
          <h2>2. A Szolgáltató adatai</h2>
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
                  <strong>Székhely</strong>
                </td>
                <td>8360 Keszthely, Fő tér 10.</td>
              </tr>
              <tr>
                <td>
                  <strong>Postacím</strong>
                </td>
                <td>8360 Keszthely, Fő tér 10.</td>
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
              <tr>
                <td>
                  <strong>Tárhelyszolgáltató</strong>
                </td>
                <td>Explore Cloud (8360 Keszthely, Kis Pál utca 8.)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-card">
          <h2>3. A szolgáltatás részletes leírása</h2>

          <h3>3.1 Túrák böngészése és foglalása</h3>
          <ul>
            <li>
              Túrák listájának és részletes adatainak megtekintése (cím, leírás,
              kategória, nehézségi szint, időtartam, ár, maximális létszám,
              aktuális foglaltság, képgaléria)
            </li>
            <li>Túra foglalása egyedi űrlapon keresztül</li>
            <li>Foglalás visszaigazolása e-mailben</li>
          </ul>

          <h3>3.2 Túrafelszerelés bérlése</h3>
          <ul>
            <li>
              Bérelhető termékek böngészése (név, kategória, márka, napi ár,
              értékelés, súly, leírás, elérhető darabszám)
            </li>
            <li>Termékek kosárba helyezése</li>
            <li>Bérlési időszak megadása (kezdő és végdátum)</li>
            <li>Bérlési rendelés leadása</li>
          </ul>

          <h3>3.3 Kapcsolatfelvétel</h3>
          <p>Kapcsolati űrlap kitöltése és elküldése a Szolgáltató felé.</p>

          <h3>3.4 Profilkezelés (regisztráció után)</h3>
          <ul>
            <li>Személyes adatok módosítása</li>
            <li>Profilkép feltöltése</li>
            <li>Jelszó módosítása</li>
          </ul>

          <h3>3.5 Adminisztrációs felület (kizárólag admin jogosultsággal)</h3>
          <ul>
            <li>
              Túrák kezelése (létrehozás, szerkesztés, törlés, státusz
              módosítás)
            </li>
            <li>Bérlési termékek kezelése</li>
            <li>Kapcsolati üzenetek kezelése és válaszadás</li>
            <li>Felhasználók kezelése</li>
          </ul>
        </div>

        <div className="legal-card">
          <h2>4. Foglalás és bérlés menete</h2>

          <h3>4.1 Túrafoglalás lépései</h3>
          <table>
            <thead>
              <tr>
                <th>Lépés</th>
                <th>Leírás</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.</td>
                <td>
                  A Felhasználó kiválaszt egy túrát a listából vagy a részletes
                  oldalon.
                </td>
              </tr>
              <tr>
                <td>2.</td>
                <td>
                  A Felhasználó kitölti a foglalási űrlapot (kötelező mezők:
                  név, e-mail, telefonszám, dátum, létszám, vészhelyzeti
                  kapcsolat neve és telefonszáma).
                </td>
              </tr>
              <tr>
                <td>3.</td>
                <td>
                  A Felhasználó kiválasztja a fizetési módot (helyszíni fizetés,
                  banki átutalás, online fizetés).
                </td>
              </tr>
              <tr>
                <td>4.</td>
                <td>
                  A rendszer ellenőrzi a szabad helyeket a kiválasztott túrán.
                </td>
              </tr>
              <tr>
                <td>5.</td>
                <td>A rendszer rögzíti a foglalást az adatbázisban.</td>
              </tr>
              <tr>
                <td>6.</td>
                <td>
                  A Felhasználó automatikus visszaigazoló e-mailt kap a foglalás
                  részleteivel.
                </td>
              </tr>
              <tr>
                <td>7.</td>
                <td>
                  A foglalás státusza frissül (új / megerősített / fizetésre vár
                  / kifizetve).
                </td>
              </tr>
            </tbody>
          </table>

          <h3>4.2 Felszerelésbérlés lépései</h3>
          <table>
            <thead>
              <tr>
                <th>Lépés</th>
                <th>Leírás</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1.</td>
                <td>A Felhasználó böngészi a bérelhető termékeket.</td>
              </tr>
              <tr>
                <td>2.</td>
                <td>
                  A Felhasználó a kívánt termék(ek)et a kosárba helyezi.
                </td>
              </tr>
              <tr>
                <td>3.</td>
                <td>
                  A Felhasználó megadja a bérlés időtartamát (kezdő és
                  végdátum).
                </td>
              </tr>
              <tr>
                <td>4.</td>
                <td>
                  A rendszer kiszámolja a napok számát és a végösszeget.
                </td>
              </tr>
              <tr>
                <td>5.</td>
                <td>A Felhasználó leadja a rendelést.</td>
              </tr>
              <tr>
                <td>6.</td>
                <td>A rendszer csökkenti a termék aktuális készletét.</td>
              </tr>
              <tr>
                <td>7.</td>
                <td>
                  A bérlés átvétele és visszaadása a túra helyszínén történik.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>4.3 Lemondási feltételek</h3>
          <table>
            <thead>
              <tr>
                <th>Időpont</th>
                <th>Visszatérítés mértéke</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Legalább 48 órával a túra időpontja előtt</td>
                <td>100% (teljes összeg visszatérítése)</td>
              </tr>
              <tr>
                <td>24-48 órával a túra időpontja előtt</td>
                <td>50% (a foglalási összeg fele)</td>
              </tr>
              <tr>
                <td>24 órán belül vagy meg nem jelenés esetén</td>
                <td>0% (nem jár visszatérítés)</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Bérlés esetén:</strong> a lemondás a fenti szabályok szerint,
            de legkésőbb a bérlés kezdő időpontja előtt 24 órával lehetséges.
          </p>
        </div>

        <div className="legal-card">
          <h2>5. Fizetési feltételek</h2>

          <h3>5.1 Elérhető fizetési módok</h3>
          <table>
            <thead>
              <tr>
                <th>Fizetési mód</th>
                <th>Leírás</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Helyszíni fizetés</td>
                <td>
                  A Felhasználó a túra helyszínén, a túra előtt készpénzben vagy
                  bankkártyával fizet.
                </td>
              </tr>
              <tr>
                <td>Banki átutalás</td>
                <td>
                  A Felhasználó a foglalást követő 3 napon belül banki
                  átutalással teljesíti a fizetést. A közleményben kötelező
                  feltüntetni a kapott referencia azonosítót
                  (EXPLORE-XXXXX).
                </td>
              </tr>
              <tr>
                <td>Online fizetés</td>
                <td>
                  A Felhasználó bankkártyával, Apple Pay-jel vagy Google Pay-jel
                  fizet a weboldal biztonságos felületén keresztül.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>5.2 Fizetési határidő elmulasztása</h3>
          <p>
            Amennyiben a Felhasználó a banki átutalás vagy online fizetés
            esetén nem teljesíti a fizetést a megadott határidőn belül, a
            foglalás automatikusan törlésre kerül.
          </p>
        </div>

        <div className="legal-card">
          <h2>6. Felelősségkorlátozás</h2>

          <h3>6.1 A Szolgáltató nem vállal felelősséget</h3>
          <ul>
            <li>
              a Felhasználó által megadott pontatlan, hiányos vagy valótlan
              adatokból eredő károkért,
            </li>
            <li>
              technikai hibákból, vírusokból, hackertámadásokból vagy egyéb
              külső támadásból eredő károkért,
            </li>
            <li>
              a Felhasználó eszközének (számítógép, telefon, táblagép)
              meghibásodásáért,
            </li>
            <li>internethálózati problémákból eredő fennakadásokért.</li>
          </ul>

          <h3>6.2 Vis maior</h3>
          <p>
            Vis maior (árvíz, vihar, járvány, hatósági intézkedés, háború,
            terrorcselekmény vagy egyéb előre nem látható, elháríthatatlan
            esemény) esetén a Szolgáltató jogosult:
          </p>
          <ul>
            <li>a túrát lemondani,</li>
            <li>a túrát átütemezni másik időpontra.</li>
          </ul>
          <p>
            Vis maior esetén a Felhasználó által befizetett összeget a
            Szolgáltató teljes egészében visszatéríti.
          </p>

          <h3>6.3 Balesetek és sérülések</h3>
          <p>
            A túrák saját felelősségre vehetők igénybe. A Szolgáltató a
            balesetekért, sérülésekért, egészségkárosodásokért kizárólag abban
            az esetben felel, ha azokat a Szolgáltató vagy alkalmazottai súlyos
            gondatlansága okozta.
          </p>
        </div>

        <div className="legal-card">
          <h2>7. Jogvita és alkalmazandó jog</h2>
          <ul>
            <li>A jelen ÁSZF-re a magyar jog az irányadó.</li>
            <li>A felek a vitás kérdéseket elsősorban békés úton rendezik.</li>
            <li>
              Jogvita esetén a Szolgáltató székhelye szerinti bíróság
              (Keszthely) rendelkezik kizárólagos illetékességgel.
            </li>
            <li>
              A fogyasztóvédelmi viták esetén a Felhasználó a Békéltető
              Testülethez is fordulhat.
            </li>
          </ul>
        </div>

        <div className="legal-card">
          <h2>8. Egyéb rendelkezések</h2>

          <h3>8.1 Az ÁSZF módosítása</h3>
          <p>
            A Szolgáltató fenntartja a jogot jelen ÁSZF egyoldalú módosítására.
            A módosítások a Weboldalon való közzététellel lépnek hatályba. A
            Felhasználó a módosított ÁSZF-et a Weboldal használatával
            automatikusan elfogadja.
          </p>

          <h3>8.2 Részleges érvénytelenség</h3>
          <p>
            Ha jelen ÁSZF bármely pontja érvénytelen vagy végrehajthatatlan, a
            többi pont érvényben marad. Az érvénytelen pont helyébe a
            jogszabályi rendelkezések lépnek.
          </p>

          <h3>8.3 Nyelvezet</h3>
          <p>
            Jelen ÁSZF magyar nyelven készült. Eltérő rendelkezés hiányában a
            magyar nyelvű változat az irányadó.
          </p>
        </div>

        <div className="legal-card">
          <h2>9. Záró rendelkezések</h2>
          <p>
            Jelen Általános Szerződési Feltételek <strong>2026. április 10-től</strong>{" "}
            visszavonásig hatályos.
          </p>
          <p>
            A Szolgáltató jelen ÁSZF-et a Weboldalon bármikor elérhetővé teszi
            (láblécben, „ÁSZF” link alatt).
          </p>
          <p>
            <strong>Kelt:</strong> Keszthely, 2026. április 10.
          </p>
          <p>
            <strong>Explore Kft.</strong>
            <br />
            (a Szolgáltató nevében és megbízásából)
          </p>
        </div>
      </div>
    </div>
  );
}