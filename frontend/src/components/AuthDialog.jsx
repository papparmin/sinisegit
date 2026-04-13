import React from "react";
import {
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Divider,
  Typography,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logonk.png";

const BG_URL =
  "https://images.pexels.com/photos/355770/pexels-photo-355770.jpeg?cs=srgb&dl=pexels-pixabay-355770.jpg&fm=jpg";

function TabPanel({ value, index, children }) {
  return value === index ? <Box>{children}</Box> : null;
}

function PolicySection({ title, text }) {
  return (
    <Box sx={{ mb: 1.4 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 13, mb: 0.35 }}>
        {title}
      </Typography>
      <Typography sx={{ opacity: 0.86, fontSize: 13, lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Box>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography sx={{ fontWeight: 900, fontSize: 12.5, opacity: 0.92 }}>
      {title}
    </Typography>
  );
}

export default function AuthDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);

  const isLogin = tab === 0;

  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [termsOpen, setTermsOpen] = React.useState(false);

  // LOGIN (NINCS 2FA)
  const [login, setLogin] = React.useState({
    identifier: "",
    password: "",
    remember: true,
  });

  // REGISTER (SOK ADAT)
  const [reg, setReg] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    country: "",
    city: "",
    zip: "",
    address1: "",
    address2: "",
    idType: "",
    idNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    password: "",
    confirmPassword: "",
    newsletter: false,
    terms: false,
    privacy: false,
    acceptedTermsAt: null,
    acceptedPrivacyAt: null,
  });

  const menuProps = {
    PaperProps: {
      sx: {
        mt: 0.5,
        borderRadius: 2,
        bgcolor: "rgba(20,20,20,.95)",
        border: "1px solid rgba(255,255,255,.14)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
        "& .MuiMenuItem-root": { fontSize: 13, color: "rgba(255,255,255,.92)" },
        "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,.08)" },
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(46,204,113,.18)" },
        "& .MuiMenuItem-root.Mui-selected:hover": { bgcolor: "rgba(46,204,113,.24)" },
      },
    },
  };

  const handleBackHome = () => {
    if (typeof onClose === "function") onClose();
    navigate("/");
  };

  const handleLoginSubmit = (e) => {
    e?.preventDefault?.();
    if (!login.identifier.trim()) return alert("Add meg az emailt / felhasználónevet.");
    if (!login.password.trim()) return alert("Add meg a jelszót.");
    console.log("LOGIN:", login);
    alert("Belépés elküldve (demo).");
  };

  const handleRegisterSubmit = (e) => {
    e?.preventDefault?.();

    const required = [
      ["firstName", "Keresztnév"],
      ["lastName", "Vezetéknév"],
      ["username", "Felhasználónév"],
      ["email", "Email"],
      ["phone", "Telefonszám"],
      ["birthDate", "Születési dátum"],
      ["gender", "Nem"],
      ["country", "Ország"],
      ["city", "Város"],
      ["zip", "Irányítószám"],
      ["address1", "Cím 1"],
      ["password", "Jelszó"],
      ["confirmPassword", "Jelszó újra"],
    ];

    for (const [key, label] of required) {
      if (!String(reg[key] || "").trim()) return alert(`Hiányzik: ${label}`);
    }

    if (reg.password.length < 8) return alert("A jelszó legyen legalább 8 karakter.");
    if (reg.password !== reg.confirmPassword) return alert("A jelszavak nem egyeznek.");
    if (!reg.terms) return alert("Fogadd el a felhasználási feltételeket.");
    if (!reg.privacy) return alert("Fogadd el az adatkezelési tájékoztatót.");

    console.log("REGISTER:", reg);
    alert("Regisztráció elküldve (demo).");
  };

  // Terms dialog acceptance
  const acceptTerms = () => {
    setReg((s) => ({
      ...s,
      terms: true,
      acceptedTermsAt: new Date().toISOString(),
    }));
    setTermsOpen(false);
  };

  // Privacy dialog acceptance
  const acceptPrivacy = () => {
    setReg((s) => ({
      ...s,
      privacy: true,
      acceptedPrivacyAt: new Date().toISOString(),
    }));
    setPrivacyOpen(false);
  };

  const Linkish = ({ onClick, children }) => (
    <span
      onClick={onClick}
      style={{
        textDecoration: "underline",
        cursor: "pointer",
        fontWeight: 900,
      }}
    >
      {children}
    </span>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            backgroundImage: `linear-gradient(rgba(0,0,0,.60), rgba(0,0,0,.60)), url(${BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
          },
        }}
      >
        <DialogContent
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* KÁRTYA: login = auto height (NINCS LYUK), reg = fix height + scroll */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 720,
              ...(isLogin
                ? {
                    height: "auto",
                    maxHeight: { xs: "86vh", sm: "80vh" },
                  }
                : {
                    height: { xs: "92vh", sm: "84vh" },
                  }),
              bgcolor: "rgba(18,18,18,.66)",
              backdropFilter: "blur(18px) saturate(140%)",
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,.18)",
              boxShadow: "0 24px 80px rgba(0,0,0,.55)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER + LOGO */}
            <Box
              sx={{
                px: 2.5,
                pt: 2,
                pb: 1.2,
                textAlign: "center",
                borderBottom: "1px solid rgba(255,255,255,.12)",
                bgcolor: "rgba(10,10,10,.18)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mb: 0.8 }}>
                <Box component="img" src={logo} alt="Explore logo" sx={{ height: 28, width: "auto" }} />
              </Box>

              <Typography sx={{ fontWeight: 900, fontSize: 16, lineHeight: 1.1 }}>
                Belépés / Regisztráció
              </Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 12, mt: 0.5 }}>
                Válassz fület, töltsd ki figyelmesen.
              </Typography>

              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  mt: 1.2,
                  minHeight: 38,
                  "& .MuiTab-root": { fontWeight: 850, fontSize: 12, minHeight: 38 },
                  "& .MuiTabs-indicator": { backgroundColor: "#2ecc71" },
                }}
              >
                <Tab label="Bejelentkezés" />
                <Tab label="Regisztráció" />
              </Tabs>
            </Box>

            {/* CONTENT */}
            <Box
              sx={{
                ...(isLogin
                  ? { flex: "unset", overflowY: "visible" }
                  : {
                      flex: 1,
                      overflowY: "auto",
                      "&::-webkit-scrollbar": { width: 8 },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255,255,255,.16)",
                        borderRadius: 999,
                      },
                      "&::-webkit-scrollbar-track": { background: "transparent" },
                    }),
                px: 2.5,
                py: 2,
              }}
            >
              {/* LOGIN */}
              <TabPanel value={tab} index={0}>
                <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: "grid", gap: 0.85 }}>
                  <TextField
                    label="Email / Felhasználónév / Telefonszám"
                    value={login.identifier}
                    onChange={(e) => setLogin((s) => ({ ...s, identifier: e.target.value }))}
                    required
                    fullWidth
                    sx={fieldSx}
                  />

                  <TextField
                    label="Jelszó"
                    type="password"
                    value={login.password}
                    onChange={(e) => setLogin((s) => ({ ...s, password: e.target.value }))}
                    required
                    fullWidth
                    sx={fieldSx}
                  />

                  <FormControlLabel
                    sx={{
                      m: 0,
                      "& .MuiFormControlLabel-label": { fontSize: 13, opacity: 0.9 },
                    }}
                    control={
                      <Checkbox
                        size="small"
                        checked={login.remember}
                        onChange={(e) => setLogin((s) => ({ ...s, remember: e.target.checked }))}
                      />
                    }
                    label="Emlékezz rám"
                  />
                </Box>
              </TabPanel>

              {/* REGISTER */}
              <TabPanel value={tab} index={1}>
                <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: "grid", gap: 1.5 }}>
                  <SectionTitle title="Alapadatok" />

                  <Box sx={twoCol}>
                    <TextField
                      label="Vezetéknév *"
                      value={reg.lastName}
                      onChange={(e) => setReg((s) => ({ ...s, lastName: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Keresztnév *"
                      value={reg.firstName}
                      onChange={(e) => setReg((s) => ({ ...s, firstName: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={twoCol}>
                    <TextField
                      label="Felhasználónév *"
                      value={reg.username}
                      onChange={(e) => setReg((s) => ({ ...s, username: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Email *"
                      type="email"
                      value={reg.email}
                      onChange={(e) => setReg((s) => ({ ...s, email: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={twoCol}>
                    <TextField
                      label="Telefonszám *"
                      value={reg.phone}
                      onChange={(e) => setReg((s) => ({ ...s, phone: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Születési dátum *"
                      type="date"
                      value={reg.birthDate}
                      onChange={(e) => setReg((s) => ({ ...s, birthDate: e.target.value }))}
                      required
                      sx={fieldSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>

                  <Box sx={twoCol}>
                    <TextField
                      select
                      label="Nem *"
                      value={reg.gender}
                      onChange={(e) => setReg((s) => ({ ...s, gender: e.target.value }))}
                      required
                      sx={fieldSx}
                      SelectProps={{ MenuProps: menuProps }}
                    >
                      <MenuItem value="male">Férfi</MenuItem>
                      <MenuItem value="female">Nő</MenuItem>
                      <MenuItem value="other">Más</MenuItem>
                      <MenuItem value="na">Nem adom meg</MenuItem>
                    </TextField>

                    <TextField
                      label="Okmány típusa"
                      value={reg.idType}
                      onChange={(e) => setReg((s) => ({ ...s, idType: e.target.value }))}
                      sx={fieldSx}
                      placeholder="pl. személyi / útlevél"
                    />
                  </Box>

                  <Box sx={twoCol}>
                    <TextField
                      label="Okmány szám"
                      value={reg.idNumber}
                      onChange={(e) => setReg((s) => ({ ...s, idNumber: e.target.value }))}
                      sx={fieldSx}
                    />
                    <TextField
                      label="Vészhelyzeti kontakt neve"
                      value={reg.emergencyName}
                      onChange={(e) => setReg((s) => ({ ...s, emergencyName: e.target.value }))}
                      sx={fieldSx}
                    />
                  </Box>

                  <TextField
                    label="Vészhelyzeti telefonszám"
                    value={reg.emergencyPhone}
                    onChange={(e) => setReg((s) => ({ ...s, emergencyPhone: e.target.value }))}
                    fullWidth
                    sx={fieldSx}
                  />

                  <Divider sx={{ borderColor: "rgba(255,255,255,.14)" }} />

                  <SectionTitle title="Lakcím" />

                  <Box sx={twoCol}>
                    <TextField
                      label="Ország *"
                      value={reg.country}
                      onChange={(e) => setReg((s) => ({ ...s, country: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Város *"
                      value={reg.city}
                      onChange={(e) => setReg((s) => ({ ...s, city: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={twoCol}>
                    <TextField
                      label="Irányítószám *"
                      value={reg.zip}
                      onChange={(e) => setReg((s) => ({ ...s, zip: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Cím 1 (utca, házszám) *"
                      value={reg.address1}
                      onChange={(e) => setReg((s) => ({ ...s, address1: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <TextField
                    label="Cím 2 (emelet/ajtó, opcionális)"
                    value={reg.address2}
                    onChange={(e) => setReg((s) => ({ ...s, address2: e.target.value }))}
                    fullWidth
                    sx={fieldSx}
                  />

                  <Divider sx={{ borderColor: "rgba(255,255,255,.14)" }} />

                  <SectionTitle title="Biztonság" />

                  <Box sx={twoCol}>
                    <TextField
                      label="Jelszó (min. 8) *"
                      type="password"
                      value={reg.password}
                      onChange={(e) => setReg((s) => ({ ...s, password: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                    <TextField
                      label="Jelszó újra *"
                      type="password"
                      value={reg.confirmPassword}
                      onChange={(e) => setReg((s) => ({ ...s, confirmPassword: e.target.value }))}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={{ display: "grid", gap: 0.35 }}>
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.newsletter}
                          onChange={(e) => setReg((s) => ({ ...s, newsletter: e.target.checked }))}
                        />
                      }
                      label="Kérek hírlevelet"
                    />

                    {/* FELHASZNÁLÁSI FELTÉTELEK */}
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.terms}
                          onChange={(e) => {
                            if (e.target.checked) setTermsOpen(true);
                            else setReg((s) => ({ ...s, terms: false, acceptedTermsAt: null }));
                          }}
                        />
                      }
                      label={
                        <span>
                          Elfogadom a{" "}
                          <Linkish onClick={() => setTermsOpen(true)}>
                            felhasználási feltételeket
                          </Linkish>{" "}
                          *
                          {reg.terms && reg.acceptedTermsAt ? (
                            <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 12 }}>
                              (elfogadva)
                            </span>
                          ) : null}
                        </span>
                      }
                    />

                    {/* ADATKEZELÉS */}
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.privacy}
                          onChange={(e) => {
                            if (e.target.checked) setPrivacyOpen(true);
                            else setReg((s) => ({ ...s, privacy: false, acceptedPrivacyAt: null }));
                          }}
                        />
                      }
                      label={
                        <span>
                          Elfogadom az{" "}
                          <Linkish onClick={() => setPrivacyOpen(true)}>
                            adatkezelési tájékoztatót
                          </Linkish>{" "}
                          *
                          {reg.privacy && reg.acceptedPrivacyAt ? (
                            <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 12 }}>
                              (elfogadva)
                            </span>
                          ) : null}
                        </span>
                      }
                    />
                  </Box>

                  <Box sx={{ height: 6 }} />
                </Box>
              </TabPanel>
            </Box>

            {/* FOOTER */}
            <Box
              sx={{
                px: 2.5,
                py: 1.2,
                borderTop: "1px solid rgba(255,255,255,.12)",
                bgcolor: "rgba(10,10,10,.18)",
                backdropFilter: "blur(10px)",
                display: "grid",
                gap: 1,
                justifyContent: "center",
              }}
            >
              <Button
                variant="contained"
                sx={actionBtnSx}
                onClick={tab === 0 ? handleLoginSubmit : handleRegisterSubmit}
              >
                {tab === 0 ? "Belépés" : "Regisztráció"}
              </Button>

              <Button variant="outlined" sx={actionBtnSx} onClick={handleBackHome}>
                Vissza a kezdőlapra
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* FELHASZNÁLÁSI FELTÉTELEK DIALOG */}
      <MuiDialog
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(18,18,18,.92)",
            border: "1px solid rgba(255,255,255,.14)",
            backdropFilter: "blur(14px)",
            color: "rgba(255,255,255,.92)",
            borderRadius: 3,
          },
        }}
      >
        <MuiDialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1 }}>
            Felhasználási feltételek
          </Typography>

          <Typography sx={{ opacity: 0.85, fontSize: 13, mb: 2 }}>
            A jelen felhasználási feltételek az EXPLORE weboldal és szolgáltatásainak
            használatára vonatkoznak.
          </Typography>

          <Box sx={{ maxHeight: "52vh", overflowY: "auto", pr: 1 }}>
            <PolicySection
              title="1) A szolgáltatás tárgya"
              text="Az EXPLORE túrák bemutatását, foglalását és kapcsolódó információk elérését biztosítja. A foglalás elküldése ajánlatkérésnek minősül, a szerződés a szolgáltató visszaigazolásával jön létre."
            />
            <PolicySection
              title="2) Regisztráció és fiókhasználat"
              text="A felhasználó köteles valós, pontos adatokat megadni. A hozzáférési adatok (pl. jelszó) biztonságos kezeléséért a felhasználó felel."
            />
            <PolicySection
              title="3) Foglalás és lemondás"
              text="A foglalás részletes feltételei, a fizetés módja, valamint az esetleges lemondási szabályok a visszaigazoló üzenetben kerülnek rögzítésre. A szolgáltató indokolt esetben jogosult a foglalás elutasítására."
            />
            <PolicySection
              title="4) Felelősség és magatartási szabályok"
              text="A túrákon való részvétel saját felelősségre történik. A résztvevő köteles a túravezető utasításait betartani, a biztonsági előírásoknak megfelelően viselkedni, és megfelelő felszereléssel érkezni."
            />
            <PolicySection
              title="5) Programmódosítás"
              text="Szélsőséges időjárás, veszélyhelyzet vagy vis maior esetén a szolgáltató jogosult az útvonalat vagy a programot módosítani, illetve a túrát elhalasztani a résztvevők biztonsága érdekében."
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" onClick={() => setTermsOpen(false)} sx={{ borderRadius: 999 }}>
              Mégse
            </Button>
            <Button variant="contained" onClick={acceptTerms} sx={{ borderRadius: 999, fontWeight: 900 }}>
              Elfogadom
            </Button>
          </Box>
        </MuiDialogContent>
      </MuiDialog>

      {/* ADATKEZELÉSI TÁJÉKOZTATÓ DIALOG */}
      <MuiDialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(18,18,18,.92)",
            border: "1px solid rgba(255,255,255,.14)",
            backdropFilter: "blur(14px)",
            color: "rgba(255,255,255,.92)",
            borderRadius: 3,
          },
        }}
      >
        <MuiDialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1 }}>
            Adatkezelési tájékoztató
          </Typography>

          <Typography sx={{ opacity: 0.85, fontSize: 13, mb: 2 }}>
            Rövid összefoglaló a regisztráció és kapcsolattartás során kezelt adatokról.
          </Typography>

          <Box sx={{ maxHeight: "52vh", overflowY: "auto", pr: 1 }}>
            <PolicySection
              title="1) Kezelt adatok köre"
              text="Regisztráció során kezelhetjük a nevet, felhasználónevet, e-mail címet, telefonszámot, születési dátumot, valamint (ha megadod) lakcímedet és kapcsolattartási adataidat."
            />
            <PolicySection
              title="2) Az adatkezelés célja"
              text="Fiók létrehozása és kezelése, kapcsolattartás, szolgáltatás nyújtása, rendszerbiztonság és visszaélés-megelőzés, valamint – amennyiben szükséges – jogszabályi kötelezettségek teljesítése."
            />
            <PolicySection
              title="3) Jogalap"
              text="A fiók létrehozásához és működtetéséhez szükséges adatokat a szolgáltatás teljesítéséhez kezeljük, egyes esetekben pedig a felhasználó hozzájárulása alapján (pl. hírlevél)."
            />
            <PolicySection
              title="4) Adatmegőrzés"
              text="Az adatokat a fiók fennállása alatt kezeljük. Fiók törlése esetén az adatokat ésszerű időn belül töröljük/anonimizáljuk, kivéve ha jogszabály hosszabb megőrzést ír elő."
            />
            <PolicySection
              title="5) Felhasználói jogok"
              text="Jogod van hozzáférést kérni, helyesbítést, törlést, korlátozást kérni, illetve tiltakozni az adatkezelés ellen. Kérésedet az elérhetőségeinken tudod jelezni."
            />
            <PolicySection
              title="6) Biztonság"
              text="Ésszerű technikai és szervezési intézkedésekkel védjük az adatokat. Jelszót nem tárolunk sima szövegként (backend oldalon jelszóhash szükséges)."
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" onClick={() => setPrivacyOpen(false)} sx={{ borderRadius: 999 }}>
              Mégse
            </Button>
            <Button
              variant="contained"
              onClick={acceptPrivacy}
              sx={{ borderRadius: 999, fontWeight: 900 }}
            >
              Elfogadom
            </Button>
          </Box>
        </MuiDialogContent>
      </MuiDialog>
    </>
  );
}

const twoCol = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 1.3,
};

const fieldSx = {
  "& .MuiInputBase-root": {
    color: "rgba(255,255,255,.92)",
    bgcolor: "rgba(0,0,0,.34)",
    borderRadius: 2,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.22)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.34)",
  },
};

const actionBtnSx = {
  minWidth: 220,
  borderRadius: 999,
  fontWeight: 900,
  py: 0.9,
  px: 3,
  textTransform: "none",
};
