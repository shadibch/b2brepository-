import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  Toolbar,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import axiosInstance from "./axiosInstance";
import { t, isRTL, getCurrentLanguage } from "../utils/translator";
import theme from "../theme/theme";

const drawerWidth = 240;

const Sidebar = ({ setActivePage }) => {
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(true);
  const token = localStorage.getItem("authToken");
  const isMobile = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    if (!token) return;

    const fetchLinks = async () => {
      try {
        const response = await axiosInstance.get("/api/navigation/");
        setLinks(response.data.links || []);
      } catch (error) {
        console.error("Error fetching navigation links:", error);
      }
    };

    fetchLinks();
  }, [getCurrentLanguage(), token]);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        direction: isRTL() ? "rtl" : "ltr",
      }}
    >
      {/* Toggle Button */}
      <IconButton
        onClick={toggleDrawer}
        sx={{
          position: "fixed",
          top: 16,
          [isRTL() ? "right" : "left"]: 16,
          zIndex: 1301,
          bgcolor: "background.paper",
          boxShadow: 2,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer
        anchor={isRTL() ? "right" : "left"}
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.default",
            color: "text.primary",
            transition: "all 0.3s ease-in-out",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
          }}
        >
          <Box component="span" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            {t("User Menu")}
          </Box>
         
        </Toolbar>
        <Divider />

        <List
  sx={{
    textAlign: isRTL() ? "right" : "left",
    "& .MuiListItemButton-root": {
      justifyContent: isRTL() ? "flex-end" : "flex-start",
    },
    "& .MuiListItemIcon-root": {
      minWidth: 0,
      mr: isRTL() ? 0 : 2,
      ml: isRTL() ? 2 : 0,
    },
    "& .MuiListItemText-root": {
      textAlign: isRTL() ? "right" : "left",
    },
  }}
>
  {links.map((link) => (
    <ListItemButton
    key={link.url}
    onClick={() => {
      setActivePage(link.url);
      if (isMobile) toggleDrawer();
    }}
    sx={{
      "&:hover": {
        bgcolor: theme.palette.sidebar?.hover || theme.palette.primary.light,
      },
      "&.Mui-selected": {
        bgcolor: theme.palette.sidebar?.active || theme.palette.primary.dark,
        color: theme.palette.sidebar?.text || "#fff",
      },
    }}
  >
  
      <ListItemIcon>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
          }}
        />
      </ListItemIcon>
      <ListItemText primary={t(link.name)} />
    </ListItemButton>
  ))}
</List>

      </Drawer>

      {/* Main content shifts when sidebar opens */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin 0.3s ease-in-out",
          marginLeft: !isRTL() && open && !isMobile ? `${drawerWidth}px` : 0,
          marginRight: isRTL() && open && !isMobile ? `${drawerWidth}px` : 0,
          p: 3,
        }}
      >
        {/* Your page content goes here */}
      </Box>
    </Box>
  );
};

export default Sidebar;
