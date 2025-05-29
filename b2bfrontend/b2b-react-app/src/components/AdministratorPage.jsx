import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
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

const AdministratorPage = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="paid-orders" element={<PaidOrders />} />
          <Route path="item-management" element={<ProductManagement />} />
          <Route path="category-management" element={<CategoryManagement/>} />
          <Route path="group-management" element={<ProductGroupManager/>} />
          <Route path="processing-orders" element={<ProcessingOrders/>} />
          <Route path="undelivered-orders" element={<UndeliveredOrders/>} />
          <Route path="order_report" element={<OrderReport/>} />
          <Route path="company-admin" element={<CompanyAdminPage/>} />
          <Route path="branch-admin" element={<BranchManagement/>} />
          <Route path="*" element={<div>Select an admin function</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdministratorPage;
