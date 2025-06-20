import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "./axiosInstance";
import { useHeaderContext } from "./HeaderContext";

import { t, switchLanguage, isRTL, getCurrentLanguage } from '../utils/translator';
import { Alert } from "react-bootstrap";
const Header = ({ setProducts }) => {
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);

  const { itemscount ,setitemscount} = useHeaderContext();
  const { setSelectedBranchId} = useHeaderContext();
  const [query, setQuery] = useState(''); // Store the input value
  const[links,setLinks] = useState([]);
  const[message,setMessage]= useState(null);
  const navigate = useNavigate(); // Handle navigation
  const location = useLocation(); // Check the current location
  const token = localStorage.getItem("authToken"); // Retrieve token
  const expiry_order = localStorage.getItem("expiry_order");
  const handleChange = (e) => {
    setSelectedBranchId(e.target.value);
  };
  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(`/api/search_text?q=${query}`);
      if (location.pathname === '/') {
        // Already on IndexPage: trigger a custom event!
        const searchEvent = new CustomEvent('searchResults', { detail: response.data.results });
        window.dispatchEvent(searchEvent);
      } else {
        // Not on IndexPage: navigate and pass results
        navigate('/', { state: { results: response.data.results } });
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
  const handleSearchEvent = (event) => {
    fetchActiveCart();
  };
  const handleExpirayOrder = (event) => {
    const eventData = event.detail;
    const date = eventData[0];
    if(date != undefined) {
    const expiryDate = isRTL() ? 
      formatHijriDate(new Date(date)) :
      date;
    const orderId = eventData[1];
    setMessage(t('order_expiry_message', { orderId, expiryDate }));
    }
  }

  // Format date for display in Hijri
  const formatHijriDate = (date) => {
    if (!date) return '';
    const options = { calendar: 'islamic-umalqura', year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('ar-SA', options).format(date);
  };

  window.addEventListener('expiry_order',handleExpirayOrder);

  window.addEventListener('updateCart', handleSearchEvent);
  const changeLanguage = (lang) => {
    switchLanguage(lang);
    window.location.reload();
  }
  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/api/user/");
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("authToken");
      setUser(null);

      console.error("Error fetching user:", error);
      window.location.reload();
    }
  };
  const fetchLinks = async () => {
    try {
      const response = await axiosInstance.get("/api/navigation/");
      setLinks(response.data.links); // Store fetched links
    } catch (error) {
      console.error("Error fetching navigation links:", error);
    }
  };
  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/branches/");
      setBranches(response.data);
      if (response.data.length >= 1) {
        setSelectedBranchId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchActiveCart = async () => {
    const response = await axiosInstance.get("/api/cart/");
    console.log(JSON.stringify(response.data));
    setitemscount(response.data.cart_items_count);
  }
  useEffect(() => {
    if (isRTL()) {
      import("./Header_rtl.css");
    } else {
      import("./Header.css");
    }
    if (!token) {
      setUser(null); // If token is removed, reset user state
      return;
    }


    fetchActiveCart();

    fetchUserData();
    fetchBranches();
    fetchLinks();
    if(expiry_order != "undefined" &&
      expiry_order &&expiry_order.length >1 && !message) {
      console.log(expiry_order);
      const exp = expiry_order.split(",");
      const expiryDate = isRTL() ? 
      formatHijriDate(new Date(exp[0])) :
      exp[0];
    const orderId = exp[1];
    setMessage(t('order_expiry_message', { orderId, expiryDate }));
    
    }

  }, [token,itemscount]); // ✅ Adding token as a dependency

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">B2B</h1>
      </div>
      {message && <Alert variant="success">{message}</Alert>}

      <div className="header-middle">
        <input
          type="text"
          placeholder={`${t('search')}...`} // ✅ Use template literal for translation
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="search-button" onClick={handleSearch}>  {t('search')}</button>
      </div>

      <div className="header-right">
        {/* User Menu - Always Exists */}
        <div className="user-menu">
          <span className="user-icon">👤</span>
          <div className="dropdown">
            <p
              className="dropdown-item user-name"
              onClick={() => navigate(user ? "/account_settings" : "/login")}
            >
              {user
                ? `${user.first_name} ${user.last_name}`
                : `${t('login')} / ${t('signup')}`}
            </p>

            <hr />
            {user && (
              <>
                {links.map((link) => (
                  <Link key={link.url} className="dropdown-item" to={link.url}>{t(link.name)}</Link>
                ))}
           
               
                                <hr />
                {branches.length > 0 && (
                  <>
                    <label className="dropdown-label">{t('switchbranch')}:</label>
                    <select className="dropdown-select" onChange={handleChange}>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </>
                )}
                <Link
                  className="dropdown-item"
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("main_url");

                    setUser(null);
                    navigate("/");
                    window.location.reload(); // ✅ Forces a full page refresh
                  }}
                >

                  {t('logout')}
                </Link>

              </>
            )}
          </div>
        </div>

        <div className="cart-wrapper">
          {itemscount > 0 && (
            <div className="cart-items-count">{itemscount}</div>
          )}
          <Link to="/cartdetails" className="cart-icon">🛒</Link>
        </div>

          <Link to="/" className="home">🏠</Link>
        {/* Customer Service */}
        <Link to="/support" className="support-icon">📞</Link>

        {/* World Menu */}
        <div className="world-menu">
          <span className="world-icon">🌍</span>
          <div className="dropdown">

            <label className="dropdown-label">{t('language')}:</label>
            <select
              className="dropdown-select"
              onChange={(e) => changeLanguage(e.target.value)} // ✅ Call switchLanguage with the selected value
              // ✅ Ensure the dropdown reflects the current language
              value={getCurrentLanguage()}
            >
              <option value='ar-SA' >{t('arabic')}</option>
              <option value='en-US'>{t('english')}</option>

            </select>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
