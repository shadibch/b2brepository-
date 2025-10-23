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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { t, isRTL } from "../../utils/translator";
import { useTheme } from "@mui/material/styles";

const API_BASE = "/api/admin";

const ManagedUsersPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filterActive, setFilterActive] = useState("false");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company_name: "",
    company_register_number: "",
    company_credit: "",
    company_period: "",
    is_active: false,
  });

  useEffect(() => {
    fetchUsers(currentPage);
  }, [filterActive, currentPage, isRTL()]);

  const fetchUsers = async (page) => {
    setLoading(true);
    let url = `${API_BASE}/search/?page=${page}`;
    if (filterActive !== "all") url += `&active=${filterActive}`;
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
    if (filterActive !== "all") url += `&active=${filterActive}`;
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

  const updateUser = async (activeUpdate = null, message = t("user_updated")) => {
    if (!selectedUser) return;

    if (!formData.company_credit || formData.company_credit <= 0) {
      return showSnackbar(t("Credit amount is mandatory and should be more than 0"), "error");
    }
    if (!formData.company_period || formData.company_period <= 0) {
      return showSnackbar(t("Period is mandatory and should be more than 0"), "error");
    }

    try {
      const data = {
        credit: formData.company_credit,
        period: formData.company_period,
      };
      if (activeUpdate !== null) data.active = activeUpdate;

      await axiosInstance.post(`${API_BASE}/update_user/${selectedUser.id}`, data);
      showSnackbar(message, "success");
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
        backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        p: 3,
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
                    onClick={() => updateUser(true, t("user_activated_message"))}
                    disabled={formData.is_active}
                  >
                    {t("Activate")}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => updateUser(false, t("user_deactivated_message"))}
                    disabled={!formData.is_active}
                  >
                    {t("Deactivate")}
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => updateUser()}>
                    {t("Update")}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>{t("Filter")}</InputLabel>
              <Select
                value={filterActive}
                label={t("Filter")}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <MenuItem value="true">{t("Active")}</MenuItem>
                <MenuItem value="false">{t("Inactive")}</MenuItem>
                <MenuItem value="all">{t("All")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button fullWidth variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
              {t("search")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
                  "is_active",
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
                        label={t(user.is_active ? "Active" : "Inactive")}
                        color={user.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {t("no_results_found")}
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
