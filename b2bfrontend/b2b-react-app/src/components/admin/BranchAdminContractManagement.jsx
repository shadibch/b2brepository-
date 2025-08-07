import React, { useEffect, useState, useRef } from "react";
import {
    t,
    switchLanguage,
    isRTL,
    getCurrentLanguage,
    formatNumber,
  } from "../../utils/translator";

  import {
    InputNumber,
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
  import axiosInstance from '../axiosInstance';

  const { Title } = Typography;

const BranchContractManagement = ({ company,product }) => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);



    const [loading, setLoading] = useState(false);
    const fetchBranches = async () => {
      try {
        
        const response = await axiosInstance.get(`/api/company/${company.value}/product/${product.id}/branches/`);
       console.log(JSON.stringify(response.data))
        setBranches(response.data);
      } catch (error) {
        message.error('Failed to fetch branches');
      }
    };

    const handleRemoveProduct = async (record) => {
      try {
       const response = await axiosInstance.delete(`/api/product/${product.id}/branches/${record.id}/`);
       console.log(response.data); 
       const updatedRecord = { ...response.data, product_exist: false }; // <- create new object
      setBranches(prev =>
        prev.map(branch => branch.id === record.id ? updatedRecord : branch)
      );
      } catch (error) {
        message.error('Failed to remove product');
      }
    };

    const handleAddProduct = async (record) => {
      const productId = product.id;
      const branchId = record.id;  // assuming you have this
      const price = record.price;
    
      const response = await axiosInstance.post(`/api/product/${productId}/branches/${branchId}/`, {
        body: {
          price: price
        }
      });
    
    
      const updatedRecord = { ...record, product_exist: true }; // <- create new object
      setBranches(prev =>
        prev.map(branch => branch.id === branchId ? updatedRecord : branch)
      );
    };
    


    const [editingKey, setEditingKey] = useState(null);
    const [priceMap, setPriceMap] = useState({});
  
    const isEditing = (record) => record.id === editingKey;
  
    const handlePriceChange = (value, record) => {
      record.price = value;
      // setPriceMap(prev => ({
      //   ...prev,
      //   [record.id]: value,
      // }));
    };
  
    const handlePriceSave = async (record) => {
      const newPrice = priceMap[record.key];
  
      if (record.product_exist) {
        // ✅ Send update request
        await fetch('/api/update-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId: record.key, price: newPrice }),
        });
      } else {
        // ✅ Send add-product request including price
        handleAddProduct({ ...record, price: newPrice });
      }
  
      setEditingKey(null);
    };
  
    
    useEffect(() => {
      if (company) {
        fetchBranches();
      }
    }, [company]);
  
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
        title: t('Price'),
        dataIndex: 'price',
        key: 'price',
        render: (text, record) => {
          const editable = isEditing(record);
          return editable ? (
            <InputNumber
              min={0}
              value={priceMap[record.key] ?? record.price}
              formatter={(value) =>
                ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              onChange={(value) => handlePriceChange(value, record)}
              onBlur={() => handlePriceSave(record)}
              onPressEnter={() => handlePriceSave(record)}
              autoFocus
            />
          ) : (
            <div
              onClick={() => {
                setEditingKey(record.id);
                setPriceMap(prev => ({
                  ...prev,
                  [record.key]: record.price,
                }));
              }}
              style={{ cursor: 'pointer' }}
            >
              {record.price}
            </div>
          );
        },
      },
      {
        title: t('Actions'),
        key: 'actions',
        render: (_, record) => {
          return record.product_exist ? (
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  handleRemoveProduct(record);
                }}
              >
                {t('Remove Product')}
              </Button>
            </Space>
          ) :  <Space>
          <Button
            type="primary"
            onClick={() => {
              handleAddProduct(record);
            }}
          >
            {t('Add Product')}
          </Button>
        </Space>;
        },
      },
    ];

    return (
        <div>
          <Title level={3}>{t('manage_branches')}</Title>
          <Table columns={columns} dataSource={branches} />
         
        </div>
      );
  };

  export default BranchContractManagement;