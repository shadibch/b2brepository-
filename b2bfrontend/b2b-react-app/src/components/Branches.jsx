import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance"; // Ensure this is correctly configured
import { Table, Form, Button, Alert, Modal } from "react-bootstrap";
import { Link } from "react-router-dom"; // Ensure routing support
import "./Branches.css";
import { t } from "../utils/translator";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [branchId, setBranchId] = useState(null); // ✅ Track branch ID for updates
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteBranch, setDeleteBranch] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/branches/");
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleRowClick = (branch) => {
    setFormData({ name: branch.name, phone: branch.phone, address: branch.address });
    setBranchId(branch.id); // ✅ Store branch ID for updates
    setMessage(null); // Clear any previous messages
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(null); // Clear messages on input change
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setMessage({ type: "danger", text: t('All fields are required.') });
      return;
    }

    const phoneRegex = /^\+?[1-9][0-9]{7,14}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: "danger", text: t('Invalid phone number format.') });
      return;
    }

    try {
      const endpoint = branchId ? `/branches/update/${branchId}/` : "/branches/create/";
      const response = await axiosInstance.post(endpoint, formData);

      if (response.status === 200 || response.status === 201) { // ✅ Success handling
        setMessage({ type: "success", text: `Branch ${branchId ? "updated" : "created"} successfully!` });
        fetchBranches(); // ✅ Refresh table

        if (!branchId) setBranchId(response.data.id); // ✅ Store branch ID after creation
      } else {
        throw new Error("Unexpected server response");
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      setMessage({ type: "danger", text: "Error saving branch." });
    }
  };

  const handleClear = () => {
    setFormData({ name: "", phone: "", address: "" });
    setBranchId(null); // ✅ Reset branch ID
    setMessage(null);  // ✅ Clear messages
  };

  const confirmDelete = (branch) => {
    setDeleteBranch(branch);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/branches/delete/${deleteBranch.id}/`);
      setMessage({ type: "success", text: `Branch "${deleteBranch.name}" deleted successfully.` });

      fetchBranches(); // ✅ Refresh table
    } catch (error) {
      setMessage({ type: "danger", text: "Error deleting branch." });
    }
    setShowModal(false);
  };

  return (
    <div className="branches-container">
      <h3>{t('manage_branches')}</h3>
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* Branch Form */}
      <div className="branch-form">
        <Form>
          <Form.Group>
            <Form.Label>{t('branch_name')}</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('phone')}</Form.Label>
            <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </Form.Group>

          <Form.Group>
            <Form.Label>{t('address')}</Form.Label>
            <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} required />
          </Form.Group>

          <div className="button-group">
            <Button variant="secondary" onClick={handleClear}>{t('Clear')}</Button> {/* ✅ New "Clear" Button */}
            <Button variant="success" onClick={handleSave}>{t('Save Branch')}</Button>
          </div>
        </Form>
      </div>

      {/* Branch List - Clicking a row populates the form */}
      <Table striped bordered hover className="branch-table">
        <thead>
          <tr>
            <th>{t('branch_name')}</th>
            <th>{t('address')}</th>
            <th>{t('phone')}</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id} onClick={() => handleRowClick(branch)} className="clickable-row">
              <td>{branch.name}</td>
              <td>{branch.address}</td>
              <td>{branch.phone}</td>
              <td>
                <Link to="#" onClick={(e) => { e.stopPropagation(); confirmDelete(branch); }} className="delete-icon">
                  🗑
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirm_deletion')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('confirm_mesages')} "{deleteBranch?.name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete}>{t('delete')}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Branches;
