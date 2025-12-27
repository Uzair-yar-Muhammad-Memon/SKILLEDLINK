const express = require('express');
const router = express.Router();
const { protectUser, protectWorker } = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// This middleware checks if either user or worker is authenticated
const protectAny = async (req, res, next) => {
  let userError = null;
  let workerError = null;
  
  try {
    await protectUser(req, res, () => {});
    return next();
  } catch (error) {
    userError = error;
  }
  
  try {
    await protectWorker(req, res, () => {});
    return next();
  } catch (error) {
    workerError = error;
  }
  
  // If both failed, return error
  return res.status(401).json({
    success: false,
    message: 'Not authorized'
  });
};

router.get('/', protectAny, getNotifications);
router.put('/:id/read', protectAny, markAsRead);

module.exports = router;
