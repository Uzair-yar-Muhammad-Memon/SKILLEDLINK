const Worker = require('../models/Worker');

// @desc    Get all workers
// @route   GET /workers/list
exports.listWorkers = async (req, res) => {
  try {
    const { city, skillCategory, availabilityStatus } = req.query;
    console.log('listWorkers called with query params:', { city, skillCategory, availabilityStatus });
    
    const filter = {};
    if (city && city.trim()) {
      // Case-insensitive city match
      filter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
      console.log('Applied city filter:', filter.city);
    }
    if (skillCategory && skillCategory.trim()) {
      // Find category by name (case-insensitive) or ObjectId
      const Category = require('../models/Category');
      try {
        const category = await Category.findOne({ 
          name: { $regex: new RegExp(`^${skillCategory.trim()}$`, 'i') } 
        });
        console.log('Found category:', category);
        if (category) {
          filter.skillCategory = category._id;
          console.log('Applied category filter:', filter.skillCategory);
        } else {
          console.log('No category found for:', skillCategory);
        }
      } catch (err) {
        console.log('Error finding category:', err);
        // If it's already an ObjectId, use it directly
        filter.skillCategory = skillCategory;
      }
    }
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus;
    
    console.log('Final filter:', filter);
    const workers = await Worker.find(filter)
      .populate('skillCategory', 'name description')
      .select('-password')
      .sort({ ratingAverage: -1 });
    
    console.log(`Found ${workers.length} workers`);
    res.status(200).json({
      success: true,
      message: 'Workers retrieved successfully',
      data: workers
    });
  } catch (error) {
    console.error('Error in listWorkers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get worker by ID
// @route   GET /workers/:id
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('skillCategory', 'name description')
      .select('-password');
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Worker retrieved successfully',
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update worker profile
// @route   PUT /workers/update-profile
exports.updateWorkerProfile = async (req, res) => {
  try {
    const { bio, availabilityStatus, location, phone, city, skills } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (availabilityStatus) updateData.availabilityStatus = availabilityStatus;
    if (location) updateData.location = location;
    if (phone) updateData.phone = phone;
    if (city) updateData.city = city;
    if (skills) updateData.skills = skills;
    
    const worker = await Worker.findByIdAndUpdate(
      req.worker._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('skillCategory', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add or update a skill
// @route   POST /workers/skills
exports.addSkill = async (req, res) => {
  try {
    const { skillName, yearsOfExperience, description } = req.body;
    
    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }
    
    const worker = await Worker.findById(req.worker._id);
    
    // Check if skill already exists
    const existingSkillIndex = worker.skills.findIndex(
      s => s.skillName.toLowerCase() === skillName.toLowerCase()
    );
    
    if (existingSkillIndex !== -1) {
      // Update existing skill
      worker.skills[existingSkillIndex].yearsOfExperience = yearsOfExperience || 0;
      worker.skills[existingSkillIndex].description = description || '';
    } else {
      // Add new skill
      worker.skills.push({
        skillName,
        yearsOfExperience: yearsOfExperience || 0,
        description: description || ''
      });
    }
    
    await worker.save();
    
    res.status(200).json({
      success: true,
      message: existingSkillIndex !== -1 ? 'Skill updated successfully' : 'Skill added successfully',
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove a skill
// @route   DELETE /workers/skills/:skillId
exports.removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const worker = await Worker.findById(req.worker._id);
    
    worker.skills = worker.skills.filter(s => s._id.toString() !== skillId);
    
    await worker.save();
    
    res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get workers by category
// @route   GET /workers/by-category
exports.getWorkersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }
    
    const workers = await Worker.find({ skillCategory: categoryId })
      .populate('skillCategory', 'name description')
      .select('-password')
      .sort({ ratingAverage: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Workers retrieved successfully',
      data: workers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
