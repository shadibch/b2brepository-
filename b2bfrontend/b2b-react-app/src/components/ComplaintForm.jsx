import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import { axiosInstance, isAuthenticated } from "./axiosInstance";
import { t, isRTL, formatNumber } from "../utils/translator";

const ComplaintForm = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [newComplaintId, setNewComplaintId] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const STATUS_COLORS = {
    Pending: "warning",
    InProgress: "info",
    Resolved: "success",
    Rejected: "error",
  };

  const align = isRTL() ? "right" : "left";

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async (search = "") => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await axiosInstance.get(`/api/complaints/${params}`);
      setComplaints(res.data);
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching complaints") });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setMessage({ type: "error", text: t("Please fill in all fields") });
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/complaints/", formData);
      setNewComplaintId(res.data.complaint_id);
      setShowSuccessDialog(true);
      setFormData({ title: "", description: "" });
      fetchComplaints();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || t("Error creating complaint"),
      });
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchComplaints(searchQuery);
  };

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false);
    setNewComplaintId("");
  };

  return (
    <Box
      sx={{
        p: 3,
        direction: isRTL() ? "rtl" : "ltr",
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        {t("Complaints")}
      </Typography>

      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Create Complaint Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("Submit Complaint")}
        </Typography>
        
        <TextField
          fullWidth
          label={t("Title")}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        
        <TextField
          fullWidth
          label={t("Description")}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          multiline
          rows={4}
          sx={{ mb: 2 }}
          disabled={loading}
        />
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<SendIcon />}
        >
          {loading ? t("Sending...") : t("Submit Complaint")}
        </Button>
      </Paper>

      {/* Search and List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            placeholder={t("Search by ID or title...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            {t("Search")}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Complaint ID")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Title")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Status")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Admin Comment")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Date")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t("No complaints found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell align={align}>
                        <Typography fontWeight="bold">
                          {complaint.complaint_id}
                        </Typography>
                      </TableCell>
                      <TableCell align={align}>{complaint.title}</TableCell>
                      <TableCell align={align}>
                        <Chip
                          label={t(complaint.status)}
                          color={STATUS_COLORS[complaint.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align={align}>
                        {complaint.admin_comment || "-"}
                      </TableCell>
                      <TableCell align={align}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={closeSuccessDialog}>
        <DialogTitle>{t("Complaint Submitted")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("Your complaint has been submitted successfully.")}
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: "bold" }}>
            {t("Complaint ID")}: {newComplaintId}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {t("Please save this ID for future reference.")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSuccessDialog} variant="contained">
            {t("OK")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintForm;