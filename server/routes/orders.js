const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// POST /api/orders - Create Order (Protected)
router.post('/', auth, orderController.createOrder);

// GET /api/orders - Get User History (Protected)
router.get('/', auth, orderController.getUserOrders);

module.exports = router;
