const express = require('express');
const router = express.Router();
const { protectUser, protectWorker } = require('../middleware/auth');
const { 
  postService, 
  listServices, 
  getServiceById,
  acceptService,
  completeService
} = require('../controllers/serviceController');

// User routes
router.post('/', protectUser, postService); // User posts a job
router.get('/my-requests', protectUser, async (req, res) => {
  try {
    const Service = require('../models/Service');
    const services = await Service.find({ userId: req.user._id })
      .populate('workerId', 'name phone ratingAverage')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Worker routes
router.get('/available', protectWorker, async (req, res) => {
  try {
    const Service = require('../models/Service');
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(req.worker.id).populate('skillCategory');
    const skillName = worker.skillCategory.name.toLowerCase();
    
    const services = await Service.find({ 
      status: 'pending',
      city: worker.city,
      skill: { $regex: new RegExp(skillName, 'i') }
    })
      .populate('userId', 'name phone city')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my-jobs', protectWorker, async (req, res) => {
  try {
    const Service = require('../models/Service');
    const services = await Service.find({ workerId: req.worker._id })
      .populate('userId', 'name phone city')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Common routes
router.get('/', listServices);
router.get('/:id', getServiceById);
router.put('/:id/accept', protectWorker, acceptService);
router.put('/:id/complete', completeService);
router.put('/:id/cancel', protectUser, async (req, res) => {
  try {
    const Service = require('../models/Service');
    const service = await Service.findById(req.params.id);
    if (!service || service.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    service.status = 'cancelled';
    service.cancelledAt = new Date();
    await service.save();
    res.json({ success: true, message: 'Job cancelled successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
