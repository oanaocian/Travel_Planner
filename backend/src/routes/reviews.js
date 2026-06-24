const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const authMiddleware = require('../middleware/auth');

router.get('/:destination_id', reviewsController.getAll);
router.post('/:destination_id', authMiddleware, reviewsController.add);
router.delete('/:id', authMiddleware, reviewsController.remove);

module.exports = router;