// /client/src/features/curriculum/curriculumService.js
import api from '../../api/axios';

// Get all items of a specific type
const getItems = async (entity) => {
  const response = await api.get(`/api/curriculum/${entity}`);
  return response.data;
};

// Get children of a specific parent
const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
  const response = await api.get(`/api/curriculum/${parentEntity}/${parentId}/${entity}`);
  return response.data;
};

// Create a new item
const createItem = async ({ entity, itemData }) => {
  const response = await api.post(`/api/curriculum/${entity}`, itemData);
  return response.data;
};

// Update an item
const updateItem = async ({ entity, itemData }) => {
  const { id, ...dataToUpdate } = itemData;
  const response = await api.put(`/api/curriculum/${entity}/${id}`, dataToUpdate);
  return response.data;
};

// Delete an item
const deleteItem = async ({ entity, itemId }) => {
  await api.delete(`/api/curriculum/${entity}/${itemId}`);
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