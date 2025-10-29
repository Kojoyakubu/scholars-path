// /client/src/components/AIInsightsCard.jsx
import { Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AIInsightsCard = ({ title = "AI Insights", content }) => {
  if (!content) return null;
  return (
    <Paper
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #6c63ff', borderRadius: 2 }}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
        {content}
      </Typography>
    </Paper>
  );
};

export default AIInsightsCard;
