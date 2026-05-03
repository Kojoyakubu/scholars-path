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
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchItems,
  fetchChildren,
  createItem,
  updateItem,
  deleteItem,
  clearChildren,
  copySubjectCurriculum,
} from '../features/curriculum/curriculumSlice';

const normalizeEntity = (type) => (type === 'sub-strands' ? 'subStrands' : type);

const AdminCurriculum = () => {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands, isLoading } = useSelector((state) => state.curriculum);

  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStrand, setSelectedStrand] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [parentId, setParentId] = useState('');
  const [newName, setNewName] = useState('');

  const [editingItem, setEditingItem] = useState(null); // { type, id }
  const [editName, setEditName] = useState('');

  const [error, setError] = useState('');

  // Copy subject curriculum state
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceSubject, setCopySourceSubject] = useState(null); // { _id, name }
  const [copyTargetClassIds, setCopyTargetClassIds] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Fetch all levels on mount
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setError('');
      await dispatch(fetchItems({ entity: 'levels' })).unwrap();
    } catch {
      setError('Failed to load levels');
    }
  };

  const fetchClassesForLevel = async (levelId) => {
    try {
      setError('');
      await dispatch(
        fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: levelId })
      ).unwrap();
      setSelectedLevel(levelId);
      dispatch(clearChildren({ entities: ['subjects', 'strands', 'subStrands'] }));
      setSelectedClass(null);
      setSelectedSubject(null);
      setSelectedStrand(null);
    } catch {
      setError('Failed to load classes');
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      setError('');
      await dispatch(
        fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: classId })
      ).unwrap();
      setSelectedClass(classId);
      dispatch(clearChildren({ entities: ['strands', 'subStrands'] }));
      setSelectedSubject(null);
      setSelectedStrand(null);
    } catch {
      setError('Failed to load subjects');
    }
  };

  const fetchStrandsForSubject = async (subjectId) => {
    try {
      setError('');
      await dispatch(
        fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: subjectId })
      ).unwrap();
      setSelectedSubject(subjectId);
      dispatch(clearChildren({ entities: ['subStrands'] }));
      setSelectedStrand(null);
    } catch {
      setError('Failed to load strands');
    }
  };

  const fetchSubStrandsForStrand = async (strandId) => {
    try {
      setError('');
      await dispatch(
        fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: strandId })
      ).unwrap();
      setSelectedStrand(strandId);
    } catch {
      setError('Failed to load sub-strands');
    }
  };

  // Create new item
  const handleCreate = async () => {
    try {
      if (!dialogType || !newName.trim()) return;

      setError('');

      const itemData = { name: newName.trim() };
      if (parentId) {
        itemData.parentId = parentId;
      }

      await dispatch(
        createItem({ entity: normalizeEntity(dialogType), itemData })
      ).unwrap();

      // Refresh the appropriate list
      if (dialogType === 'levels') {
        await fetchLevels();
      } else if (dialogType === 'classes' && selectedLevel) {
        await fetchClassesForLevel(selectedLevel);
      } else if (dialogType === 'subjects' && selectedClass) {
        await fetchSubjectsForClass(selectedClass);
      } else if (dialogType === 'strands' && selectedSubject) {
        await fetchStrandsForSubject(selectedSubject);
      } else if (dialogType === 'sub-strands' && selectedStrand) {
        await fetchSubStrandsForStrand(selectedStrand);
      }

      setNewName('');
      setDialogOpen(false);
    } catch {
      setError(`Failed to create ${dialogType}`);
    }
  };

  // Delete item
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      setError('');
      await dispatch(
        deleteItem({ entity: normalizeEntity(type), itemId: id })
      ).unwrap();

      // Refresh the appropriate list
      if (type === 'levels') {
        await fetchLevels();
        dispatch(clearChildren({ entities: ['classes', 'subjects', 'strands', 'subStrands'] }));
      } else if (type === 'classes' && selectedLevel) {
        await fetchClassesForLevel(selectedLevel);
      } else if (type === 'subjects' && selectedClass) {
        await fetchSubjectsForClass(selectedClass);
      } else if (type === 'strands' && selectedSubject) {
        await fetchStrandsForSubject(selectedSubject);
      } else if (type === 'sub-strands' && selectedStrand) {
        await fetchSubStrandsForStrand(selectedStrand);
      }
    } catch {
      setError(`Failed to delete ${type}`);
    }
  };

  // Edit item
  const startEditing = (type, id, currentName) => {
    setEditingItem({ type, id });
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditName('');
  };

  const handleEdit = async () => {
    if (!editingItem || !editName.trim()) return;
    const { type, id } = editingItem;

    try {
      setError('');
      await dispatch(
        updateItem({
          entity: normalizeEntity(type),
          itemId: id,
          itemData: { name: editName.trim() },
        })
      ).unwrap();

      // Refresh the appropriate list
      if (type === 'levels') {
        await fetchLevels();
      } else if (type === 'classes' && selectedLevel) {
        await fetchClassesForLevel(selectedLevel);
      } else if (type === 'subjects' && selectedClass) {
        await fetchSubjectsForClass(selectedClass);
      } else if (type === 'strands' && selectedSubject) {
        await fetchStrandsForSubject(selectedSubject);
      } else if (type === 'sub-strands' && selectedStrand) {
        await fetchSubStrandsForStrand(selectedStrand);
      }

      cancelEditing();
    } catch {
      setError(`Failed to update ${type}`);
    }
  };

  const openDialog = (type, parent = '') => {
    setDialogType(type);
    setParentId(parent);
    setDialogOpen(true);
  };

  const openCopyDialog = (subject) => {
    setCopySourceSubject(subject);
    setCopyTargetClassIds([]);
    setCopySuccess('');
    setError('');
    setCopyDialogOpen(true);
  };

  const toggleCopyTargetClass = (classId) => {
    setCopyTargetClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleCopySubject = async () => {
    if (!copySourceSubject || copyTargetClassIds.length === 0) return;
    setCopyLoading(true);
    setCopySuccess('');
    setError('');
    try {
      const result = await dispatch(
        copySubjectCurriculum({
          sourceSubjectId: copySourceSubject._id,
          targetClassIds: copyTargetClassIds,
        })
      ).unwrap();
      const copied = result.results
        .map((r) => `${r.subjectName} (${r.strandsCopied} strands, ${r.subStrandsCopied} sub-strands)`)
        .join(', ');
      setCopySuccess(`Copied successfully to: ${copied}`);
      setCopyTargetClassIds([]);
    } catch {
      setError('Failed to copy curriculum. Please try again.');
    } finally {
      setCopyLoading(false);
    }
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
            <IconButton aria-label="Refresh curriculum" onClick={fetchLevels}>
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
                  bgcolor: selectedLevel === level._id ? '#ECE5D8' : 'transparent',
                  '&:hover': { bgcolor: '#F4F1EA' }
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      aria-label="Expand level"
                      size="small" 
                      onClick={() => fetchClassesForLevel(level._id)}
                      color={selectedLevel === level._id ? 'primary' : 'default'}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                    {editingItem?.type === 'levels' && editingItem?.id === level._id ? (
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') cancelEditing(); }}
                        autoFocus
                        sx={{ minWidth: 150 }}
                      />
                    ) : (
                      level.name
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {editingItem?.type === 'levels' && editingItem?.id === level._id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton aria-label="Save level" onClick={handleEdit} size="small" disabled={!editName.trim() || isLoading}>
                          <CheckIcon color="success" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton aria-label="Cancel editing" onClick={cancelEditing} size="small">
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Edit Level">
                        <IconButton aria-label="Edit level" onClick={() => startEditing('levels', level._id, level.name)} size="small">
                          <EditIcon color="info" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Class">
                        <IconButton aria-label="Add class" onClick={() => openDialog('classes', level._id)} size="small">
                          <AddIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Level">
                        <IconButton aria-label="Delete level" onClick={() => handleDelete('levels', level._id)} size="small">
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
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
                      bgcolor: selectedClass === c._id ? '#ECE5D8' : 'transparent',
                      '&:hover': { bgcolor: '#F4F1EA' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          aria-label="Expand class"
                          size="small" 
                          onClick={() => fetchSubjectsForClass(c._id)}
                          color={selectedClass === c._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {editingItem?.type === 'classes' && editingItem?.id === c._id ? (
                          <TextField
                            size="small"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') cancelEditing(); }}
                            autoFocus
                            sx={{ minWidth: 150 }}
                          />
                        ) : (
                          c.name
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{c.level?.name || '—'}</TableCell>
                    <TableCell align="right">
                      {editingItem?.type === 'classes' && editingItem?.id === c._id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton aria-label="Save class" onClick={handleEdit} size="small" disabled={!editName.trim() || isLoading}>
                              <CheckIcon color="success" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton aria-label="Cancel editing" onClick={cancelEditing} size="small">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit Class">
                            <IconButton aria-label="Edit class" onClick={() => startEditing('classes', c._id, c.name)} size="small">
                              <EditIcon color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add Subject">
                            <IconButton aria-label="Add subject" onClick={() => openDialog('subjects', c._id)} size="small">
                              <AddIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Class">
                            <IconButton aria-label="Delete class" onClick={() => handleDelete('classes', c._id)} size="small">
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
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
                      bgcolor: selectedSubject === s._id ? '#ECE5D8' : 'transparent',
                      '&:hover': { bgcolor: '#F4F1EA' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          aria-label="Expand subject"
                          size="small" 
                          onClick={() => fetchStrandsForSubject(s._id)}
                          color={selectedSubject === s._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {editingItem?.type === 'subjects' && editingItem?.id === s._id ? (
                          <TextField
                            size="small"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') cancelEditing(); }}
                            autoFocus
                            sx={{ minWidth: 150 }}
                          />
                        ) : (
                          s.name
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{s.class?.name || '—'}</TableCell>
                    <TableCell align="right">
                      {editingItem?.type === 'subjects' && editingItem?.id === s._id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton aria-label="Save subject" onClick={handleEdit} size="small" disabled={!editName.trim() || isLoading}>
                              <CheckIcon color="success" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton aria-label="Cancel editing" onClick={cancelEditing} size="small">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit Subject">
                            <IconButton aria-label="Edit subject" onClick={() => startEditing('subjects', s._id, s.name)} size="small">
                              <EditIcon color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add Strand">
                            <IconButton aria-label="Add strand" onClick={() => openDialog('strands', s._id)} size="small">
                              <AddIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          {classes.length > 1 && (
                            <Tooltip title="Copy to other classes">
                              <IconButton aria-label="Copy subject curriculum" onClick={() => openCopyDialog(s)} size="small">
                                <ContentCopyIcon color="secondary" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Subject">
                            <IconButton aria-label="Delete subject" onClick={() => handleDelete('subjects', s._id)} size="small">
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
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
                      bgcolor: selectedStrand === st._id ? '#ECE5D8' : 'transparent',
                      '&:hover': { bgcolor: '#F4F1EA' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          aria-label="Expand strand"
                          size="small" 
                          onClick={() => fetchSubStrandsForStrand(st._id)}
                          color={selectedStrand === st._id ? 'primary' : 'default'}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        {editingItem?.type === 'strands' && editingItem?.id === st._id ? (
                          <TextField
                            size="small"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') cancelEditing(); }}
                            autoFocus
                            sx={{ minWidth: 150 }}
                          />
                        ) : (
                          st.name
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{st.subject?.name || '—'}</TableCell>
                    <TableCell align="right">
                      {editingItem?.type === 'strands' && editingItem?.id === st._id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton aria-label="Save strand" onClick={handleEdit} size="small" disabled={!editName.trim() || isLoading}>
                              <CheckIcon color="success" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton aria-label="Cancel editing" onClick={cancelEditing} size="small">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit Strand">
                            <IconButton aria-label="Edit strand" onClick={() => startEditing('strands', st._id, st.name)} size="small">
                              <EditIcon color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add Sub-Strand">
                            <IconButton aria-label="Add sub-strand" onClick={() => openDialog('sub-strands', st._id)} size="small">
                              <AddIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Strand">
                            <IconButton aria-label="Delete strand" onClick={() => handleDelete('strands', st._id)} size="small">
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
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
                    <TableCell>
                      {editingItem?.type === 'sub-strands' && editingItem?.id === ss._id ? (
                        <TextField
                          size="small"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') cancelEditing(); }}
                          autoFocus
                          sx={{ minWidth: 150 }}
                        />
                      ) : (
                        ss.name
                      )}
                    </TableCell>
                    <TableCell>{ss.strand?.name || '—'}</TableCell>
                    <TableCell align="right">
                      {editingItem?.type === 'sub-strands' && editingItem?.id === ss._id ? (
                        <>
                          <Tooltip title="Save">
                            <IconButton aria-label="Save sub-strand" onClick={handleEdit} size="small" disabled={!editName.trim() || isLoading}>
                              <CheckIcon color="success" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton aria-label="Cancel editing" onClick={cancelEditing} size="small">
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Edit Sub-Strand">
                            <IconButton aria-label="Edit sub-strand" onClick={() => startEditing('sub-strands', ss._id, ss.name)} size="small">
                              <EditIcon color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Sub-Strand">
                            <IconButton aria-label="Delete sub-strand" onClick={() => handleDelete('sub-strands', ss._id)} size="small">
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>

      {/* Copy Subject Curriculum Dialog */}
      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Copy "{copySourceSubject?.name}" to other classes</DialogTitle>
        <DialogContent>
          {copySuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>{copySuccess}</Alert>
          ) : (
            <>
              <Typography variant="body2" sx={{ mt: 1, mb: 1.5, color: 'text.secondary' }}>
                Select which classes should receive a copy of all strands and sub-strands:
              </Typography>
              <FormGroup>
                {classes
                  .filter((c) => c._id !== selectedClass)
                  .map((c) => (
                    <FormControlLabel
                      key={c._id}
                      control={
                        <Checkbox
                          checked={copyTargetClassIds.includes(c._id)}
                          onChange={() => toggleCopyTargetClass(c._id)}
                          size="small"
                        />
                      }
                      label={c.name}
                    />
                  ))}
              </FormGroup>
              {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Close</Button>
          {!copySuccess && (
            <Button
              variant="contained"
              onClick={handleCopySubject}
              disabled={copyTargetClassIds.length === 0 || copyLoading}
              startIcon={copyLoading ? <CircularProgress size={16} /> : <ContentCopyIcon />}
            >
              {copyLoading ? 'Copying…' : 'Copy'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim() || isLoading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCurriculum;