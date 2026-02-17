const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true
    },
    instructor: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Development', 'Design', 'Data Science', 'Business', 'Marketing', 'AI & ML', 'Cloud', 'Security']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    students: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    revenue: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
