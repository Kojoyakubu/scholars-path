import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

// Redux (curriculum slice is assumed to expose these)
import {
  fetchItems,
  fetchChildren,
  createItem,
  deleteItem,
  clearChildren,
} from '../features/curriculum/curriculumSlice';

// AI insights
import { getAiInsights } from '../features/admin/adminSlice';
import AIInsightsCard from '../components/AIInsightsCard';

const Section = ({ title, onCreate, createLabel, items, onSelect, onDelete, selectedId, placeholder = 'Name' }) => {
  const [name, setName] = useState('');

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (!name.trim()) return;
              onCreate(name.trim());
              setName('');
            }}
          >
            {createLabel}
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {Array.isArray(items) && items.length > 0 ? (
        <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {items.map((it) => {
            const isSelected = it._id === selectedId;
            return (
              <ListItem
                key={it._id}
                secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => onDelete(it._id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                }
                sx={{
                  borderLeft: `6px solid ${isSelected ? '#1976d2' : 'transparent'}`,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Button
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => onSelect(it._id)}
                      >
                        Select
                      </Button>
                      <Typography fontWeight={600}>{it.name}</Typography>
                    </Stack>
                  }
                  secondary={it.description}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography color="text.secondary">No items yet.</Typography>
      )}
    </Paper>
  );
};

const AdminCurriculum = () => {
  const dispatch = useDispatch();
  const {
    levels = [],
    classes = [],
    subjects = [],
    strands = [],
    subStrands = [],
    isLoading,
    error,
  } = useSelector((s) => s.curriculum);

  const { aiInsights } = useSelector((s) => s.admin);

  const [selected, setSelected] = useState({
    levelId: '',
    classId: '',
    subjectId: '',
    strandId: '',
  });

  // initial load
  useEffect(() => {
    dispatch(fetchItems({ entity: 'levels' }));
    dispatch(getAiInsights({ endpoint: '/api/admin/curriculum/insights' }));
  }, [dispatch]);

  // cascade children fetches
  useEffect(() => {
    if (selected.levelId) {
      dispatch(fetchChildren({ entity: 'classes', parentEntity: 'levels', parentId: selected.levelId }));
    }
  }, [dispatch, selected.levelId]);

  useEffect(() => {
    if (selected.classId) {
      dispatch(fetchChildren({ entity: 'subjects', parentEntity: 'classes', parentId: selected.classId }));
    }
  }, [dispatch, selected.classId]);

  useEffect(() => {
    if (selected.subjectId) {
      dispatch(fetchChildren({ entity: 'strands', parentEntity: 'subjects', parentId: selected.subjectId }));
    }
  }, [dispatch, selected.subjectId]);

  useEffect(() => {
    if (selected.strandId) {
      dispatch(fetchChildren({ entity: 'subStrands', parentEntity: 'strands', parentId: selected.strandId }));
    }
  }, [dispatch, selected.strandId]);

  const onSelect = useCallback((level, id) => {
    setSelected((prev) => {
      const next = { ...prev, [level]: id };
      // reset downstream selections + cached children
      const resetMap = {
        levelId: ['classId', 'subjectId', 'strandId'],
        classId: ['subjectId', 'strandId'],
        subjectId: ['strandId'],
      };
      if (resetMap[level]) {
        resetMap[level].forEach((k) => (next[k] = ''));
        dispatch(clearChildren({ entities: resetMap[level].map((x) =>
          x === 'classId' ? 'classes' :
          x === 'subjectId' ? 'subjects' :
          x === 'strandId' ? 'strands' : x
        ) }));
      }
      return next;
    });
  }, [dispatch]);

  const create = useCallback((entity, payload) => {
    const body = {
      name: payload.name,
      parentId:
        entity === 'classes' ? selected.levelId :
        entity === 'subjects' ? selected.classId :
        entity === 'strands' ? selected.subjectId :
        entity === 'subStrands' ? selected.strandId :
        undefined,
    };
    dispatch(createItem({ entity, body }));
  }, [dispatch, selected]);

  const remove = useCallback((entity, id) => {
    if (!window.confirm('Delete this item? All its descendants will also be removed.')) return;
    dispatch(deleteItem({ entity, id }));
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading curriculum…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">Failed to load curriculum: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Curriculum Manager
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Section
            title="Levels"
            createLabel="Add Level"
            items={levels}
            selectedId={selected.levelId}
            onCreate={(name) => create('levels', { name })}
            onSelect={(id) => onSelect('levelId', id)}
            onDelete={(id) => remove('levels', id)}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Section
            title="Classes"
            createLabel="Add Class"
            items={classes}
            selectedId={selected.classId}
            onCreate={(name) => create('classes', { name })}
            onSelect={(id) => onSelect('classId', id)}
            onDelete={(id) => remove('classes', id)}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Section
            title="Subjects"
            createLabel="Add Subject"
            items={subjects}
            selectedId={selected.subjectId}
            onCreate={(name) => create('subjects', { name })}
            onSelect={(id) => onSelect('subjectId', id)}
            onDelete={(id) => remove('subjects', id)}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Section
            title="Strands"
            createLabel="Add Strand"
            items={strands}
            selectedId={selected.strandId}
            onCreate={(name) => create('strands', { name })}
            onSelect={(id) => onSelect('strandId', id)}
            onDelete={(id) => remove('strands', id)}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Sub-Strands</Typography>
            <Stack direction="row" spacing={1} mb={2}>
              <TextField
                size="small"
                placeholder="Sub-strand name"
                sx={{ width: 320 }}
                id="substrand-input"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!selected.strandId}
                onClick={() => {
                  const el = document.getElementById('substrand-input');
                  const name = el?.value?.trim();
                  if (!name) return;
                  create('subStrands', { name });
                  el.value = '';
                }}
              >
                Add Sub-Strand
              </Button>
            </Stack>

            <Divider sx={{ mb: 1 }} />

            <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {Array.isArray(subStrands) && subStrands.length > 0 ? (
                subStrands.map((ss) => (
                  <ListItem
                    key={ss._id}
                    secondaryAction={
                      <IconButton color="error" edge="end" onClick={() => remove('subStrands', ss._id)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={ss.name} secondary={ss.description} />
                  </ListItem>
                ))
              ) : (
                <Typography color="text.secondary">No sub-strands for the selected strand.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {aiInsights && (
        <AIInsightsCard title="AI Insights on Curriculum Trends" content={aiInsights} />
      )}
    </Container>
  );
};

export default AdminCurriculum;
