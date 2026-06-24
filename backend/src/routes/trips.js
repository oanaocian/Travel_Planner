const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');
const authMiddleware = require('../middleware/auth');
const { sendTripEmail } = require('../controllers/emailController');

// public route — no auth needed
router.get('/public', tripsController.getPublic);

router.get('/', authMiddleware, tripsController.getAll);
router.get('/:id', authMiddleware, tripsController.getOne);
router.post('/', authMiddleware, tripsController.create);
router.put('/:id', authMiddleware, tripsController.update);
router.delete('/:id', authMiddleware, tripsController.remove);
router.patch('/:id/toggle-public', authMiddleware, tripsController.togglePublic);
router.post('/:id/copy', authMiddleware, tripsController.copyTrip);
router.post('/:id/send-email', authMiddleware, sendTripEmail);

module.exports = router;