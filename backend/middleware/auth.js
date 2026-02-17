const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Check if user is admin or instructor
const staffOnly = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
        return res.status(403).json({ error: 'Staff access required' });
    }
    next();
};

module.exports = { auth, adminOnly, staffOnly };
