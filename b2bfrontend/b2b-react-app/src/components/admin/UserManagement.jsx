import React, { useState, useEffect } from 'react';
import axiosInstance from "../axiosInstance";
import { Table, Form, Button, Alert, Modal ,FormSelect } from "react-bootstrap";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber,formatDate,formatLocal} from '../../utils/translator';
import ReactPaginate from "react-paginate";
import './UserManagement.css';
const API_BASE = 'api/admin';


const ManagedUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filterActive, setFilterActive] = useState('false'); // default to inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
   const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    company_register_number: '',
    company_credit: '',
    company_period: '',
    is_active: false,
  });
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected); // Update current page on pagination
  };
  const [message, setMessage] = useState({ text: '', type: '' });
  const handleToggle = (event)=> {
    setIsSidebarOpen(event.detail.open);
  }
  window.addEventListener('toggled', handleToggle);
  useEffect(() => {
    fetchUsers(currentPage + 1);
  }, [filterActive,currentPage,isSidebarOpen,isRTL()]);

  const fetchUsers = async (page) => {
    let url = `${API_BASE}/search/?page=${page}`;
    if (filterActive !== 'all') url += `&active=${filterActive}`;
    try {
      const response = await axiosInstance.get(url);
      setUsers(response.data.results || []);
      setTotalPages(response.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    let page = currentPage + 1;
    let url = `${API_BASE}/search/?page=${page}&q=${searchQuery}`;
    if (filterActive !== 'all') url += `&active=${filterActive}`;
    try {
      const response = await axiosInstance.get(url);
      setTotalPages(response.data.count);
      setUsers(response.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRowClick = async (id) => {
    try {

      const res = await axiosInstance.get(`${API_BASE}/user/${id}`);
      if(!res.data['company_credit']){
        res.data['company_credit'] = '';
      }
      if(!res.data['company_period']){
        res.data['company_period']='';
      }
      setSelectedUser(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateUser = async (activeUpdate = null,message=`${t('user_updated')}`) => {
    if (!selectedUser) return;

    try {
      const data = {
        credit: formData.company_credit,
        period: formData.company_period,
      };
      if (activeUpdate !== null) data.active = activeUpdate;

      await axiosInstance.post(`${API_BASE}/update_user/${selectedUser.id}`, data);
      setMessage({ type: "success", text: message });
      handleSearch(currentPage + 1);
    } catch (err) {
      setMessage({ text: `${'error_user_update'}.` , type: 'danger' });
    }
  };

  return (
    
    <div className={`p-4 space-y-6`}>
       {message && <Alert variant={message.type}>{message.text}</Alert>}
      
            {/* User Form */}


      {selectedUser && (
        <div className="border p-4 rounded bg-gray-50 space-y-3">
          {['email', 'first_name', 'last_name', 'company_name', 'company_register_number'].map((field) => (
            <Form.Group key={field}>
               <Form.Label>{t(field)}</Form.Label>
              <Form.Control
                className="w-full border p-2 bg-gray-100"
                value={formData[field]}
                disabled
              />
            </Form.Group>
          ))}

          {['company_credit', 'company_period'].map((field) => (
            <Form.Group key={field}>
               <Form.Label>{t(field)}</Form.Label>
               <Form.Control
                className="w-full border p-2"
                name={field}
                value={formData[field]}
                onChange={handleFormChange}
              />
            </Form.Group>
          ))}

          <div className="button-group flex gap-2">
            <Button
              className="bg-green-500 text-white px-4 py-2 rounded button"
              onClick={() => updateUser(true,t('user_activated_message'))}
              disabled={formData.is_active}
            >
              {t('Activate')}
            </Button>
            <Button
              className="bg-red-500 text-white px-4 py-2 rounded button"
              onClick={() => updateUser(false,t('user_deactivated_message'))}
              disabled={!formData.is_active}
            >
              {t('Deactivate')}
            </Button>
            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded button"
              onClick={() => updateUser()}
            >
              {t('Update')}
            </Button>
          </div>
        </div>
      )}

<div className="flex justify-between items-end">
<select
          className="border p-2 order-first"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
        >
          <option value="true">{t('Active')}</option>
          <option value="false">{t('Inactive')}</option>
          <option value="all">{t('All')}</option>
        </select>
        <input
          className="border p-2"
          placeholder= {`${t('search')}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded search-button"
          onClick={ handleSearch}
        >
          {t('search')}
        </button>

       
      </div>

      <table className="min-w-full border mt-6 user-table">
        <thead>
          <tr className="bg-gray-100 text-left">
            {[
              'email',
              'first_name',
              'last_name',
              'company_name',
              'company_register_number',
              'company_credit',
              'company_period',
              'is_active',
            ].map((field) => (
              <th key={field} className="p-2 border">
                {t(field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.length >0 && users.map((user) => (
            <tr
              key={user.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(user.id)}
            >
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">{user.first_name}</td>
              <td className="p-2 border">{user.last_name}</td>
              <td className="p-2 border">{user.company_name}</td>
              <td className="p-2 border">{user.company_register_number}</td>
              <td className="p-2 border">{user.company_credit}</td>
              <td className="p-2 border">{user.company_period}</td>
              <td className="p-2 border">{t(user.is_active ? 'Active' : 'Inactive' )} </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactPaginate
        previousLabel={`→ ${t("prev")}`}

        nextLabel={`${t("next")} ←`}
        breakLabel={"..."}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageChange}
        containerClassName={"pagination"}
        activeClassName={"active"}
        pageLabelBuilder={(page) => formatLocal(page)}
      />
    </div>
  );
};

export default ManagedUsersPage;
