import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyLessonNotes } from '../features/teacher/teacherSlice';
import { fetchItems } from '../features/curriculum/curriculumSlice';
import { Box, Container, Typography, CircularProgress } from '@mui/material';

function TeacherDashboard() {
  const dispatch = useDispatch();

  // Get the entire state slices to inspect them
  const curriculumState = useSelector((state) => state.curriculum);
  const teacherState = useSelector((state) => state.teacher);
  
  // Log the states every time the component renders
  console.log('--- CURRICULUM STATE ---', curriculumState);
  console.log('--- TEACHER STATE ---', teacherState);

  useEffect(() => {
    console.log('Dispatching fetch actions...');
    dispatch(fetchItems('levels'));
    dispatch(getMyLessonNotes());
  }, [dispatch]);

  // Manually check if the properties we want to map are arrays
  if (teacherState && !Array.isArray(teacherState.lessonNotes)) {
    console.error('CRITICAL ERROR: teacherState.lessonNotes is NOT an array! It is:', teacherState.lessonNotes);
  }
  if (curriculumState && !Array.isArray(curriculumState.levels)) {
    console.error('CRITICAL ERROR: curriculumState.levels is NOT an array! It is:', curriculumState.levels);
  }

  // A simple loading check
  if (!teacherState || !curriculumState) {
    return <CircularProgress />
  }

  return (
    <Container>
        <Box sx={{ my: 4, p: 2, border: '2px dashed red', fontFamily: 'monospace' }}>
            <Typography variant="h4">Teacher Dashboard - Debug Mode</Typography>
            <Typography>Check the browser console for logs. The raw state is printed below.</Typography>
            
            <hr style={{margin: '20px 0'}} />

            <Typography variant="h6">Current Teacher State:</Typography>
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#eee', padding: '10px'}}>
                {JSON.stringify(teacherState, null, 2)}
            </pre>

            <hr style={{margin: '20px 0'}} />

            <Typography variant="h6">Current Curriculum State:</Typography>
            <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#eee', padding: '10px'}}>
                {JSON.stringify(curriculumState, null, 2)}
            </pre>
        </Box>
    </Container>
  );
}

export default TeacherDashboard;