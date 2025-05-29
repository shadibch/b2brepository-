import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal, Pagination } from 'react-bootstrap';
import axiosInstance from '../axiosInstance';
import { t } from '../../utils/translator';
import { formatNumber } from '../../utils/translator';

export default function UndeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/undelivered-orders/?page=${currentPage}&q=${searchQuery}`);
      setOrders(response.data.results);
      setTotalPages(Math.ceil(response.data.count / response.data.page_size));
    } catch (error) {
      setMessage({ type: 'danger', text: t('Error fetching orders') });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleExecuteDelivery = async (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const confirmExecuteDelivery = async () => {
    try {
      await axiosInstance.post(`/api/admin/execute-delivery/${selectedOrder.id}/`);
      setMessage({ type: 'success', text: t('Order marked as delivered successfully') });
      fetchOrders();
      setShowConfirmModal(false);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || t('Error updating order') 
      });
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t('Undelivered Orders')}</h2>

      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage(null)} 
          dismissible
        >
          {message.text}
        </Alert>
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
                  variant="success"
                  size="sm"
                  onClick={() => handleExecuteDelivery(order)}
                >
                  {t('Mark as Delivered')}
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
          <Modal.Title>{t('Confirm Delivery')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('Are you sure you want to mark this order as delivered?')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            {t('Cancel')}
          </Button>
          <Button variant="success" onClick={confirmExecuteDelivery}>
            {t('Confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 