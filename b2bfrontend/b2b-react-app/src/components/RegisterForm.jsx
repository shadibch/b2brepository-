import React, { useState, useEffect } from 'react';

import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import './RegisterForm.css';
import axiosInstance from './axiosInstance'
const RegisterForm = () => {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    branch_id: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [branchForm, setBranchForm] = useState({
    company_name: '',
    company_id: null,
    branch_name: '',
    address: '',
  });

  useEffect(() => {
    if (form.company_name.length >= 3) {
      axiosInstance
        .get(`/filter-companies/?q=${form.company_name}`)
        .then((response) => {
          setSuggestions(response.data.map((company) => ({ id: company.id, name: company.name })));
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [form.company_name]);

  const fetchBranches = (companyId) => {
    axiosInstance
      .get(`/branches/${companyId}`)
      .then((response) => {
        setBranches(response.data.map((branch) => ({ id: branch.id, name: branch.name })));
      })
      .catch(() => setBranches([]));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSuggestionClick = (suggestion) => {
    setForm({ ...form, company_name: suggestion.name, branch_id: '' });
    setBranchForm({ ...branchForm, company_name: suggestion.name, company_id: suggestion.id });
    setSuggestions([]);
    fetchBranches(suggestion.id);
  };

  const handleBranchChange = (e) => {
    setForm({ ...form, branch_id: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/register/', form);
      setMessage('Registration successful!');
      setError('');
    } catch {
      setMessage('');
      setError('Something went wrong. Please try again.');
    }
  };

  const handleModalOpen = () => {
    setBranchForm({
      ...branchForm,
      company_name: form.company_name,
      company_id: suggestions.find((company) => company.name === form.company_name)?.id || null,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setBranchForm({
      company_name: '',
      company_id: null,
      branch_name: '',
      address: '',
    });
  };

  const handleBranchFormChange = (e) => {
    setBranchForm({ ...branchForm, [e.target.name]: e.target.value });
  };

  const handleSaveBranch = async () => {
    try {
      let companyId = branchForm.company_id;

      // If the company does not exist, create it first
      if (!companyId) {
        const companyResponse = await axiosInstance.post('/companies/create/', {
          name: branchForm.company_name,
        });
        companyId = companyResponse.data.id;
      }

      // Create the branch
      await axiosInstance.post('/branches/create/', {
        name: branchForm.branch_name,
        address: branchForm.address,
        company: companyId,
      });

      // Update branches dropdown
      fetchBranches(companyId);

      setMessage('Branch saved successfully!');
      setError('');
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError('Error saving branch. Please try again.');
    }
  };

  return (
    <>
      <Container className="register-container">
        <h2 className="text-center mb-4">Create Your Account</h2>
        <Form onSubmit={handleSubmit} className="register-form">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="password_confirmation"
              placeholder="Confirm your password"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative">
            <Form.Label>Company Name</Form.Label>
            <Form.Control
              type="text"
              name="company_name"
              placeholder="Enter your company name"
              value={form.company_name}
              onChange={handleChange}
              autoComplete="off"
              required
            />
            {suggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="autocomplete-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Branch</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Select
                name="branch_id"
                value={form.branch_id}
                onChange={handleBranchChange}
                required
                disabled={branches.length === 0}
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Form.Select>
              <Button
                variant="outline-primary"
                className="ms-2"
                onClick={handleModalOpen}
                disabled={!form.company_name}
              >
                +
              </Button>
            </div>
          </Form.Group>

          <Button variant="success" type="submit" className="register-button">
            Sign Up
          </Button>
        </Form>

        {message && <Alert variant="success" className="mt-3">{message}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Container>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create a New Branch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Company</Form.Label>
            <Form.Control type="text" value={branchForm.company_name} readOnly disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Branch Name</Form.Label>
            <Form.Control
              type="text"
              name="branch_name"
              placeholder="Enter branch name"
              value={branchForm.branch_name}
              onChange={handleBranchFormChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              placeholder="Enter branch address"
              value={branchForm.address}
              onChange={handleBranchFormChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveBranch}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RegisterForm;
