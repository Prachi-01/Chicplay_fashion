const Category = require('../models/mongo/Category');
const Archetype = require('../models/mongo/Archetype');
const Product = require('../models/mongo/Product');
const Color = require('../models/mongo/Color');
const { cloudinary } = require('../config/cloudinary');

// Helper to sync colors to central database
const syncIndividualColor = async (name, hex) => {
    if (!name || !hex) return;
    try {
        const normalizedName = name.toLowerCase().trim();
        let normalizedHex = hex.toUpperCase().trim();
        if (!normalizedHex.startsWith('#')) normalizedHex = '#' + normalizedHex;
        if (!/^#[0-9A-F]{6}$/i.test(normalizedHex)) return;

        const existing = await Color.findOne({ name: normalizedName });
        if (!existing) {
            console.log(`🎨 Harvesting archetype color: ${name} (${normalizedHex})`);
            await Color.create({
                name: normalizedName,
                hexCode: normalizedHex,
                category: 'other',
                isCommon: false
            });
        }
    } catch (err) { console.error('Color sync error:', err); }
};

// ARCHETYPES
exports.getArchetypes = async (req, res) => {
    try {
        const archetypes = await Archetype.find().lean();

        // Get counts for each archetype from Products
        // Since archetype is now an array, we need to $unwind it first
        const counts = await Product.aggregate([
            { $match: { status: 'approved' } },
            { $unwind: { path: '$archetype', preserveNullAndEmptyArrays: false } },
            { $group: { _id: "$archetype", count: { $sum: 1 } } }
        ]);

        // Map counts to archetypes
        const countsMap = {};
        counts.forEach(c => {
            if (c._id) countsMap[c._id.toLowerCase().trim()] = c.count;
        });

        const enrichedArchetypes = archetypes.map(arch => {
            const archName = arch.name.toLowerCase().trim();
            const archId = arch.id.toLowerCase().trim();

            // Try to match by name or ID
            const count = countsMap[archName] || countsMap[archId] || 0;

            return {
                ...arch,
                metrics: {
                    ...arch.metrics,
                    totalProducts: count
                }
            };
        });

        res.json(enrichedArchetypes);
    } catch (err) {
        console.error('Error in getArchetypes:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createArchetype = async (req, res) => {
    try {
        const archetype = new Archetype(req.body);
        await archetype.save();

        // Sync color if present
        if (archetype.name && archetype.primaryColor) {
            syncIndividualColor(`${archetype.name} Primary`, archetype.primaryColor);
        }

        res.status(201).json(archetype);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateArchetype = async (req, res) => {
    try {
        const archetype = await Archetype.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, upsert: true }
        );

        // Sync color if present
        if (archetype.name && archetype.primaryColor) {
            syncIndividualColor(`${archetype.name} Primary`, archetype.primaryColor);
        }

        res.json(archetype);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.uploadArchetypeBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageData } = req.body; // Base64 image data from frontend

        if (!imageData) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Find the archetype
        const archetype = await Archetype.findOne({ id });
        if (!archetype) {
            return res.status(404).json({ message: 'Archetype not found' });
        }

        // Upload to Cloudinary in the banner section
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: `chicplay/banners/archetypes/${archetype.id}`,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 1920, height: 600, crop: 'fill', gravity: 'center' }]
        });

        // Update archetype with banner URL
        archetype.bannerImage = uploadResult.secure_url;
        await archetype.save();

        res.json({
            message: 'Banner uploaded successfully',
            bannerUrl: uploadResult.secure_url,
            archetype
        });
    } catch (err) {
        console.error('Banner upload error:', err);
        res.status(500).json({ message: 'Failed to upload banner', error: err.message });
    }
};

// CATEGORIES
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('parent');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const data = req.body;
        if (!data.slug && data.name) {
            data.slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        const category = new Category(data);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Bulk Assignment
exports.bulkAssign = async (req, res) => {
    const { productIds, categoryId, archetype } = req.body;
    try {
        const updateData = {};
        if (categoryId) updateData.categoryId = categoryId;
        if (archetype) updateData.archetype = archetype;

        await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updateData }
        );
        res.json({ success: true, message: 'Products updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
