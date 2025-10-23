// src/theme.js
import { createTheme } from "@mui/material/styles";
import { isRTL } from "./utils/translator";

const theme = createTheme({
  direction: isRTL() ? "rtl" : "ltr",
  palette: {
    mode: "light", // change to "dark" if you prefer
    primary: {
      main: "#1976d2", // blue accent
      contrastText: "#fff",
    },
    secondary: {
      main: "#9c27b0",
    },
    success: {
      main: "#2e7d32",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ed6c02",
    },
    info: {
      main: "#0288d1",
    },
    background: {
      default: "#f7f9fc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
    sidebar: {
      bg: "#ffffff",
      text: "#1e293b",
      hover: "#f1f5f9",
      active: "#e0f2fe",
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', sans-serif`,
    h6: { fontWeight: 600, fontSize: "1.05rem" },
    h5: { fontWeight: 700 },
    body1: { fontSize: "0.95rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#1565c0" },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#f1f5f9",
          fontWeight: 600,
          color: "#1e293b",
          borderBottom: "2px solid #e2e8f0",
          textAlign: isRTL() ? "right" : "left",
        },
        body: {
          textAlign: isRTL() ? "right" : "left",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        hover: {
          "&:hover": {
            backgroundColor: "#f8fafc",
          },
        },
      },
    },
  },
});

export default theme;
