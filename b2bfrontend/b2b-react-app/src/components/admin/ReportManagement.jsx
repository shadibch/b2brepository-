import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar-SA';
import arabic_ar from 'react-date-object/locales/arabic_ar';
import arabic from "react-date-object/calendars/arabic";
import axiosInstance from '../axiosInstance';
import { t, isRTL } from '../../utils/translator';
import './styles.css';
import './shared.css';
import gregorian from "react-date-object/calendars/gregorian";

// Register Arabic locale
if(isRTL()) {
registerLocale('ar-SA', ar);
}
export default function ReportManagement() {
  // Calculate date 3 months ago
  const getThreeMonthsAgo = () => {
    const date = new DateObject();
    date.month -= 3;
    return date;
  };

  const [startDate, setStartDate] = useState(getThreeMonthsAgo());
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format date for display in Hijri
  const formatHijriDate = (date) => {
    if (!date) return '';
    const options = { calendar: 'islamic-umalqura', year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('ar-SA', options).format(date);
  };

  // Convert date to YYYY-MM-DD format for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.convert(gregorian).format("YYYY-MM-DD");
  };

  const handleDownload = async () => {
    try {
      if (!startDate) {
        setMessage({ type: 'danger', text: t('Please select a start date') });
        return;
      }

      setIsLoading(true);
      setMessage(null);

      // Format dates for API
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = endDate ? formatDateForAPI(endDate) : '';
      console.log(formattedStartDate);
      // Create query parameters
      const params = new URLSearchParams({
        start_date: formattedStartDate,
        ...(formattedEndDate && { end_date: formattedEndDate })
      });

      // Make the API request
      const response = await axiosInstance.get(`/api/admin/requests/?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      // Check if the response is actually an Excel file
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('spreadsheetml.sheet')) {
        // If not an Excel file, it might be an error response
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            throw new Error(errorData.error || t('Error downloading report'));
          } catch (e) {
            throw new Error(t('Error downloading report'));
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create a blob from the response
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set the filename based on the date range
      const filename = `report_${formattedStartDate}${formattedEndDate ? `_to_${formattedEndDate}` : ''}.xlsx`;
      link.setAttribute('download', filename);
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: t('Report downloaded successfully') });
    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage({ 
        type: 'danger', 
        text: error.message || error.response?.data?.error || t('Error downloading report') 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isArabic = isRTL();

  return (
    <div className="admin-container" dir={isRTL() ? "rtl" : "ltr"}>
      <Card>
        <Card.Body>
          <h2 className="admin-form-title mb-4">{t('Download Reports')}</h2>

          {message && (
            <Alert 
              variant={message.type} 
              onClose={() => setMessage(null)} 
              dismissible
            >
              {message.text}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('Start Date')} *</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                locale={isArabic ? arabic_ar : undefined}
                calendar={isArabic ?  arabic : undefined}
                dateFormat={isArabic ? "yyyy/MM/dd" : "yyyy-MM-dd"}
                calendarStartDay={isArabic ? 6 : 0}
                maxDate={new Date()}
                value={startDate}
                className="form-control date-picker-input"
                required
              />
              <small className="text-muted hijri-date">
                {formatHijriDate(startDate)}
              </small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('End Date')}</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                locale={isArabic ? arabic_ar : undefined}
                calendar={isArabic ? arabic : undefined}
                dateFormat={isArabic ? "yyyy/MM/dd" : "yyyy-MM-dd"}
                calendarStartDay={isArabic ? 6 : 0}
                minDate={startDate}
                maxDate={new Date()}
                className="form-control date-picker-input"
              />
              <small className="text-muted hijri-date">
                {formatHijriDate(endDate)}
              </small>
            </Form.Group>

            <Button 
              variant="primary" 
              onClick={handleDownload}
              disabled={isLoading || !startDate}
            >
              {isLoading ? t('Downloading...') : t('Generate Report')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

// Add these styles at the end of the file
const styles = `
  .date-picker-input {
    font-size: 16px;
    padding: 8px 12px;
  }

  .hijri-date {
    font-size: 14px;
    margin-top: 4px;
    display: block;
  }

  .form-label {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .rmdp-container {
    font-size: 16px;
  }

  .rmdp-calendar {
    font-size: 16px;
  }

  .rmdp-header {
    font-size: 18px;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 