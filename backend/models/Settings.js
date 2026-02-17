const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    platformName: { type: String, default: 'SkillForge' },
    supportEmail: { type: String, default: 'support@skillforge.com' },
    currency: { type: String, default: 'USD ($)' },
    taxRate: { type: Number, default: 8 },
    paymentProvider: { type: String, default: 'Stripe' },
    apiKey: { type: String, default: '' },
    webhookUrl: { type: String, default: '' },
    notifications: {
        newUsers: { type: Boolean, default: true },
        newOrders: { type: Boolean, default: true },
        courseReviews: { type: Boolean, default: true },
        refundRequests: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
