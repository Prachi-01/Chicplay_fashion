const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/mysql/User');
const GameProfile = require('../models/mongo/GameProfile'); // MongoDB Model
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

// Register User
exports.register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        email = email.toLowerCase();
        console.log(`📝 Register attempt for: ${email}`);

        // 1. Check if user exists in MySQL
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('❌ User already exists in MySQL');
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create MySQL User
        console.log('Creating MySQL user...');
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        console.log('✅ MySQL user created. ID:', newUser.id);

        // 4. Create MongoDB Game Profile linked to MySQL ID
        console.log('Creating MongoDB profile...');
        try {
            await GameProfile.create({
                userId: newUser.id,
                currentTitle: 'Fashion Newbie',
                points: 0,
                level: 1
            });
            console.log('✅ MongoDB profile created');
        } catch (mongoError) {
            console.error('❌ MongoDB Profile Creation Failed:', mongoError.message);
            // If it's a validation error, log validation details
            if (mongoError.name === 'ValidationError') {
                console.error('Validation Error Details:', mongoError.errors);
            }
            // Optional: Rollback MySQL user creation if strict consistency is needed
            // await newUser.destroy(); 
            // return res.status(500).json({ message: 'Error creating game profile' });

            // For now, let's proceed but log it. The user exists, just without stats.
        }

        // 5. Generate Token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('🔥 Registration Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        console.log(`📡 Login attempt for: ${email}`);

        // 1. Find User in MySQL
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('❌ User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Login successful');


        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('🔥 Login Error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await user.update({
            resetCode: otp,
            resetCodeExpires: expires
        });

        const emailSent = await emailService.sendOTP(email, otp);
        if (emailSent) {
            res.json({ message: 'OTP sent to your email' });
        } else {
            res.status(500).json({ message: 'Failed to send email. Please check server configuration.' });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.toLowerCase();
        console.log(`🔍 Verifying OTP for: ${email}, Code: ${otp}`);

        const user = await User.findOne({
            where: {
                email,
                resetCode: otp,
                resetCodeExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            console.log(`❌ Verification failed: No matching active OTP for ${email}`);
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        console.log(`✅ OTP Verified for ${email}`);
        res.json({ message: 'OTP verified successfully', verified: true });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        email = email.toLowerCase();
        console.log(`🔐 Attempting password reset for: ${email}, OTP: ${otp}`);

        const user = await User.findOne({
            where: {
                email,
                resetCode: otp,
                resetCodeExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            console.log(`❌ Reset failed: User not found with email ${email} and current OTP/Expiry`);
            // Check if user exists at all
            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                console.log(`ℹ️ User ${email} exists, but ResetCode is ${userExists.resetCode} (expected ${otp}) and Expires is ${userExists.resetCodeExpires}`);
            } else {
                console.log(`❌ User ${email} does not exist in database`);
            }
            return res.status(400).json({ message: 'Invalid or expired session. Please request a new OTP.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password: hashedPassword,
            resetCode: null,
            resetCodeExpires: null
        });

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Profile (Combined Data)
exports.getProfile = async (req, res) => {
    try {
        // req.user comes from middleware (to be implemented)
        const userId = req.user.id;

        // Fetch Basic Info from MySQL
        console.log(`👤 Fetching profile for userId: ${userId}`);
        const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });

        // Fetch Game Stats from MongoDB
        console.log(`🎮 Fetching game stats for userId: ${userId}`);
        const gameProfile = await GameProfile.findOne({ userId });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            ...user.toJSON(),
            gameProfile: gameProfile || {} // Return empty obj if no game profile found (shouldn't happen)
        });

    } catch (error) {
        console.error('🔥 Profile Fetch Error:', error);
        res.status(500).json({
            message: 'Server error fetching profile',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
