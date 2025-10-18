import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Alert,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from "./axiosInstance";
import { useHeaderContext } from "./HeaderContext";
import { t, switchLanguage, isRTL, getCurrentLanguage } from '../utils/translator';
import createEmotionCache from './createEmotionCache';
const Header = ({ setProducts }) => {
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const direction = isRTL() ? 'rtl' : 'ltr';

  const { itemscount, setitemscount } = useHeaderContext();
  const { setSelectedBranchId } = useHeaderContext();
  const [query, setQuery] = useState(''); // Store the input value
  const [links, setLinks] = useState([]);
  const [message, setMessage] = useState(null);
  const [cache, setCache] = useState(null);
  const navigate = useNavigate(); // Handle navigation
  const location = useLocation(); // Check the current location
  const token = localStorage.getItem("authToken"); // Retrieve token
  const expiry_order = localStorage.getItem("expiry_order");
  const handleChange = (e) => {
    setSelectedBranchId(e.target.value);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
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
    async function setupCache() {
      const newCache = await createEmotionCache(direction);
      setCache(newCache);
      document.body.dir = direction; // update DOM direction (affects layout)
    }
    setupCache();
  
    if (!token) {
      setUser(null);
      return;
    }
  
    fetchActiveCart();
    fetchUserData();
    fetchBranches();
    fetchLinks();
  
    if (expiry_order && expiry_order !== "undefined" && expiry_order.length > 1 && !message) {
      const exp = expiry_order.split(",");
      const expiryDate = isRTL() ? formatHijriDate(new Date(exp[0])) : exp[0];
      const orderId = exp[1];
      setMessage(t('order_expiry_message', { orderId, expiryDate }));
    }
  
  }, [token, itemscount, direction]);
   // ✅ Adding token as a dependency

  return (
    <>
      {message && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {message}
        </Alert>
      )}
      
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* Logo */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
            B2B
          </Typography>

          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', maxWidth: 600, mx: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={`${t('search')}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Home */}
            <IconButton color="inherit" component={RouterLink} to="/">
              <HomeIcon />
            </IconButton>

            {/* Cart */}
            <IconButton color="inherit" component={RouterLink} to="/cartdetails">
              <Badge badgeContent={itemscount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Support */}
            <IconButton color="inherit" component={RouterLink} to="/support">
              <PhoneIcon />
            </IconButton>

            {/* User Menu */}
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              aria-controls={userMenuAnchor ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuAnchor ? 'true' : undefined}
            >
              <PersonIcon />
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
            >
              <MenuItem onClick={() => { navigate(user ? "/account_settings" : "/login"); handleUserMenuClose(); }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {user ? `${user.first_name} ${user.last_name}` : `${t('login')} / ${t('signup')}`}
                </ListItemText>
              </MenuItem>
              
              {user && (
                <>
                  <Divider />
                  {links.map((link) => (
                    <MenuItem key={link.url} component={RouterLink} to={link.url} onClick={handleUserMenuClose}>
                      <ListItemText>{t(link.name)}</ListItemText>
                    </MenuItem>
                  ))}
                  
                  {branches.length > 0 && (
                    <>
                      <Divider />
                      <MenuItem>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('switchbranch')}</InputLabel>
                          <Select
                            value={branches[0]?.id || ''}
                            onChange={handleChange}
                            label={t('switchbranch')}
                          >
                            {branches.map((branch) => (
                              <MenuItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </MenuItem>
                    </>
                  )}
                  
                  <Divider />
                  <MenuItem onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("main_url");
                    setUser(null);
                    navigate("/");
                    window.location.reload();
                    handleUserMenuClose();
                  }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('logout')}</ListItemText>
                  </MenuItem>
                </>
              )}
            </Menu>

            {/* Language Menu */}
            <IconButton
              color="inherit"
              onClick={handleLanguageMenuOpen}
              aria-controls={languageMenuAnchor ? 'language-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={languageMenuAnchor ? 'true' : undefined}
            >
              <LanguageIcon />
            </IconButton>
            <Menu
              id="language-menu"
              anchorEl={languageMenuAnchor}
              open={Boolean(languageMenuAnchor)}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => { changeLanguage('ar-SA'); handleLanguageMenuClose(); }}>
                {t('arabic')}
              </MenuItem>
              <MenuItem onClick={() => { changeLanguage('en-US'); handleLanguageMenuClose(); }}>
                {t('english')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Header;
