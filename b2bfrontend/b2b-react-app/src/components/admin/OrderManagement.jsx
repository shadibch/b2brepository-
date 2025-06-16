import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { API_BASE_URL, DEFAULT_IMAGE } from '../../utils/settings'
const API_BASE_URL_ADMIN = "/api/admin";
import { Table, Form, Button, Alert, Modal, FormSelect } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { t, switchLanguage, isRTL, getCurrentLanguage, formatNumber, formatDate, formatLocal } from '../../utils/translator';
import './OrderManagement.css';
export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ text: '', type: '' });
  useEffect(() => {
    fetchOrders();
  }, []);
  const handleToggle = (event) => {
    setIsSidebarOpen(event.detail.open);
  }
  window.addEventListener('toggled', handleToggle);
  const fetchOrders = async (query = "") => {
    const res = await axiosInstance.get(`${API_BASE_URL_ADMIN}/orders/${query ? `?q=${query}` : ""}`);
    setOrders(res.data.results);
    setTotalPages(response.data.count);
  };

  const fetchOrderDetail = async (orderId) => {
    const res = await axiosInstance.get(`${API_BASE_URL_ADMIN}/order/${orderId}/`);
    setSelectedOrder(res.data);
    setSelectedOrderId(orderId);
    setRejectionReason("");
  };
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // Update current page on pagination
  };
  const handleAccept = async (message) => {
    await axiosInstance.post(
      `${API_BASE_URL_ADMIN}/updateorder/${selectedOrderId}/`,
      { status: "ACC" },
      { headers: { "Content-Type": "application/json" } }
    );
    selectedOrder.status = 'ACC';
    setMessage({ type: "success", text: message });
    await fetchOrders();
    
  };

  const handleRejectItem = async (productInstance, message) => {
    if(!productInstance.rejection_reason) {
      setMessage({ type: "danger", text: t('rejected_error_message') });
      return;
    }
    await axiosInstance.post(`api/admin/product_instance/update/${productInstance.id}/`, {
      status: "RJC",
      rejection_reason: productInstance.rejection_reason
    });
    setMessage({ type: "success", text: message });
    productInstance.status = 'RJC';
  }


  const handleAcceptedItem = async (productInstance, message) => {
   
    await axiosInstance.post(`api/admin/product_instance/update/${productInstance.id}/`, {
      status: "ACC"
    });
    setMessage({ type: "success", text: message });
    productInstance.status = 'ACC';
  }
  const handleReject = async (message) => {
    if (!rejectionReason.trim()) {
      setMessage({ type: "danger", text: t('rejected_error_message') });
      return;
    }
    await axiosInstance.post(`${API_BASE_URL_ADMIN}/updateorder/${selectedOrderId}/`, {
      status: "RJC",
      rejection_reason: rejectionReason,
    });
    setMessage({ type: "success", text: message });
    selectedOrder.status = 'RJC';
    await fetchOrders();
    setSelectedOrder(null);
  };

  return (
    <div className={`p-4 space-y-6`}>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      {selectedOrder && (
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{t('order_details')}</h2>
          <p><strong>{t('company_name')}</strong> {selectedOrder.company_name}</p>
          <p><strong>{t('company_register_number')}</strong> {selectedOrder.company_registered_number}</p>
          <p><strong>{t('company_credit')}: </strong> {formatNumber(selectedOrder?.company_credit, selectedOrder?.currency)}</p>

          <div className="cart-container mt-4">
            <h3 className="text-lg font-semibold mb-2">{t('order_items')}</h3>
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="cart-item flex items-center border-b py-2">
                <img
                  src={item.image_path ? `${API_BASE_URL}${item.image_path}` : DEFAULT_IMAGE}
                  alt={item.project_name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h2 className="cart-item-title">{item.branch_name}</h2>
                  <h2 className="cart-item-title" onClick={() => navigate(`/productitem/${item.part_id}`)} 
                    style={{ 
                      textDecoration: item.status === 'RJC' ? 'line-through' : 'none',
                      color: item.status === 'RJC' ? '#8B0000' : 'inherit'
                    }}>
                    {item.project_name}
                  </h2>

                    {(item.status == 'RJC') &&(
                        <h2 className="cart-item-title"  
                        style={{ 
                          textDecoration:  'line-through' ,
                          color:  '#8B0000' 
                        }}>
                        {item.rejection_reason}
                      </h2>
    
                    )}


                  <div className="cart-item-controls">
                    <input
                      type="number"
                      value={(item.quantity)}
                      min={1}
                      disabled
                      style={{ 
                        textDecoration: item.status === 'RJC' ? 'line-through' : 'none',
                        color: item.status === 'RJC' ? '#8B0000' : 'inherit'
                      }}
                    />
                  </div>
                </div>
                <div className="cart-item-price" 
                  style={{ 
                    textDecoration: item.status === 'RJC' ? 'line-through' : 'none',
                    color: item.status === 'RJC' ? '#8B0000' : 'inherit'
                  }}>
                  {formatNumber(item.price, item.currency)}
                </div>
                {(item.status == 'INT' ) && (
                  
                  <div>
                      <Form.Group >
            <Form.Label className="block font-medium">{t('rejected_label')}:</Form.Label>
            <Form.Control
              className="w-full border rounded p-2"
              value={(item.rejection_reason)}
              onChange={(e) => {item.rejection_reason = e.target.value;}}
              disabled={false}
            />
          </Form.Group>
         
                    <div className="flex gap-4 mt-4">
                      <Button onClick={() => handleAcceptedItem(item,t('accepted_message'))} className="px-4 py-2 bg-green-600 text-white rounded">{t('accept')}</Button>
                      <Button onClick={() => handleRejectItem(item, t('rejected_message'))} className="px-4 py-2 bg-red-600 text-white rounded">{t('reject')}</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <span>
              <div className="cart-subtotal">
                <span className="label">{t("subtotal")}</span>
                <span className="value">
                  {formatNumber(selectedOrder?.total_price, selectedOrder?.currency)}
                </span>


              </div>
            </span>
            

          </div>

          <Form.Group >
            <Form.Label className="block font-medium">{t('rejected_label')}:</Form.Label>
            <Form.Control
              className="w-full border rounded p-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={false}
            />
          </Form.Group>
          {(selectedOrder.status !== 'ACC' && selectedOrder.status !== 'RJC') && (
            <div className="flex gap-4 mt-4">
              <Button onClick={() => handleAccept(t('accepted_message'))} className="px-4 py-2 bg-green-600 text-white rounded">{t('accept')}</Button>
              <Button onClick={() => handleReject(t('rejected_message'))} className="px-4 py-2 bg-red-600 text-white rounded">{t('reject')}</Button>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border rounded shadow">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder={`${t('search')}...`}
            className="border p-2 flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => fetchOrders(search)} className="bg-blue-500 text-white px-4 py-2 rounded search-button">
            {t('search')}
          </button>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>{t('order_id')}</th>


              <th>{t('company_name')}</th>
              <th>{t('company_register_number')}</th>
              <th>{t('company_credit')}</th>
              <th>{t('total_price')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row, index) => (
              <tr
                key={index}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => fetchOrderDetail(row.id)}
              >
                <td className="p-2 border">{row.id}</td>

                <td className="p-2 border">{row.company_name}</td>
                <td className="p-2 border">{row.company_registered_number}</td>
                <td className="p-2 border">{formatNumber(row.company_credit, row.currency)}</td>
                <td className="p-2 border">{formatNumber(row.total_price, row.currency)}</td>

              </tr>
            ))}
          </tbody>
        </table>
        <ReactPaginate
          previousLabel={`→ ${t("prev")}`}

          nextLabel={`${t("next")} ←`}
          breakLabel={"..."}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={"pagination"}
          activeClassName={"active"}
          pageLabelBuilder={(page) => formatLocal(page)}
        />
      </div>
    </div>
  );
}


