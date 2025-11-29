import React, { useEffect, useState } from "react";
import {
  Box,
  TextField ,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Typography,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Grid,
  Backdrop
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import CloseIcon from "@mui/icons-material/Close";
import {
  t,
  isRTL,
  formatNumber,
  formatDate,
  formatLocal,
} from "../utils/translator";
import { API_BASE_URL, DEFAULT_IMAGE } from "../utils/settings";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const navigate = useNavigate();

  const itemsPerPage = 10;
  const theme = useTheme();
  useEffect(() => {
    document.body.classList.toggle("rtl", isRTL());
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/orders/?page=${page}`);
      setOrders(response.data.results);
      setTotalPages(Math.ceil(response.data.count / itemsPerPage));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const handleSelectedOrder = async (order) => {
    setLoadingOrder(true);           // Start loading
    setSelectedOrder(null);          // Clear previous order (if any)
  
    try {
      const response = await axiosInstance.get(`/api/order/details/${order.id}/`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoadingOrder(false);        // Stop loading
    }
  };
  

  const handleReorder = async (order) => {
    await axiosInstance.post(`api/reorder/${order.id}/`);
    navigate("/cartdetails");
  };

  const getRowColor = (status) => {
    switch (status) {
      case "PND":
        return "#FBC02D"; // Deep yellow (good contrast with white)
      case "RJC":
        return "#E53935"; // Strong red
      case "ACC":
        return "#43A047"; // Medium green
      case "PRJ":
        return "#FB8C00"; // Vivid orange
      default:
        return "#424242"; // Neutral dark gray fallback
    }
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
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {t("orders")}
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
          <TableRow
    sx={{ backgroundColor: "primary.light" }}
      >
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("id_order")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("status")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("purchase_date")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("rejection_reason")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("total_price")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("Order Status")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">{t("Invoice")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                sx={{ backgroundColor: getRowColor(order.status) }}
              >
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{formatLocal(order.id)}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t(order.status)}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{formatDate(new Date(order.purchaseDate))}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{order.rejection_reason || "-"}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  {order.total_price
                    ? formatNumber(order.total_price, order.currency)
                    : "-"}
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t(order.order_status)}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  <Grid container spacing={1} direction="column">
                    <Grid item>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.6)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.35)",
                          },
                        }}
                        onClick={() => handleSelectedOrder(order)}
                      >
                        {t("View")}
                      </Button>
                    </Grid>
                    {(order.status === "ACC" || order.status === "PRJ") && (
                      <Grid item>
                        <Button
                          variant="text"
                          size="small"
                          sx={{
                            color: "white",
                            borderColor: "rgba(255, 255, 255, 0.7)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.15)",
                              borderColor: "white",
                            },
                          }}
                          component="a"
                          href={`${API_BASE_URL}/api/download_invoice/${order.id}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("Download Invoice")}
                        </Button>
                      </Grid>
                    )}
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleReorder(order)}
                      >
                        {t("Reorder")}
                      </Button>
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Box>
      <Backdrop
  sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
  open={loadingOrder}
>
  <CircularProgress color="inherit" />
</Backdrop>

      {/* Order Details Dialog */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.palette.background.default,
              boxShadow: 8,
            },
          },
        }}
      >
         <DialogTitle
   sx={{
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    m: 0,
    p: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
  >
    <Typography variant="h6">{t("order_details")}</Typography>
    <IconButton
      aria-label="close"
      onClick={() => setSelectedOrder(null)}
      sx={{
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
        <DialogContent dividers  sx={{
          bgcolor: theme.palette.grey[50],
          p: 3,
        }}>
          {loadingDetails ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            selectedOrder && (
              <>
                {selectedOrder.items.map((item) => (
                  <Card
                    key={item.id}
                    variant="outlined"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      px: 1,
                      borderRadius: 2,
                      backgroundColor:
                        item.status === "RJC"
                          ? theme.palette.error.light + "33"
                          : theme.palette.background.paper,
                      boxShadow: theme.shadows[1],
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        transform: "translateY(-2px)",
                      },
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
                      sx={{ width: 100, height: 100, objectFit: "cover", p: 1 }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6"   sx={{ fontWeight: 600 }}>{item.branch_name}</Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color:
                            item.status === "RJC"
                              ? theme.palette.error.main
                              : theme.palette.text.primary,
                          textDecoration:
                            item.status === "RJC" ? "line-through" : "none",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration:
                              item.status === "RJC" ? "line-through" : "underline",
                          },
                        }}
                        onClick={() =>
                          navigate(`/productitem/${item.part_id}`)
                        }
                      >
                        {item.project_name}
                      </Typography>

                      {item.status === "RJC" && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.error.dark,
                            mt: 0.5,
                            fontStyle: "italic",
                          }}
                        >
                          {item.rejection_reason}
                        </Typography>
                      )}

                      <TextField
                        type="number"
                        value={item.quantity}
                        disabled
                        size="small"
                        sx={{
                          width: 100,
                          mt: 1,
                          textDecoration:
                            item.status === "RJC" ? "line-through" : "none",
                          "& .MuiInputBase-input.Mui-disabled": {
                            color:
                              item.status === "RJC" ? "#8B0000" : "inherit",
                          },
                        }}
                      />
                    </CardContent>

                    <Typography
                      variant="h6"
                      sx={{
                        px: 2,
                        color: item.status === "RJC" ? "#8B0000" : "inherit",
                        textDecoration:
                          item.status === "RJC" ? "line-through" : "none",
                      }}
                    >
                      {formatNumber(item.price, item.currency)}
                    </Typography>
                  </Card>
                ))}

                <Box sx={{ textAlign: "right", mt: 2 }}>
                  <Typography variant="h6">
                    {t("subtotal")}:{" "}
                    <strong>
                      {formatNumber(
                        selectedOrder?.total_price,
                        selectedOrder?.currency
                      )}
                    </strong>
                  </Typography>
                </Box>
              </>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
