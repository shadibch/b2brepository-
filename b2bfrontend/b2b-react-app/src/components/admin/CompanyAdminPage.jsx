import React, { useState, useEffect } from 'react';

import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Alert,
  Space,
  Typography,
  Popconfirm,
  message
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { formatPercentage, formatNumber, t } from "../../utils/translator";
import axiosInstance from '../axiosInstance';
import Products from './Products';
import { DeleteOutlined } from "@ant-design/icons";


const { Title } = Typography;

const CompanyAdminPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageState, setMessageState] = useState({ type: '', content: '' });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [companyItems,setCompanyItems] = useState([]);
  // Store branch data keyed by companyId
  const [branches, setBranches] = useState({});
  const [branchLoading, setBranchLoading] = useState({}); 

  // Store contract items data keyed by branchId
  const [contractItems, setContractItems] = useState({});
  const [contractItemsLoading, setContractItemsLoading] = useState({});
  const [companyItemsLoading, setCompanyItemsLoading] = useState({});

  const fetchCompanies = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/companies/');
      setCompanies(response.data.results);
    } catch (error) {
      setMessageState({ type: 'error', content: t('Failed to fetch companies') });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleEdit = (record) => {
    setSelectedCompany(record);
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      register_number: record.register_number,
      credit: record.credit,
      period: record.period,
      address: record.address,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await axiosInstance.patch(`/api/companies/${selectedCompany.id}/`, {
        credit: values.credit,
        period: values.period,
      });
      
      setMessageState({ type: 'success', content: t('Company updated successfully') });
      setIsModalVisible(false);
      fetchCompanies();
    } catch (error) {
      setMessageState({ type: 'error', content: t('Failed to update company') });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (companyId) => {
    try {
      setBranchLoading(prev => ({ ...prev, [companyId]: true }));
      const response = await axiosInstance.get(`/api/companies/${companyId}/branches/`);
      setBranches(prev => ({ ...prev, [companyId]: response.data }));
    } catch (error) {
      setMessageState({ type: 'error', content: t('Failed to fetch branches') });
    } finally {
      setBranchLoading(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const fetchContractItems = async (branchId) => {
    try {
      setContractItemsLoading(prev => ({ ...prev, [branchId]: true }));
      const response = await axiosInstance.get(`/api/branches/${branchId}/contract/items/`);
      
      // Attach branchId to each contract item
      const itemsWithBranchId = response.data.map(item => ({
        ...item,
        branch_id: branchId,
      }));
  
      setContractItems(prev => ({ ...prev, [branchId]: itemsWithBranchId }));
    } catch (error) {
      setMessageState({ type: 'error', content: t('Failed to fetch contract items') });
    } finally {
      setContractItemsLoading(prev => ({ ...prev, [branchId]: false }));
    }
  };

  
  const fetchCompanyItems = async (companyId) => {
    try {
      setCompanyItemsLoading(prev => ({ ...prev, [companyId]: true }));
      const response = await axiosInstance.get(`api/companies/products/${companyId}`);
      
      // Attach branchId to each contract item
      const itemsWithCompanyId = response.data.results.map(item => ({
        ...item,
        company_id: companyId,
      }));
  
      setCompanyItems(prev => ({ ...prev, [companyId]: itemsWithCompanyId }));
    } catch (error) {
      setMessageState({ type: 'error', content: t('Failed to fetch contract items') });
    } finally {
      setCompanyItemsLoading(prev => ({ ...prev, [companyId]: false }));
    }
  };
  const handleConfirmDelete = async (record) => {
    try {
      await axiosInstance.delete(`/api/admin/products/${record.product_id}/delete_price/?price_id=${record.id}`);
      setCompanyItems(prev => ({
        ...prev,
        [record.company_id]: prev[record.company_id].filter(item => item.product_id !== record.product_id)
      }));
  
      message.success('Product removed successfully');
    } catch (error) {
      setMessageState({ 
        type: 'danger', 
        text: error.response?.data?.error || t('Error deleting price') 
      });
    } 
  };
  
  const handleDeleteContractItem = async (record) => {
    axiosInstance.delete(`/api/branches/${record.branch_id}/contract/items/${record.product_id}/`);
    setContractItems(prev => ({
      ...prev,
      [record.branch_id]: prev[record.branch_id].filter(item => item.product_id !== record.product_id)
    }));

    message.success('Product removed successfully');
  }  

  const columns = [
    {
      title: t('companyname'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('companyregisternumber'),
      dataIndex: 'register_number',
      key: 'register_number',
    },
    {
      title: t('company_credit'),
      dataIndex: 'credit',
      key: 'credit',
    },
    {
      title: t('company_period'),
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: t('address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('Edit')}
          </Button>
        </Space>
      ),
    },
  ];

  // Subtable columns for branches
  const branchColumns = [
    {
      title: t('branch_name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('address'),
      dataIndex: 'address',
      key: 'address',
    },
  ];

  // Subtable columns for contract items
// Track which cell is being edited
const [editingPrice, setEditingPrice] = useState({}); // { [productId]: true/false }
const [editingCompanyPrice, setEditingCompanyPrice] = useState({}); 
const [editingCompanyPrice_discount, setEditingCompanyPrice_discount] = useState({}); 
const handlePriceCompanyPriceChange = async (companyId,record, newPrice,percentage) => {
  try {
    // update client-side state first (optimistic update)

    
    
if(percentage) {
  setCompanyItems(prev => ({
    ...prev,
    [companyId]: prev[companyId].map(item =>
      item.product_id === record.product_id ? { ...item, percentage_discount: newPrice ,
        price:(100 -newPrice)*record.base_price/100 ,flat_discount:null} : item
    ),
  }));
    // send update request to backend
    const response =     await axiosInstance.post(`/api/admin/products/${record.product_id}/add_price/`, 
        {
        purchaser: companyId,
        is_percentage: true,
        discount_value: newPrice,
        
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    else {
      setCompanyItems(prev => ({
        ...prev,
        [companyId]: prev[companyId].map(item =>
          item.product_id === record.product_id ? { ...item, percentage_discount: null ,
            price:newPrice,flat_discount:newPrice } : item
        ),
      }));
      const response =     await axiosInstance.post(`/api/admin/products/${record.product_id}/add_price/`, 
        {
        purchaser: companyId,
        is_percentage: false,
        discount_value: newPrice,
        
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    }
     
    setMessageState({ type: 'success', content: t('Price updated successfully') });
  } catch (error) {
    setMessageState({ type: 'error', content: t('Failed to update price') });
  } finally {
    if(percentage) {
    setEditingCompanyPrice(prev => ({ ...prev, [record.id]: false }));
    }else {
      setEditingCompanyPrice_discount(prev => ({ ...prev, [record.id]: false }));
    }
  }
};
const handlePriceChange = async (branchId, productId, newPrice) => {
  try {
    // update client-side state first (optimistic update)
    setContractItems(prev => ({
      ...prev,
      [branchId]: prev[branchId].map(item =>
        item.product_id === productId ? { ...item, price: newPrice } : item
      ),
    }));
    

    // send update request to backend
    await axiosInstance.post(`/api/product/${productId}/branches/${branchId}/`, {
      body: {
        price: newPrice
      }

    });

    setMessageState({ type: 'success', content: t('Price updated successfully') });
  } catch (error) {
    setMessageState({ type: 'error', content: t('Failed to update price') });
  } finally {
    setEditingPrice(prev => ({ ...prev, [productId]: false }));
  }
};
const productColumns =[  {
  title: t('Product Name'),
  dataIndex: 'product_name',
  key: 'product_name',
},
{
  title: t('Part ID'),
  dataIndex: 'product_part_id',
  key: 'product_part_id',
},
{
  title: t('Percentage'),
  dataIndex: 'percentage_discount',
  key: 'percentage_discount',
  render: (text, record) => {
    const isEditing = editingCompanyPrice[record.id];

    return isEditing ? (
      <InputNumber
        autoFocus
        defaultValue={record.percentage_discount}
        onPressEnter={(e) =>
          handlePriceCompanyPriceChange(record.company_id, record,  e.target.value,true)
        }
        onBlur={(e) =>
          handlePriceCompanyPriceChange(record.company_id, record,  e.target.value,true)
        }
        style={{ width: '100%' }}
      />
    ) : (
      <div
        style={{ cursor: 'pointer', color: '#1890ff' }}
        onClick={() =>
          setEditingCompanyPrice(prev => ({ ...prev, [record.id]: true }))
        }
      >
      {formatPercentage(record.percentage_discount ? ( record.percentage_discount/100) : 0)}

      </div>
    );
  },
},
{
  title: t('Flat'),
  dataIndex: 'flat_discount',
  key: 'flat_discount',
  render: (text, record) => {
    const isEditing = editingCompanyPrice_discount[record.id];

    return isEditing ? (
      <InputNumber
        autoFocus
        defaultValue={record.flat_discount ? record.flat_discount : record.price}
        onPressEnter={(e) =>
         // handlePriceCompanyPriceChange(record.company_id, record,  e.target.value)
         handlePriceCompanyPriceChange(record.company_id, record,  e.target.value,false)
        }
        onBlur={(e) =>
          handlePriceCompanyPriceChange(record.company_id, record,  e.target.value,false)
        }
        style={{ width: '100%' }}
      />
    ) : (
      <div
        style={{ cursor: 'pointer', color: '#1890ff' }}
        onClick={() =>
          setEditingCompanyPrice_discount(prev => ({ ...prev, [record.id]: true }))
        }
      >
      { record.flat_discount ? formatNumber(record.flat_discount,record.currency): "0.0"}

      </div>
    );
  },

},
{
  title: t('Price'),
  dataIndex: 'price',
  key: 'price',
  render: (text, record) => {
  return <div>{formatNumber(record.price,record.currency)}</div>
  }
},
{
  title: t('Actions'),
  key: 'actions',
  render: (_, record) => (
    <Popconfirm
      title={t('Are you sure you want to delete this item ?')}
      okText={t("common.ok")}
      cancelText={t('Cancel')}
      onConfirm={() => handleConfirmDelete(record)}
    >
      <Button danger icon={<DeleteOutlined />} />
    </Popconfirm>
  ),
},]
const contractItemsColumns = [
  {
    title: t('Product Name'),
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: t('Part ID'),
    dataIndex: 'product_part_id',
    key: 'product_part_id',
  },
  {
    title: t('Price'),
    dataIndex: 'price',
    key: 'price',
    render: (text, record) => {
      const isEditing = editingPrice[record.product_id];

      return isEditing ? (
        <InputNumber
          autoFocus
          defaultValue={record.price}
          onPressEnter={(e) =>
            handlePriceChange(record.branch_id, record.product_id, e.target.value)
          }
          onBlur={(e) =>
            handlePriceChange(record.branch_id, record.product_id, e.target.value)
          }
          style={{ width: '100%' }}
        />
      ) : (
        <div
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() =>
            setEditingPrice(prev => ({ ...prev, [record.product_id]: true }))
          }
        >
          {formatNumber(record.price,record.currency)}
        </div>
      );
    },
  },
  {
    title: t('Actions'),
    key: 'actions',
    render: (_, record) => (
      <Popconfirm
        title={t('Are you sure you want to delete this item ?')}
        okText={t("common.ok")}
        cancelText={t('Cancel')}
        onConfirm={() => handleDeleteContractItem(record)}
      >
        <Button danger icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  },
];

const [isAddModalVisible, setIsAddModalVisible] = useState(false);
const [isAddForCOmpanyModalVisible, setIsAddForCOmpanyModalVisible] = useState(false);
const [currentBranchId, setCurrentBranchId] = useState(null);
const [currentCompanyhId, setCurrentCompanyhId] = useState(null);

const [addForm] = Form.useForm();

const handleAddContract = (branchId) => {
  setCurrentBranchId(branchId);

  setIsAddModalVisible(true);
};

const handleAddProductToCOmpany = (companyId) => {
  setCurrentCompanyhId(companyId);
  setIsAddForCOmpanyModalVisible(true);
}

const handleAddContractSubmit = async () => {
  try {
    const values = await addForm.validateFields();
    selectedProducts.forEach(async (product) => {
      const response =     await axiosInstance.post(`/api/product/${product.id}/branches/${currentBranchId}/`, {
        body: {
          price: product.price
        }
  
      });
      console.log(response);
       // optimistic UI update
    setContractItems(prev => ({
      ...prev,
      [currentBranchId]: [
        ...(prev[currentBranchId] || []),
        { product_id:product.id,product_name:product.name,part_id:product.part_id,price:product.price },
      ],
    }));
    });



   

    setMessageState({ type: 'success', content: t('Contract item added successfully') });
    setIsAddModalVisible(false);
  } catch (error) {
    setMessageState({ type: 'error', content: t('Failed to add contract item') });
  }
};



const handleAddCompanyProductSubmit = async () => {
  try {
    const values = await addForm.validateFields();
    selectedProducts.forEach(async (product) => {
      const response =     await axiosInstance.post(`/api/admin/products/${product.id}/add_price/`, 
        {
        purchaser: currentCompanyhId,
        is_percentage: true,
        discount_value: 25,
        
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
     
       // optimistic UI update
    setCompanyItems(prev => ({
      ...prev,
      [currentCompanyhId]: [
        ...(prev[currentCompanyhId] || []),
        { product_id:product.id,
          product_name:product.name,
          product_part_id:product.part_id,
          percentage_discount:25.00,
          id:response.data.id,
          price:response.data.price,
          discount_value:0.0, },
      ],
    }));
    });



   

    setMessageState({ type: 'success', content: t('Contract item added successfully') });
    setIsAddForCOmpanyModalVisible(false);
  } catch (error) {
    setMessageState({ type: 'error', content: t('Failed to add contract item') });
  }
};

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t("Companies Management")}</Title>
      
      {messageState.content && (
        <Alert
          message={messageState.content}
          type={messageState.type}
          showIcon
          style={{ marginBottom: '16px' }}
          closable
          onClose={() => setMessageState({ type: '', content: '' })}
        />
      )}

<Table
      columns={columns}
      dataSource={companies}
      rowKey="id"
      loading={loading}
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: "12px 24px" }}>
            <Tabs
            
              items={[
                {
                  key: "branches",
                  label: t("Branches"),
                  children: (
                    <Table
                      columns={branchColumns}
                      dataSource={branches[record.id] || []}
                      rowKey="id"
                      loading={branchLoading[record.id]}
                      pagination={false}
                      size="small"
                      expandable={{
                        expandedRowRender: (branchRecord) => (
                          <div>
                         
                            <Table
                              columns={contractItemsColumns}
                              dataSource={contractItems[branchRecord.id] || []}
                              rowKey="product_id"
                              loading={contractItemsLoading[branchRecord.id]}
                              pagination={false}
                              size="small"
                            />
               
               <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button
            style={{
              backgroundColor: "#1890ff",  // Ant Design default blue
              color: "#fff",
              border: "none",
              marginTop: 20,
            }}
            onClick={() => handleAddContract(branchRecord.id)}
          >
             {t("Add Contract Item")}
          </Button>
        </div>
        
                                 </div>
                        ),
                
                        onExpand: (expanded, branchRecord) => {
                          console.log(branchRecord.id);
                          if (expanded && !contractItems[branchRecord.id]) {
                            fetchContractItems(branchRecord.id);
                          }
                        },
                      }}
                    />
                  ),
                },
                {
                  key: "products",
                  label: t("Products"),
                  children: (
                    <>
                      <Table
                        columns={productColumns}
                       dataSource={companyItems[record.id] || []}
                        rowKey="id"
                        loading={companyItemsLoading[record.id]}
                        pagination={false}
                        size="small"
                      />
                      <div style={{ textAlign: "center", marginTop: 20 }}>
                        <Button
                          type="primary"
                          onClick={() => handleAddProductToCOmpany(record.id)}
                        >
                          {t("Add Product")}
                        </Button>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </div>
        ),
        onExpand: (expanded, record) => {
          // Default fetch for first tab when expanded
          if (expanded && !branches[record.id]) {
            fetchBranches(record.id);
          }
          if(expanded && !companyItems[record.id]) {
            fetchCompanyItems(record.id);
          }
        },
        
      }}
    />
  
      
   

      <Modal
        title={t("Edit")}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t("company_name")}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="register_number"
            label={t("company_register_number")}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="credit"
            label={t("credit")}
            rules={[{ required: true, message: t('Please input credit!') }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="period"
            label={t("period")}
            rules={[{ required: true, message: t('Please input period!') }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="address"
            label={t("address")}
          >
            <Input disabled />
          </Form.Item>
        </Form>
    
      </Modal>
      <Modal
  title={t("Add Contract Item")}
  open={isAddModalVisible}
  onOk={handleAddContractSubmit}
  onCancel={() => setIsAddModalVisible(false)}
  okText={t("common.ok")}
  cancelText={t("common.cancel")}
>
  
    <Products reference_id={currentBranchId} reference_key={"branch_id"}  onSelectionChange={setSelectedProducts} />

  
</Modal>


<Modal
  title={t("Add Company Item")}
  open={isAddForCOmpanyModalVisible}
  onOk={handleAddCompanyProductSubmit}
  onCancel={() => setIsAddForCOmpanyModalVisible(false)}
  okText={t("common.ok")}
  cancelText={t("common.cancel")}
>
  
    <Products reference_id={currentCompanyhId} reference_key={"company_id"}  onSelectionChange={setSelectedProducts} />

  
</Modal>

    </div>
    
  );
};

export default CompanyAdminPage;
