// /client/src/features/curriculum/curriculumService.js
import api from '../../api/axios';

//
// ✅✅ THIS IS THE FIX ✅✅
//
// The 'getItems' function was expecting (entity) but the thunk passes ({ entity })
// Change the function signature to de-structure the object argument
const getItems = async ({ entity }) => {
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
const getChildrenOf = async ({ entity, parentEntity, parentId }) => {
  // 'entity' is the child type (e.g., 'classes')
  // 'parentEntity' is the parent type (e.g., 'levels')
  // This now matches the backend route: /:parentType/:parentId/:childType
  const response = await api.get(
    `/api/curriculum/${parentEntity}/${parentId}/${entity}`
  );
  return response.data;
};

// ✅ Create a new curriculum item
// (No change needed here, but ensure your thunk calls it correctly)
const createItem = async ({ entity, itemData }) => {
  const response = await api.post(`/api/curriculum/${entity}`, itemData);
  return response.data;
};

// ✅ Update an existing item
// (No change needed here, but ensure your thunk calls it correctly)
const updateItem = async ({ entity, itemId, itemData }) => {
  const response = await api.put(`/api/curriculum/${entity}/${itemId}`, itemData);
  return response.data;
};

// ✅ Delete an item
// (No change needed here, but ensure your thunk calls it correctly)
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