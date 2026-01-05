const express = require('express');
const router = express.Router();
const { getRewards } = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRewards);

module.exports = router;
