import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ViewModule,
  Edit,
  Delete,
  FileCopy,
  Visibility,
  Search,
  FilterList,
  MoreVert,
  Article,
  Quiz,
  School,
  CheckCircle,
  Archive,
  Folder,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getMyBundles,
  getBundleById,
  updateBundle,
  deleteBundle,
  duplicateBundle,
  resetTeacherState,
} from '../features/teacher/teacherSlice';

/**
 * BundleManager Component
 * Complete CRUD interface for managing lesson bundles
 * Features: View, Edit, Delete, Duplicate, Filter, Search
 */
function BundleManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { bundles, isLoading, isSuccess, isError, message } = useSelector((state) => state.teacher);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBundle, setSelectedBundle] = useState(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'published',
    tags: [],
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Load bundles on mount
  useEffect(() => {
    dispatch(getMyBundles());
  }, [dispatch]);
  
  // Handle success/error messages
  useEffect(() => {
    if (isSuccess && message) {
      setSnackbar({ open: true, message, severity: 'success' });
      dispatch(resetTeacherState());
    }
    if (isError && message) {
      setSnackbar({ open: true, message, severity: 'error' });
      dispatch(resetTeacherState());
    }
  }, [isSuccess, isError, message, dispatch]);
  
  // Filter bundles
  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch = bundle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bundle.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || bundle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Handlers
  const handleMenuOpen = (event, bundle) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBundle(bundle);
  };
  
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };
  
  const handleView = (bundle) => {
    setSelectedBundle(bundle);
    dispatch(getBundleById(bundle._id));
    setViewDialogOpen(true);
    handleMenuClose();
  };
  
  const handleEdit = (bundle) => {
    setSelectedBundle(bundle);
    setEditForm({
      title: bundle.title || '',
      description: bundle.description || '',
      status: bundle.status || 'published',
      tags: bundle.tags || [],
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDelete = (bundle) => {
    setSelectedBundle(bundle);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDuplicate = async (bundle) => {
    await dispatch(duplicateBundle(bundle._id));
    handleMenuClose();
  };
  
  const confirmEdit = async () => {
    await dispatch(updateBundle({
      bundleId: selectedBundle._id,
      bundleData: editForm,
    }));
    setEditDialogOpen(false);
    dispatch(getMyBundles()); // Refresh list
  };
  
  const confirmDelete = async () => {
    await dispatch(deleteBundle(selectedBundle._id));
    setDeleteDialogOpen(false);
  };
  
  // Status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };
  
  if (isLoading && bundles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header & Controls */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          placeholder="Search bundles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={(e) => {
            // Simple status toggle
            const statuses = ['all', 'published', 'draft', 'archived'];
            const currentIndex = statuses.indexOf(statusFilter);
            setStatusFilter(statuses[(currentIndex + 1) % statuses.length]);
          }}
        >
          {statusFilter === 'all' ? 'All' : statusFilter}
        </Button>
      </Stack>
      
      {/* Bundles Grid */}
      {filteredBundles.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {searchTerm || statusFilter !== 'all' 
            ? 'No bundles match your filters' 
            : 'No lesson bundles yet. Generate your first bundle from the curriculum!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredBundles.map((bundle) => (
              <Grid item xs={12} md={6} lg={4} key={bundle._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Title & Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1, pr: 1 }}>
                          {bundle.title}
                        </Typography>
                        <Chip
                          label={bundle.status}
                          size="small"
                          color={getStatusColor(bundle.status)}
                          icon={bundle.status === 'published' ? <CheckCircle /> : <Archive />}
                        />
                      </Stack>
                      
                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {bundle.description || 'No description'}
                      </Typography>
                      
                      {/* Metadata */}
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Tooltip title="Lesson Note">
                          <Chip icon={<Article />} label="Note" size="small" variant="outlined" />
                        </Tooltip>
                        <Tooltip title="Quiz">
                          <Chip icon={<Quiz />} label="Quiz" size="small" variant="outlined" />
                        </Tooltip>
                        <Tooltip title="Learner Note">
                          <Chip icon={<School />} label="Learner" size="small" variant="outlined" />
                        </Tooltip>
                      </Stack>
                      
                      {/* Tags */}
                      {bundle.tags && bundle.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                          {bundle.tags.slice(0, 3).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" variant="outlined" />
                          ))}
                          {bundle.tags.length > 3 && (
                            <Chip label={`+${bundle.tags.length - 3}`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      )}
                      
                      {/* Date */}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Created: {new Date(bundle.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <Divider />
                    
                    {/* Actions */}
                    <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                      <Button size="small" startIcon={<Visibility />} onClick={() => handleView(bundle)}>
                        View
                      </Button>
                      
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, bundle)}>
                        <MoreVert />
                      </IconButton>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
      
      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleView(selectedBundle)}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedBundle)}>
          <Edit sx={{ mr: 1 }} /> Edit Info
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate(selectedBundle)}>
          <FileCopy sx={{ mr: 1 }} /> Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDelete(selectedBundle)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bundle Information</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Bundle?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedBundle?.title}"? This will permanently delete:
            <ul>
              <li>Teacher Lesson Note</li>
              <li>Learner Note</li>
              <li>Quiz and all questions</li>
            </ul>
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Bundle Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Bundle Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedBundle && (
            <Stack spacing={3}>
              {/* Bundle Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedBundle.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedBundle.description || 'No description'}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    label={selectedBundle.status} 
                    size="small" 
                    color={getStatusColor(selectedBundle.status)}
                  />
                  {selectedBundle.tags?.map((tag, idx) => (
                    <Chip key={idx} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
              
              <Divider />
              
              {/* Components Summary */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  📦 Bundle Components
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Article fontSize="small" color="primary" />
                    <Typography variant="body2">Teacher Lesson Note</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <School fontSize="small" color="secondary" />
                    <Typography variant="body2">Learner Note (Status: {selectedBundle.learnerNote?.status || 'N/A'})</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Quiz fontSize="small" color="success" />
                    <Typography variant="body2">Quiz: {selectedBundle.quiz?.title || 'N/A'}</Typography>
                  </Stack>
                </Stack>
              </Box>
              
              <Divider />
              
              {/* Generation Context */}
              {selectedBundle.generationContext && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    📋 Generation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">School</Typography>
                      <Typography variant="body2">{selectedBundle.generationContext.school}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Class</Typography>
                      <Typography variant="body2">{selectedBundle.generationContext.className}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Subject</Typography>
                      <Typography variant="body2">{selectedBundle.generationContext.subjectName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Term / Week</Typography>
                      <Typography variant="body2">Term {selectedBundle.generationContext.term}, Week {selectedBundle.generationContext.week}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Content Standard</Typography>
                      <Typography variant="body2">{selectedBundle.generationContext.contentStandardCode}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <Divider />
              
              {/* Metadata */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  ℹ️ Metadata
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {new Date(selectedBundle.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Updated:</strong> {new Date(selectedBundle.updatedAt).toLocaleString()}
                  </Typography>
                  {selectedBundle.aiProvider && (
                    <Typography variant="body2">
                      <strong>AI Provider:</strong> {selectedBundle.aiProvider} ({selectedBundle.aiModel})
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => {
              setViewDialogOpen(false);
              handleEdit(selectedBundle);
            }}
            startIcon={<Edit />}
            variant="outlined"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      {snackbar.open && (
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
}

export default BundleManager;