import React from 'react';
import { Box, Typography, Grid, Stack, Badge, Divider, Card } from '@mui/material';
import PolishedStatCard from './Polishedstatcard';
import { Article, Preview, Quiz, Assessment, AddCircle, School } from '@mui/icons-material';

const DashboardActionsAndStats = ({
  draftLearnerNotes,
  lessonNotes,
  teacherAnalytics,
  setActiveTab,
  setIsAiQuizModalOpen,
  theme,
  refreshing,
  handleRefresh
}) => (
  <>

    {/* Stats Overview */}
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Overview</Typography>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <PolishedStatCard
          icon={Article}
          label="Lesson Notes"
          value={lessonNotes?.length || 0}
          color={theme.palette.primary.main}
          subtitle="Published notes"
          onClick={() => setActiveTab(1)}
          delay={0}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <PolishedStatCard
          icon={Preview}
          label="Draft Notes"
          value={draftLearnerNotes?.length || 0}
          color={theme.palette.secondary.main}
          subtitle="Pending review"
          onClick={() => setActiveTab(2)}
          delay={0.1}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <PolishedStatCard
          icon={Quiz}
          label="AI Quizzes"
          value={teacherAnalytics?.totalQuizzes || 0}
          color={theme.palette.warning.main}
          subtitle="Total generated"
          delay={0.2}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <PolishedStatCard
          icon={School}
          label="Students Reached"
          value={teacherAnalytics?.totalStudents || 0}
          color={theme.palette.success.main}
          subtitle="Across all classes"
          delay={0.3}
        />
      </Grid>
    </Grid>

    {/* Feature tiles */}
    <Divider sx={{ my: 4 }} />
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Quick Links</Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{ cursor: 'pointer', p: 2, textAlign: 'center', height: '100%' }}
          onClick={() => setActiveTab(0)}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>Create New</Typography>
          <Typography variant="body2" color="text.secondary">Generate a lesson bundle</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{ cursor: 'pointer', p: 2, textAlign: 'center', height: '100%' }}
          onClick={() => setActiveTab(1)}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>Lesson Notes</Typography>
          <Typography variant="body2" color="text.secondary">View your published notes</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{ cursor: 'pointer', p: 2, textAlign: 'center', height: '100%' }}
          onClick={() => setActiveTab(2)}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>Quizzes</Typography>
          <Typography variant="body2" color="text.secondary">Manage generated quizzes</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{ cursor: 'pointer', p: 2, textAlign: 'center', height: '100%' }}
          onClick={() => setActiveTab(3)}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>Analysis</Typography>
          <Typography variant="body2" color="text.secondary">View your analytics</Typography>
        </Card>
      </Grid>
    </Grid>
  </>
);

export default DashboardActionsAndStats;
