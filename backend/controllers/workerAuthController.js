const Worker = require('../models/Worker');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register worker
// @route   POST /auth/worker/signup
exports.signupWorker = async (req, res) => {
  try {
    const { name, email, phone, password, skillCategory, city, bio, location } = req.body;
    
    const workerExists = await Worker.findOne({ email });
    
    if (workerExists) {
      return res.status(400).json({
        success: false,
        message: 'Worker already exists with this email'
      });
    }
    
    // Find category by name (case-insensitive)
    const category = await Category.findOne({ 
      name: new RegExp(`^${skillCategory}$`, 'i') 
    });
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category '${skillCategory}' not found`
      });
    }
    
    const worker = await Worker.create({
      name,
      email,
      phone,
      password,
      skillCategory: category._id,
      city,
      bio,
      location,
      skills: [{
        skillName: category.name,
        yearsOfExperience: 0,
        description: bio || `Professional ${category.name} services`
      }]
    });
    
    const token = generateToken(worker._id);
    
    const populatedWorker = await Worker.findById(worker._id).populate('skillCategory', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Worker registered successfully',
      data: {
        worker: {
          id: populatedWorker._id,
          name: populatedWorker.name,
          email: populatedWorker.email,
          phone: populatedWorker.phone,
          skillCategory: populatedWorker.skillCategory,
          city: populatedWorker.city,
          bio: populatedWorker.bio,
          availabilityStatus: populatedWorker.availabilityStatus,
          skills: populatedWorker.skills || []
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login worker
// @route   POST /auth/worker/login
exports.loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    const worker = await Worker.findOne({ email }).select('+password').populate('skillCategory', 'name');
    
    if (!worker || !(await worker.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const token = generateToken(worker._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        worker: {
          id: worker._id,
          name: worker.name,
          email: worker.email,
          phone: worker.phone,
          skillCategory: worker.skillCategory,
          city: worker.city,
          bio: worker.bio,
          ratingAverage: worker.ratingAverage,
          reviewsCount: worker.reviewsCount,
          availabilityStatus: worker.availabilityStatus,
          skills: worker.skills || []
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
