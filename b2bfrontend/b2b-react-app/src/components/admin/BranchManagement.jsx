import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Image,
  Input as AntInput,
} from 'antd';
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
  formatNumber,
  formatDate,
  formatLocal
} from "../../utils/translator";
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

import axiosInstance from '../axiosInstance';
import { API_BASE_URL, DEFAULT_IMAGE } from '../../utils/settings';

const { Title } = Typography;

const BranchManagement = ({ company }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get(`/api/companies/${company.id}/branches/`);
      setBranches(response.data);
    } catch (error) {
      message.error('Failed to fetch branches');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await  axiosInstance.get( searchQuery == ''  ? '/api/products/' :  `/api/search_text?q=${searchQuery}`);;
      setProducts(response.data.results);
    } catch (error) {
      message.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    if (company) {
      fetchBranches();
    }
  }, [company]);

  const handleAddProducts = async (selectedProducts) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/api/branches/${selectedBranch.id}/contract/items/`, {
        items: selectedProducts,
      });
      message.success('Products added successfully');
      setIsProductModalVisible(false);
      fetchBranches();
    } catch (error) {
      message.error('Failed to add products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product) => {
    try {
      await axiosInstance.post(`/api/branches/${selectedBranch.id}/contract/items/`, {
        items: [product.id]
      });
      message.success('Product added successfully');
  
      const updatedItems = [...selectedBranch.contract.items, product.id];
      setSelectedBranch({
        ...selectedBranch,
        contract: {
          ...selectedBranch.contract,
          items: updatedItems,
        },
      });
    } catch (error) {
      message.error('Failed to add product');
    }
  };
  

  const deleteItem = async (product) => {
    try {
      await axiosInstance.delete(`/api/branches/${selectedBranch.id}/contract/items/${product.id}/`);
      message.success('Product removed successfully');
  
      const updatedItems = selectedBranch.contract.items.filter(id => id !== product.id);
      setSelectedBranch({
        ...selectedBranch,
        contract: {
          ...selectedBranch.contract,
          items: updatedItems,
        },
      });
    } catch (error) {
      message.error('Failed to remove product');
    }
  };
  

  const columns = [
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
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSelectedBranch(record);
              setIsProductModalVisible(true);
              fetchProducts();
            }}
          >
            {t('Manage Products')}
          </Button>
        </Space>
      ),
    },
  ];

  const productColumns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Part ID',
      dataIndex: 'part_id',
      key: 'part_id',
    },
    {
      title: t('price'),
      dataIndex: 'base_price',
      key: 'base_price'
    },
    {
      title: 'Image',
      key: 'image',
      render: (_, record) => (
        <Image
          width={50}
          src={record.media_list.length > 0 ? `${API_BASE_URL}${record.media_list[0]}` : DEFAULT_IMAGE}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              selectedBranch.contract?.items.includes(record.id) ? 
                deleteItem(record) : 
                addProduct(record);
            }}
          >
            {t(selectedBranch.contract?.items.includes(record.id) ? 'Remove' : 'Add')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>{t('manage_branches')}</Title>
      <Table columns={columns} dataSource={branches} />
      <Modal
        title={`${t("Select product")} - ${company.name}  ${selectedBranch?.name}`}
        open={isProductModalVisible}
        onOk={handleAddProducts}
        onCancel={() => setIsProductModalVisible(false)}
        confirmLoading={loading}
      >
        <div className="header-middle">
        <input
          type="text"
          placeholder={`${t('search')}...`} // ✅ Use template literal for translation
          className="search-input"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="search-button" onClick={fetchProducts}>  {t('search')}</button>
      </div>

        <Table columns={productColumns} dataSource={products} />
      </Modal>
    </div>
  );
}

export default BranchManagement;