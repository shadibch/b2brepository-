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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  useTheme,
} from "@mui/material";
import { t, isRTL, formatNumber } from "../../utils/translator";
import axiosInstance from "../axiosInstance";

export default function PaidOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/admin/paid-orders/?page=${currentPage}&q=${searchQuery}`
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

  const handleExecutePaid = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const confirmExecutePaid = async () => {
    try {
      await axiosInstance.post(`/api/admin/execute-paid/${selectedOrder.id}/`);
      setMessage({
        type: "success",
        text: t("Order marked as paid successfully"),
      });
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedOrder.id));
      setOpenDialog(false);
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
      {/* Header */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          textAlign: isRTL() ? "right" : "left",
          color: theme.palette.text.primary,
        }}
      >
        {t("Unpaid Orders")}
      </Typography>

      {/* Alerts */}
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Search Bar */}
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
          onClick={() =>handleSearch()}
          sx={{ whiteSpace: "nowrap" }}
        >
          {t("search")}
        </Button>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
          <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                {t("Order ID")}
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                {t("Company")}
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                {t("total_price")}
              </TableCell>
            
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                {t("company_credit")}
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                {t("Actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order, index) => (
              <TableRow
                key={order.id}
                sx={{
                  bgcolor:
                    index % 2 === 0
                      ? theme.palette.action.hover
                      : theme.palette.background.paper,
                }}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.company_name}</TableCell>
                <TableCell>{formatNumber(order.total_price,order.currency)}</TableCell>
               
                <TableCell>{formatNumber(order.company_credit,order.currency)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleExecutePaid(order)}
                  >
                    {t("Execute Paid")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        dir={isRTL() ? "rtl" : "ltr"}
      >
        <DialogTitle>{t("Confirm Execute Paid")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Are you sure you want to mark this order as paid?")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            {t("Cancel")}
          </Button>
          <Button onClick={() =>confirmExecutePaid()} variant="contained" color="success">
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
