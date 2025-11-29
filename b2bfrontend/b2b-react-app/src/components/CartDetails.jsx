import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosInstance from "./axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  isRTL,
  formatNumber,
  t as translate,
} from "../utils/translator";
import { API_BASE_URL, DEFAULT_IMAGE } from "../utils/settings";

export default function CreateDetails() {
  const { t } = useTranslation();
  const [cartDetails, setCartDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const allZeroQuantities =
  cartDetails?.instances?.length > 0 &&
  cartDetails.instances.every((item) => Number(item.quantity) === 0);
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axiosInstance.get("/api/cart_details/");
        setCartDetails(response.data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
    document.body.classList.toggle("rtl", isRTL());
  }, []);

  const confirmDelete = (item) => {
    setDeleteItem(item);
    setShowModal(true);
  };

  const handleQuantityChange = async (id, value) => {
    try {
      const response = await axiosInstance.post(
        `/api/update_item/${id}/`,
        new URLSearchParams({ quantity: value.toString() })
      );
      setCartDetails(response.data);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(`api/delete_item/${deleteItem.id}/`);
      setCartDetails(response.data);
      window.dispatchEvent(new CustomEvent("updateCart"));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
    setShowModal(false);
  };

  const handlePurchaseRequest = () => {
    axiosInstance
      .post("/api/purchase_request/")
      .then((response) => {
        window.dispatchEvent(new CustomEvent("updateCart"));
        navigate("/order", { state: { results: response.data } });
      })
      .catch((ex) => {
        if (ex.response && ex.response.status === 400) {
          setError(t(ex.response.data.detail));
        }
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        {t("shoppingcart")}
      </Typography>

      <Grid container spacing={2}>
        {cartDetails?.instances?.map((item) => (
          <Grid item xs={12} key={item.id}>
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
                  item.media_url
                    ? `${item.media_url}`
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
                <Typography variant="h6">{item.branch_name}</Typography>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/productitem/${item.part_id}`)}
                >
                  {item.project_name}
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
                    size="small"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value))
                    }
                    sx={{ width: 100 }}
                    inputProps={{ min: 1 }}
                  />
                  <IconButton
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(item);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>

              <Typography variant="h6" sx={{ mx: 2 }}>
                {formatNumber(item.price, item.currency)}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Subtotal & Checkout */}
      <Box sx={{ mt: 4, textAlign: "right" }}>
        <Typography variant="h6">
          {t("subtotal")}:{" "}
          <strong>
            {formatNumber(cartDetails?.total_price, cartDetails?.currency)}
          </strong>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          disabled={allZeroQuantities}
          sx={{ mt: 2 }}
          fullWidth
          onClick={handlePurchaseRequest}
        >
          {t("purchaserequest")}
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>{t("confirm_deletion")}</DialogTitle>
        <DialogContent>
          {t("confirm_item")} "{deleteItem?.project_name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>{t("cancel")}</Button>
          <Button color="error" onClick={handleDelete} variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
