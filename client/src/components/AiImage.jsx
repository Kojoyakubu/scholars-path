import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import api from '../api/axios'; // ✅ THE FIX IS HERE: Import your centralized axios instance.

const AiImage = ({ text }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract the search query from the placeholder, e.g., "[DIAGRAM: parts of a computer]"
    const match = text.match(/\[DIAGRAM:\s*(.*?)\]/);
    const query = match ? match[1] : null;

    if (!query) {
      // If the text isn't a valid diagram placeholder, do nothing.
      setIsLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        // Make the API call to your backend's new route
        const response = await api.get(`/teacher/search-image?query=${query}`);
        if (response.data.imageUrl) {
          setImageUrl(response.data.imageUrl);
        } else {
          setError(`No relevant image found for "${query}".`);
        }
      } catch (err) {
        console.error("Image fetch error:", err); // Log the actual error for debugging
        setError('Failed to load image from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [text]); // This effect runs whenever the 'text' prop changes

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="caption">Loading image...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ my: 2, p: 2, border: '1px dashed', borderColor: 'error.main', borderRadius: 1 }}>
            <Typography variant="caption" color="error">{error}</Typography>
        </Box>
    );
  }

  if (imageUrl) {
    return (
      <Box 
        component="img" 
        src={imageUrl} 
        alt={text} 
        sx={{ 
          maxWidth: '100%', 
          height: 'auto', 
          my: 2, 
          borderRadius: 2,
          boxShadow: 3 
        }} 
      />
    );
  }

  return null; // Render nothing if there's no query, error, or image URL
};

export default AiImage;