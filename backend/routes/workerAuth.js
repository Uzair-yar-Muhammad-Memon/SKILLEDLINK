const express = require('express');
const router = express.Router();
const { signupWorker, loginWorker } = require('../controllers/workerAuthController');

router.post('/signup', signupWorker);
router.post('/login', loginWorker);

module.exports = router;
