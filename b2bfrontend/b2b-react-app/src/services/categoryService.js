import axiosInstance from '../components/axiosInstance';

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/api/categories/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single category by ID
  getCategory: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/categories/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/api/categories/', categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(`/api/categories/${id}/`, categoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`/api/categories/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
}; 