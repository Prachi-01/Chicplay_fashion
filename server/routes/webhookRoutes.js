const express = require('express');
const router = express.Router();
const Product = require('../models/mongo/Product');

/**
 * Webhook for n8n / AI Chatbot
 * Returns a list of all approved products in a flattened format suitable for LLMs/Sheets processing.
 */
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved', isPublished: true });

        // Map to a cleaner format if needed, or just return as is
        const formattedProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            category: p.category,
            color: p.attributes?.color,
            stock: p.stock,
            description: p.description,
            imageUrl: p.images?.[0] || '',
            createdAt: p.createdAt
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Failed to fetch products for webhook' });
    }
});

module.exports = router;
