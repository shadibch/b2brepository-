import React, { useState, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  IconButton,
  Box,
  useMediaQuery,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

// === Local imports ===
import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import OrderManagement from "./admin/OrderManagement";
import CategoryManagement from "./admin/CategoryManagement";
import ProductGroupManager from "./admin/ProductGroup";
import ProductManagement from "./admin/ProductManagement";
import PaidOrders from "./admin/PaidOrders";
import ProcessingOrders from "./admin/ProcessingOrders";
import UndeliveredOrders from "./admin/UndeliveredOrders";
import OrderReport from "./admin/OrderReport";
import CompanyAdminPage from "./admin/CompanyAdminPage";
import BranchManagement from "./admin/BranchManagement";
import ReportManagement from "./admin/ReportManagement";

import "../assets/fonts/fonts.css";
import { appTheme } from "./theme";
import { isRTL } from "../utils/translator";
import ProductItem from "./admin/ProductItem";

const AdministratorPage = () => {
  const [mode, setMode] = useState("light");
  const [activePage, setActivePage] = useState(null);
  const theme = useMemo(() => appTheme(mode), [mode]);
  const isMobile = useMediaQuery("(max-width:900px)");

  // RTL cache for MUI
 
  return (

      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box
          sx={{
            display: "flex",
            height: "100vh",
            bgcolor: theme.palette.background.default,
            direction: isRTL() ? "rtl" : "ltr",
          }}
        >
          {/* === Sidebar === */}
          <AdminSidebar setActivePage={setActivePage} />

          {/* === Main Content === */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 3 },
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Routes>
              <Route path="" element={<AdminDashboard />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="order-management" element={<OrderManagement />} />
              <Route path="paid-orders" element={<PaidOrders />} />
              <Route path="item-management" element={<ProductManagement />} />
              <Route path="product-item/:productId?" element={<ProductItem />} />
              <Route
                path="category-management"
                element={<CategoryManagement />}
              />
              <Route
                path="group-management"
                element={<ProductGroupManager />}
              />
              <Route
                path="processing-orders"
                element={<ProcessingOrders />}
              />
              <Route
                path="undelivered-orders"
                element={<UndeliveredOrders />}
              />
              <Route path="order_report" element={<OrderReport />} />
              <Route path="company-admin" element={<CompanyAdminPage />} />
              <Route path="branch-admin" element={<BranchManagement />} />
              <Route path="report-management" element={<ReportManagement />} />
              <Route
                path="*"
                element={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "80vh",
                      typography: "h6",
                    }}
                  >
                    Select an admin function
                  </Box>
                }
              />
            </Routes>
          </Box>

          {/* === Theme toggle button === */}
          <IconButton
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              backgroundColor: "background.paper",
              boxShadow: 3,
              "&:hover": {
                backgroundColor: "primary.main",
                color: "#fff",
              },
              zIndex: 1500,
            }}
          >
            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Box>
      </ThemeProvider>

  );
};

export default AdministratorPage;
