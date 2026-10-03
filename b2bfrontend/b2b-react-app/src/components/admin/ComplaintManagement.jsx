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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { axiosInstance, isAuthenticated } from "../axiosInstance";
import { t, isRTL, formatNumber } from "../../utils/translator";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [comments, setComments] = useState([]);

  const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "InProgress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
    { value: "Rejected", label: "Rejected" },
  ];

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

  const fetchComplaints = async (search = "", status = "") => {
    setLoading(true);
    try {
      let params = "?";
      if (search) params += `search=${encodeURIComponent(search)}&`;
      if (status) params += `status=${encodeURIComponent(status)}`;
      const res = await axiosInstance.get(`/api/complaints/${params}`);
      setComplaints(res.data);
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching complaints") });
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchComplaints(searchQuery, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    fetchComplaints(searchQuery, e.target.value);
  };

  const openDetailDialog = async (complaint) => {
    setSelectedComplaint(complaint);
    setAdminComment(complaint.admin_comment || "");
    setNewStatus(complaint.status);
    setShowDetailDialog(true);
    fetchComments(complaint.id);
  };

  const fetchComments = async (complaintId) => {
    try {
      const res = await axiosInstance.get(`/api/complaints/${complaintId}/comments/`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;

    setLoading(true);
    try {
      await axiosInstance.put(`/api/complaints/${selectedComplaint.id}/`, {
        status: newStatus,
        admin_comment: adminComment,
      });
      
      setMessage({ type: "success", text: t("Complaint updated successfully") });
      setShowDetailDialog(false);
      fetchComplaints(searchQuery, statusFilter);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || t("Error updating complaint"),
      });
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!selectedComplaint || !adminComment.trim()) return;

    try {
      await axiosInstance.post(`/api/complaints/${selectedComplaint.id}/comments/`, {
        comment: adminComment,
      });
      
      setAdminComment("");
      fetchComments(selectedComplaint.id);
    } catch (err) {
      setMessage({
        type: "error",
        text: t("Error adding comment"),
      });
    }
  };

  // Calculate statistics
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "InProgress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
    rejected: complaints.filter(c => c.status === "Rejected").length,
  };

  return (
    <Box sx={{ p: 3, direction: isRTL() ? "rtl" : "ltr" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        {t("Complaint Management")}
      </Typography>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ bgcolor: "warning.main", color: "white" }}>
            <CardContent>
              <Typography variant="h6">{stats.total}</Typography>
              <Typography variant="body2">{t("Total")}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ bgcolor: "orange", color: "white" }}>
            <CardContent>
              <Typography variant="h6">{stats.pending}</Typography>
              <Typography variant="body2">{t("Pending")}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ bgcolor: "info.main", color: "white" }}>
            <CardContent>
              <Typography variant="h6">{stats.inProgress}</Typography>
              <Typography variant="body2">{t("In Progress")}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ bgcolor: "success.main", color: "white" }}>
            <CardContent>
              <Typography variant="h6">{stats.resolved}</Typography>
              <Typography variant="body2">{t("Resolved")}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card sx={{ bgcolor: "error.main", color: "white" }}>
            <CardContent>
              <Typography variant="h6">{stats.rejected}</Typography>
              <Typography variant="body2">{t("Rejected")}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t("Status")}</InputLabel>
            <Select
              value={statusFilter}
              label={t("Status")}
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">{t("All")}</MenuItem>
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            {t("Search")}
          </Button>
        </Box>

        {/* Complaints Table */}
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
                    {t("User")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Title")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Status")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Date")}
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }} align={align}>
                    {t("Action")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
                      <TableCell align={align}>{complaint.user_name}</TableCell>
                      <TableCell align={align}>{complaint.title}</TableCell>
                      <TableCell align={align}>
                        <Chip
                          label={t(complaint.status)}
                          color={STATUS_COLORS[complaint.status] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align={align}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align={align}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openDetailDialog(complaint)}
                        >
                          {t("View")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("Complaint Details")} - {selectedComplaint?.complaint_id}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{t("User")}:</strong> {selectedComplaint?.user_name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{t("Title")}:</strong> {selectedComplaint?.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>{t("Description")}:</strong> {selectedComplaint?.description}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>{t("Status")}</InputLabel>
            <Select
              value={newStatus}
              label={t("Status")}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label={t("Admin Comment")}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          
          {/* Comments Section */}
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
            {t("Comments")}
          </Typography>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("No comments yet")}
            </Typography>
          ) : (
            comments.map((comment) => (
              <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{comment.user_name}:</strong> {comment.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.created_at).toLocaleString()}
                </Typography>
              </Paper>
            ))
          )}
          
          <TextField
            fullWidth
            placeholder={t("Add a comment...")}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleAddComment();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleUpdateStatus} disabled={loading}>
            {t("Update")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintManagement;