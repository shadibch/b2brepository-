import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { t } from "../utils/translator";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [branchId, setBranchId] = useState(null);
  const [message, setMessage] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteBranch, setDeleteBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/branches/");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleRowClick = (branch) => {
    setFormData({
      name: branch.name,
      phone: branch.phone,
      address: branch.address,
    });
    setBranchId(branch.id);
    setMessage(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setMessage({ type: "error", text: t("All fields are required.") });
      return;
    }

    const phoneRegex = /^\+?[1-9][0-9]{7,14}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: "error", text: t("Invalid phone number format.") });
      return;
    }

    try {
      const endpoint = branchId
        ? `/branches/update/${branchId}/`
        : "/branches/create/";
      const response = await axiosInstance.post(endpoint, formData);

      if (response.status === 200 || response.status === 201) {
        setMessage({
          type: "success",
          text: `Branch ${branchId ? "updated" : "created"} successfully!`,
        });
        fetchBranches();

        if (!branchId) setBranchId(response.data.id);
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      setMessage({ type: "error", text: "Error saving branch." });
    }
  };

  const handleClear = () => {
    setFormData({ name: "", phone: "", address: "" });
    setBranchId(null);
    setMessage(null);
  };

  const confirmDelete = (branch) => {
    setDeleteBranch(branch);
    setShowDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/branches/delete/${deleteBranch.id}/`);
      setMessage({
        type: "success",
        text: `Branch "${deleteBranch.name}" deleted successfully.`,
      });
      fetchBranches();
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting branch." });
    }
    setShowDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        {t("manage_branches")}
      </Typography>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {message && (
          <Alert
            onClose={() => setMessage(null)}
            severity={message.type}
            sx={{ width: "100%" }}
          >
            {message.text}
          </Alert>
        )}
      </Snackbar>

      {/* Branch Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          component="form"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 2,
          }}
        >
          <TextField
            label={t("branch_name")}
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label={t("phone")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label={t("address")}
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            required
          />
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button variant="outlined" color="secondary" onClick={handleClear}>
            {t("Clear")}
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {t("Save Branch")}
          </Button>
        </Box>
      </Paper>

      {/* Branch List */}
      <Paper sx={{ p: 2 }}>
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
            }}>
              <TableCell>{t("branch_name")}</TableCell>
              <TableCell>{t("address")}</TableCell>
              <TableCell>{t("phone")}</TableCell>
              <TableCell align="center">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch,index) => (
              <TableRow
                key={branch.id}
                hover
                sx={{
                  cursor: "pointer",
                  backgroundColor:
                    index % 2 === 0 ? "#f9f9f9" : "#e3f2fd", // Alternate row colors
                  "&:hover": {
                    backgroundColor: "#bbdefb", // Row hover color
                  },
                }}
                onClick={() => handleRowClick(branch)}
              >
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.phone}</TableCell>
                <TableCell align="center">
                  <Button
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(branch);
                    }}
                  >
                    🗑
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>{t("confirm_deletion")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("confirm_mesages")} "{deleteBranch?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches;
