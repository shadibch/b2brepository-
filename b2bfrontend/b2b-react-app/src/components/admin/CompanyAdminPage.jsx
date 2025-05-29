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
  Alert,
} from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  t,
  switchLanguage,
  isRTL,
  getCurrentLanguage,
  formatNumber,
  formatDate,
  formatLocal
} from "../../utils/translator";
import axiosInstance from '../axiosInstance';
import BranchManagement from './BranchManagement';

const { Title } = Typography;

const CompanyAdminPage = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageState, setMessageState] = useState({ type: '', content: '' });

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
        {selectedCompany && <BranchManagement company={selectedCompany} />}
      </Modal>
    </div>
  );
};

export default CompanyAdminPage; 