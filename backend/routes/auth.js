const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Create user (password is auto-hashed by the model pre-save hook)
        const user = await User.create({ name, email: email.toLowerCase(), password });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                purchasedCourses: user.purchasedCourses
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if account is active
        if (user.status === 'inactive') {
            return res.status(403).json({ error: 'Your account has been deactivated' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                purchasedCourses: user.purchasedCourses
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update current user profile
router.put('/me', auth, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email.toLowerCase();

        const user = await User.findById(req.user._id);

        if (password && password.length >= 6) {
            user.password = password; // Will be hashed by pre-save hook
        }

        Object.assign(user, updates);
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
