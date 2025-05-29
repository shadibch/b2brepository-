import React, { useEffect, useState } from "react";

import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";

import { Link } from "react-router-dom";
import { t ,isRTL} from '../utils/translator';
import axiosInstance from "./axiosInstance";
const RegisterCompanyAdmin = () => {
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        confirm_password: "",
        company_name: "",
        register_number : ""
    });

    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" }); // Clear error when typing
    };
 useEffect(() => {
    if (isRTL()) {
      import("./RegisterCompanyAdmin_rtl.css");
    } else {
      import("./RegisterCompanyAdmin.css");
    }
 });
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
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
                register_number:formData.register_number,

            });

            setSaved(true);
        } catch (error) {
            if (error.response && error.response.data) {
                setErrors(error.response.data); // Backend validation errors
            } else {
                setErrors({ general: "Error registering user." });
            }
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <h2 className="text-center mb-4">{t('registercompanyadmin')}</h2>

                    {/* Success and error messages at the top */}
                    {saved && (
                        <Alert variant="success" className="text-center">
                            {t('savedsuccessfuly')}
							
                        </Alert>
                    )}
                    {errors.general && (
                        <Alert variant="danger" className="text-center">
                            {errors.general}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
                        <Form.Group className="mb-3">
                            <Form.Label>{t('email')}</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={saved}
                            />
                            {errors.email && <div className="text-danger">{errors.email}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('firstname')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.first_name && <div className="text-danger">{errors.first_name}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('lastname')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.last_name && <div className="text-danger">{errors.last_name}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('companyname')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.company_name && <div className="text-danger">{errors.company_name}</div>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('address')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="company_address"
                                value={formData.company_address}
                                onChange={handleChange}
                                required
                            />
                            {errors.company_address && <div className="text-danger">{errors.company_address}</div>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('companyregisternumber')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="register_number"
                                value={formData.register_number}
                                onChange={handleChange}
                                required
                            />
                            {errors.register_number && <div className="text-danger">{errors.register_number}</div>}
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
                            {errors.password && <div className="text-danger">{errors.password}</div>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>{t('confirmpassword')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                            />
                            {errors.confirm_password && <div className="text-danger">{errors.confirm_password}</div>}
                        </Form.Group>

                      <Button variant="primary" type="submit" className="w-100" disabled={saved}>
  {saved ? t('savedsuccessfuly') : t('register')} {/* ✅ Simplified */}
</Button>

						<Link to="/login"> {t('login')}</Link>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterCompanyAdmin;
