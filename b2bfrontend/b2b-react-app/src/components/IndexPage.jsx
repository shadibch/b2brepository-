import React, { useEffect, useState } from "react";
import Header from "./Header";
import {
  Container,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import axiosInstance from "./axiosInstance";
import { isAuthenticated } from "./axiosInstance";
import GroupSlide from "./GroupSlide";
import { t, switchLanguage, isRTL, getCurrentLanguage, formatNumber } from '../utils/translator';
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL, DEFAULT_IMAGE } from '../utils/settings';
const IndexPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
	const [categoryId,setCategoryId] = useState([]);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Sidebar open by default
const navigate = useNavigate();



  // ✅ Function to truncate long product names
  const truncateText = (text, maxLength = 34) => {
    return text.length > 37 ? `${text.substring(0, maxLength)}...` : text;
  };
   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // ✅ Toggle sidebar state
  };


  // ✅ Fetch Categories using Axios
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/api/products/");
      setProducts(response.data.results);
	   setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
	  setCategoryId(categoryId);
	   setIsSidebarOpen(true);
      setProducts(response.data.results); // ✅ Update product list dynamically
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const location = useLocation();
  useEffect(() => {
    // Load correct CSS based on language direction

  
    // Fetch categories initially
    fetchCategories();
  
    // If coming from navigation (location.state), set products
    if (location.state?.results) {
      setProducts(location.state.results);
      window.history.replaceState({}, document.title);
    } else {
      // Otherwise, fetch products normally
      fetchProducts();
    }
  
    // --- NEW: Listen for custom 'searchResults' event
    const handleSearchEvent = (event) => {
      setProducts(event.detail); // event.detail contains new search results
    };
  

    const dispatchEvent = (event)=>{
      navigate(event.detail);
    };
    window.addEventListener('dispatch', dispatchEvent);
    window.addEventListener('searchResults', handleSearchEvent);
  
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('searchResults', handleSearchEvent);
    };
  
  }, [location.state, setProducts]);
  
    // Remove the automatic redirect logic to allow users to freely navigate
    // The redirect should only happen on initial login, not when explicitly navigating to products
  return (
    <>
      {categoryId > 0 && (
        <GroupSlide 
          updateProducts={setProducts} 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          categoryId={categoryId} 
        />
      )}
      
      <Container maxWidth="xl" sx={{ mt: 5, mb: 4 }}>
        {/* Categories Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Grid container spacing={2} justifyContent="center">
            {categories.map((category) => (
              <Grid item key={category.id}>
                <Button
                  variant="outlined"
                  onClick={() => fetchProductsByCategory(category.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    minWidth: 120,
                    height: 100,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={category.file}
                    alt={category.name}
                    sx={{
                      width: 40,
                      height: 40,
                      mb: 1,
                      objectFit: 'contain',
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    {category.name}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Products Section */}
        
        <Box
  sx={{
    display: "grid",
    gap: 3,
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  }}
>
  {products.map((product) => (
    
      <Card
      key={product.id}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
        onClick={() => navigate(`/productitem/${product.part_id}`)}
      >
        <CardMedia
          component="img"
          height="200"
          image={product.media_url || DEFAULT_IMAGE}
          alt={product.name}
          sx={{ objectFit: "contain", p: 1 }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "medium",
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {truncateText(product.name)}
          </Typography>

          {isAuthenticated() && (
            <Box sx={{ mb: 1 }}>
              {product.price > 0  ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ color: "error.main", fontWeight: "bold" }}>
                    {formatNumber(product.price, product.currency)}
                  </Typography>
                  {product.base_price !== product.price && (
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: "line-through", color: "text.secondary" }}
                  >
                    {formatNumber(product.base_price, product.currency)}
                  </Typography>
                  )}
                  
                  
                  </Box>
              
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {formatNumber(product.base_price, product.currency)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", ml: 1 }}
                  >
                   
                   
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Chip
            label={t(product.availibility === "M" ? "Market" : "Stock")}
            color={product.availibility === "M" ? "error" : "success"}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </CardContent>
      </Card>

  ))}
</Box>

      
      </Container>
    </>
  );
};

export default IndexPage;
