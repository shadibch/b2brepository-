import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { t, switchLanguage, isRTL, getCurrentLanguage } from '../utils/translator';
import axiosInstance from './axiosInstance';

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Create navigation instance

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear errors on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axiosInstance.post("/api/login/", formData);
            localStorage.setItem("authToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);
            if(!response.data.main_url.includes('cartdetails')) {
             localStorage.setItem("main_url", response.data.main_url);
            }else {
                const forwardDispatch =new CustomEvent('dispatch', { detail:
                    response.data.main_ur });
               window.dispatchEvent(forwardDispatch); 
            }
            const searchEvent = new CustomEvent('expiry_order', { detail:
                 response.data.expiry_order });
            window.dispatchEvent(searchEvent);
            localStorage.setItem("expiry_order" , response.data.expiry_order);
           
            navigate(response.data.main_url);

        } catch (err) {

            setError(`${t('invalid_username_password')} `);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    {t('login')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label={t('email')}
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t('password')}
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {t('login')}
                    </Button>
                    <Box textAlign="center">
                        <MuiLink component={Link} to="/register_company_admin" variant="body2">
                            {t('signup')}
                        </MuiLink>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
