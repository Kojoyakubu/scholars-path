const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const School = require('../models/schoolModel');
const QuizAttempt = require('../models/quizAttemptModel');
const mongoose = require('mongoose');

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.countDocuments({});
  const users = await User.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-password');
  res.json({ users, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Approve a user's registration
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.status = 'approved';
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin user');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get usage statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getUsageStats = asyncHandler(async (req, res) => {
    // This function seems to be missing in the original controller, but here's a sample implementation
    const totalUsers = await User.countDocuments({});
    const totalSchools = await School.countDocuments({});
    const totalQuizAttempts = await QuizAttempt.countDocuments({});

    res.json({
        totalUsers,
        totalSchools,
        totalQuizAttempts
    });
});

// @desc    Create a new school and its admin
// @route   POST /api/admin/schools
// @access  Private/Admin
const createSchool = asyncHandler(async (req, res) => {
  const { name, adminName, adminEmail, adminPassword } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const schoolExists = await School.findOne({ name }).session(session);
    if (schoolExists) {
      res.status(400);
      throw new Error('School with this name already exists');
    }

    const adminExists = await User.findOne({ email: adminEmail }).session(session);
    if (adminExists) {
      res.status(400);
      throw new Error('User with this email already exists for the school admin');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const schoolAdminUser = new User({
      fullName: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'school_admin',
      status: 'approved',
    });
    const createdAdmin = await schoolAdminUser.save({ session });

    const school = new School({
      name,
      admin: createdAdmin._id,
    });
    const createdSchool = await school.save({ session });
    
    createdAdmin.school = createdSchool._id;
    await createdAdmin.save({ session });

    await session.commitTransaction();
    res.status(201).json({ school: createdSchool, message: `${createdAdmin.fullName} is now the admin for ${name}.` });
  } catch (error) {
    await session.abortTransaction();
    throw error; // Let the async handler and global error handler manage it
  } finally {
    session.endSession();
  }
});

// @desc    Get all schools
// @route   GET /api/admin/schools
// @access  Private/Admin
const getSchools = asyncHandler(async (req, res) => {
    const schools = await School.find({}).populate('admin', 'fullName email');
    res.json(schools);
});

// @desc    Delete a school
// @route   DELETE /api/admin/schools/:id
// @access  Private/Admin
const deleteSchool = asyncHandler(async (req, res) => {
    const school = await School.findById(req.params.id);
    if (school) {
        // Consider what should happen to users of this school. For now, we just delete the school.
        await school.deleteOne();
        res.json({ message: 'School removed' });
    } else {
        res.status(404);
        throw new Error('School not found');
    }
});

// @desc    Assign a user to a school
// @route   PUT /api/admin/users/:id/assign-school
// @access  Private/Admin
const assignUserToSchool = asyncHandler(async (req, res) => {
  const { schoolId } = req.body;
  const user = await User.findById(req.params.id);
  if (user) {
    user.school = schoolId;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUsers,
  approveUser,
  deleteUser,
  getUsageStats,
  createSchool,
  getSchools,
  deleteSchool,
  assignUserToSchool,
};