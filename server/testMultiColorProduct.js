const mongoose = require('mongoose');
const Product = require('./models/mongo/Product');
require('dotenv').config({ path: './server/.env' });

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete existing if exists
        await Product.deleteOne({ name: 'Floral Wrap Dress' });

        const testProduct = {
            name: 'Floral Wrap Dress',
            description: 'A beautiful floral wrap dress perfect for any occasion. Features a flattering V-neckline and a tie-waist for the perfect fit.',
            price: 89.99,
            category: 'Dresses',
            images: ['https://via.placeholder.com/800x1200?text=Floral+Dress+Front'],
            attributes: {
                color: '#FF6B8B',
                sizes: ['XS', 'S', 'M', 'L', 'XL'],
                style: 'Romantic',
                season: 'Summer'
            },
            styleTags: ['Romantic', 'Boho', 'Floral'],
            layerPosition: 'dress',
            seasons: ['summer', 'spring'],
            gameStats: {
                rarity: 'Rare',
                xpReward: 50
            },
            sizeStock: [
                { size: "XS", quantity: 5 },
                { size: "S", quantity: 8 },
                { size: "M", quantity: 12 },
                { size: "L", quantity: 7 },
                { size: "XL", quantity: 3 }
            ],
            stock: 35,
            colorVariations: [
                {
                    colorName: "Blush Pink",
                    hexCode: "#FF6B8B",
                    available: true,
                    images: {
                        front: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=800&q=80",
                        back: "https://images.unsplash.com/photo-1539008835279-434674508233?auto=format&fit=crop&w=800&q=80",
                        side: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80",
                        fabric: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
                        lifestyle: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"
                    },
                    sizeStock: [
                        { size: "XS", quantity: 5 },
                        { size: "S", quantity: 8 },
                        { size: "M", quantity: 12 },
                        { size: "L", quantity: 7 },
                        { size: "XL", quantity: 3 }
                    ]
                },
                {
                    colorName: "Sky Blue",
                    hexCode: "#3498DB",
                    available: true,
                    images: {
                        front: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
                        back: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
                        side: "https://images.unsplash.com/photo-1518885391774-7d3af8143520?auto=format&fit=crop&w=800&q=80",
                        fabric: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80",
                        lifestyle: "https://images.unsplash.com/photo-1529133039941-7f15941ca510?auto=format&fit=crop&w=800&q=80"
                    },
                    sizeStock: [
                        { size: "XS", quantity: 3 },
                        { size: "S", quantity: 6 },
                        { size: "M", quantity: 10 },
                        { size: "L", quantity: 5 },
                        { size: "XL", quantity: 2 }
                    ]
                },
                {
                    colorName: "Classic White",
                    hexCode: "#FFFFFF",
                    available: true,
                    images: {
                        front: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=800&q=80",
                        back: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80",
                        side: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
                        fabric: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
                        lifestyle: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80"
                    },
                    sizeStock: [
                        { size: "XS", quantity: 10 },
                        { size: "S", quantity: 15 },
                        { size: "M", quantity: 20 },
                        { size: "L", quantity: 12 },
                        { size: "XL", quantity: 8 }
                    ]
                }
            ]
        };

        console.log('Attempting to create multi-color product...');
        const product = await Product.create(testProduct);
        console.log('✅ Multi-color Product created successfully!', product.name);
        console.log('Product ID:', product._id);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.errors) {
            console.error('Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

test();
