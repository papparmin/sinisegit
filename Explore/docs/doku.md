---
sidebar_position: 1
title: "Explore Webalkalmazás"
description: "Túraszervező és tervező webalkalmazás - Premontrei Szakgimnázium és Technikum, 2026"
---

# Explore Webalkalmazás

**Szoftverfejlesztő és tesztelő szak**  
Premontrei Szakgimnázium és Technikum, Keszthely  
2026

**Készítette:** Németh Gergő, Papp Ármin Gábor

## Bemutatás

A projektmunkát ketten valósítottuk meg: **Németh Gergő** és **Papp Ármin Gábor**.

Projektünk neve: **Explore**.

Azért esett erre a témára a választásunk, mivel mindketten szeretjük a természetet és gyakran járjuk a szebbnél szebb természeti helyeket különböző túrázáshoz használható eszközökkel. Mindezek mellett szeretnénk egy támaszpont lenni, segítséget nyújtani a hasonló érdeklődési körrel rendelkező emberek számára, hogy hasznosan és élményekben gazdag időt tudjanak együtt tölteni a szabad levegőn.

Mi abban az elméletben hiszünk, hogy egy jó társaságban eltöltött idő mindennél többet érhet és segít a mindennapi teher és stressz alól mentesíteni, megtisztítani az elmét.

A mi túra ajánló és tervező webalkalmazásunknak köszönhetően mindig és könnyen lehet az időjárás befolyásolása nélkül túrát és programot találni, mert vannak melegebb időre tervezett túráink és a kicsit hűvösebb őszi napokra is gondoltunk.

A projekt témájának megválasztásakor előtérbe helyeztük, hogy valami olyasmit valósítsunk meg, ami egyedi és ami érdeklődési körünknek megfelelő legyen. Hosszas keresgélés után sem találtunk a mi elképzelésünkhöz hasonló webes alkalmazást.

Összességében az **Explore projekt** széles túrázási repertoárja nagy és sok kirándulási lehetőséget nyújt azon személyek számára, akik ellátogatnak hozzánk.

## Adatbázis

Az adatbázis egy strukturált adathalmaz, amely az adatok hatékony tárolását, rendszerezését és kezelését szolgálja. Az információk relációs táblákban kerülnek tárolásra, amelyek mezőkből és rekordokból épülnek fel. A mi adatbázisunk **14 táblát** tartalmaz, amelyek egymással relációk segítségével kapcsolódnak össze.

### Táblák listája

<details>
<summary><b>admin</b> - Adminisztrátorok kezelése</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító (elsődleges kulcs) |
| felhasznalo_id | INT | Hivatkozás a felhasználók táblára |
| jogosultsag | VARCHAR | Admin jogosultsági szintje |

</details>

<details>
<summary><b>beallitasok</b> - Rendszerbeállítások</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| admin_id | INT | Rendszergazda azonosítója |
| beallitas_kulcs | VARCHAR | Beállítás azonosító neve |
| beallitas_ertek | VARCHAR | Beállítás értéke |

</details>

<details>
<summary><b>belepes</b> - Bejelentkezési napló</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Felhasználó azonosítója |
| ip_cim | VARCHAR | Bejelentkezés IP címe |
| sikeres | BOOLEAN | Bejelentkezés sikeressége |
| datum | DATETIME | Bejelentkezés időpontja |

</details>

<details>
<summary><b>berles</b> - Bérlések kezelése</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalok_id | INT | Bérlő felhasználó |
| turak_id | INT | Bérelt túra |
| eszkoz | VARCHAR | Bérelt eszköz |
| kezdet | DATETIME | Bérlés kezdete |
| vege | DATETIME | Bérlés vége |
| ar | DECIMAL | Bérlés díja |
| kep | VARCHAR | Termék képe |

</details>

<details>
<summary><b>berles_rendelesek</b> - Bérlési rendelések</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Felhasználó azonosítója |
| termek_id | INT | Termék azonosítója |
| termek_nev | VARCHAR | Termék neve |
| mennyiseg | INT | Darabszám |
| kezd | DATETIME | Rendelés kezdete |
| vege | DATETIME | Rendelés vége |
| napi_ar | DECIMAL | Napi díj |
| vegosszeg | DECIMAL | Végösszeg |
| status | VARCHAR | Rendelés státusza |

</details>

<details>
<summary><b>berles_termekek</b> - Bérelhető termékek</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| nev | VARCHAR | Termék neve |
| kategoria | VARCHAR | Kategória |
| marka | VARCHAR | Márka |
| ar_per_nap | DECIMAL | Ár naponta |
| ertekeles | DECIMAL | Értékelés |
| suly_kg | DECIMAL | Súly kg-ban |
| kep | VARCHAR | Termék képe |

</details>

<details>
<summary><b>ertekelesek</b> - Túrák értékelései</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Értékelő felhasználó |
| turak_id | INT | Értékelt túra |
| pontszam | INT | Pontszám (1-5) |
| velemeny | TEXT | Szöveges értékelés |
| datum | DATETIME | Értékelés időpontja |

</details>

<details>
<summary><b>felhasznalok</b> - Felhasználók (központi tábla)</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| nev | VARCHAR | Felhasználó neve |
| email | VARCHAR | Email cím |
| jelszo | VARCHAR | Titkosított jelszó |
| szerepkor | VARCHAR | Szerepkör (admin/user) |
| aktiv | BOOLEAN | Aktív státusz |
| letrehozva | DATETIME | Regisztráció dátuma |
| profikep | VARCHAR | Profilkép |
| varos | VARCHAR | Tartózkodási hely |
| szuletesi_datum | DATE | Születési dátum |
| nem | VARCHAR | Nem |

</details>

<details>
<summary><b>foglalasok</b> - Túrafoglalások</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Foglaló felhasználó |
| tura_id | INT | Túra azonosítója |
| tura_slug | VARCHAR | Túra helye |
| tura_cim | VARCHAR | Túra címe |
| datum | DATETIME | Túra dátuma |
| letszam | INT | Létszám |
| nev | VARCHAR | Név |
| email | VARCHAR | Email |
| telefon | VARCHAR | Telefonszám |
| tapasztalat | VARCHAR | Tapasztalat |

</details>

<details>
<summary><b>foglalas_vendegek</b> - Foglaláshoz tartozó vendégek</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| foglalas_id | INT | Foglalás azonosítója |
| nev | VARCHAR | Vendég neve |
| email | VARCHAR | Vendég email |
| telefon | VARCHAR | Vendég telefonszáma |

</details>

<details>
<summary><b>jelentkezesek</b> - Túrákra jelentkezések</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Jelentkező felhasználó |
| turak_id | INT | Túra azonosítója |
| datum | DATETIME | Jelentkezés időpontja |

</details>

<details>
<summary><b>kapcsolatok</b> - Kapcsolatfelvételi üzenetek</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Üzenetet küldő felhasználó |
| nev | VARCHAR | Küldő neve |
| email | VARCHAR | Email cím |
| uzenet | TEXT | Üzenet szövege |
| datum | DATETIME | Küldés időpontja |

</details>

<details>
<summary><b>kapcsolat_uzenetek</b> - Kapcsolatüzenetek kezelése</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| felhasznalo_id | INT | Felhasználó azonosítója |
| nev | VARCHAR | Küldő neve |
| email | VARCHAR | Email cím |
| uzenet | TEXT | Üzenet szövege |
| status | VARCHAR | Üzenet státusza |
| admin_valasz | TEXT | Admin válasza |
| admin_id | INT | Admin azonosítója |

</details>

<details>
<summary><b>turak</b> - Túrák kezelése</summary>

| Mező | Típus | Leírás |
|------|-------|--------|
| id | INT | Egyedi azonosító |
| cim | VARCHAR | Túra címe |
| rovid_leiras | TEXT | Rövid leírás |
| nev | VARCHAR | Túra neve |
| kategoria | VARCHAR | Kategória |
| leiras | TEXT | Részletes leírás |
| nehezseg | VARCHAR | Nehézség |
| idotartam | VARCHAR | Időtartam |
| helyszin | VARCHAR | Helyszín |
| kep | VARCHAR | Kép a túráról |
| ar | DECIMAL | Részvételi díj |
| datum | DATETIME | Túra időpontja |
| letszam_max | INT | Maximális létszám |
| aktiv | INT | Jelentkezők száma |
| szervezo_id | INT | Szervező azonosítója |

</details>

### ER Modell

Az ER-modell egy túraszervező és foglalási rendszer adatbázisának logikai felépítését mutatja be. A központi elem a `felhasznalok` tábla, amely tartalmazza a regisztrált személyek adatait, szerepkörét és státuszát.

#### Kapcsolatok

| # | Kapcsolat | Típus | Magyarázat |
|---|-----------|-------|-------------|
| 1 | beallitasok ← felhasznalok | 1:N | Egy admin több beállítást kezelhet |
| 2 | turak ← felhasznalok | 1:N | Egy felhasználó több túrát szervezhet |
| 3 | ertekelesek ← turak | 1:N | Egy túrához több értékelés tartozhat |
| 4 | ertekelesek ← felhasznalok | 1:N | Egy felhasználó több értékelést írhat |
| 5 | berles ← turak | 1:N | Egy túrához több bérlés tartozhat |
| 6 | berles ← felhasznalok | 1:N | Egy felhasználó több bérlést indíthat |
| 7 | belepes ← felhasznalok | 1:N | Egy felhasználó többször bejelentkezhet |
| 8 | jelentkezesek ← turak | 1:N | Egy túrára több jelentkezés érkezhet |
| 9 | jelentkezesek ← felhasznalok | 1:N | Egy felhasználó több túrára jelentkezhet |
| 10 | kapcsolat_uzenetek ← felhasznalok | 1:N | Egy felhasználó több üzenetet küldhet |
| 11 | berles_rendelesek ← felhasznalok | 1:N | Egy felhasználó több rendelést adhat le |
| 12 | berles_rendelesek ← berles_termekek | 1:N | Egy termékhez több rendelés tartozhat |
| 13 | foglalas_vendegek ← foglalasok | 1:N | Egy foglaláshoz több vendég tartozhat |

### Strukturális jellemzők

- **Normalizáció:** Elkerüljük az adatok többszörös tárolását
- **Adatintegritás:** Idegen kulcsokkal biztosítjuk a hivatkozási integritást
- **Történeti adatok:** Az árak megőrzik a korabeli értékeket
- **Kapacitáskezelés:** Maximális létszám és darabszám szabályozás
- **Rugalmasság:** Könnyen bővíthető új túrákkal, eszközökkel

## Backend

### MVC technológia

A projektünk backend részét az **MVC (Model-View-Controller)** technológiával hoztuk létre.

#### Model (Modell)
Ez a réteg kezeli az adatbázisban elvégzésre került műveleteket és az üzleti logikát. A Model lehetővé teszi, hogy az értékek, adatok érvényesek és logikusak legyenek, így a kód letisztultabbá és áttekinthetőbbé válik.

#### View (Nézet)
A View a felhasználói felület kinézetéért, megjelenítésért felel (pl. űrlapok, gombok). Értelmezi a felhasználói kölcsönhatásokat, majd átadja azokat a Controller felé.

#### Controller (Vezérlő)
Az összekötő kapocs a Model és a View között. A vezérlő befogadja a felhasználói kéréseket, validálja az adatokat, továbbítja a Model felé, majd az eredményeket visszaküldi a View-nak.

### Middleware

A **middleware** mappa a backend alkalmazás egyik legfontosabb védelmi rétegét képezi. Az itt található fájlok olyan köztes függvényeket tartalmaznak, amelyek a kliens által küldött kérések és a szerver válaszai között futnak le.

A middleware réteg felelős:
- A kérések ellenőrzéséért és szűréséért
- A felhasználók azonosításáért
- A hitelesítésért és jogosultságok ellenőrzéséért

### Auth.js fájl

Az `auth.js` fájl egy **JWT hitelesítő middleware**, amely a JSON Web Token technológiát használja a felhasználók azonosítására.

**Működési folyamat:**

1. A kliens Authorization fejlécben küldi a JWT tokent
2. A middleware ellenőrzi a fejléc meglétét
3. Hiányzó fejléc esetén 401-es hibakód
4. Token kinyerése és verifikációja
5. Érvénytelen token esetén 403-as hibakód
6. Sikeres ellenőrzés után a kérés továbbengedése

### Tests mappa (Backend)

A `tests` mappában helyeztük el a backend működését ellenőrző **Jest** teszteket. A Jest egy elterjedt JavaScript tesztelő keretrendszer, amelyet a Node.js alkalmazások tesztelésére használunk. Segítségével ellenőrizzük, hogy az API végpontok megfelelően működnek-e, a hibás bemenetekre a várt hibaüzeneteket adják-e vissza, valamint, hogy az adatbázis műveletek helyesen futnak-e le.

Nálunk például a register teszt a következő adatokat vizsgálja:
- a sikeres regisztrációt,
- a hiányzó mezők esetén kapott 400-as hibát,
- valamint a duplikált email cím kezelését.

A login teszt pedig a helyes és hibás bejelentkezési kísérleteket, valamint a hiányzó adatokkal küldött kérések kezelését teszteli.

### Setup.js

Ennek a fájlnak az a szerepe a projektünkben, hogy a tesztkörnyezetben helyettesítse a külső függőségeket -- például az adatbázis-kezelőt, az e-mail küldő modult, a jelszótitkosítót és a tokenelőállítót --, így a tesztek futása során nem kell valódi MySQL kapcsolatot, valódi e-mail kiküldést vagy valódi kriptográfiai műveleteket végezni. Ezáltal a tesztek gyorsabbak, kiszámíthatóbbak és függetlenek lesznek a környezeti beállításoktól, miközben a kód logikáját ugyanúgy ellenőrizni tudjuk.

A mockolás segítségével szimulálni lehet a sikeres adatbázis-lekérdezéseket, tranzakciókezelést, e-mail küldést, jelszó-hashelést és token-előállítást, így a fejlesztés során elkerülhetők a valós erőforrások terheléséből vagy elérhetetlenségéből fakadó problémák.

### Server.js

Ennek a fájlnak a szerepe a projektünkben, hogy megvalósítsa a teljes backend szerveroldali logikát -- kezeli az adatbázis kapcsolatot, biztosítja a REST API végpontokat a túrák, bérlés, foglalások, felhasználói regisztráció és belépés, valamint adminisztrációs funkciók számára. Emellett gondoskodik a fájlfeltöltésekről (például profilképek vagy bérlési termékek képei), kezeli a JWT alapú hitelesítést és jogosultságokat, valamint a foglalásokhoz kapcsolódó automatikus e-mail értesítéseket küld a nodemailer segítségével.

A kód elindításkor ellenőrzi és szükség esetén létrehozza az adatbázis táblákat, valamint feltölti az alapértelmezett bérlési termékeket és egy admin felhasználót, ha azok még nem léteznek. A szerver a megadott porton fut, és a különböző végpontokon keresztül biztosítja a frontend számára a szükséges adatokat és műveleteket.

### Node_modules mappa

A `node_modules` könyvtár tartalmazza a Node.js alkalmazásunkhoz letöltött valamennyi külső függőséget és modult. Ezeket a komponenseket az npm (Node Package Manager) segédprogrammal telepítjük, és a package.json állományban rögzítjük őket.

Ebben a mappában található például:
- az `express` keretrendszer a szerver működtetéséhez,
- a `mysql2` illesztő az adatbázis eléréséhez,
- a `bcryptjs` a jelszavak kódolásához,
- a `jsonwebtoken` a tokenek előállításához és ellenőrzéséhez,
- illetve a `jest` és a `supertest` eszközök a tesztek végrehajtásához.

A `package-lock.json` állomány garantálja, hogy minden fejlesztői környezetben pontosan ugyanazok a verziók kerüljenek használatba, ezáltal megelőzve a különböző verziókból fakadó problémákat.

### Jest.config.js

Ennek a fájlnak a szerepe a projektünkben, hogy beállítsa a Jest tesztelési keretrendszer működését a backend környezetben. Meghatározza, hogy a teszteket Node.js környezetben kell futtatni, megadja, hogy a tesztek előtt a setup.js fájlban található előkészítő kódokat kell végrehajtani, harminc másodperces időkorlátot szab az egyes tesztek számára, valamint előírja, hogy a tesztek befejeződése után a folyamatnak erőszakosan le kell lépnie, és figyelmeztet a nyitva maradt erőforrásokra (például meg nem szüntetett adatbázis kapcsolatokra vagy szerverekre). Ezzel biztosítja, hogy a tesztek konzisztens és ellenőrzött környezetben fussanak, és a fejlesztő időben értesüljön az esetleges erőforrás-szivárgásokról.

## Frontend

A `public` mappába töltöttük fel a grafikai állományokat, az `src` mappába pedig a `.jsx` kiterjesztésű React komponenseket és a hozzájuk kapcsolódó CSS stíluslapokat tettük. A `vite.config.js` fájlban a Vite beállításait végeztük el a React bővítménnyel együtt, a `package.json` pedig felsorolja a szükséges függőségeket.

### Bejelentkezés

A bejelentkezés felület a Componentsen belül az `AuthDialog.jsx`-ben található, itt került megvalósításra. Az űrlap tartalma az email cím, valamint a jelszó mező, ahol akár a szem ikonra kattintva ellenőrizhetjük a jelszónkat, mert láthatóvá válik. A user adatai ellenőrzésre kerülnek, majd ha sikeres ellenőrzés történt, a válaszban kapott tokent elmenti a helyi adatbázisba. Sikeres bejelentkezés után élvezhetjük az oldal adta lehetőségeket, amennyiben hibát észlel, a problémának megfelelő hibát küldi a felhasználónak.

### Regisztráció

A regisztrációs felületet az `AuthDialog.jsx` komponens tartalmazza. Az űrlapon a következő mezők találhatók: vezetéknév, keresztnév, felhasználónév, város, email, telefon, születési dátum, nem, jelszó, valamint a jelszó újra. A jelszavas mezők mellett itt is megtalálható a szem ikon, amely a jelszó láthatóságának átkapcsolását teszi lehetővé.

Az űrlap alján három jelölőnégyzet szerepel: az Általános Szerződési Feltételek (ÁSZF) és az Adatvédelmi Nyilatkozat elfogadásához, valamint a szerzői jog, amelyek hivatkozásként a megfelelő oldalakra mutatnak. Sikeres regisztrációt követően egy pozitív visszajelzést adó animáció jelenik meg, majd átirányításra kerül a bejelentkezési felületre.

### Főoldal

A `Home.jsx`-ben valósítottuk meg a főoldalunkat, a projektünknek ez az oldal adja meg a vázát, amely bemutatja a céget és szolgáltatásait. A weboldalunk fejlécében találhatóak a különböző menüpontok, mint például: Főoldal, Túrák, Bérlés, Galéria, Térkép, Üzemeltetők, valamint a Foglalás, illetve ha valaki admin jogot szerzett, akkor az admin fül is.

A Főoldalunkon megjelennek az elkövetkező ajánlott túráink, valamint az értékelések, a "Miért az Explore" rész, és egy kis galéria is helyet kapott. Az oldal alján elérhetőségek, jogi hivatkozások és a közösségi média ikon található.

### Túrák

A megálmodott Túrák menüpontunkat a `Turak.jsx`-ben valósítottuk meg. Ez a menüpont a második pont a weboldalunkon, viszont úgy gondoljuk, hogy a legfontosabb. Ide kattintva kötelező a regisztráció után a belépés, majd a kívánt túrák foglalhatóvá válnak. Az adminok különböző nehézségű, idejű és fajtájú túrákat ajánlanak a kalandvágyóknak, hogy tartalmas időt tudjanak a szabadban tölteni.

A túráinkra egy rövid űrlap kitöltése után tudnak jelentkezni, amíg azok fel nem teltek. Az adatok elmenthetőek, ha az érdeklődő úgy dönt, hogy visszatérne egy túrára, gyorsabban és gördülékenyebben tud jelentkezni. A túra végeztével lehetőség van a túrákat értékelni a felhasználók tetszése szerint. Az oldal a főoldalon bemutatott egységes fejléccel és lábléccel rendelkezik.

### Bérlés

A megszervezésre kerülő túráinkhoz a biztonság és az előírások miatt, valamint ha valaki nem rendelkezik olyan túrafelszereléssel, amilyet a kaland megkövetel, akkor lehetőség van a felszerelések bérlésére. Az eszközöket lehet szűrni a kívánt módon, valamint értékelni.

A kölcsönzés menete:
1. A túrázó kiválaszt egy tetszőleges terméket (amennyiben van a készleten; ha elfogyott, kiírja, hogy "nincs a készleten").
2. Kiválasztja a bérlés kezdő, illetve a befejező dátumot.
3. Ennek függvényében ÁR/NAP ra tudnak bérelni.
4. A kosárból lehet törölni egyesével, valamint kiüríteni az egész kosarat.
5. A sikeres fizetést követően a bérelt termékből a készlet csökkeni fog, és a túrázó megkapja a bérelt termékeket, majd indulhat a várva várt túra.

### Galéria

A projektünkben úgy gondoltuk, hogy elengedhetetlen egy jól kinéző galéria, ami úgy igazán megfogja a kalandorokat. A képgyűjteményünket a `Galeria.jsx`-ben hoztuk létre, ahol az eddig már megszervezésre került túráinkból csempésztünk egy kis betekintést, hogy milyen is Explorosnak lenni.

A galériában lehetőség van helyszínek szerint keresni, ezáltal hatékonyabban lehet kiszűrni a kívánt fotókat. A képeknél feltüntetjük a helyszín nevét, valamint az évszámot, hogy mikor készültek a nagyszerű képek. A képgyűjteményt lapozható módon oldottuk meg, a nagyításra is lehetőség van az apróbb elemek végett.

### Térkép

A munkánk során egy merész gondolat végett úgy döntöttünk, hogy egy hőtérkép segítségével megpróbáljuk szemléltetni a túrázóknak, hogy az eddig véghezvitt expedíciók merre is törtek utat. Ebben a menüpontban az 5 különböző túra aktivitását lehet megnézni az elmúlt 2 évben, valamint a belföldi illetve külföldi helyszínek számosságát, a terepi napok sokaságát és a megtett túrák hosszát kilométerben.

Egy kis elemzés is megtalálható a menüpontban: az elmúlt 2 évet hasonlítja össze egymással a túrák számát, távolságát és a meglátogatott országokat vizsgálja.

### Üzemeltetők

Az oldalunkon megtalálható egy Üzemeltetők menüpont is. Itt főként a két alapítóról esik szó, hogy kik is vagyunk mi valójában, illetve miért is hoztuk létre ezt a túrázós céget és a hozzá tartozó webalkalmazást. Az `Uzemeltetok.jsx`-ben jött létre ez a kis fül az oldalhoz, ami szemlélteti kötődésünket a természethez, a vad környezethez, a mozgáshoz.

Egy esetlegesen felvetődő kérdés esetén lehetőség van felvenni a kapcsolatot velünk, a cég megálmodóival, és mi mindenben és mindenhová elkalauzoljuk Önöket. Illetve feltüntettük az elérhetőségeinket is egy kis rublikában.

### Tests mappa - Selenium tesztek

Ennek a fájlnak a szerepe a projektünkben, hogy automatizált böngészős teszteket futtasson a Selenium WebDriver segítségével, amelyek ellenőrzik a frontend alkalmazás különböző oldalainak elérhetőségét és betölthetőségét. A tesztfájl megnyitja a Chrome böngészőt, majd egymás után felkeresi a helyi fejlesztői szerveren futó alkalmazás főbb oldalait -- például a kezdőlapot, a túrák oldalt, a bérlés oldalt, a galériát, a profil oldalt és a foglalás oldalt.

Minden sikeresen betöltött oldalt egy-egy sikeres tesztként könyvel el, és a futás végén összesíti a sikeres és sikertelen tesztek számát. Ezáltal gyorsan kiderül, ha valamelyik oldal nem töltődik be megfelelően, például szerverhiba, útvonal változás vagy egyéb frontend hiba miatt.

## Projekthez használt programok

- **Microsoft Office (Word, PowerPoint)**: A Microsoft Office-on belül a Word a projekt dokumentálását segítette elő, míg a PowerPoint a feladatunk bemutatásánál nyújtott nagy segítséget. Emellett az ICDL tanúsítványuknak köszönhetően már rendelkeztünk ezen programokban kellő ismerettel, tapasztalattal.
- **Figma**: A Figma nélkülözhetetlen volt ahhoz, hogy a frontendünk úgy nézzen ki, ahogy a legelején megálmodtuk.
- **Canva**: Projektünk nulladik lépéseként elkészítettük a logót, mely arculatot és ötleteket biztosított a további munkánk során.
- **Inkscape**: Vektorgrafika készítéséhez.
- **Google Drive**: Nagyobb fájlok esetén szükséges volt a Drive használata, hiszen emailben korlátozott a lehetőségünk.
- **VTK - Moodle**: Ezen a felületen kommunikáltunk tanárainkkal az esetleges problémáinkról, nehézségeinkről.
- **Messenger**: A programban észlelt problémákat itt egyeztettük egymással, illetve időpontokat egyeztettünk.
- **Email**: Fájlok, képek, üzenetek küldésére használtuk.
- **Discord**: Itt kommunikáltunk, mikor szükséges volt rá. Ingyenes, és az egyik legnépszerűbb kommunikációs platform manapság.
- **GitHub**: A nap végén mindig ide kerültek fel a legfrissebb kódjaink. Egy rendkívül fontos és nélkülözhetetlen program volt a munkánk során.
- **Visual Studio Code**: A kedvenc integrált fejlesztő környezetünk. Könnyedén megtaláltuk a hibáinkat, illetve tartottuk magunkat a "Clean Code" elvéhez, amiben ez a program nagy segítséget nyújtott.
- **Docker**: A Docker a gördülékeny munkánkat segítette, mert lehetővé tette, hogy egyszerre fusson a frontend, backend és adatbázis feladatrészünk.
- **PostMan**: A backendünk tesztelésénél bírt nagy jelentőséggel, ezzel tudtuk használni a GET, POST, PUT lekéréseket.
- **Pexels**: Különböző képeket kerestünk rajta, amelyek elengedhetetlenek voltak az oldal minőségbeli kinézetéhez.
- **Adobe Photoshop**: Fontos program volt a képeink minőségének feljavításához, illetve színezéséhez.

## Reflektálás

A vizsgaremek keretében egy túraszervező és tervező webes alkalmazást valósítottunk meg, ahol a kalandoroknak lehetőségük van regisztrálni, majd ezt követően bejelentkezni és élvezni, valamint használni az oldal által kínált lehetőségeket, mint pl. bérlés, galéria, túrák, hőtérkép. Az adminoknak külön felületet hoztunk létre az oldal kezelésének érdekében.

Mi azért szerettük volna ezt a projektet megvalósítani, mert a hasonló érdeklődésünk végett arra a döntésre jutottunk, hogy a mai társadalom mozgás- és természetszegény életet folytat.

A projekt létrejöttét annak köszönhetjük, hogy elsajátítottuk a szükséges technológiákat:
- a frontendet a React keretrendszerrel, a Vite segítségével készítettük el,
- a backendet Node.js és Express használatával, MVC mintát követve építettük meg,
- adatbázisként MySQL-t választottunk,
- a konténerizációhoz pedig a Docker-t hívtuk segítségül.

A tanultak gyakorlatba ültetésével végül egy teljesen működő alkalmazást tudtunk létrehozni.

A vizsgaremekünk fő célja, hogy egy könnyen kezelhető, de tartalmas webes alkalmazást hozzunk létre, ahol a túra kedvelők, illetve a mozgást és a jó társaságot igénylő hétköznapi emberek egy kicsit ki tudjanak szakadni a mindennapokból. Az adminok kezelik az oldal működését, vagy akár túrákat hoznak létre, kezelhetik a feladatokat, míg a túrázó élvezi az oldal adta lehetőségeket. A projektünk során úgy gondoljuk, sikerült teljesíteni a magunk elé kitűzött célt.

A fejlesztést az alábbi sorrendben végeztük el:
1. Először kidolgoztuk az adatbázis sémafelépítését.
2. Majd kialakítottuk a backend API-t MVC architektúrában, ahol a modellek felelnek az adatbázis-műveletekért, a controllerek tartalmazzák az üzleti logikát, a route-ok pedig a végpontokat kötik össze a controller-függvényekkel.
3. Ezt követően létrehoztuk a React frontendet, amelyben a komponensek biztosítják a felhasználói felületet.
4. Végül tesztekkel (Jest a backendhez, Selenium a frontendhez) ellenőriztük a megfelelő működést, majd Docker segítségével konténerbe zártuk az alkalmazást.

A projektünk jövőbeli fejlesztését már tervezzük, mint például az automatikus chatbot, vagy például szponzorok szerzése, valamint egy automatikusan generált túrafüzet nyomtatása túráinkhoz.

## Melléklet

### Gantt diagram

A projektünk sikerességéhez nagyban hozzájárult az előre kiszabott határidők pontos betartása, melyet a létrehozott Gantt diagram és a jól megtervezett munkafolyamat, szervezettségünk biztosított, hogy mindent időben és pontosan teljesítsünk. A határidőknek köszönhetően nagyjából sikerült bekalkulálni, hogy az adott időre mit, hogyan kell elkészíteni, mit szeretnénk látni.

A Gantt diagram szemlélteti a projekt időbeli ütemezését, a főbb mérföldköveket és a feladatok egymásra épülését.