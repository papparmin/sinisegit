import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { AuthContext } from "../components/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

const USERS_PER_PAGE = 8;
const CITIES_PER_PAGE = 10;
const RENTALS_PER_PAGE = 6;

const TOUR_EDITOR_TAB_INDEX = 5;
const RENTAL_LIST_TAB_INDEX = 6;
const RENTAL_EDITOR_TAB_INDEX = 7;

const emptyTourForm = {
  title: "",
  shortDesc: "",
  desc: "",
  category: "",
  level: "",
  dur: "",
  badge: "EXPLORE",
  price: "",
  img: "",
  maxPeople: 20,
};

const emptyRentalForm = {
  nev: "",
  kategoria: "",
  marka: "EXPLORE",
  ar_per_nap: "",
  ertekeles: "",
  suly_kg: "",
  kep: "",
  kepFile: null,
  removeKep: false,
  leiras: "",
  darabszam: 0,
  aktiv: true,
};

function fmtFt(value) {
  return `${Number(value || 0).toLocaleString("hu-HU")} Ft`;
}

function calcAge(dateValue) {
  if (!dateValue) return null;

  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function normalizeImage(value) {
  const raw = String(value || "").trim();

  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
  if (raw.startsWith("uploads/")) return `${API_BASE}/${raw}`;
  return raw;
}

function StatCard({ title, value, helper }) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        background:
          "linear-gradient(180deg, rgba(18,22,20,0.96) 0%, rgba(10,12,11,0.98) 100%)",
        border: "1px solid rgba(120,255,180,0.12)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      }}
    >
      <CardContent>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.62)" }}>
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{ mt: 1, fontWeight: 800, color: "#fff" }}
        >
          {value}
        </Typography>

        {helper ? (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "rgba(255,255,255,0.52)" }}
          >
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        background:
          "linear-gradient(180deg, rgba(18,22,20,0.96) 0%, rgba(10,12,11,0.98) 100%)",
        border: "1px solid rgba(120,255,180,0.12)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.58)" }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          {right || null}
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <Box
      sx={{
        py: 5,
        textAlign: "center",
        borderRadius: 3,
        border: "1px dashed rgba(120,255,180,0.16)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <Typography sx={{ color: "rgba(255,255,255,0.58)" }}>{text}</Typography>
    </Box>
  );
}

export default function Admin() {
  const { token, user } = useContext(AuthContext);

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [rentalLoading, setRentalLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);

  const [userPage, setUserPage] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [rentalPage, setRentalPage] = useState(1);

  const [tourEditorMode, setTourEditorMode] = useState("create");
  const [editingTourId, setEditingTourId] = useState(null);
  const [tourForm, setTourForm] = useState(emptyTourForm);

  const [rentalEditorMode, setRentalEditorMode] = useState("create");
  const [editingRentalId, setEditingRentalId] = useState(null);
  const [rentalForm, setRentalForm] = useState(emptyRentalForm);
  const [rentalImagePreview, setRentalImagePreview] = useState("");

  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const isAdmin = user?.szerepkor === "admin";

  const userPageCount = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const cityPageCount = Math.max(
    1,
    Math.ceil(cityStats.length / CITIES_PER_PAGE)
  );
  const rentalPageCount = Math.max(
    1,
    Math.ceil(rentalItems.length / RENTALS_PER_PAGE)
  );

  const pagedUsers = users.slice(
    (userPage - 1) * USERS_PER_PAGE,
    userPage * USERS_PER_PAGE
  );

  const pagedCities = cityStats.slice(
    (cityPage - 1) * CITIES_PER_PAGE,
    cityPage * CITIES_PER_PAGE
  );

  const pagedRentalItems = rentalItems.slice(
    (rentalPage - 1) * RENTALS_PER_PAGE,
    rentalPage * RENTALS_PER_PAGE
  );

  useEffect(() => {
    if (userPage > userPageCount) setUserPage(1);
  }, [userPage, userPageCount]);

  useEffect(() => {
    if (cityPage > cityPageCount) setCityPage(1);
  }, [cityPage, cityPageCount]);

  useEffect(() => {
    if (rentalPage > rentalPageCount) setRentalPage(1);
  }, [rentalPage, rentalPageCount]);

  useEffect(() => {
    if (rentalForm.kepFile) {
      const objectUrl = URL.createObjectURL(rentalForm.kepFile);
      setRentalImagePreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setRentalImagePreview(normalizeImage(rentalForm.kep));
  }, [rentalForm.kepFile, rentalForm.kep]);

  function resetMessages() {
    setError("");
    setSuccess("");
  }

  async function loadDashboard() {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers,
      });

      setStats(res.data?.stats || null);
      setUsers(res.data?.users || []);
      setTours(res.data?.tours || []);
      setCityStats(res.data?.cityStats || []);
      setAgeGroups(res.data?.ageGroups || []);
    } catch (err) {
      console.error("ADMIN DASHBOARD LOAD HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült betölteni az admin adatokat."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadContactMessages() {
    if (!token) return;

    try {
      setContactLoading(true);

      const res = await axios.get(`${API_BASE}/api/admin/contact-messages`, {
        headers,
      });

      setContactMessages(res.data || []);
    } catch (err) {
      console.error("CONTACT LOAD HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült betölteni a kapcsolat üzeneteket."
      );
    } finally {
      setContactLoading(false);
    }
  }

  async function loadRentalProducts() {
    if (!token) return;

    try {
      setRentalLoading(true);

      const res = await axios.get(`${API_BASE}/api/admin/berles-termekek`, {
        headers,
      });

      setRentalItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("RENTAL LOAD HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült betölteni a webshop termékeket."
      );
    } finally {
      setRentalLoading(false);
    }
  }

  useEffect(() => {
    if (!token || !isAdmin) return;

    loadDashboard();
    loadContactMessages();
    loadRentalProducts();
  }, [token, isAdmin]);

  function updateTourForm(field, value) {
    setTourForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateRentalForm(field, value) {
    setRentalForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function startCreateTour() {
    resetMessages();
    setTourEditorMode("create");
    setEditingTourId(null);
    setTourForm({
      ...emptyTourForm,
      badge: "EXPLORE",
      maxPeople: 20,
    });
    setTab(TOUR_EDITOR_TAB_INDEX);
  }

  function startEditTour(tour) {
    resetMessages();
    setTourEditorMode("edit");
    setEditingTourId(tour.id);
    setTourForm({
      title: tour.title || "",
      shortDesc: tour.shortDesc || "",
      desc: tour.desc || "",
      category: tour.category || "",
      level: tour.level || "",
      dur: tour.dur || "",
      badge: tour.badge || "EXPLORE",
      price: tour.price ?? "",
      img: tour.img || "",
      maxPeople: tour.maxPeople || 20,
    });
    setTab(TOUR_EDITOR_TAB_INDEX);
  }

  function resetTourEditor() {
    setTourEditorMode("create");
    setEditingTourId(null);
    setTourForm({
      ...emptyTourForm,
      badge: "EXPLORE",
      maxPeople: 20,
    });
  }

  async function handleSaveTour() {
    try {
      resetMessages();
      setSaving(true);

      const payload = {
        title: String(tourForm.title || "").trim(),
        shortDesc: String(tourForm.shortDesc || "").trim(),
        desc: String(tourForm.desc || "").trim(),
        category: String(tourForm.category || "").trim(),
        level: String(tourForm.level || "").trim(),
        dur: String(tourForm.dur || "").trim(),
        badge: String(tourForm.badge || "EXPLORE").trim(),
        price: Number(tourForm.price || 0),
        img: String(tourForm.img || "").trim(),
        maxPeople: Number(tourForm.maxPeople || 20),
      };

      if (tourEditorMode === "create") {
        await axios.post(`${API_BASE}/api/admin/tours`, payload, { headers });
        setSuccess("Túra sikeresen létrehozva.");
      } else {
        await axios.put(
          `${API_BASE}/api/admin/tours/${editingTourId}`,
          payload,
          { headers }
        );
        setSuccess("Túra sikeresen frissítve.");
      }

      resetTourEditor();
      await loadDashboard();
      setTab(4);
    } catch (err) {
      console.error("TOUR SAVE HIBA:", err);
      setError(
        err?.response?.data?.error || "Nem sikerült menteni a túrát."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleTourActive(tour) {
    try {
      resetMessages();
      setSaving(true);

      await axios.put(
        `${API_BASE}/api/admin/tours/${tour.id}/status`,
        { aktiv: !tour.active },
        { headers }
      );

      setSuccess(
        !tour.active
          ? "A túra újra látható."
          : "A túra el lett rejtve a látogatók elől."
      );

      await loadDashboard();
    } catch (err) {
      console.error("TOUR STATUS HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült módosítani a túra állapotát."
      );
    } finally {
      setSaving(false);
    }
  }

  function startCreateRental() {
    resetMessages();
    setRentalEditorMode("create");
    setEditingRentalId(null);
    setRentalForm({
      ...emptyRentalForm,
      marka: "EXPLORE",
      aktiv: true,
      darabszam: 0,
    });
    setTab(RENTAL_EDITOR_TAB_INDEX);
  }

  function startEditRental(item) {
    resetMessages();
    setRentalEditorMode("edit");
    setEditingRentalId(item.id);
    setRentalForm({
      nev: item.nev || "",
      kategoria: item.kategoria || "",
      marka: item.marka || "EXPLORE",
      ar_per_nap:
        item.ar_per_nap === null || typeof item.ar_per_nap === "undefined"
          ? ""
          : item.ar_per_nap,
      ertekeles:
        item.ertekeles === null || typeof item.ertekeles === "undefined"
          ? ""
          : item.ertekeles,
      suly_kg:
        item.suly_kg === null || typeof item.suly_kg === "undefined"
          ? ""
          : item.suly_kg,
      kep: item.kep || "",
      kepFile: null,
      removeKep: false,
      leiras: item.leiras || "",
      darabszam:
        item.darabszam === null || typeof item.darabszam === "undefined"
          ? 0
          : item.darabszam,
      aktiv: !!item.aktiv,
    });
    setTab(RENTAL_EDITOR_TAB_INDEX);
  }

  function resetRentalEditor() {
    setRentalEditorMode("create");
    setEditingRentalId(null);
    setRentalForm({
      ...emptyRentalForm,
      marka: "EXPLORE",
      aktiv: true,
      darabszam: 0,
    });
  }

  function handleRentalFileChange(event) {
    const file = event.target.files?.[0] || null;

    setRentalForm((prev) => ({
      ...prev,
      kepFile: file,
      removeKep: false,
    }));
  }

  function handleRemoveRentalImage() {
    setRentalForm((prev) => ({
      ...prev,
      kep: "",
      kepFile: null,
      removeKep: true,
    }));
  }

  async function handleSaveRental() {
    try {
      resetMessages();
      setSaving(true);

      const formData = new FormData();

      formData.append("nev", String(rentalForm.nev || "").trim());
      formData.append(
        "kategoria",
        String(rentalForm.kategoria || "").trim() || "Egyéb"
      );
      formData.append(
        "marka",
        String(rentalForm.marka || "").trim() || "EXPLORE"
      );
      formData.append(
        "ar_per_nap",
        String(rentalForm.ar_per_nap ?? "").trim() || "0"
      );
      formData.append(
        "ertekeles",
        String(rentalForm.ertekeles ?? "").trim()
      );
      formData.append("suly_kg", String(rentalForm.suly_kg ?? "").trim());
      formData.append("leiras", String(rentalForm.leiras || "").trim());
      formData.append(
        "darabszam",
        String(rentalForm.darabszam ?? "").trim() || "0"
      );
      formData.append("aktiv", rentalForm.aktiv ? "true" : "false");

      if (rentalForm.removeKep) {
        formData.append("removeKep", "true");
      }

      if (rentalForm.kepFile) {
        formData.append("kep", rentalForm.kepFile);
      } else if (String(rentalForm.kep || "").trim()) {
        formData.append("kep", String(rentalForm.kep || "").trim());
      }

      if (rentalEditorMode === "create") {
        await axios.post(`${API_BASE}/api/admin/berles-termekek`, formData, {
          headers,
        });
        setSuccess("Webshop termék sikeresen létrehozva.");
      } else {
        await axios.put(
          `${API_BASE}/api/admin/berles-termekek/${editingRentalId}`,
          formData,
          { headers }
        );
        setSuccess("Webshop termék sikeresen frissítve.");
      }

      resetRentalEditor();
      await loadRentalProducts();
      setTab(RENTAL_LIST_TAB_INDEX);
    } catch (err) {
      console.error("RENTAL SAVE HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült menteni a webshop terméket."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRentalActive(item) {
    try {
      resetMessages();
      setSaving(true);

      await axios.put(
        `${API_BASE}/api/admin/berles-termekek/${item.id}/status`,
        { aktiv: !item.aktiv },
        { headers }
      );

      setSuccess(
        item.aktiv
          ? "A webshop termék inaktív lett."
          : "A webshop termék újra aktív."
      );

      await loadRentalProducts();
    } catch (err) {
      console.error("RENTAL STATUS HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült módosítani a termék állapotát."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRental(item) {
    const confirmed = window.confirm(
      `Biztosan törölni akarod ezt a terméket?\n\n${item.nev}`
    );

    if (!confirmed) return;

    try {
      resetMessages();
      setSaving(true);

      await axios.delete(
        `${API_BASE}/api/admin/berles-termekek/${item.id}`,
        {
          headers,
        }
      );

      setSuccess("Webshop termék sikeresen törölve.");
      await loadRentalProducts();
    } catch (err) {
      console.error("RENTAL DELETE HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült törölni a webshop terméket."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(targetUser, newRole) {
    try {
      resetMessages();
      setSaving(true);

      await axios.put(
        `${API_BASE}/api/admin/users/${targetUser.id}/role`,
        { szerepkor: newRole },
        { headers }
      );

      setSuccess("Szerepkör sikeresen frissítve.");
      await loadDashboard();
    } catch (err) {
      console.error("ROLE CHANGE HIBA:", err);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült a felhasználó szerepkörét módosítani."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleContactStatusChange(messageId, status) {
    try {
      resetMessages();
      setSaving(true);

      await axios.put(
        `${API_BASE}/api/admin/contact-messages/${messageId}/status`,
        { status },
        { headers }
      );

      setSuccess("Üzenet státusz frissítve.");
      await loadContactMessages();
    } catch (err) {
      console.error("CONTACT STATUS HIBA:", err);
      setError(
        err?.response?.data?.error || "Nem sikerült a státuszt frissíteni."
      );
    } finally {
      setSaving(false);
    }
  }

  function openReplyDialog(message) {
    resetMessages();
    setReplyTarget(message);
    setReplyText(message?.admin_valasz || "");
    setReplyDialogOpen(true);
  }

  function closeReplyDialog() {
    setReplyDialogOpen(false);
    setReplyTarget(null);
    setReplyText("");
  }

  async function handleSaveReply() {
    if (!replyTarget) return;

    try {
      resetMessages();
      setSaving(true);

      await axios.put(
        `${API_BASE}/api/admin/contact-messages/${replyTarget.id}/reply`,
        { adminValasz: replyText },
        { headers }
      );

      setSuccess("Válasz sikeresen elküldve.");
      closeReplyDialog();
      await loadContactMessages();
    } catch (err) {
      console.error("REPLY HIBA:", err);
      console.error("BACKEND VALASZ:", err?.response?.data);
      setError(
        err?.response?.data?.error ||
          "Nem sikerült elküldeni az emailes választ."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMessage(messageId) {
    const confirmed = window.confirm(
      "Biztosan törölni akarod ezt az üzenetet?"
    );

    if (!confirmed) return;

    try {
      resetMessages();
      setSaving(true);

      await axios.delete(`${API_BASE}/api/admin/contact-messages/${messageId}`, {
        headers,
      });

      setSuccess("Üzenet sikeresen törölve.");
      await loadContactMessages();
    } catch (err) {
      console.error("MESSAGE DELETE HIBA:", err);
      setError(
        err?.response?.data?.error || "Nem sikerült törölni az üzenetet."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <Box sx={{ p: 4, color: "#fff" }}>
        <Alert severity="warning">Nincs bejelentkezve admin felhasználó.</Alert>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, color: "#fff" }}>
        <Alert severity="error">
          Nincs jogosultságod az admin felülethez.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
        py: 4,
        background:
          "radial-gradient(circle at top left, rgba(68,216,132,0.12) 0%, rgba(10,10,10,0) 35%), linear-gradient(180deg, #050807 0%, #070909 100%)",
        color: "#fff",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: "#46d884" }}>
              EXPLORE • ADMIN
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Admin felület
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Felhasználók, túrák, webshop termékek, üzenetek és statisztikák egy
              helyen.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                loadDashboard();
                loadContactMessages();
                loadRentalProducts();
              }}
              sx={{
                borderColor: "rgba(120,255,180,0.24)",
                color: "#fff",
                borderRadius: 999,
              }}
            >
              Frissítés
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startCreateTour}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
                color: "#04110a",
                boxShadow: "0 12px 28px rgba(46,204,113,0.28)",
              }}
            >
              Új túra
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={startCreateRental}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #b7ffcf 0%, #46d884 100%)",
                color: "#04110a",
                boxShadow: "0 12px 28px rgba(46,204,113,0.22)",
              }}
            >
              Új webshop termék
            </Button>
          </Stack>
        </Stack>

        {!!error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 3 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {!!success && (
          <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: 3 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(18,22,20,0.96) 0%, rgba(10,12,11,0.98) 100%)",
            border: "1px solid rgba(120,255,180,0.12)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              "& .MuiTab-root": {
                color: "rgba(255,255,255,0.64)",
                fontWeight: 700,
                minHeight: 58,
              },
              "& .Mui-selected": {
                color: "#46d884 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#46d884",
                height: 3,
                borderRadius: 3,
              },
            }}
          >
            <Tab label="Áttekintés" />
            <Tab label="Felhasználók" />
            <Tab label="Üzenetek" />
            <Tab label="Városok" />
            <Tab label="Túrák" />
            <Tab label="Túraszerkesztő" />
            <Tab label="Webshop" />
            <Tab label="Webshop-szerkesztő" />
          </Tabs>
        </Card>

        {loading ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <CircularProgress sx={{ color: "#46d884" }} />
          </Box>
        ) : (
          <>
            {tab === 0 && (
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <StatCard
                    title="Összes felhasználó"
                    value={stats?.totalUsers || 0}
                    helper={`${stats?.adminCount || 0} admin • ${
                      stats?.normalUserCount || 0
                    } user`}
                  />
                  <StatCard
                    title="Összes túra"
                    value={stats?.totalTours || 0}
                    helper={`${stats?.activeTours || 0} aktív • ${
                      stats?.inactiveTours || 0
                    } rejtett`}
                  />
                  <StatCard
                    title="Webshop termék"
                    value={rentalItems.length}
                    helper={`${
                      rentalItems.filter((item) => item.aktiv).length
                    } aktív • ${
                      rentalItems.filter((item) => !item.aktiv).length
                    } inaktív`}
                  />
                  <StatCard
                    title="Bérlés bevétel"
                    value={fmtFt(stats?.totalRentalRevenue || 0)}
                    helper={`${stats?.totalRentalOrders || 0} rendelés`}
                  />
                </Box>

                <SectionCard
                  title="Korosztályok"
                  subtitle="Gyors áttekintés a regisztrált felhasználókról."
                >
                  {ageGroups.length === 0 ? (
                    <EmptyState text="Nincs elég adat a korosztályokhoz." />
                  ) : (
                    <Stack spacing={1.2}>
                      {ageGroups.map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            p: 1.5,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(120,255,180,0.08)",
                          }}
                        >
                          <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                            {item.label}
                          </Typography>
                          <Chip
                            label={`${item.count} fő`}
                            sx={{
                              background: "rgba(70,216,132,0.16)",
                              color: "#d8ffe7",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </SectionCard>

                <SectionCard
                  title="Top városok"
                  subtitle="A részletes, lapozható lista a Városok fülön van."
                >
                  {cityStats.length === 0 ? (
                    <EmptyState text="Nincs város adat." />
                  ) : (
                    <Stack spacing={1.2}>
                      {cityStats.slice(0, 5).map((city) => (
                        <Box
                          key={city.city}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(120,255,180,0.08)",
                          }}
                        >
                          <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                            {city.city}
                          </Typography>
                          <Chip
                            label={`${city.count} fő`}
                            sx={{
                              background: "rgba(70,216,132,0.16)",
                              color: "#d8ffe7",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </SectionCard>
              </Stack>
            )}

            {tab === 1 && (
              <SectionCard
                title="Felhasználók"
                subtitle="Lapozható lista, hogy ne kelljen az admin aljáig görgetni."
                right={
                  <Chip
                    label={`${users.length} felhasználó`}
                    sx={{
                      background: "rgba(70,216,132,0.16)",
                      color: "#d8ffe7",
                      fontWeight: 700,
                    }}
                  />
                }
              >
                {users.length === 0 ? (
                  <EmptyState text="Nincs egyetlen felhasználó sem." />
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(2, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {pagedUsers.map((u) => (
                        <Card
                          key={u.id}
                          sx={{
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(120,255,180,0.08)",
                          }}
                        >
                          <CardContent>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={2}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    color: "#fff",
                                    fontWeight: 800,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {u.nev}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "rgba(255,255,255,0.62)",
                                    mt: 0.5,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {u.email}
                                </Typography>

                                <Stack
                                  direction="row"
                                  flexWrap="wrap"
                                  gap={1}
                                  sx={{ mt: 1.5 }}
                                >
                                  <Chip
                                    label={u.szerepkor}
                                    size="small"
                                    sx={{
                                      background:
                                        u.szerepkor === "admin"
                                          ? "rgba(255,193,7,0.18)"
                                          : "rgba(70,216,132,0.16)",
                                      color: "#fff",
                                      fontWeight: 700,
                                    }}
                                  />
                                  {u.varos ? (
                                    <Chip
                                      label={u.varos}
                                      size="small"
                                      sx={{
                                        background: "rgba(255,255,255,0.08)",
                                        color: "#fff",
                                      }}
                                    />
                                  ) : null}
                                  {u.eletkor ? (
                                    <Chip
                                      label={`${u.eletkor} év`}
                                      size="small"
                                      sx={{
                                        background: "rgba(255,255,255,0.08)",
                                        color: "#fff",
                                      }}
                                    />
                                  ) : null}
                                  {u.nem ? (
                                    <Chip
                                      label={u.nem}
                                      size="small"
                                      sx={{
                                        background: "rgba(255,255,255,0.08)",
                                        color: "#fff",
                                      }}
                                    />
                                  ) : null}
                                </Stack>
                              </Box>

                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel
                                  sx={{ color: "rgba(255,255,255,0.7)" }}
                                >
                                  Szerepkör
                                </InputLabel>
                                <Select
                                  value={u.szerepkor || "user"}
                                  label="Szerepkör"
                                  onChange={(e) =>
                                    handleRoleChange(u, e.target.value)
                                  }
                                  sx={{
                                    color: "#fff",
                                    ".MuiOutlinedInput-notchedOutline": {
                                      borderColor: "rgba(120,255,180,0.18)",
                                    },
                                    ".MuiSvgIcon-root": { color: "#fff" },
                                  }}
                                >
                                  <MenuItem value="user">user</MenuItem>
                                  <MenuItem value="admin">admin</MenuItem>
                                </Select>
                              </FormControl>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>

                    <Stack alignItems="center" sx={{ mt: 3 }}>
                      <Pagination
                        count={userPageCount}
                        page={userPage}
                        onChange={(e, value) => setUserPage(value)}
                        shape="rounded"
                        color="primary"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "#fff",
                            borderColor: "rgba(120,255,180,0.16)",
                          },
                        }}
                      />
                    </Stack>
                  </>
                )}
              </SectionCard>
            )}

            {tab === 2 && (
              <SectionCard
                title="Kapcsolat üzenetek"
                subtitle="Itt tudsz válaszolni, státuszt állítani és törölni."
                right={
                  <Chip
                    label={`${contactMessages.length} üzenet`}
                    sx={{
                      background: "rgba(70,216,132,0.16)",
                      color: "#d8ffe7",
                      fontWeight: 700,
                    }}
                  />
                }
              >
                {contactLoading ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <CircularProgress sx={{ color: "#46d884" }} />
                  </Box>
                ) : contactMessages.length === 0 ? (
                  <EmptyState text="Nincs egyetlen kapcsolat üzenet sem." />
                ) : (
                  <Stack spacing={2}>
                    {contactMessages.map((msg) => (
                      <Card
                        key={msg.id}
                        sx={{
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(120,255,180,0.08)",
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: 18,
                                  }}
                                >
                                  {msg.nev}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 0.5,
                                    color: "rgba(255,255,255,0.62)",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {msg.email}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 0.5,
                                    color: "rgba(255,255,255,0.52)",
                                  }}
                                >
                                  Tárgy: {msg.targy || "—"}
                                </Typography>
                              </Box>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <FormControl size="small" sx={{ minWidth: 170 }}>
                                  <InputLabel
                                    sx={{ color: "rgba(255,255,255,0.7)" }}
                                  >
                                    Státusz
                                  </InputLabel>
                                  <Select
                                    value={msg.status || "uj"}
                                    label="Státusz"
                                    onChange={(e) =>
                                      handleContactStatusChange(
                                        msg.id,
                                        e.target.value
                                      )
                                    }
                                    sx={{
                                      color: "#fff",
                                      ".MuiOutlinedInput-notchedOutline": {
                                        borderColor:
                                          "rgba(120,255,180,0.18)",
                                      },
                                      ".MuiSvgIcon-root": { color: "#fff" },
                                    }}
                                  >
                                    <MenuItem value="uj">új</MenuItem>
                                    <MenuItem value="folyamatban">
                                      folyamatban
                                    </MenuItem>
                                    <MenuItem value="megvalaszolva">
                                      megválaszolva
                                    </MenuItem>
                                    <MenuItem value="lezarva">lezárva</MenuItem>
                                  </Select>
                                </FormControl>

                                <Button
                                  variant="outlined"
                                  startIcon={<MailIcon />}
                                  onClick={() => openReplyDialog(msg)}
                                  sx={{
                                    borderColor: "rgba(120,255,180,0.18)",
                                    color: "#fff",
                                    borderRadius: 999,
                                  }}
                                >
                                  Válasz
                                </Button>

                                <IconButton
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  sx={{
                                    color: "#ffb3b3",
                                    border: "1px solid rgba(255,120,120,0.18)",
                                    borderRadius: 999,
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Stack>
                            </Stack>

                            <Divider
                              sx={{ borderColor: "rgba(255,255,255,0.08)" }}
                            />

                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                background: "rgba(255,255,255,0.03)",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "rgba(255,255,255,0.82)",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {msg.uzenet}
                              </Typography>
                            </Box>

                            {msg.admin_valasz ? (
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 3,
                                  background: "rgba(70,216,132,0.07)",
                                  border:
                                    "1px solid rgba(70,216,132,0.14)",
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#d8ffe7",
                                    fontWeight: 700,
                                    mb: 0.8,
                                  }}
                                >
                                  Elküldött admin válasz
                                </Typography>
                                <Typography
                                  sx={{
                                    color: "rgba(255,255,255,0.82)",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {msg.admin_valasz}
                                </Typography>
                              </Box>
                            ) : null}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            )}

            {tab === 3 && (
              <SectionCard
                title="Városok"
                subtitle="Lapozható bontás, hogy ne legyen végtelen görgetés."
                right={
                  <Chip
                    label={`${cityStats.length} város`}
                    sx={{
                      background: "rgba(70,216,132,0.16)",
                      color: "#d8ffe7",
                      fontWeight: 700,
                    }}
                  />
                }
              >
                {cityStats.length === 0 ? (
                  <EmptyState text="Nincs város adat." />
                ) : (
                  <>
                    <Stack spacing={1.2}>
                      {pagedCities.map((city) => (
                        <Box
                          key={city.city}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.6,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(120,255,180,0.08)",
                          }}
                        >
                          <Typography sx={{ color: "#fff", fontWeight: 700 }}>
                            {city.city}
                          </Typography>

                          <Chip
                            label={`${city.count} fő`}
                            sx={{
                              background: "rgba(70,216,132,0.16)",
                              color: "#d8ffe7",
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>

                    <Stack alignItems="center" sx={{ mt: 3 }}>
                      <Pagination
                        count={cityPageCount}
                        page={cityPage}
                        onChange={(e, value) => setCityPage(value)}
                        shape="rounded"
                        color="primary"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "#fff",
                            borderColor: "rgba(120,255,180,0.16)",
                          },
                        }}
                      />
                    </Stack>
                  </>
                )}
              </SectionCard>
            )}

            {tab === 4 && (
              <SectionCard
                title="Túrák"
                subtitle="Itt látod az összes túrát. Szerkesztésnél átvisz a külön Túraszerkesztő fülre."
                right={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={startCreateTour}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
                      color: "#04110a",
                    }}
                  >
                    Új túra
                  </Button>
                }
              >
                {tours.length === 0 ? (
                  <EmptyState text="Még nincs egyetlen túra sem." />
                ) : (
                  <Stack spacing={2}>
                    {tours.map((tour) => (
                      <Card
                        key={tour.id}
                        sx={{
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(120,255,180,0.08)",
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Stack
                                direction="row"
                                flexWrap="wrap"
                                gap={1}
                                sx={{ mb: 1.5 }}
                              >
                                <Chip
                                  label={tour.active ? "Aktív" : "Rejtett"}
                                  size="small"
                                  sx={{
                                    background: tour.active
                                      ? "rgba(70,216,132,0.16)"
                                      : "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    fontWeight: 700,
                                  }}
                                />
                                <Chip
                                  label={`${tour.joinedCount || 0} / ${
                                    tour.maxPeople || 20
                                  } fő`}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                                <Chip
                                  label={`${tour.remainingPlaces || 0} szabad hely`}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                              </Stack>

                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontWeight: 800,
                                  fontSize: 20,
                                }}
                              >
                                {tour.title}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.8,
                                  color: "rgba(255,255,255,0.65)",
                                }}
                              >
                                {tour.shortDesc || tour.desc}
                              </Typography>

                              <Stack
                                direction="row"
                                flexWrap="wrap"
                                gap={1}
                                sx={{ mt: 1.5 }}
                              >
                                <Chip
                                  label={tour.category}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                                <Chip
                                  label={tour.level}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                                <Chip
                                  label={tour.dur}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                                <Chip
                                  label={fmtFt(tour.price)}
                                  size="small"
                                  sx={{
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                  }}
                                />
                              </Stack>
                            </Box>

                            <Stack
                              direction={{ xs: "row", md: "column" }}
                              spacing={1}
                              sx={{ minWidth: { xs: "100%", md: 200 } }}
                            >
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => startEditTour(tour)}
                                sx={{
                                  borderColor: "rgba(120,255,180,0.18)",
                                  color: "#fff",
                                  borderRadius: 999,
                                }}
                              >
                                Szerkesztés
                              </Button>

                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={
                                  tour.active ? (
                                    <VisibilityOffIcon />
                                  ) : (
                                    <VisibilityIcon />
                                  )
                                }
                                onClick={() => handleToggleTourActive(tour)}
                                sx={{
                                  borderColor: "rgba(120,255,180,0.18)",
                                  color: "#fff",
                                  borderRadius: 999,
                                }}
                              >
                                {tour.active ? "Elrejtés" : "Visszakapcsolás"}
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            )}

            {tab === 5 && (
              <SectionCard
                title={
                  tourEditorMode === "create"
                    ? "Túraszerkesztő • Új túra"
                    : "Túraszerkesztő • Szerkesztés"
                }
                subtitle="Itt kényelmesen, külön oldalon tudsz túrát létrehozni vagy szerkeszteni."
                right={
                  <Stack direction="row" spacing={1.2}>
                    <Button
                      variant="outlined"
                      onClick={resetTourEditor}
                      sx={{
                        borderColor: "rgba(120,255,180,0.18)",
                        color: "#fff",
                        borderRadius: 999,
                      }}
                    >
                      Ürítés
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveTour}
                      disabled={saving}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        background:
                          "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
                        color: "#04110a",
                      }}
                    >
                      {tourEditorMode === "create" ? "Létrehozás" : "Mentés"}
                    </Button>
                  </Stack>
                }
              >
                <Stack spacing={2.2}>
                  <TextField
                    label="Cím"
                    value={tourForm.title}
                    onChange={(e) => updateTourForm("title", e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <TextField
                    label="Rövid leírás"
                    value={tourForm.shortDesc}
                    onChange={(e) =>
                      updateTourForm("shortDesc", e.target.value)
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <TextField
                    label="Leírás"
                    value={tourForm.desc}
                    onChange={(e) => updateTourForm("desc", e.target.value)}
                    multiline
                    minRows={8}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Kategória"
                      value={tourForm.category}
                      onChange={(e) =>
                        updateTourForm("category", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Nehézség"
                      value={tourForm.level}
                      onChange={(e) => updateTourForm("level", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Időtartam"
                      value={tourForm.dur}
                      onChange={(e) => updateTourForm("dur", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Badge"
                      value={tourForm.badge}
                      onChange={(e) => updateTourForm("badge", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Ár"
                      type="number"
                      value={tourForm.price}
                      onChange={(e) => updateTourForm("price", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Max létszám"
                      type="number"
                      value={tourForm.maxPeople}
                      onChange={(e) =>
                        updateTourForm("maxPeople", e.target.value)
                      }
                      inputProps={{ min: 1, max: 500 }}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                  </Box>

                  <TextField
                    label="Kép URL"
                    value={tourForm.img}
                    onChange={(e) => updateTourForm("img", e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Stack>
              </SectionCard>
            )}

            {tab === 6 && (
              <SectionCard
                title="Webshop / bérlés termékek"
                subtitle="Ugyanúgy működik, mint a túrák: külön lista és külön szerkesztő."
                right={
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={startCreateRental}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
                      color: "#04110a",
                    }}
                  >
                    Új termék
                  </Button>
                }
              >
                {rentalLoading ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <CircularProgress sx={{ color: "#46d884" }} />
                  </Box>
                ) : rentalItems.length === 0 ? (
                  <EmptyState text="Még nincs egyetlen webshop termék sem." />
                ) : (
                  <>
                    <Stack spacing={2}>
                      {pagedRentalItems.map((item) => {
                        const imageSrc = normalizeImage(item.kep);

                        return (
                          <Card
                            key={item.id}
                            sx={{
                              borderRadius: 3,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(120,255,180,0.08)",
                            }}
                          >
                            <CardContent>
                              <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={2}
                                justifyContent="space-between"
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={2}
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
                                  {imageSrc ? (
                                    <Box
                                      component="img"
                                      src={imageSrc}
                                      alt={item.nev}
                                      sx={{
                                        width: { xs: "100%", sm: 180 },
                                        height: 130,
                                        objectFit: "cover",
                                        borderRadius: 3,
                                        border:
                                          "1px solid rgba(120,255,180,0.12)",
                                        background: "rgba(255,255,255,0.04)",
                                        flexShrink: 0,
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: { xs: "100%", sm: 180 },
                                        height: 130,
                                        borderRadius: 3,
                                        border:
                                          "1px solid rgba(120,255,180,0.12)",
                                        background:
                                          "linear-gradient(135deg, rgba(46,204,113,0.12), rgba(255,255,255,0.03))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "rgba(255,255,255,0.55)",
                                        fontWeight: 700,
                                        flexShrink: 0,
                                      }}
                                    >
                                      Nincs kép
                                    </Box>
                                  )}

                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Stack
                                      direction="row"
                                      flexWrap="wrap"
                                      gap={1}
                                      sx={{ mb: 1.2 }}
                                    >
                                      <Chip
                                        label={item.aktiv ? "Aktív" : "Inaktív"}
                                        size="small"
                                        sx={{
                                          background: item.aktiv
                                            ? "rgba(70,216,132,0.16)"
                                            : "rgba(255,255,255,0.08)",
                                          color: "#fff",
                                          fontWeight: 700,
                                        }}
                                      />
                                      <Chip
                                        label={`Készlet: ${Number(
                                          item.darabszam || 0
                                        )} db`}
                                        size="small"
                                        sx={{
                                          background: "rgba(255,255,255,0.08)",
                                          color: "#fff",
                                        }}
                                      />
                                      <Chip
                                        label={item.kategoria || "Egyéb"}
                                        size="small"
                                        sx={{
                                          background: "rgba(255,255,255,0.08)",
                                          color: "#fff",
                                        }}
                                      />
                                      <Chip
                                        label={item.marka || "EXPLORE"}
                                        size="small"
                                        sx={{
                                          background: "rgba(255,255,255,0.08)",
                                          color: "#fff",
                                        }}
                                      />
                                    </Stack>

                                    <Typography
                                      sx={{
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: 20,
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {item.nev}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        mt: 0.8,
                                        color: "rgba(255,255,255,0.65)",
                                      }}
                                    >
                                      {item.leiras || "Nincs leírás megadva."}
                                    </Typography>

                                    <Stack
                                      direction="row"
                                      flexWrap="wrap"
                                      gap={1}
                                      sx={{ mt: 1.5 }}
                                    >
                                      <Chip
                                        label={`Ár / nap: ${fmtFt(
                                          item.ar_per_nap
                                        )}`}
                                        size="small"
                                        sx={{
                                          background: "rgba(255,255,255,0.08)",
                                          color: "#fff",
                                        }}
                                      />

                                      {item.ertekeles !== null &&
                                      typeof item.ertekeles !== "undefined" ? (
                                        <Chip
                                          label={`Értékelés: ${Number(
                                            item.ertekeles
                                          ).toFixed(1)}`}
                                          size="small"
                                          sx={{
                                            background:
                                              "rgba(255,255,255,0.08)",
                                            color: "#fff",
                                          }}
                                        />
                                      ) : null}

                                      {item.suly_kg !== null &&
                                      typeof item.suly_kg !== "undefined" ? (
                                        <Chip
                                          label={`Súly: ${Number(
                                            item.suly_kg
                                          ).toFixed(2)} kg`}
                                          size="small"
                                          sx={{
                                            background:
                                              "rgba(255,255,255,0.08)",
                                            color: "#fff",
                                          }}
                                        />
                                      ) : null}
                                    </Stack>
                                  </Box>
                                </Stack>

                                <Stack
                                  direction={{ xs: "row", md: "column" }}
                                  spacing={1}
                                  sx={{ minWidth: { xs: "100%", md: 220 } }}
                                >
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => startEditRental(item)}
                                    sx={{
                                      borderColor: "rgba(120,255,180,0.18)",
                                      color: "#fff",
                                      borderRadius: 999,
                                    }}
                                  >
                                    Szerkesztés
                                  </Button>

                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={
                                      item.aktiv ? (
                                        <VisibilityOffIcon />
                                      ) : (
                                        <VisibilityIcon />
                                      )
                                    }
                                    onClick={() => handleToggleRentalActive(item)}
                                    sx={{
                                      borderColor: "rgba(120,255,180,0.18)",
                                      color: "#fff",
                                      borderRadius: 999,
                                    }}
                                  >
                                    {item.aktiv ? "Inaktiválás" : "Aktiválás"}
                                  </Button>

                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<DeleteOutlineIcon />}
                                    onClick={() => handleDeleteRental(item)}
                                    sx={{
                                      borderColor: "rgba(255,120,120,0.24)",
                                      color: "#ffcccc",
                                      borderRadius: 999,
                                    }}
                                  >
                                    Törlés
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>

                    <Stack alignItems="center" sx={{ mt: 3 }}>
                      <Pagination
                        count={rentalPageCount}
                        page={rentalPage}
                        onChange={(e, value) => setRentalPage(value)}
                        shape="rounded"
                        color="primary"
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: "#fff",
                            borderColor: "rgba(120,255,180,0.16)",
                          },
                        }}
                      />
                    </Stack>
                  </>
                )}
              </SectionCard>
            )}

            {tab === 7 && (
              <SectionCard
                title={
                  rentalEditorMode === "create"
                    ? "Webshop-szerkesztő • Új termék"
                    : "Webshop-szerkesztő • Szerkesztés"
                }
                subtitle="Itt tudsz webshop / bérlés terméket létrehozni vagy módosítani ugyanúgy, mint a túráknál."
                right={
                  <Stack direction="row" spacing={1.2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      onClick={resetRentalEditor}
                      sx={{
                        borderColor: "rgba(120,255,180,0.18)",
                        color: "#fff",
                        borderRadius: 999,
                      }}
                    >
                      Ürítés
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveRental}
                      disabled={saving}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 700,
                        background:
                          "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
                        color: "#04110a",
                      }}
                    >
                      {rentalEditorMode === "create" ? "Létrehozás" : "Mentés"}
                    </Button>
                  </Stack>
                }
              >
                <Stack spacing={2.2}>
                  <TextField
                    label="Termék neve"
                    value={rentalForm.nev}
                    onChange={(e) => updateRentalForm("nev", e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <TextField
                    label="Leírás"
                    value={rentalForm.leiras}
                    onChange={(e) => updateRentalForm("leiras", e.target.value)}
                    multiline
                    minRows={6}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Kategória"
                      value={rentalForm.kategoria}
                      onChange={(e) =>
                        updateRentalForm("kategoria", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Márka"
                      value={rentalForm.marka}
                      onChange={(e) => updateRentalForm("marka", e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Ár / nap"
                      type="number"
                      value={rentalForm.ar_per_nap}
                      onChange={(e) =>
                        updateRentalForm("ar_per_nap", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Készlet / darabszám"
                      type="number"
                      value={rentalForm.darabszam}
                      onChange={(e) =>
                        updateRentalForm("darabszam", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Értékelés (0 - 5)"
                      type="number"
                      value={rentalForm.ertekeles}
                      onChange={(e) =>
                        updateRentalForm("ertekeles", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />

                    <TextField
                      label="Súly (kg)"
                      type="number"
                      value={rentalForm.suly_kg}
                      onChange={(e) =>
                        updateRentalForm("suly_kg", e.target.value)
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={fieldSx}
                    />
                  </Box>

                  <TextField
                    label="Kép URL (opcionális)"
                    value={rentalForm.kep}
                    onChange={(e) =>
                      updateRentalForm("kep", e.target.value)
                    }
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.2}
                    alignItems={{ xs: "stretch", md: "center" }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(120,255,180,0.18)",
                        color: "#fff",
                        borderRadius: 999,
                        width: { xs: "100%", md: "fit-content" },
                      }}
                    >
                      Kép feltöltése
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleRentalFileChange}
                      />
                    </Button>

                    {rentalForm.kepFile ? (
                      <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
                        Kiválasztott fájl: {rentalForm.kepFile.name}
                      </Typography>
                    ) : null}

                    {(rentalForm.kep || rentalForm.kepFile) && (
                      <Button
                        variant="outlined"
                        onClick={handleRemoveRentalImage}
                        sx={{
                          borderColor: "rgba(255,120,120,0.24)",
                          color: "#ffcccc",
                          borderRadius: 999,
                        }}
                      >
                        Kép törlése
                      </Button>
                    )}
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rentalForm.aktiv}
                        onChange={(e) =>
                          updateRentalForm("aktiv", e.target.checked)
                        }
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                          "&.Mui-checked": {
                            color: "#46d884",
                          },
                        }}
                      />
                    }
                    label="A termék aktív és látható legyen"
                    sx={{
                      color: "#fff",
                      "& .MuiFormControlLabel-label": {
                        color: "#fff",
                        fontWeight: 600,
                      },
                    }}
                  />

                  {rentalImagePreview ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid rgba(120,255,180,0.12)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#d8ffe7",
                          fontWeight: 700,
                          mb: 1.5,
                        }}
                      >
                        Előnézet
                      </Typography>

                      <Box
                        component="img"
                        src={rentalImagePreview}
                        alt="Termék előnézet"
                        sx={{
                          width: "100%",
                          maxWidth: 420,
                          height: 260,
                          objectFit: "cover",
                          borderRadius: 3,
                          border: "1px solid rgba(120,255,180,0.12)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                      />
                    </Box>
                  ) : null}
                </Stack>
              </SectionCard>
            )}
          </>
        )}
      </Box>

      <Dialog
        open={replyDialogOpen}
        onClose={closeReplyDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "88vh",
            background:
              "linear-gradient(180deg, rgba(18,22,20,0.98) 0%, rgba(10,12,11,1) 100%)",
            color: "#fff",
            border: "1px solid rgba(120,255,180,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Emailes válasz küldése
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.65)" }}>
              Címzett: {replyTarget?.nev} • {replyTarget?.email}
            </Typography>

            <TextField
              label="Válasz"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              multiline
              minRows={8}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeReplyDialog}
            sx={{ color: "rgba(255,255,255,0.72)" }}
          >
            Mégse
          </Button>

          <Button
            variant="contained"
            startIcon={<MailIcon />}
            onClick={handleSaveReply}
            disabled={saving}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #2ecc71 0%, #46d884 100%)",
              color: "#04110a",
            }}
          >
            Küldés
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 3,
    "& fieldset": {
      borderColor: "rgba(120,255,180,0.14)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(120,255,180,0.28)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#46d884",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.72)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#46d884",
  },
};