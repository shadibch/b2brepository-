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
  Breadcrumbs,
  Link
} from '@mui/material';
import { AddShoppingCart, Home } from '@mui/icons-material';
import axiosInstance from "./axiosInstance";
import GroupSlide from "./GroupSlide";
import { useNavigate } from "react-router-dom"; // ✅ Handles navigation
import {API_BASE_URL,DEFAULT_IMAGE} from '../utils/settings';
import { useParams } from "react-router-dom";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber} from '../utils/translator';
const CategoryPage = () => {
  const { categoryId } = useParams(); //
  const [products, setProducts] = useState([]);
	const [categoryHierarchy, setCategoryHierarchy] = useState([]);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Sidebar open by default
  const navigate = useNavigate();


  // ✅ Function to truncate long product names
  const truncateText = (text, maxLength = 34) => {
    return text.length > 37 ? `${text.substring(0, maxLength)}...` : text;
  };
   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // ✅ Toggle sidebar state
  };


  // ✅ Fetch Categories using Axios
 
  
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
      setProducts(response.data.results);
	  axiosInstance.get(`/api/category_hierarchy/${categoryId}/`)
            .then(res => setCategoryHierarchy(res.data))
            .catch(err => console.error("Error fetching category hierarchy:", err));
	   setIsSidebarOpen(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  useEffect(() => {
	fetchProducts();
  }, []);

  return (
    <>

	{  (
    <GroupSlide 
    updateProducts={setProducts} 
    isOpen={isSidebarOpen} 
    toggleSidebar={toggleSidebar} 
    categoryId={categoryId} 
  />)}
     <Container maxWidth="xl" sx={{ mt: 5, mb: 4 }}>
    

     <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Home sx={{ mr: 0.5 }} />
            {t('home')}
          </Box>
        </Link>
        {categoryHierarchy.map((category, index) => (
          <Link
            key={category.id}
            to={`/categorypage/${category.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {category.name}
          </Link>
        ))}
      </Breadcrumbs>

        {/* Products Section */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(`/productitem/${product.part_id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.media_list.length > 0 ? `${API_BASE_URL}${product.media_list[0]}` : DEFAULT_IMAGE}
                    alt={product.name}
                    sx={{
                      objectFit: 'contain',
                      p: 1,
                    }}
                    onMouseEnter={(e) => {
                      if (product.media_list.length > 1) {
                        e.currentTarget.src = `${API_BASE_URL}${product.media_list[1]}`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (product.media_list.length > 1) {
                        e.currentTarget.src = `${API_BASE_URL}${product.media_list[0]}`;
                      }
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        fontWeight: 'medium',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {truncateText(product.name)}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      {product.price > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ color: 'error.main', fontWeight: 'bold' }}
                          >
                            {formatNumber(product.price, product.currency)}
                          </Typography>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              color: 'text.secondary',
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatNumber(product.base_price, product.currency)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                          {formatNumber(product.base_price, product.currency)}
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={t(product.availibility === 'M' ? 'Market' : 'Stock')}
                      color={product.availibility === 'M' ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default CategoryPage;
