const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST /api/contact - Submit Contact Form
router.post('/', contactController.submitContactForm);

module.exports = router;
