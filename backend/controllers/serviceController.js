const Service = require('../models/Service');
const Notification = require('../models/Notification');

// @desc    Post a new service request
// @route   POST /services/post
exports.postService = async (req, res) => {
  try {
    const { title, skill, city, description, budgetMin, budgetMax, address, workerId } = req.body;
    
    const serviceData = {
      userId: req.user._id,
      title,
      skill,
      city,
      description,
      budgetMin: budgetMin || 0,
      budgetMax: budgetMax || 0,
      address
    };

    // If a specific worker is requested, add workerId and set status to pending
    if (workerId) {
      serviceData.workerId = workerId;
      serviceData.status = 'pending';
      
      // Create notification for the worker
      await Notification.create({
        userId: workerId,
        message: `New service request: ${title}`,
        type: 'service_request',
        relatedId: null // Will be set after service creation
      });
    }
    
    const service = await Service.create(serviceData);
    
    // Update notification with service ID if workerId was provided
    if (workerId) {
      await Notification.updateOne(
        { userId: workerId, relatedId: null, type: 'service_request' },
        { relatedId: service._id }
      );
    }
    
    const populatedService = await Service.findById(service._id)
      .populate('userId', 'name phone city')
      .populate('workerId', 'name phone ratingAverage');
    
    res.status(201).json({
      success: true,
      message: workerId ? 'Service request sent to worker' : 'Job request posted successfully',
      data: populatedService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all services
// @route   GET /services/list
exports.listServices = async (req, res) => {
  try {
    const { status, city, categoryId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = city;
    if (categoryId) filter.categoryId = categoryId;
    
    const services = await Service.find(filter)
      .populate('userId', 'name phone city')
      .populate('workerId', 'name phone ratingAverage')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Services retrieved successfully',
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get service by ID
// @route   GET /services/:id
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('userId', 'name phone city')
      .populate('workerId', 'name phone ratingAverage city')
      .populate('categoryId', 'name description');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service retrieved successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept service (worker only)
// @route   PUT /services/:id/accept
exports.acceptService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    if (service.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Service is not available'
      });
    }
    
    service.workerId = req.worker._id;
    service.status = 'accepted';
    await service.save();
    
    // Create notification for user
    await Notification.create({
      userId: service.userId,
      message: `Your service request has been accepted by ${req.worker.name}`,
      type: 'job_accepted'
    });
    
    const updatedService = await Service.findById(service._id)
      .populate('userId', 'name phone')
      .populate('workerId', 'name phone')
      .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Service accepted successfully',
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete service
// @route   PUT /services/:id/complete
exports.completeService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    service.status = 'completed';
    await service.save();
    
    // Create notification
    await Notification.create({
      userId: service.userId,
      message: 'Your service has been marked as completed',
      type: 'job_completed'
    });
    
    res.status(200).json({
      success: true,
      message: 'Service marked as completed',
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
