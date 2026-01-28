import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  ShoppingBasket,
  Dashboard,
  Settings,
  Receipt,
  Timeline,
  Assessment,
  People,
  AccountCircle,
  Store,
  LocalOffer,
  Description,
  Event,
  Notifications,
  Favorite,
} from "@mui/icons-material";
import axiosInstance from "./axiosInstance";
import { t, isRTL } from "../utils/translator";

const UserDashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");
  const isRTLDirection = isRTL();

  // Icon mapping for different navigation items
  const getIconForLink = (linkName) => {
    const name = linkName.toLowerCase();
    if (name.includes("order") || name.includes("طلب")) return <Receipt sx={{ fontSize: 48 }} />;
    if (name.includes("history") || name.includes("سجل")) return <Timeline sx={{ fontSize: 48 }} />;
    if (name.includes("profile") || name.includes("حساب")) return <AccountCircle sx={{ fontSize: 48 }} />;
    if (name.includes("setting") || name.includes("إعداد")) return <Settings sx={{ fontSize: 48 }} />;
    if (name.includes("report") || name.includes("تقرير")) return <Assessment sx={{ fontSize: 48 }} />;
    if (name.includes("quote") || name.includes("عرض")) return <Description sx={{ fontSize: 48 }} />;
    if (name.includes("event") || name.includes("حدث")) return <Event sx={{ fontSize: 48 }} />;
    if (name.includes("notification") || name.includes("إشعار")) return <Notifications sx={{ fontSize: 48 }} />;
    if (name.includes("favorite") || name.includes("مفضل")) return <Favorite sx={{ fontSize: 48 }} />;
    if (name.includes("branch") || name.includes("فرع")) return <Store sx={{ fontSize: 48 }} />;
    return <Dashboard sx={{ fontSize: 48 }} />;
  };

  // Color mapping for variety
  const getColorForIndex = (index) => {
    const colors = [
      "#1976d2", // blue
      "#388e3c", // green
      "#f57c00", // orange
      "#7b1fa2", // purple
      "#c62828", // red
      "#00695c", // teal
      "#5d4037", // brown
      "#455a64", // blue grey
      "#e65100", // deep orange
      "#00838f", // cyan
    ];
    return colors[index % colors.length];
  };

  const fetchNavigationLinks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/navigation/");
      setLinks(response.data.links || []);
    } catch (error) {
      console.error("Error fetching navigation links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigationLinks();
  }, []);

  const handleCardClick = (route) => {
    navigate(route);
  };

  // Create dashboard items from navigation links
  const navigationItems = links.map((link, index) => ({
    id: link.url || `nav-${index}`,
    title: t(link.name),
    icon: getIconForLink(link.name),
    color: getColorForIndex(index),
    route: link.url,
    image: `/api/placeholder/200/150?text=${link.name}`,
    group: "NAVIGATION",
  }));

  // Add products button
  const productsItem = {
    id: "products",
    title: t("Products"),
    icon: <ShoppingBasket sx={{ fontSize: 48 }} />,
    color: "#2e7d32",
    route: "/products",
    image: "/api/placeholder/200/150?text=Products",
    group: "MAIN",
  };

  const dashboardItems = [productsItem, ...navigationItems];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Typography variant="h6">{t("Loading...")}</Typography>
      </Box>
    );
  }

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
        {t("User Dashboard")}
      </Typography>

      {/* Main Section - Products */}
      <Box sx={{ mb: 4 }}>
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
          {t("Shopping")}
        </Typography>
        
        <Grid
          container
          spacing={3}
          sx={{
            direction: isRTLDirection ? "rtl" : "ltr",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
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
                border: `2px solid ${productsItem.color}20`,
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 8,
                  border: `2px solid ${productsItem.color}`,
                },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={() => handleCardClick(productsItem.route)}
            >
              <Box
                sx={{
                  height: 150,
                  bgcolor: productsItem.color,
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
                    backgroundImage: `url(${productsItem.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {productsItem.icon}
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
                  {productsItem.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t("Browse and shop products")}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation Section */}
      {navigationItems.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Divider sx={{ mb: 3 }} />
          
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
            {t("Quick Access")}
          </Typography>
          
          <Grid
            container
            spacing={3}
            sx={{
              direction: isRTLDirection ? "rtl" : "ltr",
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            {navigationItems.map((item) => (
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
                      {t("Quick access")}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {navigationItems.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: theme.palette.text.secondary,
          }}
        >
          <Typography variant="h6">
            {t("No navigation items available")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserDashboard;