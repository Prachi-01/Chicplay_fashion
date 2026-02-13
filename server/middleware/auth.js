const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        console.log('🔑 Token verified for user:', decoded.id);
        req.user = decoded; // { id, role, ... }
        next();
    } catch (err) {
        console.error('❌ Token Verification Failed:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};

const isVendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Vendors only' });
    }
};

const isVendorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins or Vendors only' });
    }
};

const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded;
        next();
    } catch (err) {
        // Continue even if token is invalid
        next();
    }
};

module.exports = { auth, isAdmin, isVendor, isVendorOrAdmin, optionalAuth };
