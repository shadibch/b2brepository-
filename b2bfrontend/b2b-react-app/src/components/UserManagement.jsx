import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { Table, Form, Button, Alert, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./UserManagement.css";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber} from '../utils/translator';
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirmation: "",
    branches: [],
  });
  const [userId, setUserId] = useState(null); // Track user ID for updates
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchUsers(); 
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/branches/");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

const handleRowClick = async (user) => {
  setUserId(user.id);
  setMessage(null);
  setEmailError(null);

  try {
    const response = await axiosInstance.get(`/api/user/${user.id}`);

    if (response.status === 200) {
      setFormData({
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        password: "",
        confirmPassword: "",
        branches: response.data.branches.map(branch => branch.id) || [], // ✅ Extract only branch IDs
      });
    } else {
      throw new Error("Unexpected response from server.");
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    setMessage({ type: "danger", text: "Failed to retrieve user details." });
  }
};



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null);
    setEmailError(null);
  };

  const handleBranchChange = (branchId) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.includes(branchId)
        ? prev.branches.filter((id) => id !== branchId) // Uncheck
        : [...prev.branches, branchId], // Check
    }));
  };

  const validateEmail = async () => {
    if (!userId) {
      try {
        const response = await axiosInstance.get(`/api/user/${formData.email}`);
        if (response.data.exists) {
          setEmailError("Email already exists.");
        } else {
          setEmailError(null);
        }
      } catch (error) {
        console.error("Error validating email:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setMessage({ type: "danger", text: "All fields are required." });
      return;
    }

    if (!userId) {
      await validateEmail(); // ✅ Check email uniqueness only on creation
      if (emailError) return;

      if (!formData.password || !formData.password_confirmation) {
        setMessage({ type: "danger", text: "Password is required." });
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setMessage({ type: "danger", text: "Passwords do not match." });
        return;
      }
    }

    try {
      const endpoint = userId ? `/api/users/update/${userId}/` : "/api/register_staff/";
      const payload = { ...formData };

      if (userId) delete payload.password; // ✅ Remove password field if updating a user

      const response = await axiosInstance.post(endpoint, payload);

      if (response.status === 200 || response.status === 201) {
        setMessage({ type: "success", text: `User ${userId ? "updated" : "created"} successfully!` });
        fetchUsers(); // ✅ Refresh user table

        if (!userId) setUserId(response.data.id); // ✅ Store ID after creation
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setMessage({ type: "danger", text: `${'error_user_update'}.` });
    }
  };

  const handleClear = () => {
    setFormData({ email: "", first_name: "", last_name: "", password: "", password_confirmation: "", branches: [] });
    setUserId(null); // ✅ Reset user ID
    setMessage(null);
    setEmailError(null);
  };

  const confirmDelete = (user) => {
    setDeleteUser(user);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/users/${deleteUser.email}`);
      setMessage({ type: "success", text: `User "${deleteUser.email}" deleted successfully.` });

      fetchUsers(); // ✅ Refresh table
    } catch (error) {
      setMessage({ type: "danger", text: "Error deleting user." });
    }
    setShowModal(false);
  };

  return (
    <div className="user-management-container">
      <h3>{t('Manage Users')}</h3>
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* User Form */}
      <div className="user-form">
        <Form>
          <Form.Group>
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!userId}
              required
            />
            {emailError && <div className="error-text">{emailError}</div>}
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('firstname')}</Form.Label>
            <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('lastname')}</Form.Label>
            <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required={!userId} />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('confirmpassword')}</Form.Label>
            <Form.Control type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required={!userId} />
          </Form.Group>

        <Form.Group>
  <Form.Label>{t('Branches')}</Form.Label>
  <div className="branch-grid">
    {Array.from({ length: Math.ceil(branches.length / 5) }).map((_, rowIndex) => (
      <div key={rowIndex} className="branch-row">
        {branches.slice(rowIndex * 5, rowIndex * 5 + 5).map((branch) => (
          <Form.Check
            key={branch.id}
            type="checkbox"
            label={branch.name}
            checked={formData.branches.includes(branch.id)}
            onChange={() => handleBranchChange(branch.id)}
          />
        ))}
      </div>
    ))}
  </div>
</Form.Group>


          <div className="button-group">
            <Button variant="secondary" onClick={handleClear}>{t('new')}</Button>
            <Button variant="success" onClick={handleSave}>{t('save')}</Button>
          </div>
        </Form>
      </div>





      {/* Users List */}
      <Table striped bordered hover className="user-table">
        <thead>
          <tr>
            <th>{t('firstname')}</th>
            <th>{t('lastname')}</th>
            <th>{t('email')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email} onClick={() => handleRowClick(user)} className="clickable-row">
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.email}</td>
              <td>
                <Link to="#" onClick={(e) => { e.stopPropagation(); confirmDelete(user); }} className="delete-icon">
                  🗑
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;
