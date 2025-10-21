import { createTheme } from "@mui/material/styles";

export const appTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#1976d2" },
            secondary: { main: "#0288d1" },
            background: { default: "#f9f9f9", paper: "#ffffff" },
            text: { primary: "#212121", secondary: "#757575" },
          }
        : {
            primary: { main: "#90caf9" },
            secondary: { main: "#80deea" },
            background: { default: "#121212", paper: "#1e1e1e" },
            text: { primary: "#e0e0e0", secondary: "#aaaaaa" },
          }),
      sidebar: {
        bg: "#1976d2",        // Sidebar background
        text: "#ffffff",       // Sidebar text
        hover: "#1565c0",      // Hover color
        active: "#0d47a1",     // Active item color
      },
    },
    typography: {
      fontFamily: `'Somar Sans', 'Cairo', 'Noto Sans Arabic', sans-serif`,
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
          body :{
            fontFamily: "'Somar Sans', 'Roboto', 'Arial', sans-serif;"
          }
        },
        
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 12, boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" },
        },
      },
    },
  });

export default appTheme;
