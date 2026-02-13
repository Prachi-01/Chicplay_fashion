const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
// const authMiddleware = require('../middleware/auth'); // To be created

const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getProfile);

module.exports = router;
