import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { Container, Form, Button, Alert } from "react-bootstrap";

import { Link } from "react-router-dom";
import { t, switchLanguage, isRTL, getCurrentLanguage } from '../utils/translator';
import axiosInstance from './axiosInstance'

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
            localStorage.setItem("main_url", response.data.main_url);
            navigate(response.data.main_url);

        } catch (err) {

            setError(`${t('invalid_username_password')} `);
        }
    };
    useEffect(() => {
        if (isRTL()) {
            import("./Login_rtl.css");
        } else {
            import("./Login.css");
        }
    });
    return (
        <Container className="login-container">


            <h2 className="text-center mb-4">{t('login')}</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
                <Form.Group className="mb-3">
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>{t('password')}</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                    {t('login')}
                </Button>
                <Link to="/register_company_admin">{t('signup')}</Link>

            </Form>
        </Container>
    );
};

export default Login;
