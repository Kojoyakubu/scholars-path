const User = require('../models/userModel');
const QuizAttempt = require('../models/quizAttemptModel');
const School = require('../models/schoolModel');
const mongoose = require('mongoose');

const getUsers = async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await User.countDocuments({});
  const users = await User.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .select('-password');

  res.json({ users, page, pages: Math.ceil(count / pageSize) });
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = 'approved';
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

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

const getUsageStats = async (req, res) => {
  try {
    const [studentCount, teacherCount, quizAttemptsCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      QuizAttempt.countDocuments({}),
    ]);
    res.json({
      students: studentCount,
      teachers: teacherCount,
      quizAttempts: quizAttemptsCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createSchool = async (req, res) => {
  const { name, schoolAdminEmail } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const schoolExists = await School.findOne({ name }).session(session);
    if (schoolExists) {
      throw new Error('A school with this name already exists');
    }

    const schoolAdminUser = await User.findOne({ email: schoolAdminEmail }).session(session);
    if (!schoolAdminUser) {
      throw new Error(`User with email ${schoolAdminEmail} not found.`);
    }

    const [school] = await School.create([{
      name,
      admin: schoolAdminUser._id,
    }], { session });

    schoolAdminUser.role = 'school_admin';
    schoolAdminUser.school = school._id;
    await schoolAdminUser.save({ session });

    await session.commitTransaction();
    res.status(201).json({ school, message: `${schoolAdminUser.fullName} is now the admin for ${name}.` });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
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