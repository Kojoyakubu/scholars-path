// /client/src/features/curriculum/curriculumService.js
import api from '../../api/axios';

// Get all items of a specific type
const getItems = async (entity) => {
  // ✅ FIX: Changed path from /api/curriculum/${entity} to /api/${entity}
  const response = await api.get(`/api/${entity}`);
  return response.data;
};

// Get children of a specific parent
const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
  // ✅ FIX: Changed path to match the simpler, more direct route
  const response = await api.get(`/api/${parentEntity}/${parentId}/${entity}`);
  return response.data;
};

// Create a new item
const createItem = async ({ entity, itemData }) => {
  // ✅ FIX: Changed path
  const response = await api.post(`/api/${entity}`, itemData);
  return response.data;
};

// Update an item
const updateItem = async ({ entity, itemData }) => {
  const { id, ...dataToUpdate } = itemData;
  // ✅ FIX: Changed path
  const response = await api.put(`/api/${entity}/${id}`, dataToUpdate);
  return response.data;
};

// Delete an item
const deleteItem = async ({ entity, itemId }) => {
  // ✅ FIX: Changed path
  await api.delete(`/api/${entity}/${itemId}`);
  return itemId;
};

const curriculumService = {
  getItems,
  getChildrenOf,
  createItem,
  updateItem,
  deleteItem,
};

export default curriculumService;