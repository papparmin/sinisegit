// frontend/src/components/AuthModal.jsx
import React, { useContext, useMemo, useState } from "react";
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
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Link as RouterLink } from "react-router-dom";

import { AuthContext } from "./AuthContext.jsx";
import logo from "../assets/logonk.png";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";
const BG_URL = "https://images.pexels.com/photos/15382/pexels-photo.jpg";

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 1.2 }}>{children}</Box> : null;
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export default function AuthModal({ open, onClose }) {
  const { login } = useContext(AuthContext);

  const [tab, setTab] = useState(0); // 0 login, 1 register
  const [loading, setLoading] = useState(false);

  // LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // REGISTER — több adat, de kifér scroll nélkül (2 oszlop + kompakt)
  const [reg, setReg] = useState({
    lastName: "",
    firstName: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    birthDate: "",
    gender: "",
    password: "",
    confirm: "",

    // kötelező pipák
    acceptGdpr: false,
    acceptAszf: false,
    acceptCopyright: false,
  });

  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const canLogin = useMemo(() => email.trim() && password.trim(), [email, password]);

  const canRegister = useMemo(() => {
    return (
      reg.lastName.trim() &&
      reg.firstName.trim() &&
      reg.username.trim().length >= 3 &&
      reg.email.trim() &&
      reg.city.trim() &&
      reg.password.trim().length >= 6 &&
      reg.password === reg.confirm &&
      reg.acceptGdpr &&
      reg.acceptAszf &&
      reg.acceptCopyright
    );
  }, [reg]);

  const regPwMismatch = reg.confirm.length > 0 && reg.password !== reg.confirm;
  const regPwShort = reg.password.length > 0 && reg.password.length < 6;

  const resetAll = () => {
    setLoading(false);
    setEmail("");
    setPassword("");
    setShowPw(false);

    setReg({
      lastName: "",
      firstName: "",
      username: "",
      email: "",
      phone: "",
      city: "",
      birthDate: "",
      gender: "",
      password: "",
      confirm: "",
      acceptGdpr: false,
      acceptAszf: false,
      acceptCopyright: false,
    });

    setShowRegPw(false);
    setShowRegConfirm(false);
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  // -------------------- STYLE --------------------
  const paperSx = {
    width: "100vw",
    height: "100vh",
    maxWidth: "100vw",
    maxHeight: "100vh",
    margin: 0,
    borderRadius: 0,
    background: `url("${BG_URL}") center/cover no-repeat`,
    position: "relative",
    overflow: "hidden",
    color: "rgba(255,255,255,0.92)",
    "&:before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.90) 100%)",
      pointerEvents: "none",
    },
    "&:after": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(900px 340px at 18% 10%, rgba(46,204,113,0.18), rgba(0,0,0,0) 60%), radial-gradient(900px 340px at 86% 12%, rgba(120,140,255,0.14), rgba(0,0,0,0) 62%)",
      pointerEvents: "none",
      opacity: 1,
    },
  };

  const fieldSx = {
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.62)" },
    "& .MuiInputBase-root": {
      color: "rgba(255,255,255,0.92)",
      borderRadius: 2.4,
      backgroundColor: "rgba(255,255,255,0.055)",
      backdropFilter: "blur(10px)",
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.13)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.20)" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(46,204,113,0.60)",
      boxShadow: "0 0 0 4px rgba(46,204,113,0.10)",
    },
    "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.55)" },
  };

  const primaryBtnSx = {
    borderRadius: 999,
    py: 1.05,
    px: 4,
    fontWeight: 950,
    textTransform: "none",
    color: "#ffffff",
    background: "linear-gradient(180deg, rgba(46,204,113,1) 0%, rgba(35,182,97,1) 100%)",
    boxShadow: "0 18px 42px rgba(0,0,0,0.38)",
    "&:hover": {
      background: "linear-gradient(180deg, rgba(55,220,125,1) 0%, rgba(40,195,104,1) 100%)",
    },
    "&:disabled": {
      opacity: 0.55,
      color: "rgba(255,255,255,0.75)",
      background: "rgba(46,204,113,0.35)",
    },
  };

  const anim = (delayMs = 0) => ({
    animation: "authSlideIn 520ms cubic-bezier(.2,.9,.1,1) both",
    animationDelay: `${delayMs}ms`,
  });

  // -------------------- API --------------------
  const doLogin = async () => {
    if (!canLogin || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const body = await safeJson(res);

      if (!res.ok) {
        alert(body?.error || body?.message || `Sikertelen belépés (${res.status}).`);
        setLoading(false);
        return;
      }

      if (!body?.token || !body?.user) {
        alert("Login válasz hibás: nincs token vagy user.");
        setLoading(false);
        return;
      }

      login?.(body.token, body.user);
      setLoading(false);
      handleClose();
    } catch {
      alert("Hálózati hiba a belépésnél.");
      setLoading(false);
    }
  };

  const doRegister = async () => {
    if (!canRegister || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // backendnek kell
          firstName: reg.firstName.trim(),
          lastName: reg.lastName.trim(),
          email: reg.email.trim(),
          password: reg.password,

          // extra mezők (ha később bővíted a backendet, már megvan)
          username: reg.username.trim(),
          phone: reg.phone.trim() || undefined,
          city: reg.city.trim(),
          birthDate: reg.birthDate || undefined,
          gender: reg.gender || undefined,
        }),
      });

      const body = await safeJson(res);

      if (!res.ok) {
        alert(body?.error || body?.message || `Sikertelen regisztráció (${res.status}).`);
        setLoading(false);
        return;
      }

      alert(body?.message || "Sikeres regisztráció! Most jelentkezz be.");
      setLoading(false);

      setTab(0);
      setEmail(reg.email.trim());
      setPassword(reg.password);
    } catch {
      alert("Hálózati hiba a regisztrációnál.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={handleClose} fullScreen PaperProps={{ sx: paperSx }}>
      <DialogContent
        sx={{
          p: 0,
          height: "100%",
          position: "relative",
          overflow: "hidden", // NINCS SCROLL
          "@keyframes authSlideIn": {
            from: { opacity: 0, transform: "translate3d(0, 18px, 0) scale(0.985)" },
            to: { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          },
        }}
      >
        {/* Close */}
        <Box sx={{ position: "absolute", top: 18, right: 18, zIndex: 3, ...anim(40) }}>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "rgba(255,255,255,0.82)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.28)",
              backdropFilter: "blur(10px)",
              "&:hover": { background: "rgba(0,0,0,0.38)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* CENTER */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 2,
          }}
        >
          {/* CARD (kifér scroll nélkül) */}
          <Box
            sx={{
              width: "min(720px, 92vw)",
              borderRadius: 5,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(12,14,16,0.84) 0%, rgba(9,11,13,0.78) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
              position: "relative",
              "&:before": {
                content: '""',
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(900px 240px at 20% -10%, rgba(46,204,113,0.14), rgba(0,0,0,0) 60%)",
              },
              ...anim(80),
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 2.2,
                pt: 1.8,
                pb: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1.1,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flex: "0 0 auto",
                }}
              >
                <img
                  src={logo}
                  alt="Explore"
                  style={{ width: "70%", height: "70%", objectFit: "contain" }}
                />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950, letterSpacing: -0.35, fontSize: 16 }}>
                  Explore
                </Typography>
                <Typography sx={{ opacity: 0.72, fontSize: 12.5, mt: 0.2, lineHeight: 1.3 }}>
                  Belépés vagy regisztráció
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                px: 1.2,
                position: "relative",
                zIndex: 1,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 99,
                  backgroundColor: "rgba(46,204,113,0.95)",
                  boxShadow: "0 10px 22px rgba(46,204,113,0.18)",
                },
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.70)",
                  fontWeight: 900,
                  letterSpacing: 0.3,
                  minHeight: 44,
                  textTransform: "none",
                },
                "& .Mui-selected": { color: "rgba(255,255,255,0.95)" },
              }}
            >
              <Tab label="Belépés" />
              <Tab label="Regisztráció" />
            </Tabs>

            <Box sx={{ px: 2.2, pb: 2.0, position: "relative", zIndex: 1 }}>
              {/* LOGIN */}
              <TabPanel value={tab} index={0}>
                <Box sx={{ display: "grid", gap: 1.0 }}>
                  <Box sx={anim(140)}>
                    <TextField
                      size="small"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      autoComplete="email"
                      sx={fieldSx}
                    />
                  </Box>

                  <Box sx={anim(190)}>
                    <TextField
                      size="small"
                      label="Jelszó"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      autoComplete="current-password"
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPw((v) => !v)}
                              edge="end"
                              sx={{ color: "rgba(255,255,255,0.65)" }}
                            >
                              {showPw ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center", ...anim(240) }}>
                    <Button
                      onClick={doLogin}
                      disabled={!canLogin || loading}
                      variant="contained"
                      sx={{ ...primaryBtnSx, width: "min(420px, 100%)" }}
                    >
                      {loading ? "Belépés..." : "Belépés"}
                    </Button>
                  </Box>
                </Box>
              </TabPanel>

              {/* REGISTER — NINCS SCROLL, 2 OSZLOP */}
              <TabPanel value={tab} index={1}>
                <Box sx={{ display: "grid", gap: 1.0 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.0,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      ...anim(140),
                    }}
                  >
                    <TextField
                      size="small"
                      label="Vezetéknév *"
                      value={reg.lastName}
                      onChange={(e) => setReg((p) => ({ ...p, lastName: e.target.value }))}
                      fullWidth
                      sx={fieldSx}
                    />
                    <TextField
                      size="small"
                      label="Keresztnév *"
                      value={reg.firstName}
                      onChange={(e) => setReg((p) => ({ ...p, firstName: e.target.value }))}
                      fullWidth
                      sx={fieldSx}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.0,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      ...anim(190),
                    }}
                  >
                    <TextField
                      size="small"
                      label="Felhasználónév * (min. 3)"
                      value={reg.username}
                      onChange={(e) => setReg((p) => ({ ...p, username: e.target.value }))}
                      fullWidth
                      sx={fieldSx}
                    />
                    <TextField
                      size="small"
                      label="Város *"
                      value={reg.city}
                      onChange={(e) => setReg((p) => ({ ...p, city: e.target.value }))}
                      fullWidth
                      sx={fieldSx}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.0,
                      gridTemplateColumns: { xs: "1fr", sm: "1.25fr 0.75fr" },
                      ...anim(240),
                    }}
                  >
                    <TextField
                      size="small"
                      label="Email *"
                      value={reg.email}
                      onChange={(e) => setReg((p) => ({ ...p, email: e.target.value }))}
                      fullWidth
                      autoComplete="email"
                      sx={fieldSx}
                    />
                    <TextField
                      size="small"
                      label="Telefon"
                      value={reg.phone}
                      onChange={(e) => setReg((p) => ({ ...p, phone: e.target.value }))}
                      fullWidth
                      autoComplete="tel"
                      sx={fieldSx}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.0,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      ...anim(290),
                    }}
                  >
                    <TextField
                      size="small"
                      label="Születési dátum"
                      type="date"
                      value={reg.birthDate}
                      onChange={(e) => setReg((p) => ({ ...p, birthDate: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                    <TextField
                      size="small"
                      select
                      label="Nem (opcionális)"
                      value={reg.gender}
                      onChange={(e) => setReg((p) => ({ ...p, gender: e.target.value }))}
                      fullWidth
                      sx={fieldSx}
                    >
                      <MenuItem value="">Nem adom meg</MenuItem>
                      <MenuItem value="ferfi">Férfi</MenuItem>
                      <MenuItem value="no">Nő</MenuItem>
                      <MenuItem value="egyeb">Egyéb</MenuItem>
                    </TextField>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.0,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      ...anim(340),
                    }}
                  >
                    <TextField
                      size="small"
                      label="Jelszó * (min. 6)"
                      type={showRegPw ? "text" : "password"}
                      value={reg.password}
                      onChange={(e) => setReg((p) => ({ ...p, password: e.target.value }))}
                      fullWidth
                      autoComplete="new-password"
                      sx={fieldSx}
                      helperText={regPwShort ? "Legalább 6 karakter kell." : " "}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowRegPw((v) => !v)}
                              edge="end"
                              sx={{ color: "rgba(255,255,255,0.65)" }}
                            >
                              {showRegPw ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      size="small"
                      label="Jelszó újra *"
                      type={showRegConfirm ? "text" : "password"}
                      value={reg.confirm}
                      onChange={(e) => setReg((p) => ({ ...p, confirm: e.target.value }))}
                      fullWidth
                      autoComplete="new-password"
                      sx={fieldSx}
                      helperText={regPwMismatch ? "Nem egyezik a két jelszó." : " "}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowRegConfirm((v) => !v)}
                              edge="end"
                              sx={{ color: "rgba(255,255,255,0.65)" }}
                            >
                              {showRegConfirm ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* PIPÁK + linkek */}
                  <Box sx={{ display: "grid", gap: 0.2, mt: 0.2, ...anim(390) }}>
                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.acceptGdpr}
                          onChange={(e) => setReg((p) => ({ ...p, acceptGdpr: e.target.checked }))}
                          sx={{
                            color: "rgba(255,255,255,0.45)",
                            "&.Mui-checked": { color: "rgba(46,204,113,0.95)" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 12.5, opacity: 0.84 }}>
                          Elfogadom az{" "}
                          <Typography
                            component={RouterLink}
                            to="/adatvedelem"
                            onClick={handleClose}
                            sx={{
                              display: "inline",
                              color: "rgba(46,204,113,0.95)",
                              fontWeight: 900,
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            Adatvédelmi tájékoztatót (GDPR)
                          </Typography>
                          .
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.acceptAszf}
                          onChange={(e) => setReg((p) => ({ ...p, acceptAszf: e.target.checked }))}
                          sx={{
                            color: "rgba(255,255,255,0.45)",
                            "&.Mui-checked": { color: "rgba(46,204,113,0.95)" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 12.5, opacity: 0.84 }}>
                          Elfogadom az{" "}
                          <Typography
                            component={RouterLink}
                            to="/aszf"
                            onClick={handleClose}
                            sx={{
                              display: "inline",
                              color: "rgba(46,204,113,0.95)",
                              fontWeight: 900,
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            ÁSZF-et
                          </Typography>
                          .
                        </Typography>
                      }
                    />

                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={reg.acceptCopyright}
                          onChange={(e) => setReg((p) => ({ ...p, acceptCopyright: e.target.checked }))}
                          sx={{
                            color: "rgba(255,255,255,0.45)",
                            "&.Mui-checked": { color: "rgba(46,204,113,0.95)" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: 12.5, opacity: 0.84 }}>
                          Tudomásul veszem a{" "}
                          <Typography
                            component={RouterLink}
                            to="/impresszum"
                            onClick={handleClose}
                            sx={{
                              display: "inline",
                              color: "rgba(46,204,113,0.95)",
                              fontWeight: 900,
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            Szerzői jogi
                          </Typography>{" "}
                          feltételeket.
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Gomb középen */}
                  <Box sx={{ display: "flex", justifyContent: "center", ...anim(440) }}>
                    <Button
                      onClick={doRegister}
                      disabled={!canRegister || loading}
                      variant="contained"
                      sx={{ ...primaryBtnSx, width: "min(420px, 100%)" }}
                    >
                      {loading ? "Regisztráció..." : "Regisztráció"}
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}