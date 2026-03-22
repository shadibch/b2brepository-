import React, { useEffect, useState, useRef } from "react";
import AsyncSelect from 'react-select/async';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Stack,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  Tooltip,
  Chip,

  Menu,
  List,
  ListItem,
  ListItemText,
  Collapse,
  useTheme,
  CircularProgress,
  Backdrop
} from "@mui/material";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
  ExpandLess,
  ExpandMore,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  ColorLens,
  Title as TitleIcon
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
import BranchContractManagement from "./BranchAdminContractManagement";
import ProductTable from "./ProductTable";
import FullScreenLoader from "./FullscreenLoadingOverlay";

import { useParams } from "react-router-dom";
import RichTextEditor from "./Editor";

export default function ProductItem() {
  const { productId } = useParams(); 
  const theme = useTheme();
  const [selected, setSelected] = useState(null);
  const [loading,setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [translations, setTranslations] = useState({ en: { name: "", description: "" }, ar: { name: "", description: "" } });

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
  useEffect(() => {
    console.log(productId);
    if(!productId) {
      setIsEditMode(true);
    }else {
    handleProductSelect(productId);
    loadPrices();
    }
    const loadCategories = async () => {
      try {
        const res = await axiosInstance.get("/api/categories_hierarchy/");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error loading categories");
      }
    };
  
    loadCategories();
  }, [productId]);

  const TranslationFields = ({ translations, setTranslations, isEditMode }) => {
    const theme = useTheme();
   
   
    return (
      
      <Box   sx={{
       marginTop: 2,
       
        
     
        direction: isRTL() ? "rtl" : "ltr",
      }}>
        {["en", "ar"].map((lang) => (
          <Box key={lang} sx={{ mb: 3 }}>
            <TextField
              label={`${t("Product Name")} (${lang.toUpperCase()})`}
              fullWidth
              value={translations[lang]?.name || ""}
              onChange={(e) =>
                isEditMode && setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], name: e.target.value } }))
              }
              disabled={!isEditMode}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("Description")} ({lang.toUpperCase()} ) 
            </Typography>
            <RichTextEditor 
           style={{ height: "150px" }}
              value={translations[lang]?.description || ""}  
              onChange={(content) =>
                isEditMode && setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], description: content }
                }))
              }
              disabled={!isEditMode}
              dir={lang == 'ar' ? 'rtl' : 'ltr'}
              placeholder={t('Product Description')} />
            
          </Box>
        ))}
      </Box>
    );
  };
  const refreshGroupsForCurrentCategory = async () => {
    try {
      const categoryId = selectedCategory?.id || selected?.closest_category;
      if (!categoryId) return;
      const groupsRes = await axiosInstance.get(
        `/api/product_groups/${categoryId}/`
      );
      setGroups(groupsRes.data || []);
    } catch (e) {
      // ignore refresh errors
    }
  };

  const refreshGroups = async (selectedCategory) => {
    try {
      const categoryId = selectedCategory?.id ;
      if (!categoryId) return;
      const groupsRes = await axiosInstance.get(
        `/api/product_groups/${categoryId}/`
      );
      setGroups(groupsRes.data || []);
    } catch (e) {
      // ignore refresh errors
    }
  };
  const handleEditProduct = () => {
setIsEditMode(true);
  };
  const handleMainImageClick = () => fileInputRef.current?.click();
  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const file = files[0];
    setTempImages((s) => [...s, file]);
      setTempPreviewUrls((s) => [...s, URL.createObjectURL(file)]);
      setSelectedImageIndex(tempImages.length);
    if (selected?.id) {
      try {
        const formData = new FormData();
        formData.append("images", file);
       const res = await axiosInstance.post(`/api/admin/products/${selected.id}/add_media/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        selected.media_url = res.media_url;
        setSelectedImageIndex(0);
      } catch (err) {
        setMessage({ type: "error", text: t("Error adding product image") });
      }
    }  
  };
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const file = files[0];
    const newTempImages = [...tempImages];
    const newTempPreviews = [...tempPreviewUrls];
     
      newTempImages.push(file);
      newTempPreviews.push(URL.createObjectURL(file));
    
    setTempImages(newTempImages);
    setTempPreviewUrls(newTempPreviews);
   

    if (selected?.id) {
      try {
        const formData = new FormData();
        formData.append("images", file);
        const rest = await axiosInstance.post(`/api/admin/products/${selected.id}/update_media/?index=${selectedImageIndex}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        selected.media_url = rest.media_url;
      } catch (err) {
        setMessage({ type: "error", text: t("Error updating product images") });
      }
    }  
     
    
  };  
  
  const GroupSelector = ({
    categoryId,
    groups,
    setGroups,
    selectedGroups,
    onGroupSelect,
    selectedSubgroups,
    onSubgroupSelect,
    onSubgroupsUpdated,
    isEditMode,
  }) => {
    const [expanded, setExpanded] = useState({});

    const toggle = (id) => {
      const g = groups.find((x) => x.id === id);
      const defaultOpen = (g?.subgroups?.length ?? 0) > 0;
      setExpanded((s) => {
        const current = s[id] ?? defaultOpen;
        return { ...s, [id]: !current };
      });
    };
    const [modelSubGroup, setModelSubGroup] = useState(false);
    const [subGroup, setSubGroup] = useState(null);
  
  
  
    
   
    return (
      <Box>
        {groups.map((g) => {
          const groupExpanded =
            expanded[g.id] ?? (g.subgroups?.length > 0);
          return (
          <Paper key={g.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(g.id)}
                  onChange={() => onGroupSelect(g.id)}
                  disabled={!isEditMode}
                />
                <Typography sx={{ ml: 1 }}>{g.name}</Typography>
              </Box>
              {g.subgroups?.length > 0 && (
                <IconButton size="small" onClick={() => toggle(g.id)}>
                  {groupExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Box>
            <Collapse in={groupExpanded}>
              <Box sx={{ mt: 1 }}>
                {g.subgroups?.map((s) => (
                  <Box key={s.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                     <input
                       type="radio"
                       name={`group-${g.id}`}
                       checked={selectedSubgroups.includes(s.id)}
                       onChange={() => onSubgroupSelect(s.id, g.id)}
                       disabled={!isEditMode}
                     />
                    <Typography sx={{ ml: 1 }}>{s.name}</Typography>
                  </Box>
                ))}
  
              </Box>
            </Collapse>
          </Paper>
        );
        })}
  
        <Dialog
          open={modelSubGroup}
          onClose={() => {
            setModelSubGroup(false);
            setSubGroup(null);
          }}
        >
          <DialogTitle>{t("Add Subgroup")}</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="dense"
              label={`${t("Subgroup Name")} (EN)`}
              value={subGroup?.name_en || ""}
              onChange={(e) =>
                setSubGroup((prev) => ({
                  ...(prev || {}),
                  name_en: e.target.value,
                }))
              }
            />
            <TextField
              fullWidth
              margin="dense"
              label={`${t("Subgroup Name")} (AR)`}
              value={subGroup?.name_ar || ""}
              onChange={(e) =>
                setSubGroup((prev) => ({
                  ...(prev || {}),
                  name_ar: e.target.value,
                }))
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setModelSubGroup(false);
                setSubGroup(null);
              }}
            >
              {t("Cancel")}
            </Button>
          
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  const handleSave = async () => {
    if(loading) {
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();

      const translationsArray = Object.entries(translations)
        .filter(([_, v]) => v.name || v.description)
        .map(([language, v]) => ({ language, name: v.name, description: v.description }));

      const firstFilledName = translationsArray.find((t) => t.name)?.name || "";

      fd.append("translations", JSON.stringify(translationsArray));

      if (selected?.id) fd.append("id", selected.id);
      else if (partId) fd.append("part_id", partId);

      if (selectedCategory?.id) 
        fd.append("closest_category", selectedCategory.id);
      else if(selected?.closest_category) {
        fd.append("closest_category", selected.closest_category);
      }
      else {
        setMessage({ type: "error", text: t("Please select a category") });
        setLoading(false);
        return;
      }

      fd.append("base_price", price);
      fd.append("availibility", availability);
      fd.append("subgroups", JSON.stringify(selectedSubgroups));
      fd.append("name", firstFilledName);
      fd.append("stock_quantity", stockQuantity);
      fd.append("unit", unit);
      
      if (unit === "Each") {
        fd.append("for_each_en", forEachEn);
        fd.append("for_each_ar", forEachAr);
      }

      if (!selected?.id) {
        tempImages.forEach((img) => fd.append("images", img));
       
      
      }

      const url = selected?.id ? `/api/admin/products/${selected.id}/` : "/api/admin/products/";
      const method = selected?.id ? "put" : "post";

      const res = await axiosInstance[method](url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const saved = res.data.data;
      setSelected(saved);
      if (saved.closest_category) {
        const groupsRes = await axiosInstance.get(`/api/product_groups/${saved.closest_category}/`);
        setGroups(groupsRes.data || []);
        setSelectedSubgroups(saved.subgroups || []); // optional, if you want them pre-checked
      }
     
      setMessage({ type: "success", text: t(selected?.id ? "Product updated successfully" : "Product created successfully") });

    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || t("Error saving product") });
    }
    setLoading(false);
  };
  const renderImageGallery = () => {
    const mediaList = selected?.id ? ([selected?.media_url] || []) : tempPreviewUrls;

    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("Images")}</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
         

          <Box sx={{ flex: 1 }}>
            {mediaList.length > 0 ? (
              <Box>
                 <Paper
                   onClick={isEditMode ? handleMainImageClick : undefined}
                   variant="outlined"
                   sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", cursor: isEditMode ? "pointer" : "default", position: "relative" }}
                 >
                   <img
                     src={ `${mediaList[0]}` }
                     alt="main"
                     style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                   />
                   {isEditMode && (
                     <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                       <Chip icon={<ImageIcon />} label={t("Click to replace")} />
                     </Box>
                   )}
                 </Paper>

             
              </Box>
            ) : (
              <Paper variant="outlined" onClick={isEditMode ? handleMainImageClick : undefined} sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", cursor: isEditMode ? "pointer" : "default" }}>
                <Stack alignItems="center" spacing={1}>
                  <CloudUploadIcon />
                  <Typography>{t("Click to upload image")}</Typography>
                </Stack>
              </Paper>
            )}
          </Box>
        </Box>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
        <input ref={addImageInputRef} type="file" accept="image/*" onChange={handleAddImage} style={{ display: "none" }} />
      </Box>
    );
  };
  const loadPrices = async () => {
    try {
      if(!productId) {
        return false;
      }
      const res = await axiosInstance.get(`/api/admin/products/${productId}/prices/`);
      setPrices(res.data);
    } catch (err) {
      setMessage({ type: "error", text: t("Error loading prices") });
    }
  };
  
  const ProductContractPrices = ({ product, onPriceAdded, onPriceDeleted }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
  
    const loadCompanyOptions = async (inputValue) => {
      try {
        const res = await axiosInstance.get(`/filter-companies/?q=${inputValue}`);
        return res.data.map((c) => ({ value: c.id, label: `${c.name} (${c.register_number})` }));
      } catch (err) {
        return [];
      }
    };
  
    return (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("Company")}</Typography>
        <AsyncSelect
          cacheOptions
          defaultOptions
          value={selectedCompany}
          onChange={setSelectedCompany}
          loadOptions={loadCompanyOptions}
          placeholder={t("Search for a company...")}
          isClearable
        />
  
        {selectedCompany && <BranchContractManagement company={selectedCompany} product={product} />}
      </Box>
    );
  };
  const ProductPrices = ({ product, onPriceAdded, onPriceDeleted }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isPercentage, setIsPercentage] = useState(true);
    const [discountValue, setDiscountValue] = useState("");
    const [prices, setPrices] = useState([]);
    const [message, setMessage] = useState(null);
    const [editingPrice, setEditingPrice] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toDelete, setToDelete] = useState(null);
  
    const theme = useTheme();
    useEffect(() => {
      if (product?.id) loadPrices();
    }, [product]);
    const handleEdit = (p) => {
      if(isEditMode) {
      
      setEditingPrice(p);
      setSelectedCompany({ value: p.purchaser, label: p.company_name });
      setIsPercentage(p.percentage_discount !== null);
      setDiscountValue(p.percentage_discount !== null ? p.percentage_discount : p.flat_discount);
      }
    };
  
    const handleDelete = (p) => {
      if(isEditMode) {
      setToDelete(p);
      setShowConfirm(true);
      }
    };
    const loadPrices = async () => {
      try {
        const res = await axiosInstance.get(`/api/admin/products/${product.id}/prices/`);
        setPrices(res.data);
      } catch (err) {
        setMessage({ type: "error", text: t("Error loading prices") });
      }
    };
  
    const loadCompanyOptions = async (inputValue) => {
      try {
        const res = await axiosInstance.get(`/filter-companies/?q=${inputValue}`);
        return res.data.map((c) => ({ value: c.id, label: `${c.name} (${c.register_number})` }));
      } catch (err) {
        return [];
      }
    };
  
    const handleAddOrUpdate = async () => {
      try {
        if (!selectedCompany) return setMessage({ type: "error", text: t("Please select a company") });
        if (!discountValue) return setMessage({ type: "error", text: t("Please enter a discount value") });
  
        const payload = {
          purchaser: selectedCompany.value,
          is_percentage: isPercentage,
          discount_value: parseFloat(discountValue),
        };
  
        const res = await axiosInstance.post(`/api/admin/products/${product.id}/add_price/`, payload, {
          headers: { "Content-Type": "application/json" },
        });
  
        setMessage({ type: "success", text: editingPrice ? t("Price updated successfully") : t("Price added successfully") });
        setSelectedCompany(null);
        setDiscountValue("");
        setIsPercentage(true);
        setEditingPrice(null);
        await loadPrices();
        if (onPriceAdded) onPriceAdded(res.data);
      } catch (err) {
        setMessage({ type: "error", text: err.response?.data?.error || t("Error adding price") });
      }
    };
  
    
  
    const confirmDelete = async () => {
      try {
        await axiosInstance.delete(`/api/admin/products/${product.id}/delete_price/?price_id=${toDelete.id}`);
        setMessage({ type: "success", text: t("Price deleted successfully") });
        await loadPrices();
        if (onPriceDeleted) onPriceDeleted(toDelete.id);
      } catch (err) {
        setMessage({ type: "error", text: err.response?.data?.error || t("Error deleting price") });
      } finally {
        setShowConfirm(false);
        setToDelete(null);
      }
    };
  
   
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
        {message && (
          <Alert severity={message.type === "error" ? "error" : "success"} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
  
        <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
          <Box  sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}>
            <Typography variant="subtitle2">{t("Company")}</Typography>
            <AsyncSelect
              cacheOptions
              defaultOptions
              value={selectedCompany}
              onChange={setSelectedCompany}
              loadOptions={loadCompanyOptions}
              placeholder={t("Search for a company...")}
              isClearable
            />
          </Box>
  
          <Box>
            <label>
              <input
                type="checkbox"
                checked={isPercentage}
                onChange={(e) => setIsPercentage(e.target.checked)}
              />{" "}
              {t("Percentage Discount")}
            </label>
          </Box>
  
          <TextField
            label={isPercentage ? t("Percentage Discount") : t("Flat Discount")}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            InputProps={{
              endAdornment: isPercentage ? <InputAdornment position="end">%</InputAdornment> : null,
            }}
          />
  
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={handleAddOrUpdate}>
              {editingPrice ? t("Update Price") : t("Add Price")}
            </Button>
            {editingPrice && <Button onClick={() => { setEditingPrice(null); setSelectedCompany(null); setDiscountValue(""); }}> {t("Cancel")}</Button>}
          </Box>
        </Stack>
  
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("Company")}</TableCell>
                <TableCell>{t("Discount Type")}</TableCell>
                <TableCell>{t("Discount Value")}</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prices.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.company_name}</TableCell>
                  <TableCell>{p.percentage_discount !== null ? t("Percentage") : t("Flat")}</TableCell>
                  <TableCell>
                    {p.percentage_discount !== null ? `${p.percentage_discount}%` : formatNumber(p.flat_discount)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(p)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>{t("Confirm Delete")}</DialogTitle>
          <DialogContent>{t("Are you sure you want to delete this price?")}</DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirm(false)}>{t("Cancel")}</Button>
            <Button color="error" onClick={confirmDelete}>{t("Delete")}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  const handleProductSelect = async (productid) => {
    if(!productid) {
      return false;
    }
    if(loading) {
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/product-detail/${productid}/`);
      
      const dp = res.data;
      
      setSelected(dp);
      setIsEditMode(false); // Set to view mode by default

     
      const category_id = dp.closest_category;
      setSelectedCategory({ id:category_id});
      const groupsRes = await axiosInstance.get(`/api/product_groups/`+category_id+`/`);
      setGroups(groupsRes.data || []);

      let productTranslations = dp.translations || {};

      if ((dp.name || dp.description) && (!productTranslations.en && !productTranslations.ar)) {
        productTranslations = {
          en: { name: dp.name || "", description: dp.description || "" },
          ar: { name: dp.name || "", description: dp.description || "" },
        };
      } else {
        if (productTranslations.en) {
          if (!productTranslations.en.name && dp.name) productTranslations.en.name = dp.name;
          if (!productTranslations.en.description && dp.description) productTranslations.en.description = dp.description;
        }
        if (productTranslations.ar) {
          if (!productTranslations.ar.name && dp.name) productTranslations.ar.name = dp.name;
          if (!productTranslations.ar.description && dp.description) productTranslations.ar.description = dp.description;
        }
      }

      setTranslations(productTranslations);
      setPrice(dp.base_price || "");
      setAvailability(dp.availibility);
      setStockQuantity(dp.stock_quantity || 0);
      setUnit(dp.unit || "M");
      setForEachAr(dp.for_each_ar || "");
      setForEachEn(dp.for_each_en || "");
      setSelectedGroups(dp.groups || []);
      setSelectedSubgroups(dp.subgroups || []);

      // switch to details tab
      setTabIndex(0);
    } catch (err) {
      setMessage({ type: "error", text: t("Error fetching product details") });
    }
    setLoading(false);
  };
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

  <Grid item xs={12} md={7}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{t("Product Details")}</Typography>
      <Button variant="contained" color="primary" onClick={handleEditProduct} startIcon={<EditIcon />} disabled={isEditMode}>
                  {t("Edit")}
                </Button>
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label={t("Details")} />
       
        {selected && <Tab label={t("Prices")} />}
        {selected && <Tab label={t("Contracts")} />}
      </Tabs>

      {tabIndex === 0 && (
        
        <Box sx={{bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : "#f5f6fa"}} >
          <Box>
                                {renderImageGallery()}
                                </Box>
                                <Box sx={{ my: 2 }}>
  <Typography variant="subtitle2" sx={{ mb: 1 }}>
    {t("Categories")}
  </Typography>

  <RadioGroup
  disabled={!isEditMode}
    value={selectedCategory?.id || ""}
    onChange={(e) => {
      const selectedId = parseInt(e.target.value, 10);
      setSelectedCategory({ id: selectedId });
      refreshGroups({ id: selectedId });
    }}
  >
    {categories.map((cat) => (
      <FormControlLabel
        key={cat.id}
        value={cat.id}
        control={<Radio disabled={!isEditMode}/>}
        label={cat.hierarchy.join(" > ")}
      />
    ))}
  </RadioGroup>
</Box>
          <TranslationFields translations={translations} setTranslations={setTranslations} isEditMode={isEditMode} />

          <TextField
            label={t("Part ID")}
            fullWidth
            value={selected ? selected.part_id : partId}
            onChange={(e) => setPartId(e.target.value)}
            disabled={!isEditMode || !!selected}
            sx={{ my: 1 }}
          />

          <TextField
            label={t("Stock Quantity")}
            type="number"
            fullWidth
            value={stockQuantity}
            onChange={(e) => isEditMode && setStockQuantity(parseInt(e.target.value || "0", 10))}
            disabled={!isEditMode}
            sx={{ my: 1 }}
          />

          <TextField
            label={t("Price")}
            type="number"
            fullWidth
            value={price}
            onChange={(e) => isEditMode && setPrice(e.target.value)}
            disabled={!isEditMode}
            sx={{ my: 1 }}
          />

          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>{t("Unit")}</InputLabel>
            <Select value={unit} label={t("Unit")} onChange={(e) => isEditMode && setUnit(e.target.value)} disabled={!isEditMode}>
              <MenuItem value="M">{t("Meter")}</MenuItem>
              <MenuItem value="Kg">{t("Kilogram")}</MenuItem>
              <MenuItem value="Each">{t("Each")}</MenuItem>
            </Select>
          </FormControl>

          {unit === "Each" && (
            <>
              <TextField
                label={t("For Each") + " (EN)"}
                fullWidth
                value={forEachEn}
                onChange={(e) => isEditMode && setForEachEn(e.target.value)}
                disabled={!isEditMode}
                sx={{ my: 1 }}
              />
              <TextField
                label={t("For Each") + " (AR)"}
                fullWidth
                value={forEachAr}
                onChange={(e) => isEditMode && setForEachAr(e.target.value)}
                disabled={!isEditMode}
                sx={{ my: 1 }}
              />
            </>
          )}

          <FormControl fullWidth sx={{ my: 1 }}>
            <InputLabel>{t("Availability")}</InputLabel>
            <Select value={availability} label={t("Availability")} onChange={(e) => isEditMode && setAvailability(e.target.value)} disabled={!isEditMode}>
              <MenuItem value="M">{t("Market")}</MenuItem>
              <MenuItem value="S">{t("Stock")}</MenuItem>
            </Select>
          </FormControl>
          <GroupSelector
            setGroups={setGroups}
            categoryId={selectedCategory?.id}
            groups={groups}
            selectedGroups={selectedGroups}
            onGroupSelect={(id) => {
              setSelectedGroups((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
            }}
            selectedSubgroups={selectedSubgroups}
            onSubgroupSelect={(subId, groupId) => {
              const otherGroupSubgroups = selectedSubgroups.filter((id) => {
                const belongsToOtherGroup = groups.some((g) => g.id !== groupId && g.subgroups?.some((s) => s.id === id));
                return belongsToOtherGroup;
              });
              setSelectedSubgroups([...otherGroupSubgroups, subId]);
            }}
            onSubgroupsUpdated={refreshGroupsForCurrentCategory}
            isEditMode={isEditMode}
          />

        </Box>
      )}

     

     

      {tabIndex === 1 && selected && (
        <Box>
          <ProductPrices
            product={selected}
            onPriceAdded={() => handleProductSelect(selected)}
            onPriceDeleted={() => handleProductSelect(selected)}
          />
        </Box>
      )}

      {tabIndex === 2 && selected && (
        <Box>
          <ProductContractPrices
            product={selected}
            onPriceAdded={() => handleProductSelect(selected)}
            onPriceDeleted={() => handleProductSelect(selected)}
          />
        </Box>
      )}

       <Box sx={{ mt: 2 }}>
         {isEditMode && (
           <Button variant="contained" onClick={()=>handleSave()} disabled={!translations.en && !translations.ar}>
             {selected ? t("Update") : t("Create")}
           </Button>
         )}
       </Box>
    </Paper>
  </Grid></Box>
  
);
 
}