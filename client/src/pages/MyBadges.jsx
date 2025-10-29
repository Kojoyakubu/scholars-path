import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';

// Redux
import { getMyBadges, getAiInsights } from '../features/student/studentSlice';

// Shared AI card
import AIInsightsCard from '../../components/AIInsightsCard';

const BadgeCard = ({ name, description, dateAwarded, icon }) => (
  <Card
    elevation={2}
    component={motion.div}
    whileHover={{ scale: 1.02 }}
    sx={{ borderRadius: 2 }}
  >
    <CardHeader
      avatar={
        <Avatar sx={{ bgcolor: 'warning.main' }}>
          {icon ? <img src={icon} alt="badge" style={{ width: 28, height: 28 }} /> : <EmojiEventsIcon />}
        </Avatar>
      }
      title={<Typography variant="h6">{name}</Typography>}
      subheader={
        <Chip
          label={new Date(dateAwarded).toLocaleDateString()}
          size="small"
          color="default"
          variant="outlined"
        />
      }
    />
    <CardContent>
      <Typography color="text.secondary">{description || '—'}</Typography>
    </CardContent>
  </Card>
);

const MyBadges = () => {
  const dispatch = useDispatch();
  const { badges, isLoading, error, aiInsights } = useSelector((s) => s.student);

  useEffect(() => {
    dispatch(getMyBadges());
    dispatch(getAiInsights({ endpoint: '/api/student/badges/insights' }));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading your badges…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Failed to load badges: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Badges
      </Typography>

      {Array.isArray(badges) && badges.length > 0 ? (
        <Grid container spacing={3}>
          {badges.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b._id}>
              <BadgeCard
                name={b.badge?.name || b.name}
                description={b.badge?.description || b.description}
                dateAwarded={b.dateAwarded || b.createdAt || Date.now()}
                icon={b.badge?.icon}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">You haven’t earned any badges yet.</Typography>
      )}

      {aiInsights && (
        <AIInsightsCard title="AI Insights on Your Achievements" content={aiInsights} />
      )}
    </Container>
  );
};

export default MyBadges;
