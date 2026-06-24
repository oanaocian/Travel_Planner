const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const authMiddleware = require('../middleware/auth');

router.post('/:tripId/activities', authMiddleware, activitiesController.create);
router.put('/:id', authMiddleware, activitiesController.update);
router.delete('/:id', authMiddleware, activitiesController.remove);
router.get('/:tripId/cost', authMiddleware, activitiesController.getCost);

module.exports = router;