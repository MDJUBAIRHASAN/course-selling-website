const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    course: {
        type: String,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    amount: {
        type: Number,
        required: true
    },
    payment: {
        type: String,
        enum: ['bKash', 'Nagad', 'Stripe', 'PayPal'],
        default: 'bKash'
    },
    paymentPhone: {
        type: String,
        default: ''
    },
    transactionId: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'refunded'],
        default: 'pending'
    },
    avatar: {
        type: String,
        default: '#7c3aed'
    }
}, {
    timestamps: true
});

// Auto-generate orderId before saving
// Auto-generate orderId before validation
orderSchema.pre('validate', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = `ORD-${String(count + 2847).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
