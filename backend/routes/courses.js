const router = require('express').Router();
const Course = require('../models/Course');
const { auth, staffOnly } = require('../middleware/auth');

// Get all courses (public)
router.get('/', async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let filter = {};

        if (category && category !== 'all') filter.category = category;
        if (status && status !== 'all') filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { instructor: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(filter).sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single course (public)
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create course (admin/instructor only)
router.post('/', auth, staffOnly, async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update course (admin/instructor only)
router.put('/:id', auth, staffOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete course (admin/instructor only)
router.delete('/:id', auth, staffOnly, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
