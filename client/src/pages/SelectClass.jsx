// /client/src/pages/SelectClass.jsx
// 🎓 Student Class Selection Page - Modern Glassmorphism Design
// Students must select Level and Class before accessing dashboard

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ClassIcon from '@mui/icons-material/Class';

import { fetchItems, fetchChildren } from '../features/curriculum/curriculumSlice';

const SelectClass = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { levels, classes, isLoading } = useSelector((state) => state.curriculum);

  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Load levels on mount
  useEffect(() => {
    dispatch(fetchItems('levels'));
  }, [dispatch]);

  // Load classes when level is selected
  useEffect(() => {
    if (selectedLevel) {
      setIsLoadingClasses(true);
      dispatch(
        fetchChildren({
          entity: 'classes',
          parentEntity: 'levels',
          parentId: selectedLevel,
        })
      ).finally(() => {
        setIsLoadingClasses(false);
      });
      setSelectedClass(''); // Reset class selection
    }
  }, [selectedLevel, dispatch]);

  const handleLevelChange = (event) => {
    setSelectedLevel(event.target.value);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleContinue = () => {
    if (selectedLevel && selectedClass) {
      // Save selections to localStorage
      localStorage.setItem(
        'studentClassSelection',
        JSON.stringify({
          levelId: selectedLevel,
          classId: selectedClass,
        })
      );

      // Navigate to dashboard
      navigate('/student/dashboard');
    }
  };

  const isButtonDisabled = !selectedLevel || !selectedClass;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mb: 2,
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome, {user?.name?.split(' ')[0] || 'Student'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please select your level and class to continue
            </Typography>
          </Box>

          {/* Selection Card */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: alpha('#ffffff', 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Stack spacing={3}>
              {/* Level Selection */}
              <FormControl fullWidth>
                <InputLabel id="level-select-label">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="small" />
                    Level
                  </Box>
                </InputLabel>
                <Select
                  labelId="level-select-label"
                  id="level-select"
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  label="Level"
                  disabled={isLoading}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select your level</em>
                  </MenuItem>
                  {Array.isArray(levels) &&
                    levels.map((level) => (
                      <MenuItem key={level._id} value={level._id}>
                        {level.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Class Selection */}
              <FormControl fullWidth disabled={!selectedLevel || isLoadingClasses}>
                <InputLabel id="class-select-label">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ClassIcon fontSize="small" />
                    Class
                  </Box>
                </InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass}
                  onChange={handleClassChange}
                  label="Class"
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select your class</em>
                  </MenuItem>
                  {Array.isArray(classes) &&
                    classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                </Select>
                {isLoadingClasses && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                )}
              </FormControl>

              {/* Continue Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleContinue}
                disabled={isButtonDisabled}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.action.disabled, 0.12),
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                Continue to Dashboard
              </Button>

              {/* Helper Text */}
              {!selectedLevel && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  💡 Start by selecting your level
                </Typography>
              )}
              {selectedLevel && !selectedClass && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  💡 Now select your class to continue
                </Typography>
              )}
            </Stack>
          </Paper>

          {/* Additional Info */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Your selection will be used to load your personalized curriculum
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SelectClass;
