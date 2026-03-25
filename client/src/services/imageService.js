// /client/src/services/imageService.js
import api from '../api/axios';

export async function fetchImageForQuery(query) {
  if (!query) return '';

  try {
    const response = await api.get('/teacher/search-image', {
      params: { query },
    });

    return response.data?.imageUrl || '';
  } catch (error) {
    return '';
  }
}
