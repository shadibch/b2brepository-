import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance"; // Ensure this is correctly configured
import ReactPaginate from "react-paginate"; // For pagination
import "./OrdersPage.css"; // Add your custom styles
import "./OrdersPage.rtl.css";
import { Table, Button, Form, Alert, Modal, Pagination } from 'react-bootstrap';
import { API_BASE_URL, DEFAULT_IMAGE } from "../utils/settings";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber,formatDate,formatLocal} from '../utils/translator';
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showItems, setShowItems] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const itemsPerPage = 10; // Number of rows per page

  useEffect(() => {
        document.body.classList.toggle("rtl", isRTL());
     
    fetchOrders(currentPage + 1); // Fetch orders on component mount and page change
  },isRTL());

  const fetchOrders = async (page) => {
    try {
      const response = await axiosInstance.get(`/api/orders/?page=${page}`);
      console.log(response.data.results);
      setOrders(response.data.results); // Set the orders data
      setTotalPages(Math.ceil(response.data.count / itemsPerPage)); // Calculate total pages
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // Update current page on pagination
  };

  const handleSelectedOrder = async (order) => {
    
   const order_id = order.id;
    const response = await axiosInstance.get(`api/order/details/${order_id}/`);
    setSelectedOrder(response.data);
    setShowItems(true);
  };
  const getRowClass = (status) => {
    switch (status) {
      case "PND":
        return "row-pending"; // Yellow row
      case "RJC":
        return "row-rejected"; // Red row
      case "ACC":
        return "row-accepted"; // Green ro
      case "PRJ":
        return "row-partially-rejected";
      default:
        return "";
    }
  };

  return (

    <div   className={`orders-page ${ 
      isRTL() ? "shrink-rtl" : "shrink"} }`}>
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
                
                
                <h2 className="cart-item-title" onClick={() => navigate(`/productitem/${item.part_id}`)}
                    style={{ 
                      textDecoration: item.status === 'RJC' ? 'line-through' : 'none',
                      color: item.status === 'RJC' ? '#8B0000' : 'inherit'
                    }}>
                  
                  
                  {item.project_name}</h2>
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
                    value={item.quantity}
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

      <h1>{t('orders')}</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>{t('id_order')}</th>
            <th>{t('status')}</th>
            <th>{t('purchase_date')}</th>
            <th>{t('rejection_reason')}</th>
            <th>{t('total_price')}</th>
            <th>{t('Order Status')}</th>
            <th>{t('Invoice')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} 
            className={getRowClass(order.status)}
            
            >
              <td>{formatLocal(order.id)}</td>
              <td>{t(order.status)}</td>
              <td>{formatDate( new Date(order.purchaseDate))}</td>
              <td>{order.rejection_reason || "-"}</td>
              <td>
                {order.total_price
                  ? formatNumber(order.total_price, order.currency)
                  : "-"}
              </td>
              <td>{t(order.order_status)}</td>
              <td>
              <Button
                 
                  size="sm"
                  onClick={() => handleSelectedOrder(order)}
                >
                  {t('View')}
                </Button>

                {order.status == "ACC" || order.status == "PRJ" ? (
               
                  <a
                    href={`${API_BASE_URL}/api/download_invoice/${order.id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Download Invoice')}
                  </a>
                ) : (
                  "-"
                )}
              </td>
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
  );
};

export default OrdersPage;
