// CreateDetails.tsx
import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Alert, Modal } from "react-bootstrap";
import { t, switchLanguage, isRTL, getCurrentLanguage, formatNumber, formatLocal } from '../utils/translator';
import { API_BASE_URL, DEFAULT_IMAGE } from '../utils/settings'

// Handle navigation
import "./CreateDetails.css"; // Default (LTR)
import "./CreateDetails.rtl.css"; // RTL


export default function CreateDetails() {
  const { t, i18n } = useTranslation();
  const [cartDetails, setCartDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance.get("/api/cart_details/").then((response) => {
      setCartDetails(response.data);
    });

    // Dynamically add RTL or LTR class to body
    document.body.classList.toggle("rtl", isRTL());
  }, [isRTL()]);
  const confirmDelete = (item) => {
    setDeleteItem(item);
    setShowModal(true);
  };

  const handleQuantityChange = async (id, value) => {
    try {
      const response = await axiosInstance.post(
        `/api/update_item/${id}/`,
        new URLSearchParams({ quantity: value })
      );
      setCartDetails(response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };


  // Dynamically add RTL or LTR class to body

  const handleDelete = async () => {

    try {
      const response = await axiosInstance.delete(
        `api/delete_item/${deleteItem.id}/`
      );
      setCartDetails(response.data);
      const searchEvent = new CustomEvent('updateCart');
      window.dispatchEvent(searchEvent);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
    setShowModal(false);
  };
  const handleClick = () => {
    axiosInstance.post('api/purchase_request/')
      .then((response) => {
        const searchEvent = new CustomEvent('updateCart');
      window.dispatchEvent(searchEvent);
        navigate('/order', { state: { results: response.data } });
      })
      .catch((ex) => {
        if (ex.response && ex.response.status === 400) {
          setError(t(ex.response.data.detail));
        }
      });
  };


  return (
    <div className="main-cart-container">

      <div className={`cart-container ${isRTL() ? "rtl" : "ltr"}`}>
        {error && <Alert variant="danger">{error}</Alert>}
        <h1 className="cart-title">{t("shoppingcart")}</h1>

        {cartDetails?.instances.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={item.image_path ? `${API_BASE_URL}${item.image_path}` : DEFAULT_IMAGE}
              alt={item.project_name}
              className="cart-item-image"
            />



            <div className="cart-item-info">
              <h2 className="cart-item-title">{item.branch_name}</h2>
              <h2 className="cart-item-title" onClick={() => navigate(`/productitem/${item.part_id}`)}>{item.project_name}</h2>
              <div className="cart-item-controls">

                <input
                  type="number"
                  value={(item.quantity)}
                  min={1}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                />
                <a variant="ghost" href="#" className="delete-icon" onClick={(e) => { e.stopPropagation(); confirmDelete(item); }} size="icon">
                  🗑️
                </a>
              </div>
            </div>

            <div className="cart-item-price" >
              {formatNumber(item.price, item.currency)}
            </div>
          </div>
        ))}

        {/* Delete Confirmation Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('confirm_deletion')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {t('confirm_item')} "{deleteItem?.project_name}"?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
            <Button variant="danger" onClick={handleDelete}>{t('delete')}</Button>
          </Modal.Footer>
        </Modal>
        <span>
          <div className="cart-subtotal">
            <span className="label">{t("subtotal")}</span>
            <span className="value">
              {formatNumber(cartDetails?.total_price, cartDetails?.currency)}
            </span>
            <Button variant="primary" className="w-100" onClick={handleClick}>{t('purchaserequest')}</Button>

          </div>
        </span>
      </div>
    </div>
  );
}
