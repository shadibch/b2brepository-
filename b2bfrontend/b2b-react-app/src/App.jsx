
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import Header from "./components/Header";
import RegisterCompanyAdmin from "./components/RegisterCompanyAdmin";
import CategoryPage from "./components/CategoryPage";
import Login from "./components/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import IndexPage from "./components/IndexPage";
import AccountSettings from "./components/account_settings";
import ProductItem from "./components/ProductItem";
import CartDetails from "./components/CartDetails";
import Order from "./components/Order";
import OrdersPage from "./components/Orders";
import AdministratorPage from "./components/AdministratorPage"; // Import this
import UserDashboard from "./components/UserDashboard"; // Import this
import "./i18n";
import { HeaderProvider } from "./components/HeaderContext";
import Branches from "./components/Branches";
import UserManagement from "./components/UserManagement";
import Contracts from "./components/Contracts";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { appTheme } from "./components/theme";
import "./assets/fonts/fonts.css";
import RequestResetPasswordPage from "./components/RequestResetPassword";
import ResetPassword from "./components/ResetPassword.";
import CompanyManagement from "./components/CompanyManagement";

function App() {
  const token = localStorage.getItem("authToken");
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // ✅ Add theme mode state and memoized theme
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => appTheme(mode), [mode]);

  const isAdminRoute = location.pathname.startsWith("/admin");



  return (
    // ✅ Apply theme globally
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <HeaderProvider>
        {/* ✅ Show Header on non-admin routes */}
        {!isAdminRoute && <Header setProducts={setProducts} />}

        <Routes>
          <Route
            path="/register"
            element={token ? <RegisterForm /> : <Navigate to="/login" />}
          />
          <Route path="/register_company_admin" element={<RegisterCompanyAdmin />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={<IndexPage products={products} setProducts={setProducts} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/account_settings" element={<AccountSettings />} />
          <Route path="/productitem/:partId" element={<ProductItem />} />
          <Route path="/categorypage/:categoryId" element={<CategoryPage />} />
          <Route path="/cartdetails" element={<CartDetails />} />
          <Route path="/order" element={<Order />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin/*" element={<AdministratorPage />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/requestResetPassword" element={<RequestResetPasswordPage/>} /> 
          <Route path="/reset/:token" element={<ResetPassword/>} /> 
          <Route path="/company-management" element={<CompanyManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <IconButton
      onClick={() => setMode(mode === "light" ? "dark" : "light")}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        backgroundColor: "background.paper",
        boxShadow: 3,
        "&:hover": { backgroundColor: "primary.main", color: "#fff" },
      }}
    >
      {mode === "light" ? <Brightness4 /> : <Brightness7 />}
    </IconButton>
      </HeaderProvider>
    </ThemeProvider>
  );
}




export default App;
