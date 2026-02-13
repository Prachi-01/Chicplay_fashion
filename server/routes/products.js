const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isAdmin, isVendorOrAdmin, optionalAuth } = require('../middleware/auth');

// GET /api/products
router.get('/', optionalAuth, productController.getProducts);

// Admin Approval Routes - MUST BE BEFORE /:id because "admin" could be interpreted as an id
router.get('/admin/pending', auth, isAdmin, productController.getPendingProducts);

// GET /api/products/:id
router.get('/:id', productController.getProductById);

// POST /api/products/upload (Admin)
const { parser } = require('../config/cloudinary');
router.post('/upload', auth, isVendorOrAdmin, parser.single('image'), (req, res, next) => {
    console.log('🚀 Upload route hit');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    next();
}, productController.createProduct);

// PUT /api/products/:id (Admin/Vendor)
router.put('/:id', auth, isVendorOrAdmin, productController.updateProduct);

// DELETE /api/products/bulk (Admin/Vendor)
router.post('/bulk-delete', auth, isVendorOrAdmin, productController.deleteBulkProducts);

// DELETE /api/products/:id (Admin/Vendor)
router.delete('/:id', auth, isVendorOrAdmin, productController.deleteProduct);

// Specifications Routes
router.get('/:id/specifications', productController.getSpecifications);
router.put('/:id/specifications', auth, isAdmin, productController.updateSpecifications);
router.post('/:id/specifications/add', auth, isAdmin, productController.addSpecification);

// Admin Action Routes
router.patch('/:id/approve', auth, isAdmin, productController.approveProduct);

// POST /api/products/upload-image (Admin/Vendor - Single Image Upload)
router.post('/upload-image', auth, isVendorOrAdmin, parser.single('image'), (req, res) => {
    console.log('📸 Upload-image route hit');
    console.log('File:', req.file);
    if (!req.file) {
        console.error('❌ No file received by Multer');
        return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('✅ File uploaded to Cloudinary:', req.file.path);
    res.json({ url: req.file.path });
});

module.exports = router;

