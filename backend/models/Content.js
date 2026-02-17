const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    type: {
        type: String,
        enum: ['video', 'quiz', 'exercise', 'reading'],
        default: 'video'
    },
    duration: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    description: { type: String, default: '' }
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    lessons: [lessonSchema]
});

const resourceSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    type: {
        type: String,
        enum: ['pdf', 'code', 'zip', 'image', 'link', 'doc', 'spreadsheet'],
        default: 'pdf'
    },
    url: { type: String, default: '' },
    size: { type: String, default: '' }
});

const contentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        unique: true
    },
    modules: [moduleSchema],
    resources: [resourceSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
