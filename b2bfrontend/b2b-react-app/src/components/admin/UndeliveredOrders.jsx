import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axiosInstance from "../axiosInstance";
import { t, formatNumber, isRTL } from "../../utils/translator";

export default function UndeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/admin/undelivered-orders/?page=${currentPage}&q=${searchQuery}`
      );
      setOrders(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.page_size));
    } catch (error) {
      setMessage({ type: "error", text: t("Error fetching orders") });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleExecuteDelivery = (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const confirmExecuteDelivery = async () => {
    try {
      await axiosInstance.post(`/api/admin/execute-delivery/${selectedOrder.id}/`);
      setMessage({ type: "success", text: t("Order marked as delivered successfully") });
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedOrder.id));

      setShowConfirmModal(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || t("Error updating order"),
      });
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        minHeight: "100vh",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#121212" : "#f5f7fa",
        color: (theme) => theme.palette.text.primary,
      }}
    >
      {/* PAGE HEADER */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          textAlign: isRTL() ? "right" : "left",
        }}
      >
        {t("Undelivered Orders")}
      </Typography>

      {/* ALERTS */}
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
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
        >
          {t("search")}
        </Button>
      </Box>

      {/* TABLE */}
      <TableContainer
        component={Paper}
      
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("Order ID")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("Company")}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("total_price")}</TableCell>
             
              <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("company_credit")}</TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: 600 }}>
                {t("Actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order.id}
                sx={{
                  backgroundColor:
                    index % 2 === 0
                      ? "background.paper"
                      : "action.hover",
                }}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell>{formatNumber(order.total_price,order.currency)}</TableCell>
                
                <TableCell>{formatNumber(order.company_credit,order.currency)}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleExecuteDelivery(order)}
                  >
                    {t("Mark as Delivered")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* CONFIRM DELIVERY DIALOG */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <DialogTitle>{t("Confirm Delivery")}</DialogTitle>
        <DialogContent>
          {t("Are you sure you want to mark this order as delivered?")}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmModal(false)}>
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={()=>confirmExecuteDelivery()}
          >
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
