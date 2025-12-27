const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateUser, authenticateWorker, authenticate } = require('../middleware/auth');

// User routes (service receivers)
router.post('/', authenticateUser, requestController.createRequest);
router.get('/user', authenticateUser, requestController.getUserRequests);
router.get('/:id', authenticate, requestController.getRequestById);
router.put('/:id/cancel', authenticateUser, requestController.cancelRequest);

// Worker routes (service providers)
router.get('/worker/all', authenticateWorker, requestController.getWorkerRequests);
router.put('/:id/accept', authenticateWorker, requestController.acceptRequest);
router.put('/:id/reject', authenticateWorker, requestController.rejectRequest);
router.put('/:id/complete', authenticateWorker, requestController.completeRequest);

// Shared routes
router.put('/:id/status', authenticate, requestController.updateRequestStatus);

module.exports = router;
