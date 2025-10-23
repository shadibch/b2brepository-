import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import axiosInstance from "../axiosInstance";
import SearchIcon from "@mui/icons-material/Search";
import { t, formatNumber, isRTL } from "../../utils/translator";
import { API_BASE_URL, DEFAULT_IMAGE } from "../../utils/settings";

export default function ProcessingOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/admin/processing-orders/?page=${currentPage}&q=${searchQuery}`
      );
      setOrders(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.page_size));
    } catch (error) {
      setMessage({ type: "error", text: t("Error fetching orders") });
    }
  };

  const handleDownload = async (order) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/admin/orders/items/${order.id}/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_instances_${order.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ type: "error", text: t("Failed to generate report") });
    }
    setLoading(false);
  };

  const handleReadyToDeliver = (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const confirmReadyToDeliver = async () => {
    try {
      await axiosInstance.post(`/api/admin/ready-to-deliver/${selectedOrder.id}/`);
      setMessage({ type: "success", text: t("Order marked as ready to deliver") });
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedOrder.id));
      setShowConfirmModal(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || t("Error updating order"),
      });
      setShowConfirmModal(false);
    }
  };

  const handleSelectedOrder = (order) => {
    setSelectedOrder(order);
    setShowItems(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  return (
    <Box
    sx={{
      width: "100%",
      minHeight: "100vh",
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "#f5f6fa",
      p: 3,
      direction: isRTL() ? "rtl" : "ltr",
    }}
    >
      {/* HEADER */}
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 700, textAlign: isRTL() ? "right" : "left" }}
      >
        {t("Processing Orders")}
      </Typography>

      {/* ALERT MESSAGE */}
      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* SELECTED ORDER ITEMS */}
      {showItems && selectedOrder && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("Order Details")} #{selectedOrder.id}
            </Typography>

            {selectedOrder.items.map((item) => (
              <Grid
                container
                key={item.id}
                spacing={2}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  py: 1,
                  alignItems: "center",
                }}
              >
                <Grid item xs={12} sm={2}>
                  <img
                    src={
                      item.image_path
                        ? `${API_BASE_URL}${item.image_path}`
                        : DEFAULT_IMAGE
                    }
                    alt={item.project_name}
                    style={{ width: "100%", maxWidth: 80, borderRadius: 4 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography>{item.branch_name}</Typography>
                  <Typography
                    sx={{
                      textDecoration:
                        item.status === "RJC" ? "line-through" : "none",
                      color: item.status === "RJC" ? "#8B0000" : "inherit",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(
                        `/admin/item-management/?product_id=${item.product_id}`,
                        "_blank"
                      )
                    }
                  >
                    {item.project_name}
                  </Typography>
                  {item.status === "RJC" && (
                    <Typography sx={{ color: "#8B0000" }}>
                      {item.rejection_reason}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Typography>{item.quantity}</Typography>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Typography>
                    {formatNumber(item.price, item.currency)}
                  </Typography>
                </Grid>
              </Grid>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                fontWeight: 600,
              }}
            >
              {t("subtotal")}:{" "}
              {formatNumber(selectedOrder?.total_price, selectedOrder?.currency)}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* SEARCH BAR */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          placeholder={t("Search by company name")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
         
        />
        <Button
          variant="contained"
          color="primary"
          onClick={()=>handleSearch()}
          sx={{ whiteSpace: "nowrap" }}
          endIcon={<SearchIcon />}
        >
          {t("search")}
        </Button>
      </Box>

      {/* ORDERS TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell  sx={{ color: "white", fontWeight: 600 }}>{t("Order ID")}</TableCell>
              <TableCell  sx={{ color: "white", fontWeight: 600 }}>{t("Company")}</TableCell>
              <TableCell  sx={{ color: "white", fontWeight: 600 }}>{t("total_price")}</TableCell>

              <TableCell  sx={{ color: "white", fontWeight: 600 }}>{t("company_credit")}</TableCell>
              <TableCell align="center"  sx={{ color: "white", fontWeight: 600 }}>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order.id}
                sx={{
                  backgroundColor:
                    index % 2 === 0 ? "background.paper" : "action.hover",
                }}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell>{formatNumber(order.total_price,order.currency)}</TableCell>
      
                <TableCell>{formatNumber(order.company_credit,order.currency)}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleSelectedOrder(order)}
                  >
                    {t("View")}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleDownload(order)}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={14} color="inherit" /> : null
                    }
                  >
                    {t("Download")}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleReadyToDeliver(order)}
                  >
                    {t("Ready to Deliver")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>

      {/* CONFIRM DIALOG */}
      <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <DialogTitle>{t("Confirm Ready to Deliver")}</DialogTitle>
        <DialogContent>{t("Are you sure this order is ready to be delivered?")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmModal(false)}>{t("Cancel")}</Button>
          <Button variant="contained" color="success" onClick={()=>WconfirmReadyToDeliver}>
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
