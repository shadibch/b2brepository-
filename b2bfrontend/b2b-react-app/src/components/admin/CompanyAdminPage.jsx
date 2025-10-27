import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Tabs,
  Tab,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { formatPercentage, formatNumber, t, isRTL } from "../../utils/translator";
import axiosInstance from '../axiosInstance';
import Products from './Products';

const CompanyAdminPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [messageState, setMessageState] = useState({ open: false, severity: 'info', content: '' });

  const [expandedCompanies, setExpandedCompanies] = useState({}); // { [companyId]: true }
  const [branches, setBranches] = useState({}); // { [companyId]: [] }
  const [branchLoading, setBranchLoading] = useState({});

  const [contractItems, setContractItems] = useState({}); // { [branchId]: [] }
  const [contractItemsLoading, setContractItemsLoading] = useState({});

  const [companyItems, setCompanyItems] = useState({}); // { [companyId]: [] }
  const [companyItemsLoading, setCompanyItemsLoading] = useState({});

  const [editingPrice, setEditingPrice] = useState({}); // { [productId]: true }
  const [editingCompanyPrice, setEditingCompanyPrice] = useState({}); // by record.id
  const [editingCompanyPriceFlat, setEditingCompanyPriceFlat] = useState({});

  // Add product dialogs
  const [addContractOpen, setAddContractOpen] = useState(false);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState(null);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/companies/');
      setCompanies(response.data.results || []);
    } catch (error) {
      showMessage('error', t('Failed to fetch companies'));
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (severity, content) => {
    setMessageState({ open: true, severity, content });
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setEditForm({
      id: company.id,
      name: company.name,
      register_number: company.register_number,
      credit: company.credit,
      period: company.period,
      address: company.address,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/api/companies/${selectedCompany.id}/`, {
        credit: editForm.credit,
        period: editForm.period,
      });
      showMessage('success', t('Company updated successfully'));
      setEditDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      showMessage('error', t('Failed to update company'));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandCompany = (companyId) => {
    setExpandedCompanies(prev => ({ ...prev, [companyId]: !prev[companyId] }));
    if (!branches[companyId]) {
      fetchBranches(companyId);
    }
    if (!companyItems[companyId]) {
      fetchCompanyItems(companyId);
    }
  };

  const fetchBranches = async (companyId) => {
    try {
      setBranchLoading(prev => ({ ...prev, [companyId]: true }));
      const response = await axiosInstance.get(`/api/companies/${companyId}/branches/`);
      setBranches(prev => ({ ...prev, [companyId]: response.data }));
    } catch (error) {
      showMessage('error', t('Failed to fetch branches'));
    } finally {
      setBranchLoading(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const fetchContractItems = async (branchId) => {
    try {
      setContractItemsLoading(prev => ({ ...prev, [branchId]: true }));
      const response = await axiosInstance.get(`/api/branches/${branchId}/contract/items/`);
      const itemsWithBranchId = (response.data || []).map(item => ({ ...item, branch_id: branchId }));
      setContractItems(prev => ({ ...prev, [branchId]: itemsWithBranchId }));
    } catch (error) {
      showMessage('error', t('Failed to fetch contract items'));
    } finally {
      setContractItemsLoading(prev => ({ ...prev, [branchId]: false }));
    }
  };

  const fetchCompanyItems = async (companyId) => {
    try {
      setCompanyItemsLoading(prev => ({ ...prev, [companyId]: true }));
      const response = await axiosInstance.get(`/api/companies/products/${companyId}`);
      const itemsWithCompanyId = (response.data.results || []).map(item => ({ ...item, company_id: companyId }));
      setCompanyItems(prev => ({ ...prev, [companyId]: itemsWithCompanyId }));
    } catch (error) {
      showMessage('error', t('Failed to fetch contract items'));
    } finally {
      setCompanyItemsLoading(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const handleConfirmDelete = async (record) => {
    try {
      const ok = window.confirm(t('Are you sure you want to delete this item ?'));
      if (!ok) return;
      await axiosInstance.delete(`/api/admin/products/${record.product_id}/delete_price/?price_id=${record.id}`);
      setCompanyItems(prev => ({
        ...prev,
        [record.company_id]: prev[record.company_id].filter(item => item.product_id !== record.product_id)
      }));
      showMessage('success', 'Product removed successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.error || t('Error deleting price'));
    }
  };

  const handleDeleteContractItem = async (record) => {
    try {
      const ok = window.confirm(t('Are you sure you want to delete this item ?'));
      if (!ok) return;
      await axiosInstance.delete(`/api/branches/${record.branch_id}/contract/items/${record.product_id}/`);
      setContractItems(prev => ({
        ...prev,
        [record.branch_id]: prev[record.branch_id].filter(item => item.product_id !== record.product_id)
      }));
      showMessage('success', 'Product removed successfully');
    } catch (error) {
      showMessage('error', t('Error deleting price'));
    }
  };

  const handlePriceCompanyPriceChange = async (companyId, record, newPrice, percentage) => {
    try {
      // optimistic update
      if (percentage) {
        setCompanyItems(prev => ({
          ...prev,
          [companyId]: prev[companyId].map(item =>
            item.product_id === record.product_id ? { ...item, percentage_discount: newPrice, price: (100 - newPrice) * record.base_price / 100, flat_discount: null } : item
          ),
        }));
        await axiosInstance.post(`/api/admin/products/${record.product_id}/add_price/`, {
          purchaser: companyId,
          is_percentage: true,
          discount_value: newPrice,
        }, { headers: { 'Content-Type': 'application/json' } });
      } else {
        setCompanyItems(prev => ({
          ...prev,
          [companyId]: prev[companyId].map(item =>
            item.product_id === record.product_id ? { ...item, percentage_discount: null, price: newPrice, flat_discount: newPrice } : item
          ),
        }));
        await axiosInstance.post(`/api/admin/products/${record.product_id}/add_price/`, {
          purchaser: companyId,
          is_percentage: false,
          discount_value: newPrice,
        }, { headers: { 'Content-Type': 'application/json' } });
      }
      showMessage('success', t('Price updated successfully'));
    } catch (error) {
      showMessage('error', t('Failed to update price'));
    } finally {
      if (percentage) setEditingCompanyPrice(prev => ({ ...prev, [record.id]: false }));
      else setEditingCompanyPriceFlat(prev => ({ ...prev, [record.id]: false }));
    }
  };

  const handlePriceChange = async (branchId, productId, newPrice) => {
    try {
      setContractItems(prev => ({
        ...prev,
        [branchId]: prev[branchId].map(item => item.product_id === productId ? { ...item, price: newPrice } : item)
      }));
      await axiosInstance.post(`/api/product/${productId}/branches/${branchId}/`, {
        body: { price: newPrice }
      });
      showMessage('success', t('Price updated successfully'));
    } catch (error) {
      showMessage('error', t('Failed to update price'));
    } finally {
      setEditingPrice(prev => ({ ...prev, [productId]: false }));
    }
  };
  const theme = useTheme();
  const handleAddContract = (branchId) => {
    setCurrentBranchId(branchId);
    setAddContractOpen(true);
  };

  const handleAddProductToCompany = (companyId) => {
    setCurrentCompanyId(companyId);
    setAddCompanyOpen(true);
  };
  const align = isRTL ? 'right' : 'left';

  const handleAddContractSubmit = async () => {
    try {
      // For each selected product, post and optimistically update
      await Promise.all(selectedProducts.map(async (product) => {
        const response = await axiosInstance.post(`/api/product/${product.id}/branches/${currentBranchId}/`, {
          body: { price: product.price }
        });
        setContractItems(prev => ({
          ...prev,
          [currentBranchId]: [ ...(prev[currentBranchId] || []), { product_id: product.id, product_name: product.name, product_part_id: product.part_id, price: product.price } ]
        }));
        return response;
      }));
      showMessage('success', t('Contract item added successfully'));
      setAddContractOpen(false);
      setSelectedProducts([]);
    } catch (error) {
      showMessage('error', t('Failed to add contract item'));
    }
  };

  const handleAddCompanyProductSubmit = async () => {
    try {
      await Promise.all(selectedProducts.map(async (product) => {
        const response = await axiosInstance.post(`/api/admin/products/${product.id}/add_price/`, {
          purchaser: currentCompanyId,
          is_percentage: true,
          discount_value: 25,
        }, { headers: { 'Content-Type': 'application/json' } });
        setCompanyItems(prev => ({
          ...prev,
          [currentCompanyId]: [ ...(prev[currentCompanyId] || []), { product_id: product.id, product_name: product.name, product_part_id: product.part_id, percentage_discount: 25.00, id: response.data.id, price: response.data.price, discount_value: 0.0 } ]
        }));
        return response;
      }));
      showMessage('success', t('Contract item added successfully'));
      setAddCompanyOpen(false);
      setSelectedProducts([]);
    } catch (error) {
      showMessage('error', t('Failed to add contract item'));
    }
  };

  return (
    <Box  sx={{
      width: "100%",
      minHeight: "100vh",
      bgcolor:
        theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "#f5f6fa",
      p: 3,
      direction: isRTL() ? "rtl" : "ltr",
    }}>
      <Typography  variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          textAlign: isRTL() ? "right" : "left",
          color: theme.palette.text.primary,
        }} >{t('Companies Management')}</Typography>

      {messageState.open && (
        <Snackbar
          open={messageState.open}
          autoHideDuration={5000}
          onClose={() => setMessageState(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={messageState.severity} onClose={() => setMessageState(prev => ({ ...prev, open: false }))}>{messageState.content}</Alert>
        </Snackbar>
      )}

      <Paper elevation={2} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell  align={align} />
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('companyname')}</TableCell>
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('companyregisternumber')}</TableCell>
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('company_credit')}</TableCell>
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('company_period')}</TableCell>
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('address')}</TableCell>
                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company,index) => (
                <React.Fragment key={company.id}>
                  <TableRow  sx={{
                    cursor: "pointer",
                    backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                  }}>
                    <TableCell sx={{ width: 48 }}>
                      <IconButton size="small" onClick={() => toggleExpandCompany(company.id)}>
                        {expandedCompanies[company.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell align={align}>{company.name}</TableCell>
                    <TableCell align={align}>{company.register_number}</TableCell>
                    <TableCell align={align}>{formatNumber( company.credit,'SAR')}</TableCell>
                    <TableCell align={align}>{formatNumber( company.period,null)}</TableCell>
                    <TableCell align={align}>{company.address}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" startIcon={<EditIcon />} onClick={() => handleEdit(company)}>{t('Edit')}</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={!!expandedCompanies[company.id]} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2 }}>
{/* --- Tabs for Branches and Products --- */}
<Box sx={{ mt: 1 }}>
  <Tabs
    value={expandedCompanies[company.id]?.tab || 0}
    onChange={(e, newValue) =>
      setExpandedCompanies(prev => ({
        ...prev,
        [company.id]: { ...(prev[company.id] || {}), tab: newValue }
      }))
    }
    aria-label="company tabs"
  >
    <Tab label={t('Branches')} />
    <Tab label={t('Products')} />
  </Tabs>

  {/* --- Branches Tab --- */}
  {((expandedCompanies[company.id]?.tab || 0) === 0) && (
    <Box sx={{ mt: 2 }}>
      {branchLoading[company.id] ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light" }}>
            <TableCell />
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('branch_name')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('address')}</TableCell>
            
            </TableRow>
          </TableHead>
          <TableBody>
            {(branches[company.id] || []).map((branch, index) => (
              <React.Fragment key={branch.id}>
                <TableRow
                  sx={{
                    cursor: "pointer",
                    backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                  }}
                >
                    <TableCell>
  <IconButton
    size="small"
    onClick={() => {
      setExpandedCompanies(prev => ({
        ...prev,
        [company.id]: {
          ...(prev[company.id] || {}),
          expandedBranchId:
            prev[company.id]?.expandedBranchId === branch.id ? null : branch.id,
        },
      }));
      if (!contractItems[branch.id]) fetchContractItems(branch.id);
    }}
  >
    {expandedCompanies[company.id]?.expandedBranchId === branch.id ? (
      <ExpandLessIcon />
    ) : (
      <ExpandMoreIcon />
    )}
  </IconButton>
</TableCell>
                  <TableCell align={align}>{branch.name}</TableCell>
                  <TableCell align={align}>{branch.address}</TableCell>
                


                </TableRow>

                <TableRow>
                  <TableCell colSpan={3} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse
  in={expandedCompanies[company.id]?.expandedBranchId === branch.id}
  timeout="auto"
  unmountOnExit
>

                      <Box sx={{ m: 2 }}>
                        {contractItemsLoading[branch.id] ? (
                          <CircularProgress />
                        ) : (
                          <Table size="small">
                            <TableHead sx={{ backgroundColor: "primary.light" }}>
                              <TableRow>
                                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Product Name')}</TableCell>
                                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Part ID')}</TableCell>
                                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Price')}</TableCell>
                                <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Actions')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(contractItems[branch.id] || []).map((item, index) => (
                                <TableRow
                                  sx={{
                                    cursor: "pointer",
                                    backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
                                  }}
                                  key={item.product_id}
                                >
                                  <TableCell align={align}>{item.product_name}</TableCell>
                                  <TableCell align={align}>{item.product_part_id}</TableCell>
                                  <TableCell  align={align}>
                                    {editingPrice[item.product_id] ? (
                                      <TextField
                                        type="number"
                                        defaultValue={item.price}
                                        onBlur={(e) => handlePriceChange(item.branch_id, item.product_id, Number(e.target.value))}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handlePriceChange(item.branch_id, item.product_id, Number(e.target.value));
                                        }}
                                        size="small"
                                      />
                                    ) : (
                                      <Box
                                        sx={{ cursor: 'pointer', color: 'primary.main' }}
                                        onClick={() => setEditingPrice(prev => ({ ...prev, [item.product_id]: true }))}
                                      >
                                        {formatNumber(item.price, item.currency)}
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell  align={align}>
                                    <IconButton color="error" onClick={() => handleDeleteContractItem(item)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}

                        {/* ✅ Moved button INSIDE branch tab only */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button variant="contained" onClick={() => handleAddContract(branch.id)}>
                            {t('Add Contract Item')}
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )}

  {/* --- Products Tab --- */}
  {((expandedCompanies[company.id]?.tab || 0) === 1) && (
    <Box sx={{ mt: 3 }}>
      {companyItemsLoading[company.id] ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead  sx={{ backgroundColor: "primary.light" }}>
            <TableRow>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Product Name')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Part ID')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Percentage')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Flat')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Price')}</TableCell>
              <TableCell  align={align} sx={{ color: "white", fontWeight: 600 }}>{t('Actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(companyItems[company.id] || []).map((record,index) => (
              <TableRow key={record.id || record.product_id}   sx={{
                cursor: "pointer",
                backgroundColor: index % 2 === 0 ? "background.paper" : "action.hover",
              }}>
                <TableCell  align={align}>{record.product_name}</TableCell>
                <TableCell  align={align}>{record.product_part_id}</TableCell>
                <TableCell  align={align}>
                  {editingCompanyPrice[record.id] ? (
                    <TextField
                      type="number"
                      defaultValue={record.percentage_discount}
                      onBlur={(e) => handlePriceCompanyPriceChange(record.company_id, record, Number(e.target.value), true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePriceCompanyPriceChange(record.company_id, record, Number(e.target.value), true);
                      }}
                      size="small"
                    />
                  ) : (
                    <Box
                      sx={{ cursor: 'pointer', color: 'primary.main' }}
                      onClick={() => setEditingCompanyPrice(prev => ({ ...prev, [record.id]: true }))}
                    >
                      {formatPercentage(record.percentage_discount ? (record.percentage_discount / 100) : 0)}
                    </Box>
                  )}
                </TableCell>
                <TableCell  align={align}>
                  {editingCompanyPriceFlat[record.id] ? (
                    <TextField
                      type="number"
                      defaultValue={record.flat_discount ? record.flat_discount : record.price}
                      onBlur={(e) => handlePriceCompanyPriceChange(record.company_id, record, Number(e.target.value), false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePriceCompanyPriceChange(record.company_id, record, Number(e.target.value), false);
                      }}
                      size="small"
                    />
                  ) : (
                    <Box
                      sx={{ cursor: 'pointer', color: 'primary.main' }}
                      onClick={() => setEditingCompanyPriceFlat(prev => ({ ...prev, [record.id]: true }))}
                    >
                      { formatNumber(record.flat_discount ? record.flat_discount : 0.0, record.currency) }
                    </Box>
                  )}
                </TableCell>
                <TableCell  align={align}>{formatNumber(record.price, record.currency)}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleConfirmDelete(record)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button variant="contained" onClick={() => handleAddProductToCompany(company.id)}>
          {t('Add Product')}
        </Button>
      </Box>
    </Box>
  )}
</Box>
                         
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('Edit')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('company_name')} value={editForm.name || ''} disabled />
            <TextField label={t('company_register_number')} value={editForm.register_number || ''} disabled />
            <TextField label={t('credit')} type="number" value={editForm.credit ?? ''} onChange={(e) => setEditForm(prev => ({ ...prev, credit: Number(e.target.value) }))} />
            <TextField label={t('period')} type="number" value={editForm.period ?? ''} onChange={(e) => setEditForm(prev => ({ ...prev, period: Number(e.target.value) }))} />
            <TextField label={t('address')} value={editForm.address || ''} disabled />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={loading}>{loading ? <CircularProgress size={20} /> : t('common.ok')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Contract Item Dialog */}
      <Dialog open={addContractOpen} onClose={() => setAddContractOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('Add Contract Item')}</DialogTitle>
        <DialogContent>
          <Products reference_id={currentBranchId} reference_key={"branch_id"} onSelectionChange={setSelectedProducts} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddContractOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAddContractSubmit}>{t('common.ok')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Company Item Dialog */}
      <Dialog open={addCompanyOpen} onClose={() => setAddCompanyOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('Add Company Item')}</DialogTitle>
        <DialogContent>
          <Products reference_id={currentCompanyId} reference_key={"company_id"} onSelectionChange={setSelectedProducts} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCompanyOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAddCompanyProductSubmit}>{t('common.ok')}</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default CompanyAdminPage;
