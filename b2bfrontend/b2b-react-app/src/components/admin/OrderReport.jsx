import React, { useState, useEffect } from "react";
import { t, isRTL } from '../../utils/translator';
import axiosInstance from "../axiosInstance";
import {  Button,Card,Form } from 'react-bootstrap';
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar-SA';
import arabic_ar from 'react-date-object/locales/arabic_ar';
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import AsyncSelect from 'react-select/async';

const OrderReport = () => {
  const getThreeMonthsAgo = () => {
    const date = new DateObject();
    date.month -= 3;
    return date;
  };

  const [startDate, setStartDate] = useState(getThreeMonthsAgo());
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [orderStatus, setOrderStatus] = useState("UDL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load companies for autocomplete
  const loadCompanies = async (inputValue) => {
    if (inputValue.length < 3) {
      return [];
    }
    try {
      const response = await axiosInstance.get(`/api/admin/companies/?search=${inputValue}`);
      return response.data.results.map(company => ({
        value: company.id,
        label: company.name
      }));
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  };

  const formatHijriDate = (date) => {
    if (!date) return '';
    const options = { calendar: 'islamic-umalqura', year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('ar-SA', options).format(date);
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.convert(gregorian).format("YYYY-MM-DD");
  };

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    const formattedStartDate = formatDateForAPI(startDate);

    const params = new URLSearchParams({
      start_date: formattedStartDate,
      order_status: orderStatus,
      ...(selectedCompany && { company_id: selectedCompany.value })
    });

    try {
      const response = await axiosInstance.get(
        `/api/admin/orders/report/?${params.toString()}`,
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
            <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                locale={isRTL() ? arabic_ar : undefined}
                calendar={isRTL() ?  arabic : undefined}
                dateFormat={isRTL() ? "yyyy/MM/dd" : "yyyy-MM-dd"}
                calendarStartDay={isRTL() ? 6 : 0}
                maxDate={new Date()}
                value={startDate}
                className="form-control"
                required
              />
              <small className="text-muted">
                {formatHijriDate(startDate)}
              </small>
          </Form.Group>

          <Form.Group>
            <Form.Label className="block text-gray-700 font-semibold mb-2">
              {t('Company')}:
            </Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              value={selectedCompany}
              onChange={setSelectedCompany}
              loadOptions={loadCompanies}
              placeholder={t('Search company... (min. 3 characters)')}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              minInputLength={3}
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
           {loading ? t('Downloading...') : t('Generate Report')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderReport;
