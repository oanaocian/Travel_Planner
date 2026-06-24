const express = require('express');
const router = express.Router();
const favouritesController = require('../controllers/favouritesController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, favouritesController.getAll);
router.post('/', authMiddleware, favouritesController.add);
router.delete('/:id', authMiddleware, favouritesController.remove);

module.exports = router;