import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  TextField,
  Typography,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  CircularProgress,
  Box,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { t, isRTL } from "../../utils/translator";
import { useTheme } from "@mui/material/styles";

const API_BASE = "/api/admin";

const ManagedUsersPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);
  const [reasonDialog, setReasonDialog] = useState({ open: false, action: "", reason: "" });

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company_name: "",
    company_register_number: "",
    company_credit: "",
    company_period: "",
    status: "Pending",
    reason: "",
  });

  useEffect(() => {
    fetchUsers(currentPage);
  }, [filterStatus, currentPage, isRTL()]);

  const fetchUsers = async (page) => {
    setLoading(true);
    let url = `${API_BASE}/search/?page=${page}`;
    if (filterStatus !== "all") url += `&status=${filterStatus}`;
    try {
      const response = await axiosInstance.get(url);
      setUsers(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      console.error(err);
      showSnackbar(t("fetch_error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    let url = `${API_BASE}/search/?page=${currentPage}&q=${searchQuery}`;
    if (filterStatus !== "all") url += `&status=${filterStatus}`;
    try {
      const response = await axiosInstance.get(url);
      setUsers(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      console.error(err);
      showSnackbar(t("search_error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (id) => {
    try {
      const res = await axiosInstance.get(`${API_BASE}/user/${id}`);
      const data = res.data;
      setSelectedUser(data);
      setFormData({
        ...data,
        company_credit: data.company_credit || "",
        company_period: data.company_period || "",
      });
    } catch (err) {
      console.error(err);
      showSnackbar(t("fetch_user_error"), "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateUser = async (statusUpdate, message) => {
    if (!selectedUser) return;

    if (!formData.company_credit || formData.company_credit <= 0) {
      return showSnackbar(t("Credit amount is mandatory and should be more than 0"), "error");
    }
    if (!formData.company_period || formData.company_period <= 0) {
      return showSnackbar(t("Period is mandatory and should be more than 0"), "error");
    }

    if (statusUpdate === "Active") {
      try {
        const data = {
          credit: formData.company_credit,
          period: formData.company_period,
          status: "Active",
          reason: null,
        };

        await axiosInstance.post(`${API_BASE}/update_user/${selectedUser.id}`, data);
        showSnackbar(message || t("user_updated"), "success");
        fetchUsers(currentPage);
      } catch (err) {
        console.error(err);
        showSnackbar(t("error_user_update"), "error");
      }
    } else if (statusUpdate === "Blocked" || statusUpdate === "FixIssues") {
      setReasonDialog({ open: true, action: statusUpdate, reason: "" });
    }
  };

  const handleReasonSubmit = async () => {
    if (!reasonDialog.reason?.trim()) {
      return showSnackbar(t("Reason is required"), "error");
    }

    try {
      const data = {
        credit: formData.company_credit,
        period: formData.company_period,
        status: reasonDialog.action,
        reason: reasonDialog.reason,
      };

      await axiosInstance.post(`${API_BASE}/update_user/${selectedUser.id}`, data);
      
      const message = reasonDialog.action === "Blocked" 
        ? t("user_blocked_message") 
        : t("user_fix_issues_message");
      
      showSnackbar(message, "success");
      setReasonDialog({ open: false, action: "", reason: "" });
      fetchUsers(currentPage);
    } catch (err) {
      console.error(err);
      showSnackbar(t("error_user_update"), "error");
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    
<Box
  sx={{
    mb: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  }}
>
  <Typography
    variant="h4"
    component="h1"
    sx={{
      fontWeight: 700,
      color: theme.palette.text.primary,
      textAlign: isRTL() ? "right" : "left",
    }}
  >
    {t("Manage Users")}
  </Typography>
</Box>

      {/* Selected User Form */}
      {selectedUser && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("User Details")}
            </Typography>
            <Grid container spacing={2}>
              {["email", "first_name", "last_name", "company_name", "company_register_number"].map(
                (field) => (
                  <Grid item xs={12} sm={6} key={field}>
                    <TextField fullWidth label={t(field)} value={formData[field]} disabled />
                  </Grid>
                )
              )}

              {["company_credit", "company_period"].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t(field)}
                    name={field}
                    value={formData[field]}
                    onChange={handleFormChange}
                  />
                </Grid>
              ))}



              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateUser("Active", t("user_activated_message"))}
                    disabled={formData.status === "Active"}
                  >
                    {t("Activate")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => updateUser("Blocked", t("user_blocked_message"))}
                  >
                    {t("Block")}
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => updateUser("FixIssues", t("user_fix_issues_message"))}
                  >
                    {t("Fix Issues")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
   
      <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2,
    mb: 3,
  }}
>
  <FormControl sx={{ minWidth: 150, flex: 1 }}>
    <InputLabel>{t("Filter")}</InputLabel>
    <Select
      value={filterStatus}
      label={t("Filter")}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
      <MenuItem value="Pending">{t("Pending")}</MenuItem>
      <MenuItem value="Active">{t("Active")}</MenuItem>
      <MenuItem value="FixIssues">{t("FixIssues")}</MenuItem>
      <MenuItem value="Blocked">{t("Blocked")}</MenuItem>
      <MenuItem value="all">{t("All")}</MenuItem>
    </Select>
  </FormControl>

  <TextField
    fullWidth
  
    label={t("search")}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />

  <Button
    color="primary"
    variant="contained"
    sx={{ whiteSpace: "nowrap" }}
   
    endIcon={<SearchIcon />}
    onClick={() => handleSearch()}
  >
    {t("search")}
  </Button>
</Box>

     

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                {[
                  "email",
                  "first_name",
                  "last_name",
                  "company_name",
                  "company_register_number",
                  "company_credit",
                  "company_period",
                  "status",
                  "reason",
                ].map((field) => (
                  <TableCell key={field} sx={{ fontWeight: "bold", color: theme.palette.common.white }}>
                    {t(field)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        idx % 2 === 0
                          ? theme.palette.mode === "dark"
                            ? "#1e1e1e"
                            : "#f9f9f9"
                          : theme.palette.background.paper,
                    }}
                    onClick={() => handleRowClick(user.id)}
                  >
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{user.company_name}</TableCell>
                    <TableCell>{user.company_register_number}</TableCell>
                    <TableCell>{user.company_credit}</TableCell>
                    <TableCell>{user.company_period}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(user.status)}
                        color={user.status === "Active" ? "success" : user.status === "Pending" ? "default" : user.status === "FixIssues" ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.reason || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {t("No results found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>

      {/* Reason Dialog */}
      <Dialog open={reasonDialog.open} onClose={() => setReasonDialog({ open: false, action: "", reason: "" })}>
        <DialogTitle>
          {reasonDialog.action === "Blocked" ? t("Block User") : t("Fix Issues")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("Reason")}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reasonDialog.reason}
            onChange={(e) => setReasonDialog({ ...reasonDialog, reason: e.target.value })}
            placeholder={t("Enter reason")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReasonDialog({ open: false, action: "", reason: "" })}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleReasonSubmit} variant="contained" color="primary">
            {t("Submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagedUsersPage;
