const express = require('express');
const router = express.Router();
const { signupUser, loginUser, updateUserProfile } = require('../controllers/userAuthController');
const { protectUser } = require('../middleware/auth');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.put('/update-profile', protectUser, updateUserProfile);

module.exports = router;
