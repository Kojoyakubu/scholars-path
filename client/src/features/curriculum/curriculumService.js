import axios from 'axios';

const API_URL = '/api/curriculum/';

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Generic function to get all items of a type
const getItems = async (entity, token) => {
  const response = await axios.get(API_URL + entity, getConfig(token));
  return response.data;
};

// NEW generic function to get children of a parent
const getChildrenOf = async ({ entity, parentEntity, parentId }, token) => {
    const response = await axios.get(API_URL + `${parentEntity}/${parentId}/${entity}`, getConfig(token));
    return response.data;
}

// Generic function to create an item
const createItem = async (entity, itemData, token) => {
  const response = await axios.post(API_URL + entity, itemData, getConfig(token));
  return response.data;
};

// Generic function to update an item
const updateItem = async (entity, itemData, token) => {
  const response = await axios.put(API_URL + `${entity}/${itemData.id}`, { name: itemData.name }, getConfig(token));
  return response.data;
};

// Generic function to delete an item
const deleteItem = async (entity, itemId, token) => {
  await axios.delete(API_URL + `${entity}/${itemId}`, getConfig(token));
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