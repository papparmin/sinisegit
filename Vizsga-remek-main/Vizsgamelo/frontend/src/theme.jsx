import { createTheme } from "@mui/material/styles";

const APPLE_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2ecc71",
      light: "#46d884",
    },
    error: {
      main: "#ff3b30",
      dark: "#e3352b",
    },
    warning: {
      main: "#f5c542",
    },
    background: {
      default: "#0b1210",
      paper: "rgba(255, 255, 255, 0.08)",
    },
    text: {
      primary: "rgba(255, 255, 255, 0.92)",
      secondary: "rgba(255, 255, 255, 0.68)",
    },
  },

  shape: {
    borderRadius: 22,
  },

  typography: {
    fontFamily: APPLE_STACK,
    h1: { fontWeight: 900, letterSpacing: "-0.03em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // globál: minden elem Apple font + sima élsimítás
        "*": {
          fontFamily: APPLE_STACK,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },

        body: {
          backgroundColor: "#0b1210",
          backgroundImage: `
            radial-gradient(1100px 700px at 15% -10%, rgba(46,204,113,.25), transparent 60%), 
            radial-gradient(900px 600px at 90% 10%, rgba(10,132,255,.18), transparent 55%), 
            radial-gradient(900px 650px at 50% 110%, rgba(203,186,150,.16), transparent 55%)
          `,
          backgroundAttachment: "fixed",
          minHeight: "100vh",

          "&::after": {
            content: '""',
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.06,
            mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E")`,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px) saturate(165%)",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: "0 26px 90px rgba(0,0,0,0.55)",
          backgroundImage: "none",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          fontWeight: 700,
          padding: "10px 24px",
        },
        containedPrimary: {
          background: "linear-gradient(180deg, #2ecc71, #46d884)",
          color: "#07100c",
          boxShadow: "0 20px 50px rgba(46,204,113,0.25)",
          "&:hover": {
            boxShadow: "0 26px 65px rgba(46,204,113,0.25)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
  },
});
