import React, { useEffect, useState } from "react";
import { t, switchLanguage, isRTL, getCurrentLanguage } from '../utils/translator';
import { Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";

import "./AdminSidebar.css";

const AdminSidebar = ({ setActivePage   }) => {
  const [isOpen, setIsOpen] = useState(true);
 // initially set to the first item
  const handleToggle = () => {
    setIsOpen(!isOpen);
    const searchEvent = new CustomEvent('toggled', { detail: { open: isOpen } });
    window.dispatchEvent(searchEvent);
  };

  useEffect(() => {
    document.body.classList.toggle("rtl", isRTL());
  }, [getCurrentLanguage()]);

  const changeLanguage = (lang) => {
    switchLanguage(lang);
    window.location.reload();
  };
 const pathToKey = {
    "/admin/user-management": "0",
    "/admin/order-management": "1",
    "/admin/category-management": "2",
    "/admin/item-management": "2",
    "/admin/group-management":"2",
    "/admin/paid-orders":"1",
    "/admin/processing-orders":"1",
    "/admin/undelivered-orders":"1",
    "/admin/order_report":"5",
    "/admin/company-admin" : "6",
    "/admin/report-management": "5"
    // Language and logout not route-based
  };

  const activeKey = pathToKey[location.pathname] || "";
  return (
    <div className={`admin-sidebar open  ${isRTL() ? "rtl" : ""}`}>


      <Accordion  defaultActiveKey={activeKey} >
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t("users")}</Accordion.Header>
          <Accordion.Body>
            <Link to="/admin/user-management" className="sidebar-item" onClick={() => setActivePage("/admin/user-management")}>
              {t("Manage Users")}
            </Link>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>{t("Orders")}</Accordion.Header>
          <Accordion.Body>
            <Link to="/admin/order-management" className="sidebar-item" onClick={() => setActivePage("/admin/order-management")}>
              {t("Order Management")}
            </Link>
            <Link to="/admin/paid-orders" className="sidebar-item" onClick={() => setActivePage("/admin/paid-orders")}>
              {t("Unpaid Orders")}
            </Link>
            <Link to="/admin/processing-orders" className="sidebar-item" onClick={() => setActivePage("/admin/processing-orders")}>
              {t("Processing Orders")}
            </Link>
            <Link to="/admin/undelivered-orders" className="sidebar-item" onClick={() => setActivePage("/admin/undelivered-orders")}>
              {t("Undelivered Orders")}
            </Link>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>{t("Products")}</Accordion.Header>
          <Accordion.Body>
          <Link to="/admin/group-management" className="sidebar-item" onClick={() => setActivePage("/admin/group-management")}>{t("Groups")} </Link>
            <Link to="/admin/category-management" className="sidebar-item" onClick={() => setActivePage("/admin/category-management")}>{t("categories")} </Link>
            <Link to="/admin/item-management" className="sidebar-item" onClick={() => setActivePage("/admin/item-management")}>
              {t("Products Management")}
            </Link>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="6">
          <Accordion.Header>{t("Companies Management")}</Accordion.Header>
          <Accordion.Body>
          <Link to="/admin/company-admin" className="sidebar-item" onClick={() => setActivePage("/admin/company-admin")}>{t("Companies Management")} </Link>
           
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header>{t("Reports")}</Accordion.Header>
          <Accordion.Body>
            <Link to="/admin/order_report" className="sidebar-item" onClick={() => setActivePage("/admin/order_report")}>
              {t("Order Report")}
            </Link>
            <Link to="/admin/report-management" className="sidebar-item" onClick={() => setActivePage("/admin/report-management")}>
              {t("Requests Report")}
            </Link>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>{t("language")}</Accordion.Header>
          <Accordion.Body>
            <select
              className="sidebar-item dropdown"
              onChange={(e) => changeLanguage(e.target.value)}
              value={getCurrentLanguage()}
            >
              <option value="ar-SA">{t("arabic")}</option>
              <option value="en-US">{t("english")}</option>
            </select>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>{t("logout")}</Accordion.Header>
          <Accordion.Body>
            <Link
              to="/"
              className="sidebar-item"
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("main_url");
                    navigate("/");
          
              }}
            >
              {t("logout")}
            </Link>
          </Accordion.Body>
        </Accordion.Item>
       
      </Accordion>
    </div>
  );
};

export default AdminSidebar;
