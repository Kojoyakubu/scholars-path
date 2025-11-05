// /client/src/features/curriculum/curriculumService.js
import api from '../../api/axios';

// ✅ Get all items of a specific type
const getItems = async (entity) => {
  const response = await api.get(`/api/curriculum/${entity}`);
  return response.data;
};

// ✅ Get children of a specific parent
const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
  const response = await api.get(`/api/curriculum/${parentEntity}/${parentId}/${entity}`);
  return response.data;
};

// ✅ Create a new item
const createItem = async ({ entity, itemData }) => {
  const response = await api.post(`/api/curriculum/${entity}`, itemData);
  return response.data;
};

// ✅ Update an item
const updateItem = async ({ entity, itemId, itemData }) => {
  const response = await api.put(`/api/curriculum/${entity}/${itemId}`, itemData);
  return response.data;
};

// ✅ Delete an item
const deleteItem = async ({ entity, itemId }) => {
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