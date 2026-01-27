import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  People,
  ShoppingCart,
  Category,
  Business,
  Assessment,
  Settings,
} from "@mui/icons-material";
import { t, isRTL } from "../../utils/translator";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");
  const isRTLDirection = isRTL();

  const dashboardItems = [
    {
      id: "users",
      title: t("Manage Users"),
      icon: <People sx={{ fontSize: 48 }} />,
      color: "#1976d2",
      route: "/admin/user-management",
      image: "/api/placeholder/200/150?text=Users",
      group: "USERS"
    },
    {
      id: "order-management",
      title: t("Order Management"),
      icon: <ShoppingCart sx={{ fontSize: 48 }} />,
      color: "#388e3c",
      route: "/admin/order-management",
      image: "/api/placeholder/200/150?text=OrderManagement",
      group: "ORDERS"
    },
    {
      id: "paid-orders",
      title: t("Unpaid Orders"),
      icon: <ShoppingCart sx={{ fontSize: 48 }} />,
      color: "#2e7d32",
      route: "/admin/paid-orders",
      image: "/api/placeholder/200/150?text=UnpaidOrders",
      group: "ORDERS"
    },
    {
      id: "processing-orders",
      title: t("Processing Orders"),
      icon: <ShoppingCart sx={{ fontSize: 48 }} />,
      color: "#43a047",
      route: "/admin/processing-orders",
      image: "/api/placeholder/200/150?text=ProcessingOrders",
      group: "ORDERS"
    },
    {
      id: "undelivered-orders",
      title: t("Undelivered Orders"),
      icon: <ShoppingCart sx={{ fontSize: 48 }} />,
      color: "#66bb6a",
      route: "/admin/undelivered-orders",
      image: "/api/placeholder/200/150?text=UndeliveredOrders",
      group: "ORDERS"
    },
    {
      id: "categories",
      title: t("categories"),
      icon: <Category sx={{ fontSize: 48 }} />,
      color: "#f57c00",
      route: "/admin/category-management",
      image: "/api/placeholder/200/150?text=Categories",
      group: "PRODUCTS"
    },
    {
      id: "groups",
      title: t("Groups"),
      icon: <Category sx={{ fontSize: 48 }} />,
      color: "#ef6c00",
      route: "/admin/group-management",
      image: "/api/placeholder/200/150?text=Groups",
      group: "PRODUCTS"
    },
    {
      id: "products",
      title: t("Products Management"),
      icon: <Settings sx={{ fontSize: 48 }} />,
      color: "#e65100",
      route: "/admin/item-management",
      image: "/api/placeholder/200/150?text=Products",
      group: "PRODUCTS"
    },
    {
      id: "companies",
      title: t("Companies Management"),
      icon: <Business sx={{ fontSize: 48 }} />,
      color: "#c62828",
      route: "/admin/company-admin",
      image: "/api/placeholder/200/150?text=Companies",
      group: "COMPANIES"
    },
    {
      id: "order-report",
      title: t("Order Report"),
      icon: <Assessment sx={{ fontSize: 48 }} />,
      color: "#00695c",
      route: "/admin/order_report",
      image: "/api/placeholder/200/150?text=OrderReport",
      group: "REPORTS"
    },
    {
      id: "report-management",
      title: t("Requests Report"),
      icon: <Assessment sx={{ fontSize: 48 }} />,
      color: "#00897b",
      route: "/admin/report-management",
      image: "/api/placeholder/200/150?text=RequestsReport",
      group: "REPORTS"
    },
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  // Group items by category
  const groupedItems = dashboardItems.reduce((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
    return groups;
  }, {});

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        direction: isRTLDirection ? "rtl" : "ltr",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: "bold",
          textAlign: isRTLDirection ? "right" : "left",
          color: theme.palette.text.primary,
        }}
      >
        {t("Admin Dashboard")}
      </Typography>

      {Object.entries(groupedItems).map(([group, items]) => (
        <Box key={group} sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              mb: 3,
              fontWeight: "bold",
              textAlign: isRTLDirection ? "right" : "left",
              color: theme.palette.text.primary,
              borderBottom: `3px solid ${theme.palette.primary.main}`,
              pb: 1,
              display: "inline-block",
            }}
          >
            {t(group)}
          </Typography>
          
          <Grid
            container
            spacing={3}
            sx={{
              direction: isRTLDirection ? "rtl" : "ltr",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            {items.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Card
                  sx={{
                    width: 220,
                    height: 280,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    borderRadius: 3,
                    boxShadow: 3,
                    border: `2px solid ${item.color}20`,
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 8,
                      border: `2px solid ${item.color}`,
                    },
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                  onClick={() => handleCardClick(item.route)}
                >
                  <Box
                    sx={{
                      height: 150,
                      bgcolor: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {item.icon}
                  </Box>
                  
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {t(`Manage ${item.title.toLowerCase()}`)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {group !== Object.keys(groupedItems)[Object.keys(groupedItems).length - 1] && (
            <Divider sx={{ mt: 4, mb: 2 }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default AdminDashboard;