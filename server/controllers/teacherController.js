const asyncHandler = require("express-async-handler");
const LessonNote = require("../models/lessonNoteModel");
const { generateLessonNoteMarkdown } = require("../utils/aiLessonNote");
const { generateLessonNotePDF } = require("../utils/pdfGenerator");

/**
 * @desc    Get all lesson notes for the logged-in teacher
 */
const getMyLessonNotes = asyncHandler(async (req, res) => {
  const notes = await LessonNote.find({ teacher: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(notes);
});

/**
 * @desc    Generate a new lesson note using AI
 */
const generateLessonNote = asyncHandler(async (req, res) => {
  const {
    school,
    week,
    classLevel,
    strand,
    substrand,
    lesson,
    term,
    contentStandard,
    contentStandardCode,
    indicatorCode, // can contain multiple codes comma-separated
    classSize,
  } = req.body;

  if (
    !school ||
    !week ||
    !classLevel ||
    !strand ||
    !substrand ||
    !lesson ||
    !term ||
    !contentStandard ||
    !contentStandardCode ||
    !indicatorCode ||
    !classSize
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Parse indicator codes into array
  const indicatorCodesArray = indicatorCode
    .split(",")
    .map((code) => code.trim())
    .filter((c) => c.length > 0);

  // Updated prompt
  const prompt = `
You are a Ghanaian master teacher and curriculum designer.  
Your task is to create a **well-formatted Markdown lesson note** suitable for any subject and class level in the Ghanaian Basic School Curriculum.

Use the details below to generate a complete professional lesson note following the Ghana Education Service (GES) format.

**Details:**
- **School:** ${school}
- **Week:** ${week}
- **Class:** ${classLevel}
- **Class Size:** ${classSize}
- **Strand:** ${strand}
- **Sub-strand:** ${substrand}
- **Lesson:** ${lesson}
- **Term:** ${term}
- **Content Standard Code:** ${contentStandardCode}
- **Indicator Codes:** ${indicatorCodesArray.join(", ")}
- **Content Standard:** ${contentStandard}

Generate a *Performance Indicators* section that summarises what learners should be able to do based on all the indicator codes provided.  
Keep the Ghanaian structure intact (introduction, core points, activities, assessment, conclusion, reflection, etc.) and maintain Markdown table formatting.
`;

  const aiResponse = await generateLessonNoteMarkdown(prompt);

  const newNote = await LessonNote.create({
    teacher: req.user._id,
    school,
    week,
    classLevel,
    strand,
    substrand,
    lesson,
    term,
    contentStandard,
    contentStandardCode,
    indicatorCode: indicatorCodesArray,
    classSize,
    generatedNote: aiResponse,
  });

  res.status(201).json(newNote);
});

/**
 * @desc    Get lesson note by ID
 */
const getLessonNoteById = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("Lesson note not found");
  }
  res.json(note);
});

/**
 * @desc    Delete lesson note
 */
const deleteLessonNote = asyncHandler(async (req, res) => {
  const note = await LessonNote.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error("Lesson note not found");
  }

  await note.deleteOne();
  res.json({ message: "Lesson note removed" });
});

/**
 * @desc    Generate learner's note version (AI simplified)
 */
const generateLearnerNote = asyncHandler(async (req, res) => {
  const { noteId } = req.body;
  const note = await LessonNote.findById(noteId);
  if (!note) {
    res.status(404);
    throw new Error("Lesson note not found");
  }

  const learnerPrompt = `
Simplify the following Ghanaian lesson note into a learner-friendly version, using clear explanations and examples appropriate for the given class level.
Keep structure and Markdown formatting.
  
${note.generatedNote}
`;

  const learnerNote = await generateLessonNoteMarkdown(learnerPrompt);
  note.learnerNote = learnerNote;
  await note.save();

  res.json(note);
});

/**
 * @desc    Create quiz (future feature placeholder)
 */
const createQuiz = asyncHandler(async (req, res) => {
  res.json({ message: "Quiz generation endpoint (coming soon)" });
});

/**
 * @desc    Upload resource (future feature placeholder)
 */
const uploadResource = asyncHandler(async (req, res) => {
  res.json({ message: "Upload resource endpoint (coming soon)" });
});

/**
 * @desc    Teacher analytics placeholder
 */
const getTeacherAnalytics = asyncHandler(async (req, res) => {
  res.json({ message: "Teacher analytics endpoint (coming soon)" });
});

module.exports = {
  getMyLessonNotes,
  generateLessonNote,
  getLessonNoteById,
  deleteLessonNote,
  generateLearnerNote,
  createQuiz,
  uploadResource,
  getTeacherAnalytics,
};
