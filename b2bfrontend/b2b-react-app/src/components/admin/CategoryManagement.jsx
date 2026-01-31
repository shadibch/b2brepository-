import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../axiosInstance";
import {
  Box,
  Card,
  Tabs,
  Tab,
  Alert as MuiAlert,
  Snackbar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Button,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Paper,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import { ExpandMore, ChevronRight, MoreVert } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import {
  t,
  isRTL,
} from "../../utils/translator";



const ThemedTablePagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isRTL,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page - 1}
        onPageChange={(e, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) =>
          onRowsPerPageChange(parseInt(e.target.value, 10))
        }
        sx={{
          "& .MuiTablePagination-toolbar": {
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fafafa",
            color: theme.palette.text.primary,
            fontSize: theme.typography.body2.fontSize,
            px: 2,
            borderRadius: 1,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontWeight: 500,
              color: theme.palette.text.secondary,
            },
          "& .MuiTablePagination-actions": {
            color: theme.palette.primary.main,
          },
          "& .MuiTablePagination-select": {
            borderRadius: "8px",
            border: `1px solid ${theme.palette.divider}`,
            padding: "2px 8px",
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.background.default
                : "#fff",
          },
        }}
      />
    </Box>
  );
};

// Simple FileInput component using MUI
const FileInput = ({ onChange, fileName, onRemove }) => {
  const fileRef = useRef(null);
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
      <Button variant="outlined" onClick={() => fileRef.current.click()}>
        {fileName || t("Choose File")}
      </Button>
      {fileName && (
        <Button color="error" onClick={onRemove}>
          {t('Remove')}
        </Button>
      )}
    </Box>
  );
};

const GroupsTable = ({ groups, selectedGroups, onToggleGroup, page, rowsPerPage, onChangePage,
   onChangeRowsPerPage ,totalCount = 0}) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleExpand = (groupId) => setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  const align = isRTL() ? 'right' : 'left';

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align={align}>{t('Select')}</TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }} align={align}>{t('Group')}</TableCell>
              <TableCell  sx={{ color: "white", fontWeight: 600 }} align={align}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group,index) => (
              <React.Fragment key={group.id}>
                <TableRow  sx={{
                    cursor: "pointer",
                    backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                  }} hover>
                  <TableCell align={align} width={60}>
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => onToggleGroup(group.id)}
                    />
                  </TableCell>
                  <TableCell    align={align}>{group.name}</TableCell>
                  <TableCell align={align} width={80}>
                    {group.subgroups?.length > 0 && (
                      <Button size="small" onClick={() => toggleExpand(group.id)}>
                        {expandedGroups[group.id] ? '−' : '+'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedGroups[group.id] && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Table size="small">
                        <TableBody>
                          {group.subgroups?.map((sg,index) => (
                            <TableRow    sx={{
                              cursor: "pointer",
                              backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                            }} key={sg.id}>
                              <TableCell align={align} />
                              <TableCell align={align}>{sg.name}</TableCell>
                              <TableCell />
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ThemedTablePagination
       
        count={totalCount}
        page={page - 1}
        onPageChange={(e, newPage) => onChangePage(newPage + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default function CategoryManager() {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [selected, setSelected] = useState(null);
  const [update,setUpdate] = useState(true);
  const [formState, setFormState] = useState({ en: { name: '' }, ar: { name: '' } });
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [message, setMessage] = useState(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  // pagination for groups
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // file handling
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // context menu for tree
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuNode, setMenuNode] = useState(null);

  const align = isRTL() ? 'right' : 'left';

  useEffect(() => {
    fetchCategories();
    fetchGroups();
  }, [currentPage]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await axiosInstance.get('/api/admin/categories/');
      // format to RichTreeView items
      const formatted = [{ id: 'root', label: t('Root'), children: formatTree(res.data), level: 0 }];
      setCategories(formatted);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: t('Error fetching categories') });
    } finally {
      setLoadingCategories(false);
    }
  };

  const formatTree = (nodes) => (
    nodes.map(n => ({ id: String(n.id || `node-${Math.random()}`), 
    label: n.label || n.name || n.title || '',
    level: n.level || 0,
    children: n.children ? formatTree(n.children) : [] }))
  );

  const fetchGroups = async () => {
    try {
    
      const res = await axiosInstance.get(`/api/admin/product-groups/?page=${currentPage}`);
      console.log(res.data.results);
      setGroups(res.data.results || []);

      setTotalPages(Math.ceil(res.data.count / rowsPerPage) || 1);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: t('Error fetching groups') });
    }
  };

  const handleTreeSelect = async (event, itemId) => {
    // find item by id from raw categories tree
    // Raw categories are in categories[0].children
    setUpdate(true);
    const node = findNodeById(categories, itemId);
    if (!node) return;
    // if id is 'root', clear selected
    if (node.id === 'root') {
      setSelected(null);
      setFormState({ en: { name: '' }, ar: { name: '' } });
      setSelectedGroups([]);
      setPreviewUrl(null);
      setFile(null);

      return;
    }

    // try to parse original id back to number if possible
    const originalId = node.id.startsWith('node-') ? null : Number(node.id);
    if (originalId == null) {
      // fallback: we don't have direct mapping; just select node minimal
      setSelected({ id: node.id, translations: {}, groups: [], parent: null });
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/admin/category/${originalId}`);
      setSelected(res.data);
      setUpdate(true);
      // set form state based on translations
      const initialState = { en: { name: '' }, ar: { name: '' } };
      if (res.data.translations) {
        Object.entries(res.data.translations).forEach(([lang, translation]) => {
          initialState[lang] = { name: translation.name || '' };
        });
      }
      setFormState(initialState);
    
      setSelectedGroups(res.data.groups || []);
      setPreviewUrl(res.data.file || null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: t('Error loading category') });
    }
  };

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleTreeContext = (event, itemId) => {
    event.preventDefault();
    const node = findNodeById(categories, itemId);
    setMenuAnchor({ x: event.clientX, y: event.clientY });
    setMenuNode(node);
  };

  const handleCreateCategory = () => {
    const parentId = menuNode?.id === 'root' ? null : (selected?.id && Number(selected.id)) || null;
    setFormState({ en: { name: '' }, ar: { name: '' } });
    setSelected({ translations: { en: { name: '' }, ar: { name: '' } }, groups: [], parent: parentId });
    setUpdate(false);
    setFile(null);
    setSelectedGroups([]);
    setContextMenuAnchor(null);
    setPreviewUrl(null);
  
  };

  const handleDeleteCategory = async () => {
    const id = selected?.id  ? Number(selected.id) : null;
    if (!id) {
      setMessage({ type: 'error', text: t('Cannot delete this node') });
      setContextMenuAnchor(null);
      return;
    }
    try {
      await axiosInstance.delete(`/api/delete_categories/${id}/`);
      setContextMenuAnchor(null);
      setMessage({ type: 'success', text: t('Category deleted successfully') });
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: t('Error deleting category') });
    } finally {
      setMenuAnchor(null);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
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
      let name;
      if (formState.en.name) name = formState.en.name;
      else if (formState.ar.name) name = formState.ar.name;
      else {
        setMessage({ type: 'error', text: t('Please provide at least one translation') });
        return;
      }

      const translationsList = Object.entries(formState)
        .filter(([_, v]) => v.name)
        .map(([language, value]) => ({ language, name: value.name }));

      const formData = new FormData();
      formData.append('id', selected?.id || '');
      formData.append('name', name);
      formData.append('translations', JSON.stringify(translationsList));
      formData.append('groups', JSON.stringify(selectedGroups));
      if (selected?.parent) formData.append('parent', selected.parent);
      if (file) formData.append('file', file);
      if(update) {
        await axiosInstance.put('/api/admin/categories_admin/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }else {
        await axiosInstance.post('/api/admin/categories_admin/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
    }
      setUpdate(true);
      setMessage({ type: 'success', text: t('Category created successfully') });
      setFormState({ en: { name: '' }, ar: { name: '' } });
      setSelectedGroups([]);
      setSelected(null);
      setFile(null);
      setPreviewUrl(null);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || t('Error saving category') });
    }
  };

  const handleDelete = async () => {
    const id = selected?.id || null;
    if (!id) return;
    try {
      await axiosInstance.delete(`/api/delete_categories/${id}/`);
      setMessage({ type: 'success', text: t('Category deleted successfully') });
      setSelected(null);
      setUpdate(true);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || t('Error deleting category') });
    }
  };

  const handleGroupToggle = (gid) => setSelectedGroups(prev => prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]);

  return (
    <Box sx={{ p: 3, direction: isRTL() ? 'rtl' : 'ltr', bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f6fa' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{t('categories')}</Typography>

      {message && (
        <Snackbar open autoHideDuration={6000} onClose={() => setMessage(null)}>
          <MuiAlert severity={message.type} onClose={() => setMessage(null)}>{message.text}</MuiAlert>
        </Snackbar>
      )}

      <Box display="flex" gap={3}>
        <Box sx={{ width: '30%' }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('categories')}</Typography>

            {loadingCategories ? (
              <Box display="flex" justifyContent="center" sx={{ py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <RichTreeView
                items={categories}
                slots={{ expandIcon: ExpandMore, collapseIcon: ChevronRight }}
                onItemClick={handleTreeSelect}
                onItemContextMenu={handleTreeContext}
                onContextMenu={(event, itemId) => {
                  event.preventDefault();
 
                  setContextMenuAnchor({
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                  });
                }}
                sx={{ maxHeight: '70vh', overflow: 'auto' }}
              />
            )}

            {/* context menu (MUI Menu) */}
            <Menu
               open={!!contextMenuAnchor}
              anchorReference="anchorPosition"
              anchorPosition={
                contextMenuAnchor !== null
                  ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX }
                  : undefined
              }
              onClose={() => setContextMenuAnchor(null)}
            >
            
                <MenuItem onClick={()=>handleCreateCategory()}>{t('Create new category')}</MenuItem>
            
              
              {selected?.id && selected.id  && (
                <MenuItem onClick={()=>handleDeleteCategory()} sx={{ color: 'error.main' }}>{t('Delete selected category')}</MenuItem>
              )}
            </Menu>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          {selected ? (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Tabs value={0} sx={{ mb: 2 }}>
                <Tab label={t('en')} />
                <Tab label={t('ar')} />
              </Tabs>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('Category Name (EN)')}
                  value={formState.en.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, en: { name: e.target.value } }))}
                  fullWidth
                />
                <TextField
                  label={t('Category Name (AR)')}
                  value={formState.ar.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, ar: { name: e.target.value } }))}
                  fullWidth
                />

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('Category Image')}</Typography>
                  <FileInput onChange={handleFileChange} fileName={file?.name || (previewUrl ? 
                    t('Click to upload image') : '')} onRemove={handleRemoveFile} />
                  {previewUrl && (
                    <Box sx={{ position: 'relative', display: 'inline-block', mt: 1 }}>
                      <Avatar variant="rounded" src={previewUrl} alt={t('Preview')} sx={{ width: 120, height: 80 }} />
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('Product Groups')}</Typography>
                  <GroupsTable
                    groups={groups}
                    totalCount={totalPages}
                    selectedGroups={selectedGroups}
                    onToggleGroup={handleGroupToggle}
                    page={currentPage}
                    rowsPerPage={rowsPerPage}
                    onChangePage={(p) => setCurrentPage(p)}
                    onChangeRowsPerPage={(r) => setRowsPerPage(r)}
                  />
                </Box>

                <Box display="flex" gap={2}>
                  <Button variant="contained" onClick={handleSave}>{selected?.id ? t('Update') : t('Create')}</Button>
                  {selected?.id && <Button color="error" onClick={handleDelete}>{t('Delete')}</Button>}
                </Box>
              </Box>
            </Card>
          ) : (
            <Card variant="outlined" sx={{ p: 4, minHeight: 240 }}>
              <Typography>{t('Select a category to edit or right-click the tree to create.')}</Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
