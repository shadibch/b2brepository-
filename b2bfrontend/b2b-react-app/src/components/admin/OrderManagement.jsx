import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { API_BASE_URL, DEFAULT_IMAGE } from "../../utils/settings";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Pagination,
  Grid,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { t, formatNumber, formatLocal, isRTL } from "../../utils/translator";
import SearchIcon from "@mui/icons-material/Search";

const API_BASE_URL_ADMIN = "/api/admin";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async (query = "", page = 1) => {
    try {
      const res = await axiosInstance.get(
        `${API_BASE_URL_ADMIN}/orders/${query ? `?q=${query}&` : "?"}page=${page}`
      );
      setOrders(res.data.results);
      setTotalPages(res.data.total_pages || 1); // use total_pages from API
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL_ADMIN}/order/${orderId}/`);
      setSelectedOrder(res.data);
      setSelectedOrderId(orderId);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageChange = (e, page) => {
    setCurrentPage(page);
    fetchOrders(search, page );
  };

  const handleAccept = async (messageText) => {
    if (!selectedOrderId) return;
    await axiosInstance.post(
      `${API_BASE_URL_ADMIN}/updateorder/${selectedOrderId}/`,
      { status: "ACC" }
    );
    if (selectedOrder) selectedOrder.status = "ACC";
    setMessage({ type: "success", text: messageText });
    setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedOrder.id));
  };

  const handleReject = async (messageText) => {
    if (!rejectionReason.trim()) {
      setMessage({ type: "error", text: t("rejected_error_message") });
      return;
    }
    await axiosInstance.post(`${API_BASE_URL_ADMIN}/updateorder/${selectedOrderId}/`, {
      status: "RJC",
      rejection_reason: rejectionReason,
    });
    if (selectedOrder) selectedOrder.status = "RJC";
    setMessage({ type: "success", text: messageText });
    fetchOrders();
    setSelectedOrder(null);
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
      {/* PAGE HEADER */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          textAlign: isRTL() ? "right" : "left",
          color: theme.palette.text.primary,
        }} >
        {t("Order Management")}
      </Typography>

      {/* GLOBAL MESSAGE */}
      {message.text && (
        <Alert
          severity={message.type === "danger" ? "error" : message.type}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* SELECTED ORDER */}
      {selectedOrder && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("order_details")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>{t("company_name")}: </strong>
                  {selectedOrder.company_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>{t("company_register_number")}: </strong>
                  {selectedOrder.company_registered_number}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography>
                  <strong>{t("company_credit")}: </strong>
                  {formatNumber(selectedOrder?.company_credit, selectedOrder?.currency)}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {t("order_items")}
              </Typography>

              {selectedOrder.items.map((item) => (
                <Grid
                  container
                  spacing={2}
                  key={item.id}
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    py: 1,
                    alignItems: "center",
                  }}
                >
                  <Grid item xs={12} sm={2}>
                    <img
                      src={item.media_url ? `${item.media_url}` : DEFAULT_IMAGE}
                      alt={item.project_name}
                      style={{ width: "100%", maxWidth: 80, borderRadius: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography
                      sx={{
                        textDecoration: item.status === "RJC" ? "line-through" : "none",
                        color: item.status === "RJC" ? "#8B0000" : "inherit",
                      }}
                    >
                      {item.project_name}
                    </Typography>
                    {item.status === "RJC" && (
                      <Typography sx={{ color: "#8B0000" }}>{item.rejection_reason}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography>{item.quantity}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Typography>{formatNumber(item.price, item.currency)}</Typography>
                  </Grid>
                  {item.status === "INT" && (
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label={t("rejected_label")}
                        value={item.rejection_reason || ""}
                        onChange={(e) => (item.rejection_reason = e.target.value)}
                        size="small"
                      />
                      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleAccept(t("accepted_message"))}
                        >
                          {t("accept")}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleReject(t("rejected_message"))}
                        >
                          {t("reject")}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ))}
            </Box>

            {/* REJECTION REASON FOR ORDER */}
            {selectedOrder.status !== "ACC" && selectedOrder.status !== "RJC" && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label={t("rejected_label")}
                  fullWidth
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  size="small"
                />
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAccept(t("accepted_message"))}
                  >
                    {t("accept")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(t("rejected_message"))}
                  >
                    {t("reject")}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEARCH & ORDERS TABLE */}
     
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
          value={search}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() =>fetchOrders(search)}
          sx={{ whiteSpace: "nowrap" }}
          endIcon={<SearchIcon />}
        >
          {t("search")}
        </Button>
      </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("order_id")}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("company_name")}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("company_register_number")}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("company_credit")}</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>{t("total_price")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((row, index) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                  }}
                  onClick={() => fetchOrderDetail(row.id)}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.company_name}</TableCell>
                  <TableCell>{row.company_registered_number}</TableCell>
                  <TableCell>{formatNumber(row.company_credit, row.currency)}</TableCell>
                  <TableCell>{formatNumber(row.total_price, row.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
  
  );
}
