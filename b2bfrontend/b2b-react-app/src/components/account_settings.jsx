import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Branches from "./Branches";
import UserManagement from "./UserManagement";
import OrdersPage from "./Orders";
import { useTheme } from "@mui/material/styles";

const AccountSettings = () => {
  const [activePage, setActivePage] = useState("users"); 
  const theme = useTheme();

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "branches":
        return <Branches />;
      case "orders":
        return <OrdersPage />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Sidebar setActivePage={setActivePage} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s",
          bgcolor: "inherit", // uses same bg as Box parent
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AccountSettings;
