import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { useHeaderContext } from "./HeaderContext";
import { t, isRTL, formatNumber } from "../utils/translator";
import { API_BASE_URL, DEFAULT_IMAGE } from "../utils/settings";

export default function Contracts() {
  const { i18n } = useTranslation();
  const [contracts, setContracts] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { selectedBranchId } = useHeaderContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axiosInstance.get("/api/contract/");
        const contract = response.data;
        console.log(contract);
        const items = contract.items.map((item) => ({
          ...item,
          quantity: 0,
        }));
        setContracts({ ...contract, items });
      } catch (err) {
        console.error("Error fetching contracts:", err);
        setError(t("Error loading contracts"));
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
    document.body.classList.toggle("rtl", isRTL());
  }, [i18n.language]);

  const handleQuantityChange = (productId, newQuantity) => {
    setContracts((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      return { ...prev, items: updatedItems };
    });
  };
  

  const handleAddedItem = async (item) => {

    try {
      await axiosInstance.post(`/api/add-item/${selectedBranchId}/`, {
        product: item.product.id,
        quantity: item.quantity,
      });
      window.dispatchEvent(new CustomEvent("updateCart"));
      setMessage(`${t("Item has added to the shopping cart")} ${item.product.name}`);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(t("Failed to add item to cart"));
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        direction: isRTL() ? "rtl" : "ltr",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {t("Contracts")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message &&(
        <Alert
          onClose={() => setMessage("")}
          severity="success"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      )}
   
      {contracts?.items?.length > 0 ? (
        <Grid container spacing={2}>
          {contracts.items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                flexWrap: "wrap",
              }}
            >

<CardMedia
                component="img"
                image={
                  item.product.media_url
                  ? `${item.product.media_url}`
                  : DEFAULT_IMAGE
                }
                alt={item.project_name}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  mr: 2,
                  objectFit: "cover",
                }}
              />
             


              <CardContent sx={{ flex: 1, minWidth: 220 }}>
                  <Typography
                    variant="h6"
                    onClick={() => navigate(`/productitem/${item.product.part_id}`)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {item.product.name}
                  </Typography>
                
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(item.price, item.currency)}
                  </Typography>
                  <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    gap: 1,
                  }}
                >
                  <TextField
                    type="number"
                    label={t("Quantity")}
                    size="small"
                    fullWidth
                    value={item.quantity}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100 }}
                    onChange={(e) =>
                      handleQuantityChange(item.product.id, parseInt(e.target.value))
                    }
                    
                  />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleAddedItem(item)}
                  >
                    {t("add_to_cart")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">{t("No contracts available")}</Typography>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
     
      </Snackbar>
    </Box>
  );
}
