import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { getLevels, getClasses, getSubjects, getStrands, getSubStrands } from '../features/curriculum/curriculumSlice';
import { 
  generateLessonNote, 
  generateLearnerNote,
  createQuiz, 
  generateAiQuestion, 
  uploadResource, 
  getResources, 
  generateAiQuizSection, 
  getTeacherAnalytics,
  reset 
} from '../features/teacher/teacherSlice';

// --- MUI Imports ---
import { 
  Box, Typography, Container, Button, Tabs, Tab, Paper, Modal, Grid, Card, CardContent, 
  FormControl, InputLabel, Select as MuiSelect, MenuItem, TextField, Radio, RadioGroup, FormControlLabel, IconButton, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Helper component for MUI Tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// --- AI WIZARD SUB-COMPONENT ---
const AiWizard = ({ subjectId, onQuestionsGenerated, closeWizard, isOpen }) => {
  const dispatch = useDispatch();
  const { subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { isLoading } = useSelector((state) => state.teacher);
  const [wizardData, setWizardData] = useState({ topics: [], questionType: 'MCQ', count: 5, section: 'Section A' });

  const relevantSubject = subjects.find(s => s._id === subjectId);
  const relevantStrands = strands.filter(s => s.subject?._id === subjectId);
  const relevantSubStrands = subStrands.filter(s => relevantStrands.some(rs => rs._id === s.strand?._id));

  const topicOptions = relevantSubject ? [
    { value: relevantSubject.name, label: `Entire Subject: ${relevantSubject.name}` },
    ...relevantStrands.map(s => ({ value: s.name, label: `Strand: ${s.name}`})),
    ...relevantSubStrands.map(s => ({ value: s.name, label: `Sub-Strand: ${s.name}`}))
  ] : [];

  const handleWizardChange = (e) => setWizardData({ ...wizardData, [e.target.name]: e.target.value });
  const handleTopicChange = (selectedOptions) => setWizardData({ ...wizardData, topics: selectedOptions.map(opt => opt.value) });
  
  const handleGenerate = async () => {
    if (wizardData.topics.length === 0) {
      alert('Please select at least one topic for the AI.');
      return;
    }
    const resultAction = await dispatch(generateAiQuizSection(wizardData));
    if (generateAiQuizSection.fulfilled.match(resultAction)) {
      onQuestionsGenerated(resultAction.payload, wizardData.section);
      closeWizard();
    }
  };

  return (
    <Modal open={isOpen} onClose={closeWizard}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>AI Quiz Section Wizard</Typography>
        <FormControl fullWidth margin="normal"><label>Select Topics from "{relevantSubject?.name}"</label><Select isMulti options={topicOptions} onChange={handleTopicChange} /></FormControl>
        <TextField fullWidth margin="normal" label="Section Title" name="section" value={wizardData.section} onChange={handleWizardChange} />
        <FormControl fullWidth margin="normal"><InputLabel>Question Type</InputLabel><MuiSelect name="questionType" value={wizardData.questionType} label="Question Type" onChange={handleWizardChange}><MenuItem value="MCQ">Multiple Choice</MenuItem><MenuItem value="SHORT_ANSWER">Short Answer</MenuItem><MenuItem value="ESSAY">Essay</MenuItem></MuiSelect></FormControl>
        <TextField fullWidth margin="normal" label="Number of Questions" name="count" type="number" value={wizardData.count} onChange={handleWizardChange} inputProps={{ min: 1, max: 20 }} />
        <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={closeWizard}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate Questions'}</Button>
        </Box>
      </Box>
    </Modal>
  );
};

// --- QUESTION FORM SUB-COMPONENT ---
const QuestionForm = ({ addQuestion, subjectId }) => {
  const dispatch = useDispatch();
  const { subjects } = useSelector((state) => state.curriculum);
  const topicName = subjects.find(s => s._id === subjectId)?.name || 'the selected topic';
  
  const [question, setQuestion] = useState({ section: 'Section A', text: '', questionType: 'MCQ' });
  const [options, setOptions] = useState([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);

  const handleGenerateAI = async () => {
    const resultAction = await dispatch(generateAiQuestion({ topic: topicName, questionType: question.questionType }));
    if (generateAiQuestion.fulfilled.match(resultAction)) {
      const aiQuestion = resultAction.payload;
      setQuestion({ ...question, text: aiQuestion.text });
      if (aiQuestion.options) setOptions(aiQuestion.options);
    }
  };

  const handleQuestionChange = (e) => setQuestion({ ...question, [e.target.name]: e.target.value });
  const handleOptionChange = (index, e) => {
    const newOptions = options.map((opt, i) => i === index ? { ...opt, text: e.target.value } : opt);
    setOptions(newOptions);
  };
  const handleCorrectChange = (index) => {
    const newOptions = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
    setOptions(newOptions);
  };
  const addOptionField = () => setOptions([...options, { text: '', isCorrect: false }]);
  const handleAddQuestion = () => {
    if (!question.text) {
      alert('Please enter question text.');
      return;
    }
    const finalQuestion = { ...question };
    if (question.questionType === 'MCQ') finalQuestion.options = options;
    addQuestion(finalQuestion);
    setQuestion({ section: 'Section A', text: '', questionType: 'MCQ' });
    setOptions([{ text: '', isCorrect: true }, { text: '', isCorrect: false }]);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Add New Question Manually</Typography>
      <TextField fullWidth margin="normal" name="section" label="Section Title" value={question.section} onChange={handleQuestionChange} />
      <TextField fullWidth multiline rows={3} margin="normal" name="text" label="Question Text" value={question.text} onChange={handleQuestionChange} />
      <Button size="small" onClick={handleGenerateAI} sx={{mb: 2}}>Generate with AI (Single Question)</Button>
      <FormControl fullWidth margin="normal"><InputLabel>Question Type</InputLabel><MuiSelect name="questionType" value={question.questionType} label="Question Type" onChange={handleQuestionChange}>
          <MenuItem value="MCQ">Multiple Choice</MenuItem><MenuItem value="SHORT_ANSWER">Short Answer</MenuItem><MenuItem value="ESSAY">Essay</MenuItem><MenuItem value="TRUE_FALSE">True / False</MenuItem><MenuItem value="FILL_IN_THE_BLANK">Fill in the Blank</MenuItem>
      </MuiSelect></FormControl>
      {question.questionType === 'MCQ' && (
        <FormControl component="fieldset" margin="normal"><RadioGroup>{options.map((opt, index) => (<FormControlLabel key={index} control={<Radio checked={opt.isCorrect} onChange={() => handleCorrectChange(index)} />} label={<TextField size="small" variant="standard" value={opt.text} onChange={(e) => handleOptionChange(index, e)} placeholder={`Option ${index + 1}`} />} />))}</RadioGroup><Button size="small" startIcon={<AddIcon />} onClick={addOptionField}>Add Option</Button></FormControl>
      )}
      <Box mt={2}><Button variant="contained" onClick={handleAddQuestion}>Add Question to Quiz</Button></Box>
    </Paper>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
function TeacherDashboard() {
  const dispatch = useDispatch();
  const { levels, classes, subjects, strands, subStrands } = useSelector((state) => state.curriculum);
  const { resources, analytics, isLoading, isSuccess, isError, message } = useSelector((state) => state.teacher);
  
  const [tabValue, setTabValue] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [noteType, setNoteType] = useState('lessonNote');
  
  const [noteSelections, setNoteSelections] = useState({ level: '', class: '', subject: '', strand: '', subStrand: '' });
  const [noteDetails, setNoteDetails] = useState({ objectives: '', aids: '', duration: '' });
  const [quiz, setQuiz] = useState({ title: '', subjectId: '', questions: [] });
  const [uploadSelection, setUploadSelection] = useState({ subStrand: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    dispatch(getLevels()); dispatch(getClasses()); dispatch(getSubjects()); dispatch(getStrands()); dispatch(getSubStrands());
  }, [dispatch]);

  useEffect(() => {
    if (tabValue === 3) {
      dispatch(getTeacherAnalytics());
    }
  }, [tabValue, dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      alert(message);
      if (view === 'quiz') {
        setQuiz({ title: '', subjectId: '', questions: [] });
        setShowQuestionForm(false);
      }
    }
    if (isError) { alert(`Error: ${message}`); }
    if ((isSuccess || isError) && message) {
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  const onAiQuestionsGenerated = (aiQuestions, section) => {
    const questionsWithSection = aiQuestions.map(q => ({ ...q, section }));
    setQuiz(prev => ({ ...prev, questions: [...prev.questions, ...questionsWithSection] }));
    alert(`${aiQuestions.length} questions have been generated and added to your quiz.`);
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleNoteSelectionChange = (e) => { const { name, value } = e.target; setNoteSelections(prev => ({ ...prev, [name]: value })); };
  const handleNoteDetailChange = (e) => { const { name, value } = e.target; setNoteDetails(prev => ({ ...prev, [name]: value })); };
  const handleNoteSubmit = (e) => { e.preventDefault(); const subStrand = subStrands.find(s => s._id === noteSelections.subStrand); if (!subStrand) return; if (noteType === 'lessonNote') { const dataToSubmit = { subStrandId: noteSelections.subStrand, ...noteDetails }; dispatch(generateLessonNote(dataToSubmit)); } else { const dataToSubmit = { subStrandId: noteSelections.subStrand, topic: subStrand.name }; dispatch(generateLearnerNote(dataToSubmit)); } };
  const handleQuizChange = (e) => setQuiz({ ...quiz, [e.target.name]: e.target.value });
  const addQuestionToQuiz = (question) => { setQuiz({ ...quiz, questions: [...quiz.questions, question] }); alert('Question added!'); };
  const handleQuizSubmit = (e) => { e.preventDefault(); dispatch(createQuiz({ title: quiz.title, subjectId: quiz.subjectId, questions: quiz.questions })); };
  const handleUploadSelectionChange = (e) => { const subStrandId = e.target.value; setUploadSelection({ subStrand: subStrandId }); if (subStrandId) { dispatch(getResources(subStrandId)); } };
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleUploadSubmit = (e) => { e.preventDefault(); const formData = new FormData(); formData.append('subStrandId', uploadSelection.subStrand); formData.append('resource', file); dispatch(uploadResource(formData)); };
  
  const filteredClasses = classes.filter(c => c.level._id === noteSelections.level);
  const filteredSubjects = subjects.filter(s => s.class._id === noteSelections.class);
  const filteredStrands = strands.filter(s => s.subject._id === noteSelections.subject);
  const filteredSubStrands = subStrands.filter(s => s.strand._id === noteSelections.strand);

  return (
    <motion.div className="container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container>
        <Box textAlign="center" my={5}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>Teacher Dashboard</Typography>
        </Box>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" centered>
              <Tab label="Note Generator" />
              <Tab label="Quiz Builder" />
              <Tab label="Upload Resource" />
              <Tab label="Analytics" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom>AI Note Generator</Typography>
            <Box component="form" onSubmit={handleNoteSubmit}>
              <FormControl fullWidth margin="normal"><InputLabel>Note Type</InputLabel><MuiSelect value={noteType} label="Note Type" onChange={(e) => setNoteType(e.target.value)}><MenuItem value="lessonNote">Teacher's Lesson Note</MenuItem><MenuItem value="learnerNote">Student's Learner Note</MenuItem></MuiSelect></FormControl>
              <FormControl fullWidth margin="normal"><InputLabel>Level</InputLabel><MuiSelect name="level" value={noteSelections.level} label="Level" onChange={handleNoteSelectionChange} required>{levels.map(l => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</MuiSelect></FormControl>
              {noteSelections.level && <FormControl fullWidth margin="normal"><InputLabel>Class</InputLabel><MuiSelect name="class" value={noteSelections.class} label="Class" onChange={handleNoteSelectionChange} required>{filteredClasses.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</MuiSelect></FormControl>}
              {noteSelections.class && <FormControl fullWidth margin="normal"><InputLabel>Subject</InputLabel><MuiSelect name="subject" value={noteSelections.subject} label="Subject" onChange={handleNoteSelectionChange} required>{filteredSubjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</MuiSelect></FormControl>}
              {noteSelections.subject && <FormControl fullWidth margin="normal"><InputLabel>Strand</InputLabel><MuiSelect name="strand" value={noteSelections.strand} label="Strand" onChange={handleNoteSelectionChange} required>{filteredStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</MuiSelect></FormControl>}
              {noteSelections.strand && <FormControl fullWidth margin="normal"><InputLabel>Sub-Strand</InputLabel><MuiSelect name="subStrand" value={noteSelections.subStrand} label="Sub-Strand" onChange={handleNoteSelectionChange} required>{filteredSubStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}</MuiSelect></FormControl>}
              {noteSelections.subStrand && noteType === 'lessonNote' && (<> <TextField margin="normal" fullWidth label="Learning Objectives" name="objectives" value={noteDetails.objectives} onChange={handleNoteDetailChange}/> <TextField margin="normal" fullWidth label="Teaching Aids" name="aids" value={noteDetails.aids} onChange={handleNoteDetailChange}/> <TextField margin="normal" fullWidth label="Duration" name="duration" value={noteDetails.duration} onChange={handleNoteDetailChange}/></>)}
              {noteSelections.subStrand && <Button type="submit" variant="contained" sx={{mt: 2}} disabled={isLoading}>{isLoading ? 'Generating...' : `Generate ${noteType === 'lessonNote' ? 'Lesson Note' : 'Learner Note'}`}</Button>}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
             <Box component="form" onSubmit={handleQuizSubmit}>
                {isWizardOpen && <AiWizard subjectId={quiz.subjectId} onQuestionsGenerated={onAiQuestionsGenerated} closeWizard={() => setIsWizardOpen(false)} />}
                <Typography variant="h5" gutterBottom>Create New Quiz</Typography>
                <Button variant="contained" onClick={() => setIsWizardOpen(true)} disabled={!quiz.subjectId} sx={{mb: 2, background: '#5cb85c'}}>Generate Section with AI Wizard</Button>
                <TextField fullWidth margin="normal" name="title" label="Quiz Title" value={quiz.title} onChange={handleQuizChange} required />
                <FormControl fullWidth margin="normal"><InputLabel>Subject</InputLabel><MuiSelect name="subjectId" value={quiz.subjectId} label="Subject" onChange={handleQuizChange} required>{subjects.map(s => <MenuItem key={s._id} value={s._id}>{s.name} - ({s.class?.name})</MenuItem>)}</MuiSelect></FormControl>
                <Box sx={{my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Typography variant="h6">Added Questions ({quiz.questions.length})</Typography><Button onClick={() => setShowQuestionForm(!showQuestionForm)}>{showQuestionForm ? 'Close Question Form' : 'Add Question Manually'}</Button></Box>
                {quiz.questions.map((q, i) => <Typography key={i} sx={{p: 1, border: '1px solid green', borderRadius: 1, mb: 1}}>{i+1}. {q.text} ({q.section})</Typography>)}
                {showQuestionForm && <QuestionForm addQuestion={addQuestionToQuiz} subjectId={quiz.subjectId} />}
                <Button type="submit" variant="contained" sx={{mt: 3}} disabled={isLoading || quiz.questions.length === 0}>{isLoading ? 'Saving Quiz...' : 'Save Full Quiz'}</Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>Upload New Resource</Typography>
            <Box component="form" onSubmit={handleUploadSubmit}>
              <FormControl fullWidth margin="normal"><InputLabel>Select Sub-Strand</InputLabel><MuiSelect name="subStrand" value={uploadSelection.subStrand} label="Select Sub-Strand" onChange={handleUploadSelectionChange} required>{subStrands.map(s => <MenuItem key={s._id} value={s._id}>{s.name} - {s.strand?.name}</MenuItem>)}</MuiSelect></FormControl>
              <Button variant="contained" component="label" sx={{mt: 2, mb: 2}}>Upload File<input type="file" hidden onChange={handleFileChange} required /></Button>
              {file && <Typography sx={{display: 'inline-block', ml: 2}}>{file.name}</Typography>}
              <Button type="submit" variant="contained" sx={{display: 'block'}} disabled={isLoading}>{isLoading ? 'Uploading...' : 'Submit Resource'}</Button>
            </Box>
            <Box sx={{mt: 4}}>
              <Typography variant="h6">Existing Resources for this Sub-Strand:</Typography>
              {isLoading && !resources.length ? <p>Loading...</p> : (<ul>{resources.map(res => (<li key={res._id}><Link href={`http://localhost:5000/${res.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">{res.fileName}</Link></li>))}</ul>)}
              {!isLoading && resources.length === 0 && <p>No resources found.</p>}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h5" gutterBottom>Your Analytics</Typography>
            {isLoading ? <CircularProgress /> : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}><Card><CardContent sx={{textAlign: 'center'}}><Typography variant="h4" color="primary">{analytics.totalNoteViews || 0}</Typography><Typography color="text.secondary">Note Views</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={4}><Card><CardContent sx={{textAlign: 'center'}}><Typography variant="h4" color="primary">{analytics.totalQuizAttempts || 0}</Typography><Typography color="text.secondary">Quiz Attempts</Typography></CardContent></Card></Grid>
                <Grid item xs={12} md={4}><Card><CardContent sx={{textAlign: 'center'}}><Typography variant="h4" color="primary">{analytics.averageScore || 0}%</Typography><Typography color="text.secondary">Average Score</Typography></CardContent></Card></Grid>
              </Grid>
            )}
          </TabPanel>
        </Paper>
      </Container>
    </motion.div>
  );
}

export default TeacherDashboard;