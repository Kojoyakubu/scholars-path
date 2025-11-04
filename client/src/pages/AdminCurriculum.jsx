// /client/src/pages/AdminCurriculum.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import api from '../api/axios';

const AdminCurriculum = () => {
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStrand, setSelectedStrand] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [parentId, setParentId] = useState('');
  const [newName, setNewName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all levels on mount
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/curriculum/levels');
      setLevels(response.data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      setError('Failed to load levels');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesForLevel = async (levelId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/curriculum/levels/${levelId}/classes`);
      setClasses(response.data || []);
      setSelectedLevel(levelId);
      // Clear lower levels
      setSubjects([]);
      setStrands([]);
      setSubStrands([]);
      setSelectedClass(null);
      setSelectedSubject(null);
      setSelectedStrand(null);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/curriculum/classes/${classId}/subjects`);
      setSubjects(response.data || []);
      setSelectedClass(classId);
      // Clear lower levels
      setStrands([]);
      setSubStrands([]);
      setSelectedSubject(null);
      setSelectedStrand(null);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrandsForSubject = async (subjectId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/curriculum/subjects/${subjectId}/strands`);
      setStrands(response.data || []);
      setSelectedSubject(subjectId);
      // Clear lower levels
      setSubStrands([]);
      setSelectedStrand(null);
    } catch (error) {
      console.error('Error fetching strands:', error);
      setError('Failed to load strands');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubStrandsForStrand = async (strandId) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/curriculum/strands/${strandId}/sub-strands`);
      setSubStrands(response.data || []);
      setSelectedStrand(strandId);
    } catch (error) {
      console.error('Error fetching sub-strands:', error);
      setError('Failed to load sub-strands');
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const handleCreate = async () => {
    try {
      if (!dialogType || !newName.trim()) return;
      
      setLoading(true);
      setError('');
      
      const payload = { name: newName.trim() };
      if (parentId) {
        payload.parentId = parentId;
      }
      
      await api.post(`/api/curriculum/${dialogType}`, payload);

      // Refresh the appropriate list
      if (dialogType === 'levels') {
        fetchLevels();
      } else if (dialogType === 'classes' && selectedLevel) {
        fetchClassesForLevel(selectedLevel);
      } else if (dialogType === 'subjects' && selectedClass) {
        fetchSubjectsForClass(selectedClass);
      } else if (dialogType === 'strands' && selectedSubject) {
        fetchStrandsForSubject(selectedSubject);
      } else if (dialogType === 'sub-strands' && selectedStrand) {
        fetchSubStrandsForStrand(selectedStrand);
      }

      setNewName('');
      setDialogOpen(false);
    } catch (error) {
      console.error(`Error creating ${dialogType}:`, error);
      setError(`Failed to create ${dialogType}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete item
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/curriculum/${type}/${id}`);

      // Refresh the appropriate list
      if (type === 'levels') {
        fetchLevels();
        setClasses([]);
        setSubjects([]);
        setStrands([]);
        setSubStrands([]);
      } else if (type === 'classes' && selectedLevel) {
        fetchClassesForLevel(selectedLevel);
      } else if (type === 'subjects' && selectedClass) {
        fetchSubjectsForClass(selectedClass);
      } else if (type === 'strands' && selectedSubject) {
        fetchStrandsForSubject(selectedSubject);
      } else if (type === 'sub-strands' && selectedStrand) {
        fetchSubStrandsForStrand(selectedStrand);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setError(`Failed to delete ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type, parent = '') => {
    setDialogType(type);
    setParentId(parent);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Curriculum Management
          </Typography>
          <Tooltip title="Refresh All">
            <IconButton onClick={fetchLevels}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog('levels')}
            size="small"
          >
            New Level
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* LEVELS */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Levels
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {levels.map((level) => (
              <TableRow 
                key={level._id}
                sx={{ 
                  bgcolor: selectedLevel === level._id ? '#E8F5E9' : 'transparent',
                  '&:hover': { bgcolor: '#F1F8E9' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => fetchClassesForLevel(level._id)}
                      color={selectedLevel === level._id ? 'primary' : 'default'}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                    {level.name}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Add Class">
                    <IconButton onClick={() => openDialog('classes', level._id)} size="small">
                      <AddIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Level">
                    <IconButton onClick={() => handleDelete('levels', level._id)} size="small">
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* CLASSES */}
        {classes.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
              Classes (for selected level)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((c) => (
                  <TableRow 
                    key={c._id}
                    sx={{ 
                      bgcolor: selectedClass === c._id ? '#E8F5E9' : 'transparent',
                      '&:hover': { bgcolor: '#F1F8E9' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => fetchSubjectsForClass(c._id)}
                          color={selectedClass === c._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {c.name}
                      </Box>
                    </TableCell>
                    <TableCell>{c.level?.name || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Add Subject">
                        <IconButton onClick={() => openDialog('subjects', c._id)} size="small">
                          <AddIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Class">
                        <IconButton onClick={() => handleDelete('classes', c._id)} size="small">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* SUBJECTS */}
        {subjects.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
              Subjects (for selected class)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((s) => (
                  <TableRow 
                    key={s._id}
                    sx={{ 
                      bgcolor: selectedSubject === s._id ? '#E8F5E9' : 'transparent',
                      '&:hover': { bgcolor: '#F1F8E9' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => fetchStrandsForSubject(s._id)}
                          color={selectedSubject === s._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {s.name}
                      </Box>
                    </TableCell>
                    <TableCell>{s.class?.name || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Add Strand">
                        <IconButton onClick={() => openDialog('strands', s._id)} size="small">
                          <AddIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Subject">
                        <IconButton onClick={() => handleDelete('subjects', s._id)} size="small">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* STRANDS */}
        {strands.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
              Strands (for selected subject)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {strands.map((st) => (
                  <TableRow 
                    key={st._id}
                    sx={{ 
                      bgcolor: selectedStrand === st._id ? '#E8F5E9' : 'transparent',
                      '&:hover': { bgcolor: '#F1F8E9' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => fetchSubStrandsForStrand(st._id)}
                          color={selectedStrand === st._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {st.name}
                      </Box>
                    </TableCell>
                    <TableCell>{st.subject?.name || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Add Sub-Strand">
                        <IconButton onClick={() => openDialog('sub-strands', st._id)} size="small">
                          <AddIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Strand">
                        <IconButton onClick={() => handleDelete('strands', st._id)} size="small">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* SUB-STRANDS */}
        {subStrands.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
              Sub-Strands (for selected strand)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Strand</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subStrands.map((ss) => (
                  <TableRow key={ss._id}>
                    <TableCell>{ss.name}</TableCell>
                    <TableCell>{ss.strand?.name || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete Sub-Strand">
                        <IconButton onClick={() => handleDelete('sub-strands', ss._id)} size="small">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>

      {/* Create Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create {dialogType?.replace('-', ' ').toUpperCase()}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            sx={{ mt: 2 }}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim() || loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCurriculum;