const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, isAdmin } = require('../middleware/auth');
const { vendorParser } = require('../config/vendorCloudinary');

// Public: Vendor Registration
router.post('/register', vendorParser.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'businessProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
]), vendorController.registerVendor);

// Admin Routes
router.get('/admin/all', auth, isAdmin, vendorController.getAllVendors);
router.put('/admin/:id/status', auth, isAdmin, vendorController.updateVendorStatus);

// Vendor Routes
router.get('/me', auth, vendorController.getVendorProfile);
router.get('/orders', auth, vendorController.getVendorOrders);
router.get('/products', auth, vendorController.getVendorProducts);

module.exports = router;
