// src/features/curriculum/curriculumService.js
import api from '../../api/axios';

const getItems = async (entity) => {
  const response = await api.get(`/curriculum/${entity}`);
  return response.data;
};

const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
  const response = await api.get(`/curriculum/${parentEntity}/${parentId}/${entity}`);
  return response.data;
};

const createItem = async ({ entity, itemData }) => {
  const response = await api.post(`/curriculum/${entity}`, itemData);
  return response.data;
};

const updateItem = async ({ entity, itemData }) => {
  const { id, ...dataToUpdate } = itemData;
  const response = await api.put(`/curriculum/${entity}/${id}`, dataToUpdate);
  return response.data;
};

const deleteItem = async ({ entity, itemId }) => {
  await api.delete(`/curriculum/${entity}/${itemId}`);
  return itemId;
};

export default { getItems, getChildrenOf, createItem, updateItem, deleteItem };
