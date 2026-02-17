const router = require('express').Router();
const Content = require('../models/Content');
const { auth, staffOnly } = require('../middleware/auth');

// Get course content (public for enrolled users, preview for others)
router.get('/:courseId', async (req, res) => {
    try {
        let content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) {
            // Return empty content structure if none exists
            content = { courseId: req.params.courseId, modules: [], resources: [] };
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create or update course content (admin/instructor only)
router.put('/:courseId', auth, staffOnly, async (req, res) => {
    try {
        const { modules, resources } = req.body;
        let content = await Content.findOne({ courseId: req.params.courseId });

        if (content) {
            content.modules = modules || content.modules;
            content.resources = resources || content.resources;
            await content.save();
        } else {
            content = await Content.create({
                courseId: req.params.courseId,
                modules: modules || [],
                resources: resources || []
            });
        }

        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a module to course content
router.post('/:courseId/modules', auth, staffOnly, async (req, res) => {
    try {
        let content = await Content.findOne({ courseId: req.params.courseId });

        if (!content) {
            content = new Content({ courseId: req.params.courseId, modules: [], resources: [] });
        }

        content.modules.push({
            title: req.body.title || `Module ${content.modules.length + 1}`,
            description: req.body.description || '',
            lessons: []
        });

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a specific module
router.put('/:courseId/modules/:moduleIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const mi = parseInt(req.params.moduleIndex);
        if (mi < 0 || mi >= content.modules.length) {
            return res.status(400).json({ error: 'Invalid module index' });
        }

        if (req.body.title !== undefined) content.modules[mi].title = req.body.title;
        if (req.body.description !== undefined) content.modules[mi].description = req.body.description;

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a module
router.delete('/:courseId/modules/:moduleIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const mi = parseInt(req.params.moduleIndex);
        content.modules.splice(mi, 1);
        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a lesson to a module
router.post('/:courseId/modules/:moduleIndex/lessons', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const mi = parseInt(req.params.moduleIndex);
        content.modules[mi].lessons.push({
            title: req.body.title || '',
            type: req.body.type || 'video',
            duration: req.body.duration || '',
            videoUrl: req.body.videoUrl || '',
            description: req.body.description || ''
        });

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a lesson
router.put('/:courseId/modules/:moduleIndex/lessons/:lessonIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const mi = parseInt(req.params.moduleIndex);
        const li = parseInt(req.params.lessonIndex);
        const lesson = content.modules[mi].lessons[li];

        Object.keys(req.body).forEach(key => {
            if (lesson[key] !== undefined || ['title', 'type', 'duration', 'videoUrl', 'description'].includes(key)) {
                lesson[key] = req.body[key];
            }
        });

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a lesson
router.delete('/:courseId/modules/:moduleIndex/lessons/:lessonIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const mi = parseInt(req.params.moduleIndex);
        const li = parseInt(req.params.lessonIndex);
        content.modules[mi].lessons.splice(li, 1);
        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a resource
router.post('/:courseId/resources', auth, staffOnly, async (req, res) => {
    try {
        let content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) {
            content = new Content({ courseId: req.params.courseId, modules: [], resources: [] });
        }

        content.resources.push({
            title: req.body.title || '',
            type: req.body.type || 'pdf',
            url: req.body.url || ''
        });

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a resource
router.put('/:courseId/resources/:resourceIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const ri = parseInt(req.params.resourceIndex);
        Object.keys(req.body).forEach(key => {
            content.resources[ri][key] = req.body[key];
        });

        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a resource
router.delete('/:courseId/resources/:resourceIndex', auth, staffOnly, async (req, res) => {
    try {
        const content = await Content.findOne({ courseId: req.params.courseId });
        if (!content) return res.status(404).json({ error: 'Content not found' });

        const ri = parseInt(req.params.resourceIndex);
        content.resources.splice(ri, 1);
        await content.save();
        res.json(content);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
