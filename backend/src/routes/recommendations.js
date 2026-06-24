const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, recommendationsController.getRecommendations);

module.exports = router;