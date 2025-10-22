import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [lessonNotes, setLessonNotes] = useState([]);
  const navigate = useNavigate();

  // Fetch teacher’s lesson notes from backend
  const fetchLessonNotes = async () => {
    try {
      const { data } = await axios.get("/api/lesson-notes");
      setLessonNotes(data);
    } catch (error) {
      toast.error("Failed to load lesson notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonNotes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`/api/lesson-notes/${id}`);
        toast.success("Lesson note deleted successfully");
        fetchLessonNotes();
      } catch (error) {
        toast.error("Failed to delete lesson note");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Teacher Dashboard
      </Typography>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate("/create-lesson-note")}
        >
          New Lesson Note
        </Button>
      </Box>

      <Grid container spacing={3}>
        {lessonNotes.length === 0 ? (
          <Grid item xs={12}>
            <Typography textAlign="center" color="text.secondary">
              No lesson notes yet.
            </Typography>
          </Grid>
        ) : (
          lessonNotes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note._id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <DescriptionIcon sx={{ mr: 2, color: "text.secondary" }} />
                      <Typography variant="h6" fontWeight="bold">
                        {note.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {note.subject} — {note.week}
                    </Typography>

                    <Box display="flex" justifyContent="space-between">
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/lesson-notes/${note._id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(note._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>

      <Box mt={5}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FaceRetouchingNaturalIcon />}
              onClick={() => navigate("/learners")}
            >
              Learners
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={() => navigate("/approve-notes")}
            >
              Approve Notes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
