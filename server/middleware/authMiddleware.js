const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  // This middleware runs *after* 'protect', so req.user will exist.
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed to the next function (the controller).
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const teacher = (req, res, next) => {
  // Admins can always create content (for the 'individual learner' model)
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  // Teachers can only create content IF they are assigned to a school
  if (req.user && req.user.role === 'teacher' && req.user.school) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized: Teacher must be assigned to a school to create content.' });
  }
};

module.exports = { protect, admin, teacher };