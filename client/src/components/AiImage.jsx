import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import api from '../api/axios'; // Your centralized axios instance

const AiImage = ({ text }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract the search query from the placeholder, e.g., "[DIAGRAM: parts of a computer]"
    const match = text.match(/\[DIAGRAM:\s*(.*?)\]/);
    const query = match ? match[1] : null;

    if (!query) {
      setIsLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const response = await api.get(`/teacher/search-image?query=${query}`);
        if (response.data.imageUrl) {
          setImageUrl(response.data.imageUrl);
        } else {
          setError('No relevant image found.');
        }
      } catch (err) {
        setError('Failed to load image.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [text]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}><CircularProgress size={20} /><Typography variant="caption">Loading image...</Typography></Box>;
  }

  if (error) {
    return <Typography variant="caption" color="error">{error}</Typography>;
  }

  if (imageUrl) {
    return (
      <Box component="img" src={imageUrl} alt={text} sx={{ maxWidth: '100%', height: 'auto', my: 2, borderRadius: 1 }} />
    );
  }

  return null; // Render nothing if it's not a valid diagram placeholder
};

export default AiImage;