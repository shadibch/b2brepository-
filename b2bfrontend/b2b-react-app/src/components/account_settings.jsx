import React, { useState } from "react";

import Sidebar from "./Sidebar";
import Branches from "./Branches";
import UserManagement from "./UserManagement";
import "./IndexPage.css";
import OrdersPage from "./Orders";

const AccountSettings = () => {
  const [activePage, setActivePage] = useState(null); // ✅ Fix: Define activePage state

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "branches":
        return <Branches />;
      case "orders":
        return <OrdersPage/>;
        
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar setActivePage={setActivePage} /> {/* ✅ Fix: Pass state updater to Sidebar */}
      
      <main className="content">
        {renderContent()} {/* ✅ Call function to render page content */}
      </main>
    </div>
  );
};

export default AccountSettings;
