// src/features/curriculum/curriculumService.js (Revised)

import api from '../../api/axios'; // <-- Import our new centralized instance

// Generic function to get all items of a type (e.g., all levels)
const getItems = async (entity) => {
  const response = await api.get(`/curriculum/${entity}`);
  return response.data;
};

// Generic function to get children of a parent (e.g., classes of a level)
const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
    const response = await api.get(`/curriculum/${parentEntity}/${parentId}/${entity}`);
    return response.data;
}

// Generic function to create an item
const createItem = async ({ entity, itemData }) => {
  const response = await api.post(`/curriculum/${entity}`, itemData);
  return response.data;
};

// Generic function to update an item
const updateItem = async ({ entity, itemData }) => {
  // Destructure id and name from itemData
  const { id, ...dataToUpdate } = itemData;
  const response = await api.put(`/curriculum/${entity}/${id}`, dataToUpdate);
  return response.data;
};

// Generic function to delete an item
const deleteItem = async ({ entity, itemId }) => {
  await api.delete(`/curriculum/${entity}/${itemId}`);
  return itemId; // Return the ID for easy removal from state
};

const curriculumService = {
  getItems,
  getChildrenOf,
  createItem,
  updateItem,
  deleteItem,
};

export default curriculumService;