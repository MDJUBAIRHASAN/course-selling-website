const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
    hero: {
        title: { type: String, default: 'Unlock Your Potential.\nLearn Without Limits.' },
        subtitle: { type: String, default: 'Join over 50 million learners worldwide. Access 5,000+ courses from top instructors and industry leaders.' },
        ctaText: { type: String, default: 'Explore Courses' },
        ctaLink: { type: String, default: '#catalog' }
    },
    stats: [{
        label: { type: String },
        value: { type: String },
        suffix: { type: String }
    }],
    features: [{
        title: { type: String },
        desc: { type: String },
        icon: { type: String }
    }],
    testimonials: [{
        name: { type: String },
        role: { type: String },
        text: { type: String },
        avatar: { type: String }
    }],
    about: {
        title: { type: String, default: 'About SkillForge' },
        text: { type: String, default: 'We are on a mission to make quality education accessible to everyone, everywhere.' },
        mission: { type: String, default: 'To democratize education by providing world-class learning experiences accessible to anyone, regardless of their background or location.' }
    },
    contact: {
        email: { type: String, default: 'support@skillforge.com' },
        address: { type: String, default: '123 Education Lane, Tech City' },
        phone: { type: String, default: '+1 (555) 123-4567' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
