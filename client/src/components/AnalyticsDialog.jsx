/**
 * Teacher Analytics dialog — extracted from TeacherDashboard.
 */
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { OpenInFull, CloseFullscreen } from '@mui/icons-material';

const analyticsKpiCardSx = {
  p: 2,
  height: '100%',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 0,
  bgcolor: 'background.paper',
};

const dialogBodySx = {
  overflowY: 'auto',
  bgcolor: 'background.default',
  py: 2,
};

function FullscreenTitle({ title, isFullscreen, onToggle }) {
  return (
    <DialogTitle sx={{ pb: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
          <IconButton size="small" onClick={onToggle}>
            {isFullscreen ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </DialogTitle>
  );
}

export default function AnalyticsDialog({
  open,
  onClose,
  analyticsSummary,
  fullScreen = false,
  onToggleFullscreen,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      scroll="paper"
      fullWidth
      maxWidth={fullScreen ? false : 'lg'}
    >
      <FullscreenTitle title="Analytics" isFullscreen={fullScreen} onToggle={onToggleFullscreen} />
      <DialogContent tabIndex={0} sx={dialogBodySx}>
        {/* KPI row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={analyticsKpiCardSx}>
              <Typography variant="caption" color="text.secondary">Lesson Notes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalLessonNotes}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={analyticsKpiCardSx}>
              <Typography variant="caption" color="text.secondary">Learner Notes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalLearnerNotes}</Typography>
              <Typography variant="body2" color="text.secondary">
                {analyticsSummary.publishedLearnerNotes} published &bull; {analyticsSummary.draftOnlyLearnerNotes} draft
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={analyticsKpiCardSx}>
              <Typography variant="caption" color="text.secondary">Quizzes Generated</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{analyticsSummary.totalQuizzes}</Typography>
              <Typography variant="body2" color="text.secondary">{analyticsSummary.totalQuizAttempts} attempts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={analyticsKpiCardSx}>
              <Typography variant="caption" color="text.secondary">Average Quiz Score</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Number(analyticsSummary.avgQuizScore).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analyticsSummary.totalNoteViews} note views &bull; {analyticsSummary.totalBundles} bundles
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Activity + Topics */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {analyticsSummary.last30Count} actions in the last 30 days
              </Typography>
              {analyticsSummary.recentActivity.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No recent activity yet.</Typography>
              ) : (
                <List sx={{ pt: 0 }}>
                  {analyticsSummary.recentActivity.map((entry, index) => (
                    <ListItem key={`${entry.type}-${entry.date}-${index}`} sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemText
                        primary={`${entry.type}: ${entry.title}`}
                        secondary={new Date(entry.date).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Top Topics</Typography>
              {analyticsSummary.topTopics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No topic data available yet.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {analyticsSummary.topTopics.map((topic) => (
                    <Box key={topic.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{topic.name}</Typography>
                        <Chip label={`${topic.count}`} size="small" color="primary" variant="outlined" />
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 8, bgcolor: 'grey.200', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            bgcolor: 'primary.main',
                            width: `${Math.min(100, (topic.count / Math.max(...analyticsSummary.topTopics.map((item) => item.count))) * 100)}%`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
