const express = require('express');
const router = express.Router();
const { protectWorker } = require('../middleware/auth');
const { 
  listWorkers, 
  getWorkerById, 
  updateWorkerProfile,
  getWorkersByCategory,
  addSkill,
  removeSkill
} = require('../controllers/workerController');

router.get('/me', protectWorker, async (req, res) => {
  try {
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(req.worker.id).populate('skillCategory', 'name');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/me/services', protectWorker, async (req, res) => {
  try {
    const Worker = require('../models/Worker');
    const { title, description, skill, city, budgetMin, budgetMax } = req.body;
    
    const worker = await Worker.findById(req.worker.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    worker.services.push({
      title,
      description,
      skill,
      city,
      budgetMin: budgetMin || 0,
      budgetMax: budgetMax || 0
    });
    
    await worker.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Service added successfully',
      data: worker.services[worker.services.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me/services', protectWorker, async (req, res) => {
  try {
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(req.worker.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, data: worker.services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/services', async (req, res) => {
  try {
    const Worker = require('../models/Worker');
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.json({ success: true, data: worker.services || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', listWorkers); // Also support /workers directly
router.get('/list', listWorkers);
router.get('/by-category', getWorkersByCategory);
router.get('/:id', getWorkerById);
router.put('/update-profile', protectWorker, updateWorkerProfile);

// Skill management routes
router.post('/skills', protectWorker, addSkill);
router.delete('/skills/:skillId', protectWorker, removeSkill);

module.exports = router;
