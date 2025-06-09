import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Pagination } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { t, formatNumber } from '../../utils/translator';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, DEFAULT_IMAGE } from '../../utils/settings';

export default function ProcessingOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/processing-orders/?page=${currentPage}&q=${searchQuery}`);
      setOrders(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.page_size));
    } catch (error) {
      setMessage({ type: 'danger', text: t('Error fetching orders') });
    }
  };

  const handleDownload = async (order) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/api/admin/orders/items/${order.id}/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_instances_${order.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError(t('Failed to generate report'));
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleReadyToDeliver = async (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const handleSelectedOrder = async (order) => {
    setSelectedOrder(order);
    setShowItems(true);
  };

  const confirmReadyToDeliver = async () => {
    try {
      await axiosInstance.post(`/api/admin/ready-to-deliver/${selectedOrder.id}/`);
      setMessage({ type: 'success', text: t('Order marked as ready to deliver') });
      fetchOrders();
      setShowConfirmModal(false);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || t('Error updating order') 
      });
    }
  };

  const handleAccept = async (message) => {
    try {
      await axiosInstance.post(`/api/admin/accept-order/${selectedOrder.id}/`);
      setMessage({ type: 'success', text: message });
      setShowItems(false);
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.error || t('Error accepting order') });
    }
  };

  const handleReject = async (message) => {
    try {
      await axiosInstance.post(`/api/admin/reject-order/${selectedOrder.id}/`, {
        reason: rejectionReason
      });
      setMessage({ type: 'success', text: message });
      setShowItems(false);
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.error || t('Error rejecting order') });
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t('Processing Orders')}</h2>

      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage(null)} 
          dismissible
        >
          {message.text}
        </Alert>
      )}

{error && (
        <Alert 
          variant="danger"
          onClose={() => setError(null)} 
          dismissible
        >
          {error}
        </Alert>
      )}
      {showItems && selectedOrder && (
        <div className="order-details mb-4">
          {selectedOrder.items.map((item) => (
            <div key={item.id} className="cart-item flex items-center border-b py-2">
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
                    value={item.quantity}
                    min={1}
                    disabled
                  />
                </div>
              </div>
              <div className="cart-item-price">
                {formatNumber(item.price, item.currency)}
              </div>
            </div>
          ))}
          <div className="cart-subtotal">
            <span className="label">{t("subtotal")}</span>
            <span className="value">
              {formatNumber(selectedOrder?.total_price, selectedOrder?.currency)}
            </span>
          </div>

          

          
        </div>
      )}

      <div className="d-flex mb-3">
        <Form.Control
          type="text"
          placeholder={t('Search by company name')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="me-2"
        />
        <Button onClick={handleSearch}>{t('search')}</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('Order ID')}</th>
            <th>{t('Company')}</th>
            <th>{t('total_price')}</th>
            <th>{t('currency')}</th>
            <th>{t('company_credit')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.company_name}</td>
              <td>{formatNumber(order.total_price)}</td>
              <td>{order.currency}</td>
              <td>{formatNumber(order.company_credit)}</td>
              <td>
              <Button
                 
                  size="sm"
                  onClick={() => handleSelectedOrder(order)}
                >
                  {t('View')}
                </Button>


                <Button
                 
                  size="sm"
                  onClick={() => handleDownload(order)}
                  disabled={loading}
                >
                  {t('Download')}
                </Button>

                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleReadyToDeliver(order)}
                >
                  {t('Ready to Deliver')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <Pagination>
            <Pagination.First onClick={() => setCurrentPage(1)} />
            <Pagination.Prev 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
          </Pagination>
        </div>
      )}

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('Confirm Ready to Deliver')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('Are you sure this order is ready to be delivered?')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            {t('Cancel')}
          </Button>
          <Button variant="success" onClick={confirmReadyToDeliver}>
            {t('Confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 