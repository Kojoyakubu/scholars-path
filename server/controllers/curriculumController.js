const Level = require('../models/levelModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Strand = require('../models/strandModel');
const SubStrand = require('../models/subStrandModel');

// --- NEW FUNCTIONS FOR ON-DEMAND FETCHING ---
const getClassesByLevel = async (req, res) => {
  try {
    const classes = await Class.find({ level: req.params.levelId });
    res.json(classes);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ class: req.params.classId });
    res.json(subjects);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getStrandsBySubject = async (req, res) => {
  try {
    const strands = await Strand.find({ subject: req.params.subjectId });
    res.json(strands);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getSubStrandsByStrand = async (req, res) => {
  try {
    const subStrands = await SubStrand.find({ strand: req.params.strandId });
    res.json(subStrands);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};


// --- EXISTING HELPER FUNCTIONS ---
const createItem = (Model) => async (req, res) => {
  try {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const getItems = (Model, populateOptions) => async (req, res) => {
  try {
    let query = Model.find({});
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const items = await query;
    res.json(items);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createCrudHandlers = (Model, modelName) => {
  const updateItem = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (item) {
        item.name = req.body.name || item.name;
        const updatedItem = await item.save();
        res.json(updatedItem);
      } else { res.status(404).json({ message: `${modelName} not found` }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
  };

  const deleteItem = async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (item) {
        await item.deleteOne();
        res.json({ message: `${modelName} removed` });
      } else { res.status(404).json({ message: `${modelName} not found` }); }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
  };
  return { updateItem, deleteItem };
};

const levelHandlers = createCrudHandlers(Level, 'Level');
const classHandlers = createCrudHandlers(Class, 'Class');
const subjectHandlers = createCrudHandlers(Subject, 'Subject');
const strandHandlers = createCrudHandlers(Strand, 'Strand');
const subStrandHandlers = createCrudHandlers(SubStrand, 'SubStrand');

module.exports = { 
  // New exports
  getClassesByLevel,
  getSubjectsByClass,
  getStrandsBySubject,
  getSubStrandsByStrand,

  // Existing exports
  createLevel: createItem(Level),
  getLevels: getItems(Level),
  updateLevel: levelHandlers.updateItem,
  deleteLevel: levelHandlers.deleteItem,
  
  createClass: createItem(Class),
  getClasses: getItems(Class, { path: 'level', select: 'name' }),
  updateClass: classHandlers.updateItem,
  deleteClass: classHandlers.deleteItem,

  createSubject: createItem(Subject),
  getSubjects: getItems(Subject, { path: 'class', select: 'name', populate: { path: 'level', select: 'name' } }),
  updateSubject: subjectHandlers.updateItem,
  deleteSubject: subjectHandlers.deleteItem,

  createStrand: createItem(Strand),
  getStrands: getItems(Strand, { path: 'subject', select: 'name', populate: { path: 'class', select: 'name' } }),
  updateStrand: strandHandlers.updateItem,
  deleteStrand: strandHandlers.deleteItem,

  createSubStrand: createItem(SubStrand),
  getSubStrands: getItems(SubStrand, { path: 'strand', select: 'name', populate: { path: 'subject', select: 'name' } }),
  updateSubStrand: subStrandHandlers.updateItem,
  deleteSubStrand: subStrandHandlers.deleteItem,
};