import React, { useState } from "react";
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
import "./i18n";
import { HeaderProvider } from "./components/HeaderContext";
import Branches from "./components/Branches";
import UserManagement from "./components/UserManagement";
import Contracts from "./components/Contracts";

function App() {
  const token = localStorage.getItem("authToken");
  const [products, setProducts] = useState([]);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <HeaderProvider>
      {!isAdminRoute && <Header setProducts={setProducts} />}

      <Routes>
        <Route path="/register" element={token ? <RegisterForm /> : <Navigate to="/login" />} />
        <Route path="/register_company_admin" element={<RegisterCompanyAdmin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<IndexPage products={products} setProducts={setProducts} />} />
        <Route path="/account_settings" element={<AccountSettings />} />
        <Route path="/productitem/:partId" element={<ProductItem />} />
        <Route path="/categorypage/:categoryId" element={<CategoryPage />} />
        <Route path="/cartdetails" element={<CartDetails />} />
        <Route path="/order" element={<Order />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin/*" element={<AdministratorPage />} /> {/* ✅ Admin route */}
       <Route path="/branches" element={<Branches/>} />
       <Route path="/users" element={<UserManagement></UserManagement>} />
       <Route path="/contracts" element={<Contracts/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HeaderProvider>
  );
}

export default App;
