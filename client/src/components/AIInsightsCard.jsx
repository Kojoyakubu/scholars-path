// /client/src/components/AIInsightsCard.jsx
import DOMPurify from 'dompurify';
import { Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AIInsightsCard = ({
  title = 'AI Insights',
  content,
  elevation,
  paperSx,
  titleSx,
  contentSx,
  titleVariant = 'h6',
  contentVariant = 'body1',
  contentAsHtml = false,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.6 },
}) => {
  if (!content) return null;

  const sanitizedHtml = contentAsHtml ? DOMPurify.sanitize(String(content)) : '';

  return (
    <Paper
      elevation={elevation}
      sx={{ p: 3, mt: 4, borderLeft: '6px solid #6c63ff', borderRadius: 2, ...paperSx }}
      component={motion.div}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <Typography variant={titleVariant} gutterBottom sx={titleSx}>{title}</Typography>
      {contentAsHtml ? (
        <Typography
          variant={contentVariant}
          color="text.secondary"
          sx={contentSx}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        <Typography variant={contentVariant} color="text.secondary" whiteSpace="pre-line" sx={contentSx}>
          {content}
        </Typography>
      )}
    </Paper>
  );
};

export default AIInsightsCard;
