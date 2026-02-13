const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config();

const mockProducts = [
    {
        name: 'Floral Silk Dress',
        description: 'Elegant floral silk dress for summer.',
        price: 120,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#FF6B8B', sizes: ['S', 'M', 'L'], style: 'romantic' },
        layerPosition: 'dress'
    },
    {
        name: 'Midnight Evening Gown',
        description: 'Stunning dark blue gown for formal events.',
        price: 250,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#1A237E', sizes: ['M', 'L'], style: 'elegant' },
        layerPosition: 'dress'
    },
    {
        name: 'Summer Boho Maxi',
        description: 'Comfortable boho style maxi dress.',
        price: 85,
        category: 'Dresses',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#FDF2F5', sizes: ['XS', 'S', 'M', 'L'], style: 'boho' },
        layerPosition: 'dress'
    },
    {
        name: 'Classic White Blouse',
        description: 'Versatile white blouse.',
        price: 45,
        category: 'Tops',
        images: ['https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=800&q=80'],
        attributes: { color: '#FFFFFF', sizes: ['S', 'M', 'L'], style: 'minimalist' },
        layerPosition: 'top'
    }
];

const seedMongoOnly = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        await Product.deleteMany({});
        await Product.insertMany(mockProducts);
        console.log('Seeded MongoDB with mock products');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedMongoOnly();
