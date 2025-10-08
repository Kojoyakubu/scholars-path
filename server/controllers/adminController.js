const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');
const School = require('../models/schoolModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = 'approved'; // We only change the status now
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete an admin account' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get usage statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getUsageStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const quizAttemptsCount = await QuizAttempt.countDocuments({});

    res.json({
      students: studentCount,
      teachers: teacherCount,
      quizAttempts: quizAttemptsCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new school
// @route   POST /api/admin/schools
// @access  Private/Admin
const createSchool = async (req, res) => {
  const { name, schoolAdminEmail } = req.body; // We now expect an email for the admin

  try {
    // Check if school already exists
    if (await School.findOne({ name })) {
      return res.status(400).json({ message: 'A school with this name already exists' });
    }

    // Find the user who will become the school admin
    const schoolAdminUser = await User.findOne({ email: schoolAdminEmail });
    if (!schoolAdminUser) {
      return res.status(404).json({ message: `User with email ${schoolAdminEmail} not found.` });
    }

    // Create the school
    const school = await School.create({
      name,
      admin: schoolAdminUser._id, // Link the school to its new admin
    });

    // Update the user's role and assign them to the new school
    schoolAdminUser.role = 'school_admin';
    schoolAdminUser.school = school._id;
    await schoolAdminUser.save();

    res.status(201).json({ school, message: `${schoolAdminUser.fullName} is now the admin for ${name}.` });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const assignUserToSchool = async (req, res) => {
  const { schoolId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.school = schoolId;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getSchools = async (req, res) => {
  try {
    const schools = await School.find({});
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (school) {
      // Future enhancement: You might want to decide what happens to users/content
      // linked to this school before deleting. For now, we'll just remove the school.
      await school.deleteOne();
      res.json({ message: 'School removed' });
    } else {
      res.status(404).json({ message: 'School not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  approveUser,
  deleteUser,
  getUsageStats,
  createSchool,
  assignUserToSchool,
  getSchools,
  deleteSchool,
};
