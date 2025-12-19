import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Grid,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import { t, isRTL } from "../utils/translator";
import axiosInstance from "./axiosInstance";

const RegisterCompanyAdmin = () => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    company_name: "",
    company_address: "",
    register_number: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setErrors({ ...errors, confirm_password: "Passwords do not match." });
      return;
    }

    try {
      await axiosInstance.post("/register/", {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirmation: formData.confirm_password,
        company_name: formData.company_name,
        company_address: formData.company_address,
        register_number: formData.register_number,
      });

      setSaved(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Error registering user." });
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t("registercompanyadmin")}
        </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
       sx={{ mt: 3 }}
      >
      

        {/* Success and error messages */}
        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t("savedsuccessfuly")}
          </Alert>
        )}
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

{errors && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors}
          </Alert>
        )}

      
            <TextField
             margin="normal"
              label={t("email")}
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              disabled={saved}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
             margin="normal"
              label={t("firstname")}
              name="first_name"
              fullWidth
              required
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
        
            <TextField
             margin="normal"
              label={t("lastname")}
              name="last_name"
              fullWidth
              required
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
            />
      
            <TextField
             margin="normal"
              label={t("companyname")}
              name="company_name"
              fullWidth
              required
              value={formData.company_name}
              onChange={handleChange}
              error={!!errors.company_name}
              helperText={errors.company_name}
            />
         
            <TextField
             margin="normal"
              label={t("address")}
              name="company_address"
              fullWidth
              required
              value={formData.company_address}
              onChange={handleChange}
              error={!!errors.company_address}
              helperText={errors.company_address}
            />
      
            <TextField
             margin="normal"
              label={t("companyregisternumber")}
              name="register_number"
              fullWidth
              required
              value={formData.register_number}
              onChange={handleChange}
              error={!!errors.register_number}
              helperText={errors.register_number}
            />
       
            <TextField
             margin="normal"
              label={t("password")}
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
        
            <TextField
             margin="normal"
              label={t("confirmpassword")}
              name="confirm_password"
              type="password"
              fullWidth
              required
              value={formData.confirm_password}
              onChange={handleChange}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password}
            />
        

                     
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={saved}
              sx={{ mt: 3, mb: 2 }}
            >
              {saved ? t("savedsuccessfuly") : t("register")}
            </Button>
       

        <Box textAlign="center" mt={2}>
          <MuiLink
            component={Link}
            to="/login"
            underline="hover"
            color="primary"
          >
            {t("login")}
          </MuiLink>
        </Box>
      </Box>
      </Paper>
    </Container>
  );
};

export default RegisterCompanyAdmin;
