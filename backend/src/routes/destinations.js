const express = require('express');
const router = express.Router();
const destinationsController = require('../controllers/destinationsController');
const authMiddleware = require('../middleware/auth');

router.get('/', destinationsController.getAll);
router.get('/:id', destinationsController.getOne);
router.post('/', authMiddleware, destinationsController.create);
router.delete('/:id', authMiddleware, destinationsController.remove);

module.exports = router;