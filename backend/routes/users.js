const router = require('express').Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const { role, search } = req.query;
        let filter = {};

        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single user (admin only)
router.get('/:id', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('purchasedCourses');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create user (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: password || 'default123',
            role: role || 'student',
            status: status || 'active'
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update user (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { name, email, role, status } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (email) updates.email = email.toLowerCase();
        if (role) updates.role = role;
        if (status) updates.status = status;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete user (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        // Prevent deleting yourself
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
