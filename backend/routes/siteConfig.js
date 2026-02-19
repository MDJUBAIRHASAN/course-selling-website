const router = require('express').Router();
const SiteConfig = require('../models/SiteConfig');
const { auth, adminOnly } = require('../middleware/auth');

// Get site config (Public)
router.get('/', async (req, res) => {
    try {
        let config = await SiteConfig.findOne();
        if (!config) {
            // Create default if not exists
            config = await SiteConfig.create({
                stats: [
                    { label: 'Active Learners', value: '50', suffix: 'M+' },
                    { label: 'Expert Courses', value: '5000', suffix: '+' },
                    { label: 'Industry Partners', value: '200', suffix: '+' },
                    { label: 'Satisfaction Rate', value: '95', suffix: '%' }
                ],
                testimonials: [
                    { name: "Jessica Williams", role: "Software Engineer at Google", avatar: "#7c3aed", text: "SkillForge helped me transition from a non-tech background to a software engineering role at Google." },
                    { name: "Michael Chen", role: "Data Scientist at Netflix", avatar: "#ec4899", text: "The data science track on SkillForge is world-class. I completed 5 courses and each one gave me skills I use daily." },
                    { name: "Aisha Patel", role: "UX Designer at Spotify", avatar: "#10b981", text: "I went from knowing nothing about design to landing my dream job at Spotify. The community support is amazing." }
                ]
            });
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update site config (Admin only)
router.put('/', auth, adminOnly, async (req, res) => {
    try {
        let config = await SiteConfig.findOne();
        if (!config) {
            config = new SiteConfig({});
        }

        const allowedKeys = ['hero', 'stats', 'features', 'testimonials', 'about', 'contact'];
        allowedKeys.forEach(key => {
            if (req.body[key]) config[key] = req.body[key];
        });

        await config.save();
        res.json(config);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
