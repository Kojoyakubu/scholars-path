// server/controllers/adminController.js

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <-- BUG FIX: Added missing import
const User = require('../models/userModel');
const School = require('../models/schoolModel');
const QuizAttempt = require('../models/quizAttemptModel');

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  const filter = req.query.status ? { status: req.query.status } : {}; // Allow filtering by status

  const count = await User.countDocuments(filter);
  const users = await User.find(filter)
    .populate('school', 'name') // Show school name
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-password');
    
  res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Approve a user's registration
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  // Use `findByIdAndUpdate` for a more concise operation
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: `User ${user.fullName} has been approved.` });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Critical security check: prevent deletion of the main admin or other admins
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete an admin user.');
  }

  await user.deleteOne();
  res.json({ message: 'User removed successfully.' });
});

// @desc    Get platform-wide usage statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getUsageStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalSchools, totalQuizAttempts, pendingUsers] = await Promise.all([
        User.countDocuments({}),
        School.countDocuments({}),
        QuizAttempt.countDocuments({}),
        User.countDocuments({ status: 'pending' }),
    ]);

    res.json({ totalUsers, totalSchools, totalQuizAttempts, pendingUsers });
});

// @desc    Create a new school and its admin user
// @route   POST /api/admin/schools
// @access  Private/Admin
const createSchool = asyncHandler(async (req, res) => {
  const { name, adminName, adminEmail, adminPassword } = req.body;
  // TODO: Add robust validation for these fields

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schoolExists = await School.findOne({ name }).session(session);
    if (schoolExists) throw new Error('School with this name already exists.');

    const adminExists = await User.findOne({ email: adminEmail }).session(session);
    if (adminExists) throw new Error('A user with this email already exists.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the school first
    const school = new School({ name });
    const createdSchool = await school.save({ session });

    // Then create the school admin, associating them with the new school
    const schoolAdmin = new User({
      fullName: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'school_admin',
      status: 'approved',
      school: createdSchool._id, // Associate user with school
    });
    const createdAdmin = await schoolAdmin.save({ session });
    
    // Finally, update the school with the ID of its admin
    createdSchool.admin = createdAdmin._id;
    await createdSchool.save({ session });

    await session.commitTransaction();
    res.status(201).json({ 
        message: `School '${name}' created successfully with ${adminName} as admin.`,
        school: createdSchool 
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400); // Bad request due to duplicate or bad data
    throw error;
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

// @desc    Delete a school and all its associated users
// @route   DELETE /api/admin/schools/:id
// @access  Private/Admin
const deleteSchool = asyncHandler(async (req, res) => {
    const schoolId = req.params.id;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const school = await School.findById(schoolId).session(session);
        if (!school) {
            throw new Error('School not found');
        }

        // Delete all users associated with this school
        const deletionResult = await User.deleteMany({ school: schoolId }).session(session);
        // Delete the school itself
        await school.deleteOne({ session });

        await session.commitTransaction();
        res.json({ message: `School removed, and ${deletionResult.deletedCount} associated users were deleted.` });

    } catch (error) {
        await session.abortTransaction();
        res.status(404);
        throw error;
    } finally {
        session.endSession();
    }
});


// ... (assignUserToSchool can remain similar but should check if schoolId is valid)
/**
 * @desc    Assign a user to a school
 * @route   PUT /api/admin/users/:id/assign-school
 * @access  Private/Admin
 */
const assignUserToSchool = asyncHandler(async (req, res) => {
  const { schoolId } = req.body;
  const { id: userId } = req.params;

  // --- Input Validation ---
  if (!schoolId) {
    res.status(400);
    throw new Error('School ID is required in the request body.');
  }
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(schoolId)) {
      res.status(400);
      throw new Error('Invalid User or School ID format.');
  }

  // Check for existence of both user and school in parallel
  const [user, school] = await Promise.all([
      User.findById(userId),
      School.findById(schoolId)
  ]);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (!school) {
    res.status(404);
    throw new Error('School not found.');
  }

  user.school = schoolId;
  const updatedUser = await user.save();

  res.json({
      message: `Successfully assigned ${user.fullName} to school: ${school.name}.`,
      user: updatedUser,
  });
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