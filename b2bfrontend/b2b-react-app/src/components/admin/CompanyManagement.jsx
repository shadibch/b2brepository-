import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Typography,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import axiosInstance from '../axiosInstance';

const { Title } = Typography;

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies/');
      setCompanies(response.data);
    } catch (error) {
      message.error('Failed to fetch companies');
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleEdit = (record) => {
    setSelectedCompany(record);
    form.setFieldsValue({
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
      
      message.success(t('Company updated successfully'));
      setIsModalVisible(false);
      fetchCompanies();
    } catch (error) {
      message.error('Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Register Number',
      dataIndex: 'register_number',
      key: 'register_number',
    },
    {
      title: 'Credit',
      dataIndex: 'credit',
      key: 'credit',
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Actions',
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

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>{t("Companies Management")} </Title>
      
      <Table
        columns={columns}
        dataSource={companies}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title="Edit Company"
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
            label="Name"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="register_number"
            label="Register Number"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="credit"
            label="Credit"
            rules={[{ required: true, message: 'Please input credit!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="period"
            label="Period"
            rules={[{ required: true, message: 'Please input period!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyManagement; 