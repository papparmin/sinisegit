import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Chip,
  Stack,
  Tabs,
  Tab,
  Divider,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Dialog,
  DialogContent,
} from "@mui/material";
import { TOURS } from "../data/tours";

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function PolicySection({ title, text }) {
  return (
    <Box sx={{ mb: 1.4 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 13, mb: 0.4 }}>{title}</Typography>
      <Typography sx={{ opacity: 0.86, fontSize: 13, lineHeight: 1.6 }}>{text}</Typography>
    </Box>
  );
}

export default function TuraReszletek() {
  const { slug } = useParams();
  const tour = React.useMemo(() => TOURS.find((t) => t.slug === slug), [slug]);

  const [tab, setTab] = React.useState(0);

  // ✅ Komolyabb elfogadás: dialog + accept gomb állítja true-ra
  const [termsOpen, setTermsOpen] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);

  const [booking, setBooking] = React.useState({
    date: "",
    people: 2,
    fullName: "",
    email: "",
    phone: "",
    note: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptedTermsAt: null,
    acceptedPrivacyAt: null,
  });

  if (!tour) {
    return (
      <Container sx={{ pt: 12, pb: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Nincs ilyen túra: <b>{slug}</b>
        </Alert>
        <Button component={RouterLink} to="/turak" variant="contained">
          Vissza a túrákhoz
        </Button>
      </Container>
    );
  }

  const acceptTerms = () => {
    setBooking((s) => ({
      ...s,
      acceptTerms: true,
      acceptedTermsAt: new Date().toISOString(),
    }));
    setTermsOpen(false);
  };

  const acceptPrivacy = () => {
    setBooking((s) => ({
      ...s,
      acceptPrivacy: true,
      acceptedPrivacyAt: new Date().toISOString(),
    }));
    setPrivacyOpen(false);
  };

  const submitBooking = (e) => {
    e?.preventDefault?.();

    if (!booking.date) return alert("Válassz dátumot!");
    if (!booking.fullName.trim()) return alert("Add meg a neved!");
    if (!booking.email.trim()) return alert("Add meg az emailed!");
    if (!booking.phone.trim()) return alert("Add meg a telefonszámod!");
    if (!booking.acceptTerms) return alert("Fogadd el a felhasználási feltételeket!");
    if (!booking.acceptPrivacy) return alert("Fogadd el az adatkezelési tájékoztatót!");

    console.log("FOGLALÁS:", {
      tour: tour.title,
      slug: tour.slug,
      ...booking,
    });

    alert("Foglalás elküldve (demo) – backend majd később.");
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
      <Container sx={{ pt: 12, pb: 6 }}>
        <Button component={RouterLink} to="/turak" variant="outlined" sx={{ mb: 2 }}>
          ← Vissza a túrákhoz
        </Button>

        <Card sx={{ overflow: "hidden" }}>
          <CardMedia
            component="img"
            image={tour.cover}
            alt={tour.title}
            sx={{ height: 260, objectFit: "cover" }}
          />

          <Box sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 900, flex: 1 }}>
                {tour.title}
              </Typography>

              <Typography sx={{ fontWeight: 900, fontSize: 15 }}>
                {Number(tour.priceFt || 0).toLocaleString("hu-HU")} Ft
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
              <Chip size="small" label={tour.region || "—"} />
              <Chip size="small" label={tour.duration || "—"} />
              <Chip
                size="small"
                label={tour.difficulty || "—"}
                sx={{
                  bgcolor: "rgba(46,204,113,.14)",
                  border: "1px solid rgba(46,204,113,.25)",
                }}
              />
              <Chip size="small" label={tour.season || "—"} sx={{ opacity: 0.9 }} />
            </Stack>

            <Typography sx={{ mt: 1.6, opacity: 0.8 }}>{tour.shortDesc || ""}</Typography>

            <Divider sx={{ my: 2 }} />

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTab-root": { fontWeight: 900 },
                "& .MuiTabs-indicator": { backgroundColor: "#2ecc71" },
              }}
            >
              <Tab label="Leírás" />
              <Tab label="Foglalás" />
            </Tabs>

            {/* LEÍRÁS */}
            <TabPanel value={tab} index={0}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Részletes leírás</Typography>

              {(tour.longDesc || []).map((p, i) => (
                <Typography key={i} sx={{ opacity: 0.82, mb: 1.2, lineHeight: 1.7 }}>
                  {p}
                </Typography>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 900, mb: 1 }}>Fő pontok</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.2, opacity: 0.85 }}>
                {(tour.highlights || []).map((h, i) => (
                  <li key={i}>
                    <Typography sx={{ opacity: 0.85 }}>{h}</Typography>
                  </li>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 900, mb: 1 }}>Program / Útiterv</Typography>
              <Box sx={{ display: "grid", gap: 1.2 }}>
                {(tour.itinerary || []).map((it, i) => (
                  <Box
                    key={i}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,.14)",
                      bgcolor: "rgba(255,255,255,.05)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, mb: 0.4 }}>{it.day}</Typography>
                    <Typography sx={{ opacity: 0.82 }}>{it.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Tartalmazza</Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.2, opacity: 0.85 }}>
                    {(tour.includes || []).map((x, i) => (
                      <li key={i}>
                        <Typography sx={{ opacity: 0.85 }}>{x}</Typography>
                      </li>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Nem tartalmazza</Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.2, opacity: 0.85 }}>
                    {(tour.notIncludes || []).map((x, i) => (
                      <li key={i}>
                        <Typography sx={{ opacity: 0.85 }}>{x}</Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 900, mb: 0.6 }}>Találkozó</Typography>
              <Typography sx={{ opacity: 0.82 }}>
                {tour.meetingPoint || "Foglalás után pontosítjuk."}
              </Typography>
            </TabPanel>

            {/* FOGLALÁS */}
            <TabPanel value={tab} index={1}>
              <Typography sx={{ fontWeight: 900, mb: 1 }}>Foglalás</Typography>
              <Typography sx={{ opacity: 0.8, mb: 2 }}>
                Add meg az adatokat – a foglalás elküldése után visszajelzünk (demo).
              </Typography>

              <Box component="form" onSubmit={submitBooking} sx={{ display: "grid", gap: 1.2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                  <TextField
                    label="Dátum *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={booking.date}
                    onChange={(e) => setBooking((s) => ({ ...s, date: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Résztvevők száma *"
                    type="number"
                    inputProps={{ min: 1, max: 20 }}
                    value={booking.people}
                    onChange={(e) => setBooking((s) => ({ ...s, people: Number(e.target.value) }))}
                    fullWidth
                  />
                </Stack>

                <TextField
                  label="Teljes név *"
                  value={booking.fullName}
                  onChange={(e) => setBooking((s) => ({ ...s, fullName: e.target.value }))}
                  fullWidth
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                  <TextField
                    label="Email *"
                    type="email"
                    value={booking.email}
                    onChange={(e) => setBooking((s) => ({ ...s, email: e.target.value }))}
                    fullWidth
                  />
                  <TextField
                    label="Telefonszám *"
                    value={booking.phone}
                    onChange={(e) => setBooking((s) => ({ ...s, phone: e.target.value }))}
                    fullWidth
                  />
                </Stack>

                <TextField
                  label="Megjegyzés (opcionális)"
                  multiline
                  minRows={3}
                  value={booking.note}
                  onChange={(e) => setBooking((s) => ({ ...s, note: e.target.value }))}
                  fullWidth
                />

                {/* ✅ FELHASZNÁLÁSI FELTÉTELEK – link + dialog */}
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={booking.acceptTerms}
                      onChange={(e) => {
                        if (e.target.checked) setTermsOpen(true);
                        else setBooking((s) => ({ ...s, acceptTerms: false, acceptedTermsAt: null }));
                      }}
                    />
                  }
                  label={
                    <span>
                      Elfogadom a{" "}
                      <Linkish onClick={() => setTermsOpen(true)}>felhasználási feltételeket</Linkish> *
                      {booking.acceptTerms && booking.acceptedTermsAt ? (
                        <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 12 }}>
                          (elfogadva)
                        </span>
                      ) : null}
                    </span>
                  }
                />

                {/* ✅ ADATKEZELÉS – link + dialog */}
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={booking.acceptPrivacy}
                      onChange={(e) => {
                        if (e.target.checked) setPrivacyOpen(true);
                        else setBooking((s) => ({ ...s, acceptPrivacy: false, acceptedPrivacyAt: null }));
                      }}
                    />
                  }
                  label={
                    <span>
                      Elfogadom az{" "}
                      <Linkish onClick={() => setPrivacyOpen(true)}>adatkezelési tájékoztatót</Linkish> *
                      {booking.acceptPrivacy && booking.acceptedPrivacyAt ? (
                        <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 12 }}>
                          (elfogadva)
                        </span>
                      ) : null}
                    </span>
                  }
                />

                <Button type="submit" variant="contained" sx={{ mt: 0.5 }}>
                  Foglalás elküldése
                </Button>
              </Box>
            </TabPanel>
          </Box>
        </Card>
      </Container>

      {/* ✅ TERMS DIALOG */}
      <Dialog
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
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1 }}>
            Felhasználási feltételek
          </Typography>

          <Typography sx={{ opacity: 0.85, fontSize: 13, mb: 2 }}>
            A foglalás leadásával elfogadod az alábbi feltételeket.
          </Typography>

          <Box sx={{ maxHeight: "52vh", overflowY: "auto", pr: 1 }}>
            <PolicySection
              title="1) Foglalás és fizetés"
              text="A foglalás elküldése ajánlatkérésnek minősül. A végleges visszaigazolás e-mailben történik. A fizetési feltételek és lemondási szabályok a visszaigazolásban szerepelnek."
            />
            <PolicySection
              title="2) Részvételi feltételek"
              text="A túrán saját felelősségre veszel részt. Köteles vagy a túravezető utasításait betartani, és megfelelő felszereléssel érkezni."
            />
            <PolicySection
              title="3) Biztonság"
              text="Szélsőséges időjárás vagy veszélyhelyzet esetén a szervező módosíthatja az útvonalat vagy a programot, a résztvevők biztonságának érdekében."
            />
            <PolicySection
              title="4) Lemondás"
              text="A lemondás feltételei a visszaigazolásban kerülnek rögzítésre. Visszaélés vagy szabályszegés esetén a részvétel megtagadható."
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
        </DialogContent>
      </Dialog>

      {/* ✅ PRIVACY DIALOG */}
      <Dialog
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
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1 }}>
            Adatkezelési tájékoztató
          </Typography>

          <Typography sx={{ opacity: 0.85, fontSize: 13, mb: 2 }}>
            A foglaláshoz szükséges adatokat kizárólag a szervezéshez és kapcsolattartáshoz használjuk.
          </Typography>

          <Box sx={{ maxHeight: "52vh", overflowY: "auto", pr: 1 }}>
            <PolicySection
              title="1) Kezelt adatok"
              text="Név, e-mail cím, telefonszám, választott túra, létszám, dátum és opcionális megjegyzés."
            />
            <PolicySection
              title="2) Adatkezelés célja"
              text="Foglalás feldolgozása, kapcsolattartás, visszaigazolás, szervezési információk küldése."
            />
            <PolicySection
              title="3) Megőrzés"
              text="Az adatokat a foglalás lezárását követően ésszerű ideig (legfeljebb 12 hónapig) őrizzük meg, kivéve ha jogszabály hosszabb tárolást ír elő."
            />
            <PolicySection
              title="4) Jogok"
              text="Hozzáférés, helyesbítés, törlés, korlátozás, tiltakozás. Kérés esetén e-mailben intézzük."
            />
            <PolicySection
              title="5) Biztonság"
              text="Az adatokhoz csak az arra jogosult személyek férnek hozzá, és azokat biztonságos rendszeren kezeljük."
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" onClick={() => setPrivacyOpen(false)} sx={{ borderRadius: 999 }}>
              Mégse
            </Button>
            <Button variant="contained" onClick={acceptPrivacy} sx={{ borderRadius: 999, fontWeight: 900 }}>
              Elfogadom
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
