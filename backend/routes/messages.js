const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.post('/', authenticate, messageController.sendMessage);
router.get('/request/:serviceRequestId', authenticate, messageController.getMessages);
router.put('/request/:serviceRequestId/read', authenticate, messageController.markAsRead);
router.get('/conversations', authenticate, messageController.getConversations);
router.get('/unread-count', authenticate, messageController.getUnreadCount);

module.exports = router;
