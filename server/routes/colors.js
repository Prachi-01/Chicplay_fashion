const express = require('express');
const router = express.Router();
const Color = require('../models/mongo/Color');

// GET /api/colors - Get all colors or search
router.get('/', async (req, res) => {
    try {
        const { search, category, limit = 100 } = req.query;

        let query = {};

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        const colors = await Color.find(query)
            .limit(parseInt(limit))
            .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 });

        res.json(colors);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ message: 'Failed to fetch colors' });
    }
});

// GET /api/colors/autocomplete - Autocomplete suggestions
router.get('/autocomplete', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            // Return common colors if no query
            const colors = await Color.find({ isCommon: true })
                .limit(20)
                .sort({ name: 1 });
            return res.json(colors);
        }

        // Search by name starting with query (case-insensitive)
        const colors = await Color.find({
            name: { $regex: `^${q}`, $options: 'i' }
        })
            .limit(20)
            .sort({ name: 1 });

        res.json(colors);
    } catch (error) {
        console.error('Error in autocomplete:', error);
        res.status(500).json({ message: 'Autocomplete failed' });
    }
});

// GET /api/colors/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Color.distinct('category');
        res.json(categories.sort());
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

// GET /api/colors/:name - Get color by name
router.get('/:name', async (req, res) => {
    try {
        const color = await Color.findOne({
            name: req.params.name.toLowerCase()
        });

        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }

        res.json(color);
    } catch (error) {
        console.error('Error fetching color:', error);
        res.status(500).json({ message: 'Failed to fetch color' });
    }
});

const { auth, isAdmin } = require('../middleware/auth');

// POST /api/colors - Create a new color (Admin)
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const { name, hexCode, category, isCommon } = req.body;

        if (!name || !hexCode) {
            return res.status(400).json({ message: 'Name and hexCode are required' });
        }

        // Check if color already exists
        const existingColor = await Color.findOne({
            $or: [
                { name: name.toLowerCase() },
                { hexCode: hexCode.toUpperCase() }
            ]
        });

        if (existingColor) {
            return res.status(400).json({ message: 'Color with this name or hex code already exists' });
        }

        const newColor = new Color({
            name: name.toLowerCase(),
            hexCode: hexCode.toUpperCase(),
            category: category || 'General',
            isCommon: isCommon || false
        });

        await newColor.save();
        res.status(201).json(newColor);
    } catch (error) {
        console.error('Error creating color:', error);
        res.status(500).json({ message: 'Failed to create color' });
    }
});

module.exports = router;
