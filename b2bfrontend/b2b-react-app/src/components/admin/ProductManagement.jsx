// ProductManagement.mui.jsx
import React, { useEffect, useState, useRef } from "react";

import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,

  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,

  useTheme,
  CircularProgress,
  Backdrop
} from "@mui/material";

import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,

  Title as TitleIcon,
  
} from "@mui/icons-material";

import axiosInstance from "../axiosInstance";
import { API_BASE_URL, DEFAULT_IMAGE } from "../../utils/settings";
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
  formatNumber,
} from "../../utils/translator";
import CategoryTree from "./Categories";

import AsyncSelect from "react-select/async";
import ProductTable from "./ProductTable";
import FullScreenLoader from "./FullscreenLoadingOverlay";
import { useNavigate } from "react-router-dom";



export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [translations, setTranslations] = useState({ en: { name: "", description: "" }, ar: { name: "", description: "" } });
  const navigate = useNavigate();
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("M");
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [contextProduct,setContextProduct] = useState(null);

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  // Edit/View mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

const [tempImages, setTempImages] = useState([]);
  const [tempPreviewUrls, setTempPreviewUrls] = useState([]);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [partId, setPartId] = useState("");
  const [unit, setUnit] = useState("M");
  const [forEachAr, setForEachAr] = useState("");
  const [forEachEn, setForEachEn] = useState("");

  const fileInputRef = useRef(null);
  const addImageInputRef = useRef(null);
  const isSearchingRef = useRef(false);

  const [tabIndex, setTabIndex] = useState(0);

  /* --- Fetching & init --- */
  useEffect(() => {
    if (!isSearchingRef.current) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory]);



  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/products/?page=${currentPage}`);
      setProducts(res.data.results || []);
      setTotalPages(res.data.num_pages);
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching products") });
    }
    setLoading(false);
  };





  const fetchProductsByCategory = async (categoryId) => {
    if(loading) {
      return;
    }
    setLoading(true);
    if(categoryId == "null") {
      handleSearch();
    }else {
    try {
      const res = await axiosInstance.get(`/api/products/category/${categoryId}`);
      setProducts(res.data.results || []);
      setTotalPages(res.data.num_pages);
      // Fetch groups for category if endpoint exists
      try {
        const groupsRes = await axiosInstance.get(`/api/product_groups/${categoryId}/`);
        setGroups(groupsRes.data || []);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching category products") });
    }
  }
  setLoading(false);
  };

  const handleSearch = async () => {
    if(loading || isSearchingRef.current) {
      return;
    }
    isSearchingRef.current = true;
    setLoading(true);
    try {
      
      if (searchQuery && searchQuery.trim() != '' ) {
        
        const res = await axiosInstance.get(`/api/search_text?q=${encodeURIComponent(searchQuery)}`);
        setProducts(res.data.results || []);
        setTotalPages(res.data.num_pages);
        setCurrentPage(1);
      } else {
       if(selectedCategory?.id) {
        await fetchProductsByCategory(selectedCategory?.id);
       }else {
        await fetchProducts();
       }
      }
    } catch (err) {
      setMessage({ type: "error", text: t("Error searching products") });
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  /* --- Image handling --- */
  /* --- Form handling --- */
 const clearForm = () => {
    setSelected(null);
    setIsEditMode(false);

    setSelectedGroups([]);
    setSelectedSubgroups([]);
    setTranslations({ en: { name: "", description: "" }, ar: { name: "", description: "" } });
    setPrice("");
    setPartId("");
    setTempImages([]);
    setTempPreviewUrls([]);
    setSelectedImageIndex(0);
    setStockQuantity(0);
    setAvailability("M");
    setUnit("M");
    setForEachAr("");
    setForEachEn("");
    setLoading(false); // Reset loading state
  };



  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/admin/products/${productToDelete}/`);
      setMessage({ type: "success", text: t("Product deleted successfully") });
      clearForm();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || t("Error deleting product") });
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const handleProductSelect = async (product) => {
    if(loading) {
      return;
    }
    setLoading(true);
    try {
      
      navigate(`/admin/product-item/?productId=${product.id}/`);
     
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching product details") });
    }
    setLoading(false);
  };

  const getProductImage = (product) => {
    if ( product.media_url) return `${product.media_url}`;
    return `${DEFAULT_IMAGE}`;
  };

  


  const handleNewProduct = () => {
    navigate(`/admin/product-item/`);
  };

  const confirmWarningAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowWarningDialog(false);
  };

  const cancelWarningAction = () => {
    setPendingAction(null);
    setShowWarningDialog(false);
  };
  
  const theme = useTheme();



  /* --------------------------
     UI Render
     -------------------------- */
     <Backdrop
     sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
     open={loading}
   >
     <CircularProgress color="inherit" />
   </Backdrop>
   
  return (
    <Box
    sx={{
      width: "100%",
      minHeight: "100vh",
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "#f5f6fa",
      p: 3,
      direction: isRTL() ? "rtl" : "ltr",
    }}
  >
     {loading && <FullScreenLoader />}
    {/* Header */}
    <Typography
      variant="h4"
      sx={{
        mb: 3,
        fontWeight: 700,
        textAlign: isRTL() ? "right" : "left",
        color: theme.palette.text.primary,
      }}
    >
      {t("Products Management")}
    </Typography>
    <Box sx={{ p: 2 }} dir={isRTL() ? "rtl" : "ltr"}>
      <Grid container spacing={2}>


        

        <Grid item xs={12} md={9}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: "60%" }}>
                <TextField
                  fullWidth
                  placeholder={`${t("search")}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button variant="contained" onClick={handleSearch}>{t("search")}</Button>
              </Box>

              <Button variant="contained" color="success" onClick={handleNewProduct} startIcon={<AddIcon />}>
                {t("New Product")}
              </Button>
             
            </Box>

            {message && (
              <Alert severity={message.type === "error" ? "error" : "success"} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Left: Products List */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6">{t("Products")}</Typography>
                    <Button variant="outlined" onClick={handleNewProduct}>{t("New Product")}</Button>
                  </Box>

                <ProductTable products={products} selected={selected} 
                handleProductSelect={handleProductSelect}
                handleDelete={handleDelete} 
                getProductImage={getProductImage}
               
                ></ProductTable>

                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                      <Pagination count={totalPages} page={currentPage} onChange={(e, p) => setCurrentPage(p)} />
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Right: Form */}
              
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>{t("Confirm Delete")}</DialogTitle>
        <DialogContent>{t("Are you sure you want to delete this product?")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>{t("Cancel")}</Button>
          <Button color="error" onClick={confirmDelete}>{t("Delete")}</Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog for Discarding Changes */}
      <Dialog open={showWarningDialog} onClose={cancelWarningAction}>
        <DialogTitle>{t("Unsaved Changes")}</DialogTitle>
        <DialogContent>
          {t("The changes will be discard, Do you want to continue ?")}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelWarningAction}>{t("No")}</Button>
          <Button onClick={confirmWarningAction} variant="contained">{t("Yes")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
}
