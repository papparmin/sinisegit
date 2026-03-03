import React from "react";
import { Snackbar, Box, Typography, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function SuccessToast({
  open,
  onClose,
  title = "Siker",
  message = "Kész.",
  duration = 2200,
  anchorOrigin = { vertical: "top", horizontal: "center" },
}) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={duration}
      anchorOrigin={anchorOrigin}
      sx={(theme) => ({
        zIndex: theme.zIndex.modal + 999, // ✅ modal fölé
        "& .MuiSnackbarContent-root": { p: 0, bgcolor: "transparent", boxShadow: "none" },
      })}
      message={
        <Box
          sx={{
            minWidth: { xs: 320, sm: 420 },
            maxWidth: "92vw",
            px: 1.4,
            py: 1.15,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            bgcolor: "rgba(14,14,14,.75)",
            backdropFilter: "blur(14px) saturate(160%)",
            border: "1px solid rgba(255,255,255,.14)",
            boxShadow: "0 18px 60px rgba(0,0,0,.55)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(46,204,113,.16)",
                border: "1px solid rgba(46,204,113,.35)",
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 22, color: "#2ecc71" }} />
            </Box>

            <Box sx={{ display: "grid", lineHeight: 1.2 }}>
              <Typography sx={{ fontWeight: 950, fontSize: 13.5, color: "rgba(255,255,255,.95)" }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 12.5, opacity: 0.82, color: "rgba(255,255,255,.92)" }}>
                {message}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              ml: "auto",
              color: "rgba(255,255,255,.8)",
              bgcolor: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
              "&:hover": { bgcolor: "rgba(255,255,255,.10)" },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    />
  );
}