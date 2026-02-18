const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const { auth, adminOnly } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const { status, search } = req.query;
        let filter = {};

        if (status && status !== 'all') filter.status = status;
        if (search) {
            filter.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { customer: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get orders for current user — MUST be before /:id so Express doesn't treat "my" as an ID
router.get('/my/purchases', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create order (purchase a course)
router.post('/', auth, async (req, res) => {
    try {
        const { courseId, payment, paymentPhone } = req.body;
        const user = req.user;

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Check if already purchased
        if (user.purchasedCourses.includes(courseId)) {
            return res.status(400).json({ error: 'You have already purchased this course' });
        }

        // Use provided transaction ID or generate one
        let { transactionId } = req.body;
        if (!transactionId) {
            const txnPrefix = (payment === 'Nagad') ? 'NGD' : 'BKS';
            transactionId = `${txnPrefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }

        // Create the order
        const order = await Order.create({
            customer: user.name,
            customerEmail: user.email,
            userId: user._id,
            course: course.title,
            courseId: course._id,
            amount: course.price,
            payment: payment || 'bKash',
            paymentPhone: paymentPhone || '',
            transactionId,
            status: 'pending',
            avatar: user.avatar
        });

        // Course access will be granted upon admin verification (status -> completed)
        // user.purchasedCourses.push(courseId);
        // await user.save();

        // Update course stats
        course.students += 1;
        course.revenue += course.price;
        await course.save();

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        // Find order first
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // Update status
        order.status = status;
        await order.save();

        // If status is completed, grant access
        if (status === 'completed') {
            await User.findByIdAndUpdate(order.userId, {
                $addToSet: { purchasedCourses: order.courseId }
            });
        }

        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
