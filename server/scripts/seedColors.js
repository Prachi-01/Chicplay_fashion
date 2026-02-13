require('dotenv').config();
const mongoose = require('mongoose');
const Color = require('../models/mongo/Color');

// Comprehensive color database from colorcodes.io and CSS color names
const colors = [
    // Reds
    { name: 'red', hexCode: '#FF0000', category: 'red', isCommon: true },
    { name: 'crimson', hexCode: '#DC143C', category: 'red', isCommon: true },
    { name: 'firebrick', hexCode: '#B22222', category: 'red', isCommon: false },
    { name: 'dark red', hexCode: '#8B0000', category: 'red', isCommon: true },
    { name: 'indian red', hexCode: '#CD5C5C', category: 'red', isCommon: false },
    { name: 'light coral', hexCode: '#F08080', category: 'red', isCommon: false },
    { name: 'salmon', hexCode: '#FA8072', category: 'red', isCommon: true },
    { name: 'dark salmon', hexCode: '#E9967A', category: 'red', isCommon: false },
    { name: 'light salmon', hexCode: '#FFA07A', category: 'red', isCommon: false },
    { name: 'coral', hexCode: '#FF7F50', category: 'red', isCommon: true },
    { name: 'tomato', hexCode: '#FF6347', category: 'red', isCommon: false },
    { name: 'cherry red', hexCode: '#DE3163', category: 'red', isCommon: true },
    { name: 'burgundy', hexCode: '#800020', category: 'red', isCommon: true },
    { name: 'maroon', hexCode: '#800000', category: 'red', isCommon: true },
    { name: 'scarlet', hexCode: '#FF2400', category: 'red', isCommon: true },

    // Pinks
    { name: 'pink', hexCode: '#FFC0CB', category: 'pink', isCommon: true },
    { name: 'light pink', hexCode: '#FFB6C1', category: 'pink', isCommon: true },
    { name: 'hot pink', hexCode: '#FF69B4', category: 'pink', isCommon: true },
    { name: 'deep pink', hexCode: '#FF1493', category: 'pink', isCommon: true },
    { name: 'medium violet red', hexCode: '#C71585', category: 'pink', isCommon: false },
    { name: 'pale violet red', hexCode: '#DB7093', category: 'pink', isCommon: false },
    { name: 'rose', hexCode: '#FF007F', category: 'pink', isCommon: true },
    { name: 'blush pink', hexCode: '#FE828C', category: 'pink', isCommon: true },
    { name: 'baby pink', hexCode: '#F4C2C2', category: 'pink', isCommon: true },
    { name: 'fuchsia', hexCode: '#FF00FF', category: 'pink', isCommon: true },
    { name: 'magenta', hexCode: '#FF00FF', category: 'pink', isCommon: true },
    { name: 'carnation pink', hexCode: '#FFA6C9', category: 'pink', isCommon: false },

    // Purples
    { name: 'purple', hexCode: '#800080', category: 'purple', isCommon: true },
    { name: 'lavender', hexCode: '#E6E6FA', category: 'purple', isCommon: true },
    { name: 'thistle', hexCode: '#D8BFD8', category: 'purple', isCommon: false },
    { name: 'plum', hexCode: '#DDA0DD', category: 'purple', isCommon: true },
    { name: 'violet', hexCode: '#EE82EE', category: 'purple', isCommon: true },
    { name: 'orchid', hexCode: '#DA70D6', category: 'purple', isCommon: true },
    { name: 'medium orchid', hexCode: '#BA55D3', category: 'purple', isCommon: false },
    { name: 'medium purple', hexCode: '#9370DB', category: 'purple', isCommon: false },
    { name: 'blue violet', hexCode: '#8A2BE2', category: 'purple', isCommon: false },
    { name: 'dark violet', hexCode: '#9400D3', category: 'purple', isCommon: false },
    { name: 'dark orchid', hexCode: '#9932CC', category: 'purple', isCommon: false },
    { name: 'dark magenta', hexCode: '#8B008B', category: 'purple', isCommon: false },
    { name: 'indigo', hexCode: '#4B0082', category: 'purple', isCommon: true },
    { name: 'amethyst', hexCode: '#9966CC', category: 'purple', isCommon: true },
    { name: 'mauve', hexCode: '#E0B0FF', category: 'purple', isCommon: true },

    // Blues
    { name: 'blue', hexCode: '#0000FF', category: 'blue', isCommon: true },
    { name: 'light blue', hexCode: '#ADD8E6', category: 'blue', isCommon: true },
    { name: 'sky blue', hexCode: '#87CEEB', category: 'blue', isCommon: true },
    { name: 'light sky blue', hexCode: '#87CEFA', category: 'blue', isCommon: false },
    { name: 'deep sky blue', hexCode: '#00BFFF', category: 'blue', isCommon: false },
    { name: 'dodger blue', hexCode: '#1E90FF', category: 'blue', isCommon: false },
    { name: 'cornflower blue', hexCode: '#6495ED', category: 'blue', isCommon: false },
    { name: 'royal blue', hexCode: '#4169E1', category: 'blue', isCommon: true },
    { name: 'medium blue', hexCode: '#0000CD', category: 'blue', isCommon: false },
    { name: 'dark blue', hexCode: '#00008B', category: 'blue', isCommon: true },
    { name: 'navy', hexCode: '#000080', category: 'blue', isCommon: true },
    { name: 'midnight blue', hexCode: '#191970', category: 'blue', isCommon: false },
    { name: 'powder blue', hexCode: '#B0E0E6', category: 'blue', isCommon: false },
    { name: 'steel blue', hexCode: '#4682B4', category: 'blue', isCommon: false },
    { name: 'cadet blue', hexCode: '#5F9EA0', category: 'blue', isCommon: false },
    { name: 'azure', hexCode: '#F0FFFF', category: 'blue', isCommon: false },
    { name: 'alice blue', hexCode: '#F0F8FF', category: 'blue', isCommon: false },
    { name: 'turquoise', hexCode: '#40E0D0', category: 'blue', isCommon: true },
    { name: 'teal', hexCode: '#008080', category: 'blue', isCommon: true },
    { name: 'cyan', hexCode: '#00FFFF', category: 'blue', isCommon: true },
    { name: 'aqua', hexCode: '#00FFFF', category: 'blue', isCommon: true },

    // Greens
    { name: 'green', hexCode: '#008000', category: 'green', isCommon: true },
    { name: 'lime', hexCode: '#00FF00', category: 'green', isCommon: true },
    { name: 'lime green', hexCode: '#32CD32', category: 'green', isCommon: false },
    { name: 'lawn green', hexCode: '#7CFC00', category: 'green', isCommon: false },
    { name: 'chartreuse', hexCode: '#7FFF00', category: 'green', isCommon: false },
    { name: 'green yellow', hexCode: '#ADFF2F', category: 'green', isCommon: false },
    { name: 'spring green', hexCode: '#00FF7F', category: 'green', isCommon: false },
    { name: 'medium spring green', hexCode: '#00FA9A', category: 'green', isCommon: false },
    { name: 'light green', hexCode: '#90EE90', category: 'green', isCommon: true },
    { name: 'pale green', hexCode: '#98FB98', category: 'green', isCommon: false },
    { name: 'dark sea green', hexCode: '#8FBC8F', category: 'green', isCommon: false },
    { name: 'medium sea green', hexCode: '#3CB371', category: 'green', isCommon: false },
    { name: 'sea green', hexCode: '#2E8B57', category: 'green', isCommon: false },
    { name: 'forest green', hexCode: '#228B22', category: 'green', isCommon: true },
    { name: 'dark green', hexCode: '#006400', category: 'green', isCommon: true },
    { name: 'olive', hexCode: '#808000', category: 'green', isCommon: true },
    { name: 'dark olive green', hexCode: '#556B2F', category: 'green', isCommon: false },
    { name: 'olive drab', hexCode: '#6B8E23', category: 'green', isCommon: false },
    { name: 'yellow green', hexCode: '#9ACD32', category: 'green', isCommon: false },
    { name: 'mint', hexCode: '#3EB489', category: 'green', isCommon: true },
    { name: 'emerald', hexCode: '#50C878', category: 'green', isCommon: true },
    { name: 'sage', hexCode: '#BCB88A', category: 'green', isCommon: true },

    // Yellows
    { name: 'yellow', hexCode: '#FFFF00', category: 'yellow', isCommon: true },
    { name: 'light yellow', hexCode: '#FFFFE0', category: 'yellow', isCommon: false },
    { name: 'lemon chiffon', hexCode: '#FFFACD', category: 'yellow', isCommon: false },
    { name: 'light goldenrod yellow', hexCode: '#FAFAD2', category: 'yellow', isCommon: false },
    { name: 'papaya whip', hexCode: '#FFEFD5', category: 'yellow', isCommon: false },
    { name: 'moccasin', hexCode: '#FFE4B5', category: 'yellow', isCommon: false },
    { name: 'peach puff', hexCode: '#FFDAB9', category: 'yellow', isCommon: false },
    { name: 'pale goldenrod', hexCode: '#EEE8AA', category: 'yellow', isCommon: false },
    { name: 'khaki', hexCode: '#F0E68C', category: 'yellow', isCommon: true },
    { name: 'dark khaki', hexCode: '#BDB76B', category: 'yellow', isCommon: false },
    { name: 'gold', hexCode: '#FFD700', category: 'yellow', isCommon: true },
    { name: 'golden', hexCode: '#FFC107', category: 'yellow', isCommon: true },
    { name: 'mustard', hexCode: '#FFDB58', category: 'yellow', isCommon: true },
    { name: 'canary', hexCode: '#FFEF00', category: 'yellow', isCommon: true },

    // Oranges
    { name: 'orange', hexCode: '#FFA500', category: 'orange', isCommon: true },
    { name: 'dark orange', hexCode: '#FF8C00', category: 'orange', isCommon: false },
    { name: 'orange red', hexCode: '#FF4500', category: 'orange', isCommon: false },
    { name: 'tangerine', hexCode: '#F28500', category: 'orange', isCommon: true },
    { name: 'peach', hexCode: '#FFE5B4', category: 'orange', isCommon: true },
    { name: 'apricot', hexCode: '#FBCEB1', category: 'orange', isCommon: true },
    { name: 'burnt orange', hexCode: '#CC5500', category: 'orange', isCommon: true },
    { name: 'rust', hexCode: '#B7410E', category: 'orange', isCommon: true },

    // Browns
    { name: 'brown', hexCode: '#A52A2A', category: 'brown', isCommon: true },
    { name: 'saddle brown', hexCode: '#8B4513', category: 'brown', isCommon: false },
    { name: 'sienna', hexCode: '#A0522D', category: 'brown', isCommon: false },
    { name: 'chocolate', hexCode: '#D2691E', category: 'brown', isCommon: true },
    { name: 'peru', hexCode: '#CD853F', category: 'brown', isCommon: false },
    { name: 'tan', hexCode: '#D2B48C', category: 'brown', isCommon: true },
    { name: 'rosy brown', hexCode: '#BC8F8F', category: 'brown', isCommon: false },
    { name: 'sandy brown', hexCode: '#F4A460', category: 'brown', isCommon: false },
    { name: 'beige', hexCode: '#F5F5DC', category: 'brown', isCommon: true },
    { name: 'wheat', hexCode: '#F5DEB3', category: 'brown', isCommon: false },
    { name: 'burly wood', hexCode: '#DEB887', category: 'brown', isCommon: false },
    { name: 'camel', hexCode: '#C19A6B', category: 'brown', isCommon: true },
    { name: 'coffee', hexCode: '#6F4E37', category: 'brown', isCommon: true },
    { name: 'taupe', hexCode: '#483C32', category: 'brown', isCommon: true },

    // Grays
    { name: 'gray', hexCode: '#808080', category: 'gray', isCommon: true },
    { name: 'light gray', hexCode: '#D3D3D3', category: 'gray', isCommon: true },
    { name: 'silver', hexCode: '#C0C0C0', category: 'gray', isCommon: true },
    { name: 'dark gray', hexCode: '#A9A9A9', category: 'gray', isCommon: true },
    { name: 'dim gray', hexCode: '#696969', category: 'gray', isCommon: false },
    { name: 'slate gray', hexCode: '#708090', category: 'gray', isCommon: false },
    { name: 'light slate gray', hexCode: '#778899', category: 'gray', isCommon: false },
    { name: 'dark slate gray', hexCode: '#2F4F4F', category: 'gray', isCommon: false },
    { name: 'gainsboro', hexCode: '#DCDCDC', category: 'gray', isCommon: false },
    { name: 'charcoal', hexCode: '#36454F', category: 'gray', isCommon: true },
    { name: 'ash gray', hexCode: '#B2BEB5', category: 'gray', isCommon: true },

    // Black and White
    { name: 'black', hexCode: '#000000', category: 'black', isCommon: true },
    { name: 'white', hexCode: '#FFFFFF', category: 'white', isCommon: true },
    { name: 'snow', hexCode: '#FFFAFA', category: 'white', isCommon: false },
    { name: 'ivory', hexCode: '#FFFFF0', category: 'white', isCommon: true },
    { name: 'cream', hexCode: '#FFFDD0', category: 'white', isCommon: true },
    { name: 'off white', hexCode: '#FAF9F6', category: 'white', isCommon: true },
    { name: 'ghost white', hexCode: '#F8F8FF', category: 'white', isCommon: false },
    { name: 'antique white', hexCode: '#FAEBD7', category: 'white', isCommon: false },
    { name: 'linen', hexCode: '#FAF0E6', category: 'white', isCommon: false },
    { name: 'old lace', hexCode: '#FDF5E6', category: 'white', isCommon: false },
    { name: 'floral white', hexCode: '#FFFAF0', category: 'white', isCommon: false },
    { name: 'seashell', hexCode: '#FFF5EE', category: 'white', isCommon: false },
    { name: 'mint cream', hexCode: '#F5FFFA', category: 'white', isCommon: false },

    // Fashion-specific colors
    { name: 'champagne', hexCode: '#F7E7CE', category: 'other', isCommon: true },
    { name: 'rose gold', hexCode: '#B76E79', category: 'other', isCommon: true },
    { name: 'copper', hexCode: '#B87333', category: 'other', isCommon: true },
    { name: 'bronze', hexCode: '#CD7F32', category: 'other', isCommon: true },
    { name: 'nude', hexCode: '#E3BC9A', category: 'other', isCommon: true },
    { name: 'blush', hexCode: '#DE5D83', category: 'pink', isCommon: true },
    { name: 'marigold', hexCode: '#EAA221', category: 'yellow', isCommon: true },
    { name: 'lilac', hexCode: '#C8A2C8', category: 'purple', isCommon: true },
    { name: 'periwinkle', hexCode: '#CCCCFF', category: 'blue', isCommon: true },
    { name: 'seafoam', hexCode: '#93E9BE', category: 'green', isCommon: true },
    { name: 'dusty rose', hexCode: '#DCAE96', category: 'pink', isCommon: true },
    { name: 'terracotta', hexCode: '#E2725B', category: 'orange', isCommon: true },
    { name: 'cobalt', hexCode: '#0047AB', category: 'blue', isCommon: true },
];

async function seedColors() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing colors
        await Color.deleteMany({});
        console.log('🗑️  Cleared existing colors\n');

        // Insert all colors
        const result = await Color.insertMany(colors);
        console.log(`✅ Successfully inserted ${result.length} colors!\n`);

        // Show statistics
        const commonCount = await Color.countDocuments({ isCommon: true });
        const categories = await Color.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log(`📊 Statistics:`);
        console.log(`   Total colors: ${result.length}`);
        console.log(`   Common colors: ${commonCount}`);
        console.log(`\n📁 Colors by category:`);
        categories.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} colors`);
        });

        console.log('\n✨ Some example colors:');
        const examples = await Color.find({ isCommon: true }).limit(10);
        examples.forEach(color => {
            console.log(`   ${color.name} → ${color.hexCode}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedColors();
