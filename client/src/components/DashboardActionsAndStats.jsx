import React from 'react';
import { Box, Typography, Grid, Stack, Badge } from '@mui/material';
import QuickActionCard from './QuickActionCard';
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
    {/* Quick Actions */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Quick Actions</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Create Lesson"
            description="Generate AI-powered lesson notes"
            icon={AddCircle}
            color={theme.palette.primary.main}
            onClick={() => setActiveTab(0)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Review Drafts"
            description={`${draftLearnerNotes?.length || 0} notes pending`}
            icon={Preview}
            color={theme.palette.secondary.main}
            onClick={() => setActiveTab(2)}
            badge={draftLearnerNotes?.length > 0 ? draftLearnerNotes.length : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Create Quiz"
            description="AI-generated assessments"
            icon={Quiz}
            color={theme.palette.warning.main}
            onClick={() => setIsAiQuizModalOpen(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View Analytics"
            description="Track your performance"
            icon={Assessment}
            color={theme.palette.success.main}
            onClick={() => setActiveTab(3)}
          />
        </Grid>
      </Grid>
    </Box>

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
