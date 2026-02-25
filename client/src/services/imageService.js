// /client/src/services/imageService.js
import axios from 'axios';

// Unsplash integration. Expect VITE_UNSPLASH_ACCESS_KEY to be defined in .env.
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_KEY) {
  console.warn('Unsplash key is not set. Image searches will fail.');
}

export async function fetchImageForQuery(query) {
  if (!query) return '';
  try {
    const resp = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });
    return resp.data?.results?.[0]?.urls?.regular || '';
  } catch (err) {
    console.error('Unsplash search failed:', err.message);
    return '';
  }
}
