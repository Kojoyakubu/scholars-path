import React from 'react';
import { Box, Typography, Grid, Stack, Badge } from '@mui/material';
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
  </>
);

export default DashboardActionsAndStats;
