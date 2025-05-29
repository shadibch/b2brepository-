import React, { useState } from "react";
import { t, isRTL } from '../../utils/translator';
import axiosInstance from "../axiosInstance";
import {  Button,Card,Form } from 'react-bootstrap';
const OrderReport = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().slice(0, 10)
  );
  const [orderStatus, setOrderStatus] = useState("UDL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(
        `/api/admin/orders/report/?start_date=${startDate}&order_status=${orderStatus}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError(t('Failed to generate report'));
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 py-12 px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-xl mx-auto rounded-3xl shadow-xl p-10">
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-10">
          {t('Order Report')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">{t('Error')}:</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <span onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
              <svg className="fill-current h-6 w-6 text-red-500" role="button" viewBox="0 0 20 20">
                <title>{t('Close')}</title>
                <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
              </svg>
            </span>
          </div>
        )}

        <Card
          className="flex flex-col gap-6 mb-10"
          onSubmit={e => {
            e.preventDefault();
            handleDownload();
          }}
        >
          <Form.Group>
            <Form.Label className="block text-gray-700 font-semibold mb-2" htmlFor="order-date">
              {t('Order Purchase Date')}:
            </Form.Label>
            <input
              id="order-date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-300 px-4 py-2"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="block text-gray-700 font-semibold mb-2" htmlFor="order-status">
              {t('Order Status')}:
            </Form.Label>
            <select
              id="order-status"
              value={orderStatus}
              onChange={e => setOrderStatus(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-300 px-4 py-2"
            >
              <option value="UPD">{t('UPD')}</option>
              <option value="PRC">{t('PRC')}</option>
              <option value="UDL">{t('UDL')}</option>
              <option value="DLV">{t('DLV')}</option>
            </select>
          </Form.Group>
        </Card>

        <div className="text-center">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className={`px-10 py-3 rounded-full font-semibold 
              ${loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
              shadow-md`}
            type="button"
          >
            {loading ? t('Generating...') : t('Generate Report')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderReport;
