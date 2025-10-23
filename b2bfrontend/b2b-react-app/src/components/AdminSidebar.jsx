import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem,
  Typography,
  Box,
  useMediaQuery,
  Drawer,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
} from "../utils/translator";

const AdminSidebar = ({ setActivePage }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const drawerWidth = 260;
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

  const handleToggle = () => {
    setOpen(!open);
    const searchEvent = new CustomEvent("toggled", { detail: { open } });
    window.dispatchEvent(searchEvent);
  };

  useEffect(() => {
    document.body.dir = isRTL() ? "rtl" : "ltr";
  }, [getCurrentLanguage()]);

  const changeLanguage = (lang) => {
    switchLanguage(lang);
    window.location.reload();
  };

  const pathToKey = {
    "/admin/user-management": "0",
    "/admin/order-management": "1",
    "/admin/category-management": "2",
    "/admin/item-management": "2",
    "/admin/group-management": "2",
    "/admin/paid-orders": "1",
    "/admin/processing-orders": "1",
    "/admin/undelivered-orders": "1",
    "/admin/order_report": "5",
    "/admin/company-admin": "6",
    "/admin/report-management": "5",
  };

  const activeKey = pathToKey[window.location.pathname] || "";

  // Common accordion style
  const accordionSx = {
    mb: 0.5,
    bgcolor: theme.palette.sidebar.bg,
    color: theme.palette.sidebar.text,
    borderRadius: 2,
    boxShadow: "none",
    "&:before": { display: "none" },
    "& .MuiAccordionSummary-root": {
      bgcolor: theme.palette.sidebar.bg,
      "& .MuiAccordionSummary-expandIconWrapper": {
        color: theme.palette.sidebar.text,
      },
      "& .MuiTypography-root": {
        fontWeight: 600,
        fontSize: "0.95rem",
        width: "100%",
        textAlign: isRTL() ? "right" : "left",
      },
      "&:hover": { bgcolor: theme.palette.sidebar.hover },
    },
    "&.Mui-expanded": {
      bgcolor: theme.palette.sidebar.active,
      "& .MuiAccordionSummary-root": {
        bgcolor: theme.palette.sidebar.active,
      },
    },
    "& .MuiAccordionDetails-root": {
      bgcolor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      textAlign: isRTL() ? "right" : "left",
      "& .MuiListItemButton-root": {
        justifyContent: isRTL() ? "flex-end" : "flex-start",
      },
      "& .MuiListItemText-root": {
        textAlign: isRTL() ? "right" : "left",
      },
      "& .MuiSelect-select": {
        textAlign: isRTL() ? "right" : "left",
      },
      "& .MuiMenuItem-root": {
        justifyContent: isRTL() ? "flex-end" : "flex-start",
        textAlign: isRTL() ? "right" : "left",
      },
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        direction: isRTL() ? "rtl" : "ltr",
      }}
    >
      <Drawer
        anchor={isRTL() ? "right" : "left"} // ✅ Drawer stays on correct side
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={handleToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
            p: 1,
            direction: isRTL() ? "rtl" : "ltr",
          },
        }}
      >
        <List
          sx={{
            textAlign: isRTL() ? "right" : "left",
            "& .MuiListItemButton-root": {
              justifyContent: isRTL() ? "flex-end" : "flex-start",
              borderRadius: 1,
              px: 2,
              "&:hover": {
                bgcolor: theme.palette.sidebar.hover,
                color: theme.palette.sidebar.text,
              },
            },
          }}
        >
          {/* === USERS === */}
          <Accordion disableGutters defaultExpanded={activeKey === "0"} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("users")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ListItemButton
                component={Link}
                to="/admin/user-management"
                onClick={() => setActivePage("/admin/user-management")}
              >
                <ListItemText primary={t("Manage Users")} />
              </ListItemButton>
            </AccordionDetails>
          </Accordion>

          {/* === ORDERS === */}
          <Accordion disableGutters defaultExpanded={activeKey === "1"} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Orders")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItemButton component={Link} to="/admin/order-management" onClick={() => setActivePage("/admin/order-management")}>
                  <ListItemText primary={t("Order Management")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/paid-orders" onClick={() => setActivePage("/admin/paid-orders")}>
                  <ListItemText primary={t("Unpaid Orders")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/processing-orders" onClick={() => setActivePage("/admin/processing-orders")}>
                  <ListItemText primary={t("Processing Orders")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/undelivered-orders" onClick={() => setActivePage("/admin/undelivered-orders")}>
                  <ListItemText primary={t("Undelivered Orders")} />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* === PRODUCTS === */}
          <Accordion disableGutters defaultExpanded={activeKey === "2"} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Products")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItemButton component={Link} to="/admin/group-management" onClick={() => setActivePage("/admin/group-management")}>
                  <ListItemText primary={t("Groups")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/category-management" onClick={() => setActivePage("/admin/category-management")}>
                  <ListItemText primary={t("categories")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/item-management" onClick={() => setActivePage("/admin/item-management")}>
                  <ListItemText primary={t("Products Management")} />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* === COMPANIES === */}
          <Accordion disableGutters defaultExpanded={activeKey === "6"} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Companies Management")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ListItemButton
                component={Link}
                to="/admin/company-admin"
                onClick={() => setActivePage("/admin/company-admin")}
              >
                <ListItemText primary={t("Companies Management")} />
              </ListItemButton>
            </AccordionDetails>
          </Accordion>

          {/* === REPORTS === */}
          <Accordion disableGutters defaultExpanded={activeKey === "5"} sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Reports")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItemButton component={Link} to="/admin/order_report" onClick={() => setActivePage("/admin/order_report")}>
                  <ListItemText primary={t("Order Report")} />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/report-management" onClick={() => setActivePage("/admin/report-management")}>
                  <ListItemText primary={t("Requests Report")} />
                </ListItemButton>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* === LANGUAGE === */}
          <Accordion disableGutters sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("language")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Select
                fullWidth
                value={getCurrentLanguage()}
                onChange={(e) => changeLanguage(e.target.value)}
                size="small"
              >
                <MenuItem value="ar-SA">{t("arabic")}</MenuItem>
                <MenuItem value="en-US">{t("english")}</MenuItem>
              </Select>
            </AccordionDetails>
          </Accordion>

          {/* === LOGOUT === */}
          <Accordion disableGutters sx={accordionSx}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("logout")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ListItemButton
                onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("main_url");
                  navigate("/");
                }}
              >
                <ListItemText primary={t("logout")} />
              </ListItemButton>
            </AccordionDetails>
          </Accordion>
        </List>
      </Drawer>
    </Box>
  );
};

export default AdminSidebar;
