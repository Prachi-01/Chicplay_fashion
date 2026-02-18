const { User, VendorProfile, OrderItem, Order } = require('../config/db');
const Product = require('../models/mongo/Product');
const GameProfile = require('../models/mongo/GameProfile'); // Need this
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Register Vendor
exports.registerVendor = async (req, res) => {
    console.log('🚀 Registration process started');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📎 Files received:', req.files ? Object.keys(req.files) : 'No files');

    try {
        let {
            storeName, businessType, ownerName, email, phone,
            panNumber, gstNumber, pickupAddress, password,
            bankAccountHolder, bankAccountNumber, bankIfsc, bankName
        } = req.body;

        email = email.toLowerCase();

        // Validate required fields
        console.log('✅ Validating required fields...');
        if (!email || !password || !storeName || !ownerName) {
            console.log('❌ Missing required fields:', { email: !!email, password: !!password, storeName: !!storeName, ownerName: !!ownerName });
            return res.status(400).json({ message: 'Store Name, owner name, Email and Password are required' });
        }

        // Additional validation for vendor-specific fields
        if (!phone || !panNumber || !pickupAddress) {
            console.log('❌ Missing vendor fields:', { phone: !!phone, panNumber: !!panNumber, pickupAddress: !!pickupAddress });
            return res.status(400).json({ message: 'Phone, PAN Number, and Pickup Address are required' });
        }

        if (!bankAccountHolder || !bankAccountNumber || !bankIfsc || !bankName) {
            console.log('❌ Missing bank details:', {
                bankAccountHolder: !!bankAccountHolder,
                bankAccountNumber: !!bankAccountNumber,
                bankIfsc: !!bankIfsc,
                bankName: !!bankName
            });
            return res.status(400).json({ message: 'All bank details (Account Holder, Account Number, IFSC, Bank Name) are required' });
        }

        // 1. Check if user exists in MySQL
        console.log('🔍 Checking if user exists...');
        let user = await User.findOne({ where: { email } });

        let isExistingUserUpgrade = false;

        if (user) {
            console.log('ℹ️ User exists with email:', email);

            // Check if they are already a vendor
            if (user.role === 'vendor') {
                console.log('❌ User is already a vendor');
                return res.status(400).json({ message: 'A vendor account with this email already exists' });
            }

            // check if VendorProfile already exists (just in case)
            const existingProfile = await VendorProfile.findOne({ where: { userId: user.id } });
            if (existingProfile) {
                console.log('❌ Vendor profile already exists');
                return res.status(400).json({ message: 'A vendor profile for this account already exists' });
            }

            console.log('🚀 Upgrading existing user to vendor role...');
            isExistingUserUpgrade = true;

            // Verify password for existing user upgrade
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log('❌ Password mismatch for existing user upgrade');
                return res.status(401).json({ message: 'Invalid credentials for existing account upgrade' });
            }

            // Update role
            user.role = 'vendor';
            await user.save();
        }

        let hashedPassword = null;
        if (!isExistingUserUpgrade) {
            // 2. Hash Password
            console.log('🔐 Hashing password...');
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);

            // 3. Create User in MySQL
            console.log('👤 Creating user...');
            const username = (ownerName || 'vendor').replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            user = await User.create({
                username,
                email,
                password: hashedPassword,
                role: 'vendor'
            });
        }

        console.log('✅ User (Vendor) ready with ID:', user.id);

        // 4. Create Vendor Profile in MySQL
        console.log('🏪 Preparing vendor profile...');
        const files = req.files || {};
        const documents = {
            panCard: (files.panCard && files.panCard[0]) ? files.panCard[0].path : null,
            gstCertificate: (files.gstCertificate && files.gstCertificate[0]) ? files.gstCertificate[0].path : null,
            businessProof: (files.businessProof && files.businessProof[0]) ? files.businessProof[0].path : null,
            addressProof: (files.addressProof && files.addressProof[0]) ? files.addressProof[0].path : null
        };

        const bankDetails = {
            accountHolder: bankAccountHolder,
            accountNumber: bankAccountNumber,
            ifsc: bankIfsc,
            bankName: bankName
        };

        console.log('📄 Documents:', JSON.stringify(documents, null, 2));
        console.log('🏦 Bank Details:', JSON.stringify(bankDetails, null, 2));

        console.log('💾 Creating vendor profile...');
        const vendor = await VendorProfile.create({
            userId: user.id,
            storeName,
            businessType,
            ownerName,
            phone,
            panNumber,
            gstNumber: gstNumber || null,
            pickupAddress,
            bankDetails,
            documents,
            status: 'Pending'
        });
        console.log('✅ Vendor profile created with ID:', vendor.id);

        // 5. Create Game Profile in MongoDB (Gamification)
        try {
            await GameProfile.create({
                userId: user.id,
                currentTitle: 'Apprentice Seller',
                points: 0,
                level: 1
            });
        } catch (mongoErr) {
            console.error('⚠️ Failed to create GameProfile:', mongoErr.message);
        }

        console.log('Step 6: Generating Token');
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );

        console.log('✅ Registration complete!');
        res.status(201).json({
            message: 'Vendor application submitted successfully!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            vendor
        });

    } catch (err) {
        console.error('❌ SEVERE Registration Error:', err);
        res.status(500).json({
            message: 'Server Error during registration',
            error: err.message,
            stack: err.stack
        });
    }
};

// Admin: Get All Vendors
exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await VendorProfile.findAll({
            include: [{ model: User, attributes: ['email', 'avatarUrl'] }]
        });
        res.json(vendors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin: Update Status
exports.updateVendorStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const vendorId = req.params.id;

        const vendor = await VendorProfile.findByPk(vendorId);
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        vendor.status = status;
        if (status === 'Rejected') {
            vendor.rejectionReason = rejectionReason;
        } else {
            vendor.rejectionReason = null;
        }

        await vendor.save();
        res.json(vendor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Vendor: Get Profile
exports.getVendorProfile = async (req, res) => {
    try {
        const vendor = await VendorProfile.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, attributes: ['email', 'avatarUrl'] }]
        });
        if (!vendor) return res.status(404).json({ message: 'Vendor profile not found' });
        res.json(vendor);
    } catch (err) {
        console.error('🔥 Error in getVendorProfile:', err);
        res.status(500).send('Server Error');
    }
};

// Vendor: Get Orders
exports.getVendorOrders = async (req, res) => {
    try {
        const orders = await OrderItem.findAll({
            where: { vendorId: req.user.id },
            include: [{
                model: Order,
                as: 'Order',
                attributes: ['userId', 'status', 'createdAt']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error('🔥 Error in getVendorOrders:', err);
        res.status(500).send('Server Error');
    }
};

// Vendor: Get Products
exports.getVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.id });
        res.json(products);
    } catch (error) {
        console.error('🔥 Error in getVendorProducts:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
