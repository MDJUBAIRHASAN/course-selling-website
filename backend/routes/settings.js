const router = require('express').Router();
const Settings = require('../models/Settings');
const { auth, adminOnly } = require('../middleware/auth');

// Get settings
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update settings
router.put('/', auth, adminOnly, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        Object.keys(req.body).forEach(key => {
            settings[key] = req.body[key];
        });

        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
