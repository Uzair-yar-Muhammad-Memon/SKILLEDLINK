const express = require('express');
const router = express.Router();
const { protectUser } = require('../middleware/auth');
const { addReview, getWorkerReviews } = require('../controllers/reviewController');

router.post('/add', protectUser, addReview);
router.get('/worker/:id', getWorkerReviews);

module.exports = router;
