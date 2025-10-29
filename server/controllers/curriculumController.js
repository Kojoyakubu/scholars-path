// /server/controllers/curriculumController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Strand = require('../models/strandModel');
const SubStrand = require('../models/subStrandModel');
const aiService = require('../services/aiService');

/**
 * @desc    Create a new class
 * @route   POST /api/curriculum/classes
 * @access  Private (Admin)
 */
const createClass = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Class name is required.');
  }

  const existing = await Class.findOne({ name });
  if (existing) {
    res.status(400);
    throw new Error('This class already exists.');
  }

  const newClass = await Class.create({ name });
  res.status(201).json(newClass);
});

/**
 * @desc    Create a new subject under a class
 * @route   POST /api/curriculum/subjects
 * @access  Private (Admin)
 */
const createSubject = asyncHandler(async (req, res) => {
  const { classId, name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(classId) || !name) {
    res.status(400);
    throw new Error('Valid classId and subject name are required.');
  }

  const subject = await Subject.create({ class: classId, name });
  res.status(201).json(subject);
});

/**
 * @desc    Create or expand a Strand with AI support
 * @route   POST /api/curriculum/strands
 * @access  Private (Admin/Teacher)
 */
const createStrand = asyncHandler(async (req, res) => {
  const { subjectId, name, aiExpand } = req.body;

  if (!mongoose.Types.ObjectId.isValid(subjectId) || !name) {
    res.status(400);
    throw new Error('Valid subjectId and strand name are required.');
  }

  const strand = await Strand.create({ subject: subjectId, name });

  // 🧠 If teacher requested AI expansion, auto-generate sub-strands
  let aiSuggestions = [];
  if (aiExpand) {
    try {
      const prompt = `
You are a Ghanaian curriculum design expert.
Suggest 4–6 logical Sub-Strands that belong under the Strand "${name}" for the subject "${(await Subject.findById(subjectId)).name}".
Follow the NaCCA Ghana curriculum style for ${new Date().getFullYear()}.
Each Sub-Strand name should be short (max 8 words) and conceptually accurate.
Return ONLY a JSON array of sub-strand names. Example:
["Introduction to Plants", "Parts of a Plant", "Functions of Plant Parts"]
`;

      const { text } = await aiService.generateTextCore({
        prompt,
        task: 'curriculumExpansion',
        jsonNeeded: true,
      });

      aiSuggestions = JSON.parse(text);
      if (Array.isArray(aiSuggestions)) {
        for (const title of aiSuggestions) {
          await SubStrand.create({ strand: strand._id, name: title });
        }
      }
    } catch (err) {
      console.error('AI sub-strand generation failed:', err.message);
    }
  }

  res.status(201).json({
    message: 'Strand created successfully.',
    strand,
    aiGeneratedSubStrands: aiSuggestions,
  });
});

/**
 * @desc    Add a Sub-Strand manually
 * @route   POST /api/curriculum/sub-strands
 * @access  Private (Admin/Teacher)
 */
const createSubStrand = asyncHandler(async (req, res) => {
  const { strandId, name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(strandId) || !name) {
    res.status(400);
    throw new Error('Valid strandId and sub-strand name are required.');
  }

  const subStrand = await SubStrand.create({ strand: strandId, name });
  res.status(201).json(subStrand);
});

/**
 * @desc    Auto-fill Sub-Strand details using AI (description + learning outcomes)
 * @route   POST /api/curriculum/sub-strands/:id/autofill
 * @access  Private (Admin/Teacher)
 */
const autoFillSubStrand = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid sub-strand ID.');
  }

  const subStrand = await SubStrand.findById(id).populate({
    path: 'strand',
    populate: { path: 'subject', populate: 'class' },
  });

  if (!subStrand) {
    res.status(404);
    throw new Error('Sub-Strand not found.');
  }

  // 🧠 AI-generated curriculum enrichment
  const prompt = `
You are a Ghanaian curriculum expert for the National Council for Curriculum and Assessment (NaCCA).
Provide a JSON object describing this sub-strand:
- Subject: ${subStrand.strand.subject.name}
- Strand: ${subStrand.strand.name}
- Sub-Strand: ${subStrand.name}
- Class: ${subStrand.strand.subject.class.name}

JSON format:
{
  "description": "A concise academic description of this Sub-Strand.",
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
  "keyCompetencies": ["Critical Thinking", "Collaboration", ...]
}
`;

  try {
    const { text } = await aiService.generateTextCore({
      prompt,
      task: 'curriculumDetails',
      jsonNeeded: true,
    });

    const parsed = JSON.parse(text);

    subStrand.description = parsed.description || '';
    subStrand.learningOutcomes = parsed.learningOutcomes || [];
    subStrand.keyCompetencies = parsed.keyCompetencies || [];
    await subStrand.save();

    res.json({
      message: 'Sub-Strand enriched successfully.',
      subStrand,
      aiGenerated: parsed,
    });
  } catch (err) {
    console.error('AI autofill failed:', err.message);
    res.status(500).json({
      message: 'AI enrichment failed. Please try again later.',
    });
  }
});

/**
 * @desc    Get all classes, subjects, strands, or sub-strands
 * @route   GET /api/curriculum/:type
 * @access  Private
 */
const getCurriculum = asyncHandler(async (req, res) => {
  const { type } = req.params;

  const models = {
    classes: Class,
    subjects: Subject,
    strands: Strand,
    subStrands: SubStrand,
  };

  const model = models[type];
  if (!model) {
    res.status(400);
    throw new Error('Invalid type. Use classes, subjects, strands, or subStrands.');
  }

  const data = await model.find().sort({ createdAt: -1 });
  res.json(data);
});

module.exports = {
  createClass,
  createSubject,
  createStrand,
  createSubStrand,
  autoFillSubStrand,
  getCurriculum,
};
