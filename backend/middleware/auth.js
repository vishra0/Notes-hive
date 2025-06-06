const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded:', decoded);

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('No user found for token');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('User authenticated:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;