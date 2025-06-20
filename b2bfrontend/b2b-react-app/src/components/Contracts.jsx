// CreateDetails.tsx
import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Alert, Modal } from "react-bootstrap";
import { setitemscount, useHeaderContext } from "./HeaderContext";
import { t, switchLanguage, isRTL, getCurrentLanguage, formatNumber, formatLocal } from '../utils/translator';
import { API_BASE_URL, DEFAULT_IMAGE } from '../utils/settings'

// Handle navigation
import "./CreateDetails.css"; // Default (LTR)
import "./CreateDetails.rtl.css"; // RTL


export default function Contracts() {
  const { t, i18n } = useTranslation();
  const [contracts, setContracts] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {  selectedBranchId } = useHeaderContext();  
  const [error, setError] = useState("");
  const [message,setMessage] = useState("");  
  const navigate = useNavigate();
  useEffect(() => {
    axiosInstance.get("/api/contract/").then((response) => {
      const contract = response.data;
      const items = contract.items;
      for(const item in items) {
        items[item]["quantity"] = 0;
      }
      setContracts(contract);
    });

    // Dynamically add RTL or LTR class to body
    document.body.classList.toggle("rtl", isRTL());
  }, [isRTL()]);
  const confirmDelete = (item) => {
    setDeleteItem(item);
    setShowModal(true);
  };

  const handleAddedItem = async (item) => {
    axiosInstance.post(`/api/add-item/${selectedBranchId}/`,{
      
      "product": item.id,
      "quantity": item.quantity
  }
  )
  .then(response => {
    const searchEvent = new CustomEvent('updateCart');
    window.dispatchEvent(searchEvent);
    setMessage(`${t("Item has added to the shopping cart")} ${item.name}`  );
  })
  .catch(error => console.error("Error fetching product:", error));
  };

const handleQuantityChange = (id, newQuantity) => {
  setContracts((prevContracts) => {
    const updatedItems = prevContracts.items.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    return { ...prevContracts, items: updatedItems };
  });
};

  

  return (
    <div className="main-cart-container">

      <div className={`cart-container ${isRTL() ? "rtl" : "ltr"}`}>
        {message && <Alert variant="success">{message}</Alert>}
        <h1 className="cart-title">{t("Contracts")}</h1>

        {contracts?.items.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={item.image_path ? `${API_BASE_URL}${item.image_path}` : DEFAULT_IMAGE}
              alt={item.project_name}
              className="cart-item-image"
            />



            <div className="cart-item-info">
             
              <h2 className="cart-item-title" onClick={() => navigate(`/productitem/${item.part_id}`)}>{item.name}</h2>
              <div className="cart-item-controls">

                <input
                  type="number"
                  value={(item.quantity)}
                  min={1}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                             />
               
              </div>
            </div>

            <div className="cart-item-price" >
              {formatNumber(item.price, item.currency)}
            </div>
            <Button variant="primary" className="w-100"  onClick={()=> handleAddedItem(item)} >{t('add_to_cart')}</Button>
          </div>
        ))}

        {/* Delete Confirmation Modal */}
       
      </div>
    </div>
  );
}
