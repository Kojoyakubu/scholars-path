// server/controllers/curriculumController.js

const asyncHandler = require('express-async-handler');
const Level = require('../models/levelModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Strand = require('../models/strandModel');
const SubStrand = require('../models/subStrandModel');

// --- DYNAMIC FETCHING CONTROLLERS ---

const getClassesByLevel = asyncHandler(async (req, res) => {
  // Assumes a middleware has validated req.params.levelId is a valid ObjectId
  const classes = await Class.find({ level: req.params.levelId });
  res.json(classes);
});

const getSubjectsByClass = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ class: req.params.classId });
  res.json(subjects);
});

const getStrandsBySubject = asyncHandler(async (req, res) => {
  const strands = await Strand.find({ subject: req.params.subjectId });
  res.json(strands);
});

const getSubStrandsByStrand = asyncHandler(async (req, res) => {
  const subStrands = await SubStrand.find({ strand: req.params.strandId });
  res.json(subStrands);
});

// --- GENERIC CRUD FACTORY FUNCTIONS ---
// This is an excellent pattern for keeping code DRY.

/**
 * Factory function to create a controller for adding a new document.
 * @param {mongoose.Model} Model - The Mongoose model to use.
 * @returns {Function} An Express controller function.
 */
const createItem = (Model) => asyncHandler(async (req, res) => {
  // Note: Add validation for req.body in the route or here.
  const item = await Model.create(req.body);
  res.status(201).json(item);
});

/**
 * Factory function to create a controller for fetching all documents of a model.
 * @param {mongoose.Model} Model - The Mongoose model to use.
 * @param {object|string} [populateOptions] - Optional populate options for the query.
 * @returns {Function} An Express controller function.
 */
const getItems = (Model, populateOptions) => asyncHandler(async (req, res) => {
  let query = Model.find({});
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  const items = await query.exec(); // .exec() is good practice
  res.json(items);
});

/**
 * Factory function to create a controller for updating a document by ID.
 * @param {mongoose.Model} Model - The Mongoose model to use.
 * @returns {Function} An Express controller function.
 */
const updateItem = (Model) => asyncHandler(async (req, res) => {
  const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return the modified document
    runValidators: true, // Ensure updates follow schema rules
  });
  
  if (!item) {
    res.status(404);
    throw new Error(`${Model.modelName} not found`);
  }
  res.json(item);
});

/**
 * Factory function to create a controller for deleting a document by ID.
 * @param {mongoose.Model} Model - The Mongoose model to use.
 * @returns {Function} An Express controller function.
 */
const deleteItem = (Model) => asyncHandler(async (req, res) => {
  const item = await Model.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error(`${Model.modelName} not found`);
  }
  
  await item.deleteOne(); // Replaces remove() which is deprecated
  res.json({ message: `${Model.modelName} removed successfully` });
});

// Export all the generated controller functions
module.exports = {
  // Dynamic fetching
  getClassesByLevel,
  getSubjectsByClass,
  getStrandsBySubject,
  getSubStrandsByStrand,

  // CRUD for Levels
  createLevel: createItem(Level),
  getLevels: getItems(Level),
  updateLevel: updateItem(Level),
  deleteLevel: deleteItem(Level),
  
  // CRUD for Classes
  createClass: createItem(Class),
  getClasses: getItems(Class, { path: 'level', select: 'name' }),
  updateClass: updateItem(Class),
  deleteClass: deleteItem(Class),

  // CRUD for Subjects
  createSubject: createItem(Subject),
  getSubjects: getItems(Subject, { path: 'class', select: 'name', populate: { path: 'level', select: 'name' } }),
  updateSubject: updateItem(Subject),
  deleteSubject: deleteItem(Subject),

  // CRUD for Strands
  createStrand: createItem(Strand),
  getStrands: getItems(Strand, { path: 'subject', select: 'name', populate: { path: 'class', select: 'name' } }),
  updateStrand: updateItem(Strand),
  deleteStrand: deleteItem(Strand),

  // CRUD for SubStrands
  createSubStrand: createItem(SubStrand),
  getSubStrands: getItems(SubStrand, { path: 'strand', select: 'name', populate: { path: 'subject', select: 'name' } }),
  updateSubStrand: updateItem(SubStrand),
  deleteSubStrand: deleteItem(SubStrand),
};