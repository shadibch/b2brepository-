import React, { useEffect, useState, useRef } from "react";
import { Form, Button, Card, Tabs, Tab, Alert, Table, Pagination, Image } from "react-bootstrap";
import axiosInstance from "../axiosInstance";
import "./styles.css";
import "./shared.css";
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
  formatNumber,
  formatDate,
  formatLocal
} from "../../utils/translator";
import ReactPaginate from "react-paginate";

const GroupsTable = ({ groups, selectedGroups, onToggleGroup, currentPage, totalPages, onPageChange }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <div>
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>{t('Select')}</th>
            <th>{t('Group')}</th>
            <th style={{ width: "50px" }}></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.id}>
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => onToggleGroup(group.id)}
                  />
                </td>
                <td>{group.name}</td>
                <td>
                  {group.subgroups?.length > 0 && (
                    <button 
                      className="expand-button"
                      onClick={() => toggleExpand(group.id)}
                    >
                      {expandedGroups[group.id] ? "−" : "+"}
                    </button>
                  )}
                </td>
              </tr>
              {expandedGroups[group.id] && (
                <tr>
                  <td colSpan="3">
                    <div className="nested-table-container">
                      <table className="nested-table">
                        <thead>
                          <tr>
                            <th style={{ width: "50px" }}></th>
                            <th>{t('subgroup')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.subgroups?.map((subgroup) => (
                            <tr key={subgroup.id}>
                              <td></td>
                              <td>{subgroup.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="admin-pagination">
          <Pagination>
            <Pagination.First 
              onClick={() => onPageChange(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => onPageChange(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

const FileInput = ({ onChange }) => {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
    onChange(e);
  };

  return (
    <div className="custom-file-input">
      <Button 
        variant="outline-secondary" 
        onClick={() => fileInputRef.current.click()}
        className="file-select-button"
      >
        {fileName || t('Choose File')}
      </Button>
      <Form.Control
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        aria-label={t('Choose File')}
      />
    </div>
  );
};

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [formState, setFormState] = useState({
    en: { name: "" },
    ar: { name: "" }
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuTimer, setContextMenuTimer] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const languages = ["ar", "en"];
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      const res = await axiosInstance.get(`/api/admin/product-groups/?page=${currentPage}`);
      setGroups(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage({ type: "danger", text: t("Error fetching groups") });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchGroups();
  }, [currentPage]);

  useEffect(() => {
    if (selected) {
      const initialState = {
        en: { name: "" },
        ar: { name: "" }
      };
      
      if (selected.translations) {
        Object.entries(selected.translations).forEach(([lang, translation]) => {
          initialState[lang] = { name: translation.name || "" };
        });
      }
      
      setFormState(initialState);
      setSelectedGroups(selected.groups || []);
      setParentId(selected.parent || null);

      // Handle existing file
      if (selected.file) {
        setPreviewUrl(selected.file);
        setFile(null); // We don't have the actual file object, just the URL
      } else {
        setPreviewUrl(null);
        setFile(null);
      }
    }
  }, [selected]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    try {
      // Determine the name based on translations
      let name;
      if (formState.en.name && formState.ar.name) {
        name = formState.en.name;
      } else if (formState.en.name) {
        name = formState.en.name;
      } else if (formState.ar.name) {
        name = formState.ar.name;
      } else {
        setMessage({ type: "danger", text: t("Please provide at least one translation") });
        return;
      }

      // Transform translations into list format
      const translationsList = Object.entries(formState)
        .filter(([_, value]) => value.name)
        .map(([language, value]) => ({
          language,
          name: value.name
        }));

      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('id', selected?.id || '');
      formData.append('name', name);
      formData.append('translations', JSON.stringify(translationsList));
      formData.append('groups', JSON.stringify(selectedGroups));
      if (parentId) {
        formData.append('parent', parentId);
      }
      if (file) {
        formData.append('file', file);
      }

      await axiosInstance.post("/api/admin/categories_admin/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage({ type: "success", text: t("Category created successfully") });
      // Reset form after successful creation
      setFormState({
        en: { name: "" },
        ar: { name: "" }
      });
      setSelectedGroups([]);
      setSelected(null);
      setParentId(null);
      setFile(null);
      setPreviewUrl(null);

      await fetchCategories(); // Refresh the category tree
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ 
        type: "danger", 
        text: error.response?.data?.error || t("Error saving category") 
      });
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await axiosInstance.delete(`/api/categories/${categoryId}/`);
      setMessage({ type: "success", text: t("Category deleted successfully") });
      await fetchCategories();
      setSelected(null);
      setContextMenu(null);
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ 
        type: "danger", 
        text: error.response?.data?.error || t("Error deleting category") 
      });
    }
  };

  useEffect(() => {
    // Handle click outside context menu
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const handleContextMenu = (e, cat) => {
    e.preventDefault();
    
    // Clear any existing timer
    if (contextMenuTimer) {
      clearTimeout(contextMenuTimer);
    }
    
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      category: cat
    });

    // Set new timer to close menu after 3 seconds
    const timer = setTimeout(() => {
      setContextMenu(null);
    }, 3000);
    
    setContextMenuTimer(timer);
  };

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (contextMenuTimer) {
        clearTimeout(contextMenuTimer);
      }
    };
  }, [contextMenuTimer]);

  const handleCreateCategory = () => {
    const parent = contextMenu?.category?.id ?? null;
    setParentId(parent);
    
    const emptyTranslations = {
      en: { name: "" },
      ar: { name: "" }
    };

    setFormState(emptyTranslations);
    setSelected({"translations": emptyTranslations, "groups": [], "parent": parent});
    setSelectedGroups([]);
    setContextMenu(null);
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectItem = async (cat) => {
    const res = await axiosInstance.get(`api/admin/category/${cat.id}`);
    setSelected(res.data);
  };

  const renderTree = (cats, depth = 0) => {
    return cats.map((cat) => {
      const buttonWidth = 2.5; // assumed button width in rem
      const hasChildren = cat.children?.length > 0;
      const de = depth * 0.5 + (!hasChildren ? buttonWidth : 0);

      return (
        <div key={cat.id} className={`${isRTL() ? "rtl-tree" : "ltr-tree"}`}>
          <div className="tree-node">
            <span
              onClick={() => selectItem(cat)}
              onContextMenu={(e) => handleContextMenu(e, cat)}
              style={{
                cursor: "pointer",
                fontWeight: selected?.id === cat.id ? "bold" : "normal",
                marginRight: isRTL() ? `${de}rem` : "0",
                marginLeft: isRTL() ? "0" : `${de}rem`
              }}
            >
              📁 {cat.label}
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
                {expanded[cat.id] ? "▾" : "▸"}
              </Button>
            )}
          </div>

          {expanded[cat.id] && hasChildren && (
            <div className="tree-children">
              {renderTree(cat.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="admin-container" dir={isRTL() ? "rtl" : "ltr"}>
      {message && (
        <Alert 
          variant={message.type} 
          onClose={() => setMessage(null)} 
          dismissible
          className="mb-3"
        >
          {message.text}
        </Alert>
      )}
      
      <div className="d-flex gap-4">
        <div className="tree-container" style={{ width: "30%" }}>
          <Card className="admin-card">
            <div className="admin-form">
              <h2 className="admin-form-title">{t("categories")}</h2>
              {renderTree(categories)}
            </div>
          </Card>
        </div>

        {selected && (
          <div style={{ flex: 1 }}>
            <Card className="admin-card">
              <div className="admin-form">
                <Tabs defaultActiveKey="ar" id="category-tabs" className="admin-tabs">
                  {languages.map((lang) => (
                    <Tab eventKey={lang} title={t(lang)} key={lang}>
                      <div className="form-group">
                        <Form.Control
                          value={formState[lang]?.name || ""}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              [lang]: { ...prev[lang], name: e.target.value }
                            }))
                          }
                          placeholder={t("Category Name")}
                        />
                      </div>
                    </Tab>
                  ))}
                </Tabs>

                <div className="mt-4">
                  <h4 className="admin-form-title">{t('Category Image')}</h4>
                  <div className="file-upload-container">
                    <FileInput onChange={handleFileChange} />
                    {previewUrl && (
                      <div className="preview-container mb-3">
                        <img
                          src={previewUrl}
                          alt={t('Preview')}
                          className="preview-image"
                        />
                        <button
                          className="remove-image-btn"
                          onClick={handleRemoveFile}
                          aria-label={t('Remove Image')}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="admin-form-title">{t('Product Groups')}</h4>
                  <GroupsTable
                    groups={groups}
                    selectedGroups={selectedGroups}
                    onToggleGroup={handleGroupToggle}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>

                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                  >
                    {selected.id ? t("Update") : t("Create")}
                  </Button>
                  {selected.id && (
                    <Button
                      variant="danger"
                      className="ms-2"
                      onClick={() => handleDelete(selected.id)}
                    >
                      {t("Delete")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {contextMenu && (
          <div
            className="context-menu"
            style={{
              position: "absolute",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "0.5rem",
              zIndex: 9999
            }}
          >
            <div
              className="context-menu-item"
              onClick={() => {
                handleCreateCategory();
                if (contextMenuTimer) {
                  clearTimeout(contextMenuTimer);
                }
              }}
              style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              ➕ {t("Create new category")}
            </div>
            {contextMenu.category.id && (
              <div
                className="context-menu-item"
                onClick={() => {
                  handleDelete(contextMenu.category.id);
                  if (contextMenuTimer) {
                    clearTimeout(contextMenuTimer);
                  }
                }}
                style={{ padding: "0.5rem 1rem", cursor: "pointer", color: "#dc3545" }}
              >
                🗑️ {t("Delete selected category")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
