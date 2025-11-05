// /client/src/features/curriculum/curriculumService.js
import api from '../../api/axios';

// ✅ Generic fetch for items (levels, classes, subjects, strands, substrands)
const getItems = async (entity) => {
  try {
    const response = await api.get(`/api/curriculum/${entity}`);
    return response.data;
  } catch (error) {
    // 🩵 Fallback for teachers: if admin-only route is restricted, read from admin route
    if (entity === 'levels') {
      const fallback = await api.get('/api/admin/levels');
      return fallback.data;
    }
    throw error;
  }
};

// ✅ Fetch children of a specific parent entity
const getChildrenOf = async (entity, parentId) => {
  const response = await api.get(`/api/curriculum/${entity}/parent/${parentId}`);
  return response.data;
};

// ✅ Create a new curriculum item
const createItem = async (entity, itemData) => {
  const response = await api.post(`/api/curriculum/${entity}`, itemData);
  return response.data;
};

// ✅ Update an existing item
const updateItem = async (entity, itemId, itemData) => {
  const response = await api.put(`/api/curriculum/${entity}/${itemId}`, itemData);
  return response.data;
};

// ✅ Delete an item
const deleteItem = async (entity, itemId) => {
  const response = await api.delete(`/api/curriculum/${entity}/${itemId}`);
  return response.data;
};

const curriculumService = {
  getItems,
  getChildrenOf,
  createItem,
  updateItem,
  deleteItem,
};

export default curriculumService;
