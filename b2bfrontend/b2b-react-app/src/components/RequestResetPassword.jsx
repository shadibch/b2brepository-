import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Alert } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";
import { t, isRTL } from "../utils/translator";
import axiosInstance from "./axiosInstance";
export default function RequestResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError(t( "Email is required"));
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/api/request/resetpassword/", { email });
      setSuccess(t("If this email exists, a reset link has been sent."));
      setEmail("");
    } catch (err) {
      setError(t("Unable to process your request. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <LockResetIcon sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" gutterBottom>
        {t( "Reset your password")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("Enter your email address and we’ll send you a password reset link.")}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
           {loading ? t('Sending...') : t('Send reset link')}

          </Button>
        </Box>
      </Box>
    </Container>
  );
}
