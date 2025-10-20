import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,

  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { t } from "../utils/translator";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: "",
    branches: [],
  });
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, branchesRes] = await Promise.all([
          axiosInstance.get("/api/users/"),
          axiosInstance.get("/api/branches/"),
        ]);
        setUsers(usersRes.data);
        setBranches(branchesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRowClick = async (user) => {
    try {
      const res = await axiosInstance.get(`/api/user/${user.id}`);
      setUserId(user.id);
      setFormData({
        email: res.data.email,
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        password: "",
        password_confirmation: "",
        branches: res.data.branches.map((b) => b.id) || [],
      });
      setMessage(null);
      setEmailError(null);
    } catch (err) {
      console.error("Error fetching user:", err);
      setMessage({ type: "error", text: t("Failed to retrieve user details.") });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEmailError(null);
    setMessage(null);
  };

  const handleBranchChange = (id) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.includes(id)
        ? prev.branches.filter((b) => b !== id)
        : [...prev.branches, id],
    }));
  };

  const validateEmail = async () => {
    if (!userId && formData.email) {
      try {
        const res = await axiosInstance.get(`/api/user/${formData.email}`);
        if (res.data.exists) setEmailError(t("Email already exists."));
      } catch {
        // ignore if user not found
      }
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      return setMessage({ type: "error", text: t("All fields are required.") });
    }

    if (!userId) {
      await validateEmail();
      if (emailError) return;
      if (!formData.password || !formData.password_confirmation) {
        return setMessage({ type: "error", text: t("Password is required.") });
      }
      if (formData.password !== formData.password_confirmation) {
        return setMessage({ type: "error", text: t("Passwords do not match.") });
      }
    }

    try {
      const endpoint = userId
        ? `/api/users/update/${userId}/`
        : "/api/register_staff/";
      const payload = { ...formData };
      if (userId) delete payload.password;

      const res = await axiosInstance.post(endpoint, payload);
      if (res.status === 200 || res.status === 201) {
        setMessage({
          type: "success",
          text: t(`User ${userId ? "updated" : "created"} successfully!`),
        });
        const refreshed = await axiosInstance.get("/api/users/");
        setUsers(refreshed.data);
        if (!userId) setUserId(res.data.id);
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setMessage({ type: "error", text: t("Error saving user.") });
    }
  };

  const handleClear = () => {
    setUserId(null);
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirmation: "",
      branches: [],
    });
    setMessage(null);
    setEmailError(null);
  };

  const confirmDelete = (user) => {
    setDeleteUser(user);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/users/${deleteUser.email}`);
      setMessage({
        type: "success",
        text: `User "${deleteUser.email}" deleted successfully.`,
      });
      const refreshed = await axiosInstance.get("/api/users/");
      setUsers(refreshed.data);
    } catch {
      setMessage({ type: "error", text: t("Error deleting user.") });
    } finally {
      setConfirmOpen(false);
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
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {t("Manage Users")}
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* User Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
  <Grid container spacing={2} direction="column">
    <Grid item xs={12}>
      <TextField
        fullWidth
        label={t("email")}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={validateEmail}
        disabled={!!userId}
        error={!!emailError}
        helperText={emailError}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label={t("firstname")}
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label={t("lastname")}
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
      />
    </Grid>

    {!userId && (
      <>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("password")}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("confirmpassword")}
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
        </Grid>
      </>
    )}

    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {t("Branches")}
      </Typography>
      <Grid container spacing={1}>
        {branches.map((branch) => (
          <Grid item xs={12} sm={6} md={4} key={branch.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.branches.includes(branch.id)}
                  onChange={() => handleBranchChange(branch.id)}
                />
              }
              label={branch.name}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>

    <Grid item xs={12}>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          {t("new")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Box>
    </Grid>
  </Grid>
</Paper>


      {/* Users Table */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
  <Table>
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: "#1976d2", // Header background color
          "& th": {
            color: "#fff", // Header text color
            fontWeight: "bold",
            textAlign: "left",
          },
        }}
      >
        <TableCell>{t("firstname")}</TableCell>
        <TableCell>{t("lastname")}</TableCell>
        <TableCell>{t("email")}</TableCell>
        <TableCell> </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {users.map((user, index) => (
        <TableRow
          key={user.email}
          onClick={() => handleRowClick(user)}
          hover
          sx={{
            cursor: "pointer",
            backgroundColor:
              index % 2 === 0 ? "#f9f9f9" : "#e3f2fd", // Alternate row colors
            "&:hover": {
              backgroundColor: "#bbdefb", // Row hover color
            },
          }}
        >
          <TableCell>{user.first_name}</TableCell>
          <TableCell>{user.last_name}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(user);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>


      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t("Confirm Delete")}</DialogTitle>
        <DialogContent>
          {t("Are you sure you want to delete this user?")}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t("Cancel")}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {message && (
          <Alert severity={message.type} sx={{ width: "100%" }}>
            {message.text}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
