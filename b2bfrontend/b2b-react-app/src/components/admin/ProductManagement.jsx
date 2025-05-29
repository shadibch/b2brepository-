import React, { useEffect, useState, useRef } from "react";
import { Form, Button, Card, Tabs, Tab, Alert, Table, Pagination, Modal, InputGroup } from "react-bootstrap";
import axiosInstance from "../axiosInstance";
import {API_BASE_URL,DEFAULT_IMAGE} from '../../utils/settings';
import "./styles.css";
import "./shared.css";
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
  formatNumber,
} from "../../utils/translator";
import AsyncSelect from 'react-select/async';

const RichTextEditor = ({ value, onChange, dir, placeholder }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fonts = [
    { name: 'Default', value: '' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' }
  ];

  const handleBold = () => {
    document.execCommand('bold', false, null);
  };

  const handleItalic = () => {
    document.execCommand('italic', false, null);
  };

  const handleUnderline = () => {
    document.execCommand('underline', false, null);
  };

  const handleList = () => {
    document.execCommand('insertUnorderedList', false, null);
  };

  const handleOrderedList = () => {
    document.execCommand('insertOrderedList', false, null);
  };

  const handleHeader = (level) => {
    document.execCommand('formatBlock', false, `h${level}`);
  };

  const handleColor = (color) => {
    document.execCommand('foreColor', false, color);
    setShowColorPicker(false);
  };

  const handleFont = (fontFamily) => {
    document.execCommand('fontName', false, fontFamily);
  };

  const handleContentChange = (e) => {
    onChange(e.target.innerHTML);
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FF00FF', '#00FFFF', '#FFFF00', '#808080'
  ];

  return (
    <div className="rich-text-container">
      <div className="rich-text-toolbar">
        <div className="toolbar-group">
          <select 
            onChange={(e) => handleFont(e.target.value)}
            className="toolbar-select font-select"
            title={t('Font Family')}
          >
            {fonts.map(font => (
              <option 
                key={font.value} 
                value={font.value}
                style={{ fontFamily: font.value || 'inherit' }}
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <select 
            onChange={(e) => handleHeader(e.target.value)}
            className="toolbar-select"
            title={t('Header Style')}
          >
            <option value="">{t('Normal')}</option>
            <option value="1">{t('Header')} 1</option>
            <option value="2">{t('Header')} 2</option>
            <option value="3">{t('Header')} 3</option>
            <option value="4">{t('Header')} 4</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={handleBold} className="toolbar-button" title={t('Bold')}>
            <strong>B</strong>
          </button>
          <button type="button" onClick={handleItalic} className="toolbar-button" title={t('Italic')}>
            <em>I</em>
          </button>
          <button type="button" onClick={handleUnderline} className="toolbar-button" title={t('Underline')}>
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={handleList} className="toolbar-button" title={t('Bullet List')}>
            • List
          </button>
          <button type="button" onClick={handleOrderedList} className="toolbar-button" title={t('Numbered List')}>
            1. List
          </button>
        </div>

        <div className="toolbar-group color-picker-container">
          <button 
            type="button" 
            className="toolbar-button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title={t('Text Color')}
          >
            Color
          </button>
          {showColorPicker && (
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColor(color)}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="rich-text-editor"
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        dir={dir}
        data-placeholder={placeholder}
        style={{ minHeight: '150px' }}
      />
    </div>
  );
};

const TranslationFields = ({ translations, setTranslations }) => {
  return (
    <div>
      {["en", "ar"].map((lang) => (
        <div key={lang} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>{t('Product Name')} ({lang.toUpperCase()})</Form.Label>
            <Form.Control
              value={translations[lang]?.name || ""}
              onChange={(e) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], name: e.target.value }
                }))
              }
              placeholder={t('Product Name')}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t('Description')} ({lang.toUpperCase()})</Form.Label>
            <RichTextEditor
              value={translations[lang]?.description || ""}
              onChange={(content) =>
                setTranslations((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], description: content }
                }))
              }
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              placeholder={t('Product Description')}
            />
          </Form.Group>
        </div>
      ))}
    </div>
  );
};

const CategoryTree = ({ categories, 
  selectedCategory, onSelect, 
  expandedCategories, setExpandedCategories}) => {
  

  const toggleExpand = (id) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };
  

  const renderCategories = (cats, depth = 0) => {
    return cats.map((cat) => {
      const buttonWidth = 2.5;
      const hasChildren = cat.children?.length > 0;
      const de = depth * 0.5 + (!hasChildren ? buttonWidth : 0);
      const isExpanded = expandedCategories.has(cat.id);

      return (
        <div key={cat.id} className={`${isRTL() ? "rtl-tree" : "ltr-tree"}`}>
          <div className="tree-node">
            <span
              onClick={() => onSelect({
                id: cat.id,
                label: cat.label || cat.name
              })}
              style={{
                cursor: "pointer",
                fontWeight: selectedCategory?.id === cat.id ? "bold" : "normal",
                marginRight: isRTL() ? `${de}rem` : "0",
                marginLeft: isRTL() ? "0" : `${de}rem`
              }}
            >
              📁 {cat.label || cat.name}
            </span>

            {hasChildren && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => toggleExpand(cat.id)}
                style={{
                  order: isRTL() ? -1 : 1
                }}
              >
                {isExpanded ? "▾" : "▸"}
              </Button>
            )}
          </div>

          {isExpanded && hasChildren && (
            <div className="tree-children">
              {renderCategories(cat.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="category-tree">
      {renderCategories(categories)}
    </div>
  );
};

const GroupSelector = ({ groups, selectedGroups, onGroupSelect, selectedSubgroups, onSubgroupSelect }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <div className="groups-selector">
      {groups.map((group) => (
        <div key={group.id} className="group-item">
          <div className="d-flex align-items-center mb-2">
            <span className="group-name">{group.name}</span>
            {group.subgroups?.length > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => toggleExpand(group.id)}
                className="ms-2"
              >
                {expandedGroups[group.id] ? '−' : '+'}
              </Button>
            )}
          </div>
          {expandedGroups[group.id] && group.subgroups?.length > 0 && (
            <div className="subgroups-container ms-4">
              {group.subgroups.map((subgroup) => (
                <Form.Check
                  key={subgroup.id}
                  type="radio"
                  name={`group-${group.id}`}
                  label={subgroup.name}
                  checked={selectedSubgroups.includes(subgroup.id)}
                  onChange={() => onSubgroupSelect(subgroup.id, group.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProductPrices = ({ product, onPriceAdded, onPriceDeleted }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPercentage, setIsPercentage] = useState(true);
  const [discountValue, setDiscountValue] = useState('');
  const [prices, setPrices] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);
  const [message, setMessage] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  useEffect(() => {
    if (product?.id) {
      loadPrices();
    }
  }, [product]);

  const loadPrices = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/products/${product.id}/prices/`);
      setPrices(response.data);
    } catch (error) {
      setMessage({ type: 'danger', text: t('Error loading prices') });
    }
  };

  const loadCompanyOptions = async (inputValue) => {
    try {
      const response = await axiosInstance.get(`/filter-companies/?q=${inputValue}`);
      return response.data.map(company => ({
        value: company.id,
        label: `${company.name} (${company.register_number})`
      }));
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  };

  const handleAddPrice = async () => {
    try {
      if (!selectedCompany) {
        setMessage({ type: 'danger', text: t('Please select a company') });
        return;
      }

      if (!discountValue) {
        setMessage({ type: 'danger', text: t('Please enter a discount value') });
        return;
      }

      const response = await axiosInstance.post(`/api/admin/products/${product.id}/add_price/`, {
        purchaser: selectedCompany.value,
        is_percentage: isPercentage,
        discount_value: parseFloat(discountValue)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await loadPrices();
      setMessage({ type: 'success', text: editingPrice ? t('Price updated successfully') : t('Price added successfully') });
      resetForm();

      if (onPriceAdded) {
        onPriceAdded(response.data);
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || t('Error adding price') 
      });
    }
  };

  const handleDeleteClick = (price) => {
    setPriceToDelete(price);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/admin/products/${product.id}/delete_price/?price_id=${priceToDelete.id}`);
      await loadPrices();
      setMessage({ type: 'success', text: t('Price deleted successfully') });
      
      if (onPriceDeleted) {
        onPriceDeleted(priceToDelete.id);
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || t('Error deleting price') 
      });
    } finally {
      setShowDeleteModal(false);
      setPriceToDelete(null);
    }
  };

  const handleEditClick = (price) => {
    setEditingPrice(price);
    setSelectedCompany({
      value: price.purchaser,
      label: price.company_name
    });
    setIsPercentage(price.percentage_discount !== null);
    setDiscountValue(price.percentage_discount !== null ? price.percentage_discount : price.flat_discount);
  };

  const resetForm = () => {
    setSelectedCompany(null);
    setIsPercentage(true);
    setDiscountValue('');
    setEditingPrice(null);
  };

  return (
    <div>
      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage(null)} 
          dismissible
        >
          {message.text}
        </Alert>
      )}

      <Form className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>{t('Company')}</Form.Label>
          <AsyncSelect
            cacheOptions
            defaultOptions
            value={selectedCompany}
            onChange={setSelectedCompany}
            loadOptions={loadCompanyOptions}
            placeholder={t('Search for a company...')}
            isClearable
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label={t('Percentage Discount')}
            checked={isPercentage}
            onChange={(e) => setIsPercentage(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            {isPercentage ? t('Percentage Discount') : t('Flat Discount')}
          </Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={isPercentage ? t('Enter percentage') : t('Enter amount')}
            />
            {isPercentage && <InputGroup.Text>%</InputGroup.Text>}
          </InputGroup>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddPrice}>
            {editingPrice ? t('Update Price') : t('Add Price')}
          </Button>
          {editingPrice && (
            <Button variant="secondary" onClick={resetForm}>
              {t('Cancel')}
            </Button>
          )}
        </div>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('Company')}</th>
            <th>{t('Discount Type')}</th>
            <th>{t('Discount Value')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price) => (
            <tr key={price.id}>
              <td>{price.company_name}</td>
              <td>
                {price.percentage_discount !== null ? t('Percentage') : t('Flat')}
              </td>
              <td>
                {price.percentage_discount !== null 
                  ? `${price.percentage_discount}%`
                  : formatNumber(price.flat_discount)}
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEditClick(price)}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(price)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('Confirm Delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('Are you sure you want to delete this price?')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            {t('Delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [translations, setTranslations] = useState({
    en: { name: "", description: "" },
    ar: { name: "", description: "" }
  });
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef(null);
  const addImageInputRef = useRef(null);
  const [partId, setPartId] = useState('');
  const [tempImages, setTempImages] = useState([]);
  const [tempPreviewUrls, setTempPreviewUrls] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (selectedCategory?.id) {
        fetchProductsByCategory(selectedCategory.id);
      } else {
        fetchProducts();
      }
    }
    fetchCategories();
    fetchGroups();
  }, [currentPage, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(`/api/products/?page=${currentPage}`);
      setProducts(res.data.results);
      setTotalPages(Math.ceil(res.data.count / res.data.page_size));
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage({ type: "danger", text: t("Error fetching products") });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/categories/");
      const dataWithRoot = [
        { id: null, label: t("Root"), children: res.data }
      ];
      setCategories(dataWithRoot);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({ type: "danger", text: t("Error fetching categories") });
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/product-groups/");
      setGroups(res.data.results);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage({ type: "danger", text: t("Error fetching groups") });
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const res = await axiosInstance.get(`/api/products/category/${categoryId}`);
      setProducts(res.data.results);
      setTotalPages(Math.ceil(res.data.count / res.data.page_size));
      
      // Fetch product groups for this category
      const groupsRes = await axiosInstance.get(`/api/product_groups/${categoryId}/`);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error("Error fetching category products:", error);
      setMessage({ type: "danger", text: t("Error fetching category products") });
    }
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.trim()) {
        const res = await axiosInstance.get(`/api/search_text?q=${searchQuery}`);
        setProducts(res.data.results || []);
        setTotalPages(Math.ceil((res.data.count || 0) / 10));
        setCurrentPage(1);
      } else {
        fetchProducts(); // If search query is empty, fetch all products
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setMessage({ type: "danger", text: t("Error searching products") });
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (selected?.id) {
        // If product exists, update image on server
        try {
          const formData = new FormData();
          formData.append('images', files[0]);
          
          await axiosInstance.post(`/api/admin/products/${selected.id}/update_media/?index=${selectedImageIndex}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const response = await axiosInstance.get(`/api/admin/product-detail/${selected.id}/`);
          setSelected(response.data);
        } catch (error) {
          console.error("Error updating product images:", error);
          setMessage({
            type: "danger",
            text: t("Error updating product images")
          });
        }
      } else {
        // If product doesn't exist yet, store image temporarily
        const file = files[0];
        const newTempImages = [...tempImages];
        const newTempPreviewUrls = [...tempPreviewUrls];

        // Replace image at selected index or add new one
        if (selectedImageIndex < newTempImages.length) {
          newTempImages[selectedImageIndex] = file;
          newTempPreviewUrls[selectedImageIndex] = URL.createObjectURL(file);
        } else {
          newTempImages.push(file);
          newTempPreviewUrls.push(URL.createObjectURL(file));
        }

        setTempImages(newTempImages);
        setTempPreviewUrls(newTempPreviewUrls);
      }
    }
  };

  const handleMainImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteMainImage = async () => {
    if (selected?.id) {
      // If product exists, delete from server
      if (!selected?.media_list?.length) return;

      try {
        await axiosInstance.delete(`/api/admin/products/${selected.id}/delete_media/?index=${selectedImageIndex}`);
        const response = await axiosInstance.get(`/api/admin/product-detail/${selected.id}/`);
        setSelected(response.data);
        
        if (selectedImageIndex >= response.data.media_list.length) {
          setSelectedImageIndex(Math.max(0, response.data.media_list.length - 1));
        }
      } catch (error) {
        console.error("Error deleting product image:", error);
        setMessage({
          type: "danger",
          text: t("Error deleting product image")
        });
      }
    } else {
      // If product doesn't exist yet, remove from temporary storage
      const newTempImages = [...tempImages];
      const newTempPreviewUrls = [...tempPreviewUrls];
      
      newTempImages.splice(selectedImageIndex, 1);
      newTempPreviewUrls.splice(selectedImageIndex, 1);
      
      setTempImages(newTempImages);
      setTempPreviewUrls(newTempPreviewUrls);
      
      if (selectedImageIndex >= newTempImages.length) {
        setSelectedImageIndex(Math.max(0, newTempImages.length - 1));
      }
    }
  };

  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (selected?.id) {
        // If product exists, add to server
        try {
          const formData = new FormData();
          formData.append('images', files[0]);
          
          await axiosInstance.post(`/api/admin/products/${selected.id}/add_media/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const response = await axiosInstance.get(`/api/admin/product-detail/${selected.id}/`);
          setSelected(response.data);
          setSelectedImageIndex(response.data.media_list.length - 1);
        } catch (error) {
          console.error("Error adding product image:", error);
          setMessage({
            type: "danger",
            text: t("Error adding product image")
          });
        }
      } else {
        // If product doesn't exist yet, add to temporary storage
        const file = files[0];
        setTempImages([...tempImages, file]);
        setTempPreviewUrls([...tempPreviewUrls, URL.createObjectURL(file)]);
        setSelectedImageIndex(tempImages.length);
      }
    }
  };

  const renderImageSection = () => {
    const mediaList = selected?.id ? (selected?.media_list || []) : tempPreviewUrls;

    return (
      <Form.Group className="mb-3">
        <Form.Label>{t('Images')}</Form.Label>
        <div className="image-gallery-container">
          <div className="thumbnails-container">
            {mediaList.map((url, index) => (
              <div 
                key={index} 
                className={`thumbnail-wrapper ${index === selectedImageIndex ? 'selected' : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={selected?.id ? `${API_BASE_URL}${url}` : url}
                  alt={t('Preview')}
                  className="thumbnail-image"
                />
              </div>
            ))}
          </div>
          
          <div className="main-image-container">
            {mediaList.length > 0 ? (
              <>
                <div 
                  className="main-image-wrapper"
                  onClick={handleMainImageClick}
                >
                  <img
                    src={selected?.id ? `${API_BASE_URL}${mediaList[selectedImageIndex]}` : mediaList[selectedImageIndex]}
                    alt={t('Preview')}
                    className="main-image"
                  />
                  <div className="image-overlay">
                    <span>{t('Click to replace')}</span>
                  </div>
                </div>
                <div className="image-actions">
                  <Button 
                    variant="danger" 
                    size="sm"
                    className="delete-image-btn"
                    onClick={handleDeleteMainImage}
                  >
                    <i className="fas fa-trash"></i> {t('Delete')}
                  </Button>
                  <Button 
                    variant="success" 
                    size="sm"
                    className="add-image-btn"
                    onClick={() => addImageInputRef.current?.click()}
                  >
                    <i className="fas fa-plus"></i> {t('Add Image')}
                  </Button>
                </div>
              </>
            ) : (
              <div 
                className="main-image-wrapper empty"
                onClick={handleMainImageClick}
              >
                <div className="upload-placeholder">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>{t('Click to upload image')}</span>
                </div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/*"
            onChange={handleImageChange}
          />
          <input
            type="file"
            ref={addImageInputRef}
            className="d-none"
            accept="image/*"
            onChange={handleAddImage}
          />
        </div>
      </Form.Group>
    );
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubgroupSelect = (subgroupId, groupId) => {
    // First, remove any previously selected subgroups from the same group
    const otherGroupSubgroups = selectedSubgroups.filter(id => {
      // Find the group this subgroup belongs to
      const belongsToOtherGroup = groups.some(g => 
        g.id !== groupId && g.subgroups.some(s => s.id === id)
      );
      return belongsToOtherGroup;
    });
    
    // Add the newly selected subgroup
    setSelectedSubgroups([...otherGroupSubgroups, subgroupId]);
  };

  const clearForm = () => {
    setSelected(null);
    setSelectedCategory(null);
    setSelectedGroups([]);
    setSelectedSubgroups([]);
    setTranslations({
      en: { name: "", description: "" },
      ar: { name: "", description: "" }
    });
    setPrice("");
    setImages([]);
    setPreviewUrls([]);
    setPartId('');
    setTempImages([]);
    setTempPreviewUrls([]);
    setSelectedImageIndex(0);
  };

  const handleSave = async () => {
    try {
        // Parse JSON data from form fields
        const formData = new FormData();
        
        // Get the first filled translated name to be the name of the product
        const translationsArray = Object.entries(translations)
          .filter(([_, value]) => value.name || value.description)
          .map(([language, value]) => ({
            language,
            name: value.name,
            description: value.description
          }));

        // Find the first filled name to use as the product name
        const firstFilledName = translationsArray.find(trans => trans.name)?.name || '';
        
        formData.append('translations', JSON.stringify(translationsArray));

        // Add other fields
        if (selected?.id) {
          formData.append('id', selected.id);
        } else if (partId) {
          formData.append('part_id', partId);
        }

        // Properly handle category ID
        if (selectedCategory?.id) {
          formData.append('closest_category', selectedCategory.id);
        } else {
          return setMessage({ 
            type: "danger", 
            text: t("Please select a category") 
          });
        }

        formData.append('base_price', price);
        formData.append('subgroups', JSON.stringify(selectedSubgroups));
        formData.append('name', firstFilledName);

        // Add temporary images if creating new product
        if (!selected?.id) {
          tempImages.forEach(image => {
            formData.append('images', image);
          });
        }

        const url = selected?.id 
          ? `/api/admin/products/${selected.id}/`
          : '/api/admin/products/';
        
        const method = selected?.id ? 'put' : 'post';

        const response = await axiosInstance[method](url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setMessage({ 
          type: "success", 
          text: t(selected?.id ? "Product updated successfully" : "Product created successfully") 
        });

        // Reset form and refresh products
        clearForm();
        await fetchProducts();

    } catch (error) {
      console.error("Save error:", error);
      setMessage({ 
        type: "danger", 
        text: error.response?.data?.error || t("Error saving product") 
      });
    }
  };

  const handleDelete = async (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/admin/products/${productToDelete}/`);
      setMessage({ type: "success", text: t("Product deleted successfully") });
      await fetchProducts();
      clearForm();
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ 
        type: "danger", 
        text: error.response?.data?.error || t("Error deleting product") 
      });
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const getProductImage = (product) => {
    if (product.media_list && product.media_list.length > 0) {
      return `${API_BASE_URL}${product.media_list[0]}`;
    }
    return  `${DEFAULT_IMAGE}`; // Default image path
  };

  const findCategoryNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      return null;
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
    
    if (category?.id) {
      await fetchProductsByCategory(category.id);
    } else {
      await fetchProducts();
      await fetchGroups();
    }
  };


  const handleProductSelect = async (product) => {
    try {
      // Get detailed product information
      const response = await axiosInstance.get(`/api/admin/product-detail/${product.id}/`);
      const detailedProduct = response.data;
      console.log(detailedProduct);

      // Set selected product
      setSelected(detailedProduct);

      // Handle translations
      let productTranslations = detailedProduct.translations || {};
      
      // If there's a name or description but no translations, create translations with the existing values
      if ((detailedProduct.name || detailedProduct.description) && 
          (!productTranslations.en && !productTranslations.ar)) {
        productTranslations = {
          en: { 
            name: detailedProduct.name || '', 
            description: detailedProduct.description || '' 
          },
          ar: { 
            name: detailedProduct.name || '', 
            description: detailedProduct.description || '' 
          }
        };
      } else {
        // If translations exist but some fields are missing, ensure they have the base values
        if (productTranslations.en) {
          if (!productTranslations.en.name && detailedProduct.name) {
            productTranslations.en.name = detailedProduct.name;
          }
          if (!productTranslations.en.description && detailedProduct.description) {
            productTranslations.en.description = detailedProduct.description;
          }
        }
        if (productTranslations.ar) {
          if (!productTranslations.ar.name && detailedProduct.name) {
            productTranslations.ar.name = detailedProduct.name;
          }
          if (!productTranslations.ar.description && detailedProduct.description) {
            productTranslations.ar.description = detailedProduct.description;
          }
        }
      }
      
      setTranslations(productTranslations);

      // Set price
      setPrice(detailedProduct.base_price || '');

      // Set groups and subgroups
      setSelectedGroups(detailedProduct.groups);
      setSelectedSubgroups(detailedProduct.subgroups);

      // Handle category tree expansion
      if (detailedProduct.category_hierarchy && detailedProduct.category_hierarchy.length > 0) {
        // For each category in the hierarchy
        for (const category of detailedProduct.category_hierarchy) {
          const categoryIds = new Set(detailedProduct.category_hierarchy.map(cat => cat.id));
          categoryIds.add(null);
          setExpandedCategories(categoryIds);
        }

        // Set the final category as selected
        const finalCategory = detailedProduct.category_hierarchy[detailedProduct.category_hierarchy.length - 1];
        setSelectedCategory({ 
          id: finalCategory.id, 
          label: finalCategory.name 
        });
      }

      // Switch to details tab
      document.querySelector('button[data-rb-event-key="details"]')?.click();

    } catch (error) {
      console.error("Error fetching product details:", error);
      setMessage({
        type: "danger",
        text: t("Error fetching product details")
      });
    }
  };

  return (
    <div className="admin-container" dir={isRTL() ? "rtl" : "ltr"}>
      <div className="row">
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <CategoryTree
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
              />
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-9">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center" style={{ width: "60%" }}>
                  <Form.Control
                    type="text"
                    placeholder={`${t('search')}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    
                    className="me-2"
                  />
                  <Button variant="primary" onClick={handleSearch}>
                    {t("search")}
                  </Button>
                </div>
                <Button variant="success" onClick={clearForm}>
                  {t("New Product")}
                </Button>
              </div>
              {message && (
                <Alert 
                  variant={message.type}
                  onClose={() => setMessage(null)}
                  dismissible
                >
                  {message.text}
                </Alert>
              )}

              <div className="d-flex gap-4">
                {/* Products List */}
                <Card className="admin-card" style={{ width: "40%" }}>
                  <div className="admin-form">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h2 className="admin-form-title mb-0">{t('Products')}</h2>
                      <Button 
                        variant="outline-primary" 
                        onClick={clearForm}
                      >
                        {t('New Product')}
                      </Button>
                    </div>
                    <div className="table-responsive">
                      <Table className="admin-table">
                        <thead>
                          <tr>
                            <th>{t('Image')}</th>
                            <th>{t('Product Name')}</th>
                            <th>{t('Part ID')}</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr 
                              key={product.id}
                              onClick={() => handleProductSelect(product)}
                              className={selected?.id === product.id ? 'selected' : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td style={{ width: '80px' }}>
                                <img
                                  src={getProductImage(product)}
                                  alt={product.name}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                  }}
                                />
                              </td>
                              <td>{product.name}</td>
                              <td>{product.part_id}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(product.id);
                                  }}
                                >
                                  ×
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                          <Pagination.First 
                            onClick={() => setCurrentPage(1)} 
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                          />
                          {[...Array(totalPages)].map((_, idx) => (
                            <Pagination.Item
                              key={idx + 1}
                              active={idx + 1 === currentPage}
                              onClick={() => setCurrentPage(idx + 1)}
                            >
                              {idx + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last 
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Product Form */}
                <Card className="admin-card" style={{ flex: 1 }}>
                  <div className="admin-form">
                    <h2 className="admin-form-title">{t('Product Details')}</h2>

                    <Tabs defaultActiveKey="details" className="mb-3">
                      <Tab eventKey="details" title={t('Details')}>
                        <TranslationFields 
                          translations={translations}
                          setTranslations={setTranslations}
                        />

                        <Form.Group className="mb-3">
                          <Form.Label>{t('Part ID')}</Form.Label>
                          <Form.Control
                            type="text"
                            value={selected ? selected.part_id : (partId || '')}
                            onChange={(e) => !selected && setPartId(e.target.value)}
                            disabled={!!selected}
                            placeholder={t('Enter Part ID')}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('Price')}</Form.Label>
                          <Form.Control
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={t('Enter price')}
                          />
                        </Form.Group>

                        {renderImageSection()}
                      </Tab>

                      
                      <Tab eventKey="groups" title={t('Groups')}>
                        <GroupSelector
                          groups={groups}
                          selectedGroups={selectedGroups}
                          onGroupSelect={handleGroupToggle}
                          selectedSubgroups={selectedSubgroups}
                          onSubgroupSelect={handleSubgroupSelect}
                        />
                      </Tab>

                      {selected && (
                        <Tab eventKey="prices" title={t('Prices')}>
                          <ProductPrices 
                            product={selected} 
                            onPriceAdded={() => {
                              // Refresh product details if needed
                              if (selected) {
                                handleProductSelect(selected);
                              }
                            }}
                            onPriceDeleted={() => {
                              // Refresh product details if needed
                              if (selected) {
                                handleProductSelect(selected);
                              }
                            }}
                          />
                        </Tab>
                      )}
                    </Tabs>

                    <div className="mt-4">
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={!translations.en && !translations.ar}
                      >
                        {selected ? t('Update') : t('Create')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('Confirm Delete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('Are you sure you want to delete this product?')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('Cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('Delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
} 