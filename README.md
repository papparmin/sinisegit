# 🌍 Explore – Vizsgaremek  
**Szoftverfejlesztő és -tesztelő záróvizsga remek**  

**Résztvevők:** Németh Gergő és Papp Ármin  

Az Explore egy komplex, full-stack webalkalmazás, amely egyetlen letisztult felületen integrálja a túraszervezést és felszerelésbérlést, miközben erős, személyre szabott közösségi élményt nyújt.

---

## 📑 Tartalomjegyzék
- [A projekt célkitűzése](#1-a-projekt-célkitűzése)
- [Fő funkciók és modulok](#2-fő-funkciók-és-modulok)
- [Technológiai Stack](#3-technológiai-stack)
- [Csapatmunka és Feladatkörök](#4-csapatmunka-és-feladatkörök)
- [Adatbázis architektúra](#5-adatbázis-architektúra)
- [Szoftvertesztelés (QA)](#6-szoftvertesztelés-qa)
- [Fejlesztési eszközök](#7-fejlesztési-eszközök)
- [Környezet és Futtatás](#8-környezet-és-futtatás)

---

## 1. A projekt célkitűzése
A téma kiválasztását a közös érdeklődési körünk inspirálta. A jelenlegi túraszervező és felszerelésbérlő portálok használata során számos felhasználói fájdalompontot azonosítottunk: töredezett információk, elavult felületek és a személyre szabhatóság hiánya.

Célunk egy olyan modern, Single Page Application (SPA) alapú platform megalkotása volt, amely megoldást kínál ezekre a problémákra. Az Explore nem csupán informál a túrákról, hanem intelligens ajánlórendszerével segít a tartalomfeldolgozásban, miközben a felszerelésbérlési lehetőségeket is naprakészen tartja.

---

## 2. Fő funkciók és modulok

**Személyre szabott élmény:**  
Intelligens ajánlórendszer, amely a felhasználó által kedvelt túratípusok (pl. hegyi, vízi, városi) alapján súlyozza a megjelenő tartalmakat.

**Túrákra jelentkezés:**  
Egyszerű, gyors foglalási rendszer időpontválasztással és létszámkezeléssel.

**Felszerelésbérlés:**  
Túrákhoz kapcsolódó felszerelések (sátor, túrabot, hátizsák, stb.) bérlésének integrált kezelése.

**Hőtérkép:**  
Az eddigi túráink vizuális megjelenítése interaktív hőtérképen, amely mutatja a legnépszerűbb útvonalakat.

**Galéria:**  
Képes beszámolók a korábbi túrákról, felhasználók által feltölthető tartalmakkal.

**Üzemeltetők kezelése:**  
Túravezetők és szolgáltatók nyilvántartása, értékelése.

**Adminisztrációs felület:**  
Szerepkör-alapú (RBAC) hozzáférés a tartalmak kezeléséhez (CRUD), a felhasználók menedzseléséhez, foglalások moderálásához és hibajegyek kezeléséhez.

---

## 3. Technológiai Stack
A rendszert szigorúan rétegezett, mikro-szolgáltatás (microservices) szemléletű architektúrában építettük fel.

**Frontend (Kliensoldal):**
- React.js (Vite környezetben)  
- CSS Grid / Flexbox (egyedi, reszponzív dizájn) & Material UI (komponensekhez)  
- Leaflet.js + Heatmap plugin (interaktív hőtérkép modul)  
- Context API (állapotkezelés)  

**Backend (Szerversoldal):**
- Node.js & Express.js (RESTful API, MVC minta alapján)  
- JWT (JSON Web Token) & Bcrypt (autentikáció és kriptográfia)  
- Node-cron (feladatok ütemezése)  

**Adattárolás & Infrastruktúra:**
- MySQL (mélyen normalizált relációs adatbázis)  
- Docker & Docker Compose (konténerizáció)  

---

## 4. Csapatmunka és Feladatkörök
A fejlesztés során az agilis módszertant követtük, heti sprintekkel és folyamatos integrációval (CI). A komplexebb moduloknál páros programozást (pair programming) alkalmaztunk. Mindkét csapattag Full-Stack szemléletben dolgozott.

### Németh Gergő
**Rendszerarchitektúra & Biztonság:** RESTful API váz megtervezése, JWT/Bcrypt alapú autentikáció implementálása.  

**Core Logika:** Foglalási rendszer és bérlési modul aszinkron logikájának fejlesztése.  

**Frontend State Management:** A React környezet felállítása, globális állapotkezelés, kliensoldali útválasztás.  

**QA:** End-to-End (E2E) automatizált tesztelés kiépítése Selenium Webdriver segítségével.  

### Papp Ármin
**Adatbázis & Relációk:** A MySQL ER diagram megtervezése, az adatbázis normalizációja.  

**Hőtérkép & Galéria:** A Leaflet.js hőtérkép modul integrációja és a galéria rendszer végpontjainak megírása.  

**Admin & Üzemeltetők:** Az adminisztrációs vezérlőpult teljes körű fejlesztése és az üzemeltetők kezelőfelülete.  

**QA:** Backend automatikus egységtesztek írása Jest keretrendszerrel.  

---

## 5. Adatbázis architektúra
A rendszer alapját egy 3NF (Harmadik Normálforma) szabályai szerint optimalizált, 14 táblából álló MySQL adatbázis adja. A tervezés két fő logikai blokkra oszlik:

**Felhasználók és interakciók:**  
Felhasználói adatok, hashelt jelszavak, jogosultságok, foglalások, bérlések és személyes túrapreferenciák N:M kapcsolatokkal.

**Túrák és felszerelések:**  
Túrák, útvonalak, üzemeltetők, felszereléskészlet, árak, időpontok és kapcsolódó galériaelemek tárolása.

---

## 6. Szoftvertesztelés (QA)
A magas fokú rendelkezésre állás és hibamentes élmény érdekében többlépcsős tesztelést alkalmaztunk:

**Manuális API tesztelés:**  
Postman segítségével a végpontok és a middleware-ek (pl. jogosultság-ellenőrzés) validálása.

**Backend egységtesztek (Unit Test):**  
A kritikus üzleti logikák (pl. foglalási folyamat hibakezelése) automatizált ellenőrzése Jest segítségével.

**Frontend End-to-End Tesztelés (E2E):**  
Selenium Webdriver alapú, automatizált UI tesztelés, 25 tesztesettel lefedve a felhasználói interakciókat (regisztráció, túrára jelentkezés, bérlés, admin funkciók) Google Chrome környezetében.

---

## 7. Fejlesztési eszközök
**Tervezés & Dizájn:** Figma, Canva, Inkscape  

**Kódolás & Verziók:** Visual Studio Code, Git & GitHub  

**Adatbázis & DevOps:** Docker Desktop, phpMyAdmin  

**Projektmenedzsment:** Vtk Moodle, Discord, Google Drive, Microsoft Office  

---

## 8. Környezet és Futtatás
A platform telepítésének és futtatásának leegyszerűsítésére a teljes architektúrát Docker konténerekbe csomagoltuk. Az érzékeny adatokat a biztonsági standardoknak megfelelően lokális .env fájl kezeli.

**A rendszer indítása:**
A gyökérkönyvtárban elhelyezett inicializáló szkriptünk (init.js) egyetlen paranccsal elindítja a teljes rendszert (ellenőrzi a hálózatot, felhúzza az adatbázist, majd az API-t és a klienst):

```bash
node init.js
