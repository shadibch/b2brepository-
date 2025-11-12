import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  Chip,
  Divider,
  Dialog,
  DialogContent,
  Breadcrumbs,
  Paper,
  CircularProgress,
  useTheme,
  TableContainer,
} from '@mui/material';
import { AddShoppingCart, Home } from '@mui/icons-material';
import { isAuthenticated } from "./axiosInstance";
import axiosInstance from "./axiosInstance";
import { setitemscount, useHeaderContext } from "./HeaderContext";
import { t, isRTL, formatNumber } from '../utils/translator';
import { API_BASE_URL } from '../utils/settings';
import TechnicalDetailsTable from "./TechnicalDetailsTable";
import SimilarProducts from "./SimilarProducts";
const ProductItem = () => {
  const { partId } = useParams(); // ✅ Extract product ID from URL
  const [product, setProduct] = useState(null);
  const [categoryHierarchy, setCategoryHierarchy] = useState([]); // ✅ State for categories
  const [selectedImage, setSelectedImage] = useState(""); // ✅ Stores main image
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Controls modal visibility
  const theme = useTheme();
  const [quantity, setQuantity] = useState(1);
  const {  selectedBranchId } = useHeaderContext();
  const { refreshCartCount } = useHeaderContext();
  const [similarProducts, setSimilarProducts] = useState([]);
  const handleAddToCart = () => {
    // Send quantity to API or cart manager
    
    console.log("Adding to cart:", quantity);
    axiosInstance.post(`/api/add-item/${selectedBranchId}/`,{
      
        "product": product.id,
        "quantity": quantity
    }
    )
    .then(response => {
      const searchEvent = new CustomEvent('updateCart');
      window.dispatchEvent(searchEvent);
    })
    .catch(error => console.error("Error fetching product:", error));
  };
  

// Removed custom Modal component - using Material-UI Dialog instead

  useEffect(() => {
   
    
    axiosInstance.get(`/api/product/${partId}/`)
      .then(response => {
        setProduct(response.data);
        axiosInstance.get(`/api/products/${partId}/similar/`)

        .then(response => setSimilarProducts(response.data));
        const closestCategory = response.data.closest_category;
        if (closestCategory) {
        const res =   axiosInstance.get(`/api/category_hierarchy/${closestCategory}/`)
            .then(res => {
              setCategoryHierarchy(res.data);
              console.log(res.data);
            })
            .catch(err => console.error("Error fetching category hierarchy:", err));
        }
        if (response.data.media_list.length > 0) {
          setSelectedImage(API_BASE_URL + response.data.media_list[0]);
        }
      })
      .catch(error => console.error("Error fetching product:", error));

    

  }, [partId]);

  if (!product) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
    
    maxWidth={false}
    sx={{
      mt: 4,
      mb: 4,
      maxWidth: "1300px", // ✅ prevent overly wide layout
      mx: "auto",          // ✅ center content
    }}
  >
  
      {/* Breadcrumbs */}
      <Box
    
     component={Card}
     sx={{
       mb: 3,
       p: 2,
       borderRadius: 3, // curved corners
       boxShadow: 3, // subtle elevation
       transition: "transform 0.2s ease, box-shadow 0.2s ease",
       bgcolor:
       theme.palette.mode === "dark"
         ? theme.palette.background.default
         : "#f5f6fa",
       "&:hover": {
         transform: "translateY(-3px)",
         boxShadow: 6, // elevate a bit on hover
       },
     }}
   >
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

      <Grid container spacing={4}>
        {/* Left: Image Gallery */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {/* Thumbnail Bar */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto' }}>
              {product.media_list.map((img, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 80,
                    height: 80,
                    cursor: 'pointer',
                    border: selectedImage === API_BASE_URL + img ? 2 : 1,
                    borderColor: selectedImage === API_BASE_URL + img ? 'primary.main' : 'grey.300',
                  }}
                  onClick={() => setSelectedImage(API_BASE_URL + img)}
                >
                  <CardMedia
                    component="img"
                    height="100%"
                    image={API_BASE_URL + img}
                    alt={`Preview ${index}`}
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              ))}
            </Box>

            {/* Main Image */}
            <Card
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
            >
              <CardMedia
                component="img"
                height="400"
                image={selectedImage}
                alt="Main Product"
                sx={{ objectFit: 'contain' }}
              />
            </Card>

            {/* Add to Cart Section */}
            {isAuthenticated() && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  id="quantity"
                  type="number"
                  label={t('quantity')}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 120 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddShoppingCart />}
                  onClick={handleAddToCart}
                  size="large"
                >
                  {t('add_to_cart')}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right: Product Info */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Price */}
            <Box sx={{ mb: 2 }}>
              {product.price > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{ color: 'error.main', fontWeight: 'bold' }}
                  >
                    {formatNumber(product.price, product.currency)}
                  </Typography>
                  <Typography
                    variant="h6"
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
                <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(product.base_price, product.currency)}
                </Typography>
              )}
            </Box>

            {/* Availability */}
            <Chip
              label={t(product.availibility === 'M' ? 'Market' : 'Stock')}
              color={product.availibility === 'M' ? 'error' : 'success'}
              sx={{ mb: 3, fontWeight: 'bold' }}
            />

            {/* Attributes */}
            {product.attributs && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('specifications')}
                </Typography>
                {Object.entries(product.attributs).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* About Section */}
            <Typography variant="h6" gutterBottom dir={isRTL() ? "rtl" : "ltr"}>
              <strong>{t("about_this_item")}</strong>
            </Typography>
            <Typography
              variant="body1"
              dangerouslySetInnerHTML={{ __html: product.description }}
              dir={isRTL() ? "rtl" : "ltr"}
            />
             <TechnicalDetailsTable product={product} />
          </Paper>
        </Grid>
        <Box>
       
       
  
        </Box>
     
      </Grid>
      {similarProducts.length > 0 && (
<SimilarProducts similarProducts={similarProducts} />
        )}
      {/* Image Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <CardMedia
            component="img"
            image={selectedImage}
            alt="Magnified Product"
            sx={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
      </Box>
    </Container>
  );
};

export default ProductItem;
