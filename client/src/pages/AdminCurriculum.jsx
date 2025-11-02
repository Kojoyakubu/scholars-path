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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import curriculumService from '../features/curriculum/curriculumService';

const AdminCurriculum = () => {
  const [levels, setLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [parentId, setParentId] = useState('');
  const [newName, setNewName] = useState('');

  const [loading, setLoading] = useState(false);

  // 🔄 Fetch all levels at load
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await curriculumService.getItems('levels');
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async (type, id) => {
    try {
      setLoading(true);
      const data = await curriculumService.getChildrenOf(type, id);
      switch (type) {
        case 'classes':
          setClasses(data || []);
          break;
        case 'subjects':
          setSubjects(data || []);
          break;
        case 'strands':
          setStrands(data || []);
          break;
        case 'sub-strands':
          setSubStrands(data || []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Create new item
  const handleCreate = async () => {
    try {
      if (!dialogType || !newName.trim()) return;
      const payload = { name: newName.trim(), parentId: parentId || undefined };
      await curriculumService.createItem(dialogType, payload);

      // Refresh data
      if (dialogType === 'levels') fetchLevels();
      else fetchChildren(dialogType, parentId);

      setNewName('');
      setDialogOpen(false);
    } catch (error) {
      console.error(`Error creating ${dialogType}:`, error);
    }
  };

  // ❌ Delete item
  const handleDelete = async (type, id, parent) => {
    try {
      await curriculumService.deleteItem(type, id);
      if (type === 'levels') fetchLevels();
      else fetchChildren(type, parent);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
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
        </Box>

        {/* LEVELS */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
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
              <TableRow key={level._id}>
                <TableCell>{level.name}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Add Class">
                    <IconButton onClick={() => openDialog('classes', level._id)}>
                      <AddIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Level">
                    <IconButton onClick={() => handleDelete('levels', level._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* CLASSES */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4 }}>
          Classes
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
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.level?.name || '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Add Subject">
                    <IconButton onClick={() => openDialog('subjects', c._id)}>
                      <AddIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Class">
                    <IconButton onClick={() => handleDelete('classes', c._id, c.level?._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* SUBJECTS */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4 }}>
          Subjects
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
              <TableRow key={s._id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.class?.name || '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Add Strand">
                    <IconButton onClick={() => openDialog('strands', s._id)}>
                      <AddIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Subject">
                    <IconButton onClick={() => handleDelete('subjects', s._id, s.class?._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* STRANDS */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4 }}>
          Strands
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
              <TableRow key={st._id}>
                <TableCell>{st.name}</TableCell>
                <TableCell>{st.subject?.name || '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Add Sub-Strand">
                    <IconButton onClick={() => openDialog('sub-strands', st._id)}>
                      <AddIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Strand">
                    <IconButton onClick={() => handleDelete('strands', st._id, st.subject?._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* SUB-STRANDS */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 4 }}>
          Sub-Strands
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
                    <IconButton onClick={() => handleDelete('sub-strands', ss._id, ss.strand?._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCurriculum;
