import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance"; // Ensure this is correctly configured
import ReactPaginate from "react-paginate"; // For pagination
import "./OrdersPage.css"; // Add your custom styles
import "./OrdersPage.rtl.css";
import { API_BASE_URL } from "../utils/settings";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber,formatDate,formatLocal} from '../utils/translator';
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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


  const getRowClass = (status) => {
    switch (status) {
      case "PND":
        return "row-pending"; // Yellow row
      case "RJC":
        return "row-rejected"; // Red row
      case "ACC":
        return "row-accepted"; // Green row
      default:
        return "";
    }
  };

  return (

    <div   className={`orders-page ${ 
      isRTL() ? "shrink-rtl" : "shrink"} }`}>
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
            <tr key={order.id} className={getRowClass(order.status)}>
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
                {order.order_status != "UNP" ? (
               
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
