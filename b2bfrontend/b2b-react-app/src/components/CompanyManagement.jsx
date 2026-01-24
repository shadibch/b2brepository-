import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Snackbar, Alert, Card, CardContent, CircularProgress } from "@mui/material";
import axiosInstance from "./axiosInstance";
import { isRTL, t } from "../utils/translator";

export default function CompanyManagement() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const loadCompany = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/company-management/");
      setCompanyName(res.data?.name || "");
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response?.data : null) ||
        t("Error updating company name");
      setMessage({ type: "error", text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axiosInstance.post("/api/company-management/", { name: companyName });
      setCompanyName(res.data?.name || companyName);
      setMessage({ type: "success", text: t("Company name updated successfully") });
    } catch (err) {
      const data = err.response?.data;
      const errMsg =
        data?.error ||
        (Array.isArray(data?.name) ? data.name.join(" ") : null) ||
        (typeof data === "string" ? data : null) ||
        t("Error updating company name");
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, direction: isRTL() ? "rtl" : "ltr" }}>
      <Snackbar
        open={!!message}
        autoHideDuration={3500}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {message && <Alert severity={message.type}>{message.text}</Alert>}
      </Snackbar>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: isRTL() ? "right" : "left" }}>
        {t("Company Management")}
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={22} />
              <Typography variant="body2">{t("Loading...")}</Typography>
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label={t("company_name")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button variant="contained" onClick={handleSave} disabled={saving || !companyName.trim()}>
                {saving ? t("Saving...") : t("save")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}