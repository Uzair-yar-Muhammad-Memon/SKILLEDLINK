const express = require('express');
const router = express.Router();
const { getWorkerLocations } = require('../controllers/mapController');

router.get('/worker-locations', getWorkerLocations);

module.exports = router;
