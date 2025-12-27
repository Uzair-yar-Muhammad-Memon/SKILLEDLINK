const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

exports.protectUser = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 Token decoded, user ID:', decoded.id);
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('❌ User not found in database for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }
    
    console.log('✅ User authenticated:', req.user.name);
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

exports.protectWorker = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.worker = await Worker.findById(decoded.id);
    
    if (!req.worker) {
      return res.status(401).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Authenticate either user or worker
exports.authenticate = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user first
    req.user = await User.findById(decoded.id);
    
    // If not user, try worker
    if (!req.user) {
      req.worker = await Worker.findById(decoded.id);
    }
    
    if (!req.user && !req.worker) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Aliases for consistency
exports.authenticateUser = exports.protectUser;
exports.authenticateWorker = exports.protectWorker;
