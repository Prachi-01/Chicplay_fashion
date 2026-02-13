const Product = require('../models/mongo/Product');
const Color = require('../models/mongo/Color');

// Helper to sync colors used in products to the central database
const syncColorsToCentralDb = async (colorVariations) => {
    if (!colorVariations || !Array.isArray(colorVariations)) return;

    for (const variation of colorVariations) {
        const { colorName, hexCode } = variation;
        if (!colorName || !hexCode) continue;

        try {
            const normalizedName = colorName.toLowerCase().trim();
            let normalizedHex = hexCode.toUpperCase().trim();

            // Ensure hex starts with #
            if (!normalizedHex.startsWith('#')) normalizedHex = '#' + normalizedHex;

            // basic validation for hex format (must be #RRGGBB)
            if (!/^#[0-9A-F]{6}$/i.test(normalizedHex)) continue;

            const existingColor = await Color.findOne({ name: normalizedName });

            if (!existingColor) {
                console.log(`🎨 Harvesting new color for central DB: ${colorName} (${normalizedHex})`);
                await Color.create({
                    name: normalizedName,
                    hexCode: normalizedHex,
                    category: 'other', // Must match Color schema enum
                    isCommon: false
                });
            }
        } catch (error) {
            console.error('Error syncing color to central DB:', error);
        }
    }
};

// Get All Products (with filtering & sorting)
exports.getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, search } = req.query;

        let query = {};

        // Accessibility Logic:
        // 1. Admin: Sees everything.
        // 2. Vendor: Sees approved products AND their own products (pending/rejected).
        // 3. Customer: Sees only approved products.

        if (req.user && req.user.role === 'admin') {
            // Admin sees all, no status filter needed by default
        } else {
            // Everyone else (Customer, Vendor, Guest) only sees approved products in General Shop
            // Vendors should manage their pending/rejected items via Dashboard
            query.status = 'approved';
        }


        // Only show published products unless user is an admin
        if (!req.user || req.user.role !== 'admin') {
            // Use $ne: false to include legacy products where isPublished might be undefined
            query.isPublished = { $ne: false };
        }

        // Filtering
        if (category) {
            // Normalize: 'dresses' -> 'dress', 'tops' -> 'top', etc.
            let term = category.toLowerCase().trim();
            if (term.endsWith('es')) term = term.slice(0, -2);
            else if (term.endsWith('s')) term = term.slice(0, -1);

            // Match anything containing the base term (e.g. 'mini dress' matches 'dress')
            query.category = { $regex: new RegExp(term, 'i') };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Sorting
        let sortOption = {};
        if (sort === 'price_asc') sortOption.price = 1;
        if (sort === 'price_desc') sortOption.price = -1;
        if (sort === 'newest') sortOption.createdAt = -1;

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
// Helper to handle both single values and arrays from FormData (takes first if array)
const normalizeInput = (val) => Array.isArray(val) ? val[0] : val;

// Get Single Product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Security: Prevent viewing unapproved products by Direct Link (unless Admin/Owner)
        const isAdmin = req.user && req.user.role === 'admin';
        const isOwner = req.user && product.vendorId === req.user.id;

        if (product.status !== 'approved' && !isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Access denied: Product is awaiting approval' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create new product (Admin)
exports.createProduct = async (req, res) => {
    try {
        console.log('📦 createProduct hit with body:', req.body);
        console.log('📂 file:', req.file);

        const {
            name: rawName, price: rawPrice, category: rawCategory, description: rawDescription,
            styleTags, layerPosition, seasons, colors, isPublished, archetype: rawArchetype,
            mood: rawMood, occasion: rawOccasion, specifications, vendorDetails
        } = req.body;

        const name = normalizeInput(rawName);
        const price = normalizeInput(rawPrice);
        const category = normalizeInput(rawCategory);
        const description = normalizeInput(rawDescription);

        // Ensure we have an uploaded file
        // Primary image is optional (can use fallbacks from colorVariations)
        let primaryImage = req.file?.path || '';

        // Parse JSON strings if they come as strings (common with FormData)
        let parsedStyleTags, parsedSeasons, parsedColors, parsedSizeStock, parsedColorVariations,
            parsedSpecifications, parsedVendorDetails, parsedArchetype, parsedMood, parsedOccasion;

        try {
            parsedStyleTags = typeof styleTags === 'string' ? JSON.parse(styleTags) : (styleTags || []);
            parsedSeasons = typeof seasons === 'string' ? JSON.parse(seasons) : (seasons || []);
            parsedColors = typeof colors === 'string' ? JSON.parse(colors) : (colors || []);
            parsedSizeStock = req.body.sizeStock ? (typeof req.body.sizeStock === 'string' ? JSON.parse(req.body.sizeStock) : req.body.sizeStock) : [];
            parsedColorVariations = req.body.colorVariations ? (typeof req.body.colorVariations === 'string' ? JSON.parse(req.body.colorVariations) : req.body.colorVariations) : [];
            parsedSpecifications = req.body.specifications ? (typeof req.body.specifications === 'string' ? JSON.parse(req.body.specifications) : req.body.specifications) : [];
            parsedVendorDetails = req.body.vendorDetails ? (typeof req.body.vendorDetails === 'string' ? JSON.parse(req.body.vendorDetails) : req.body.vendorDetails) : {};
            parsedArchetype = rawArchetype ? (typeof rawArchetype === 'string' ? JSON.parse(rawArchetype) : rawArchetype) : [];
            parsedMood = rawMood ? (typeof rawMood === 'string' ? JSON.parse(rawMood) : rawMood) : [];
            parsedOccasion = rawOccasion ? (typeof rawOccasion === 'string' ? JSON.parse(rawOccasion) : rawOccasion) : [];
        } catch (parseError) {
            console.error('❌ JSON Parsing error:', parseError);
            return res.status(400).json({ message: 'Invalid JSON in form data', error: parseError.message });
        }

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Name, Price, and Category are required' });
        }

        const numericPrice = Number(price);
        if (isNaN(numericPrice)) {
            return res.status(400).json({ message: 'Price must be a valid number' });
        }

        // Calculate total stock from sizes if provided
        let initialStock = 0;
        if (Array.isArray(parsedSizeStock)) {
            initialStock = parsedSizeStock.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0);
        }

        // Map category to a valid layerPosition if not provided or plural
        // Enum: ['dress', 'top', 'bottom', 'outerwear', 'shoes', 'accessory']
        let resolvedLayerPosition = layerPosition;
        if (!resolvedLayerPosition) {
            const categoryMap = {
                'dresses': 'dress',
                'dress': 'dress',
                'tops': 'top',
                'top': 'top',
                'bottoms': 'bottom',
                'bottom': 'bottom',
                'outerwear': 'outerwear',
                'shoes': 'shoes',
                'accessories': 'accessory',
                'accessory': 'accessory'
            };
            const normalizedCategory = String(category || '').toLowerCase().trim();
            resolvedLayerPosition = categoryMap[normalizedCategory] || 'dress';
        }

        // FALLBACK: If no primary image but has color variations, use the first front image
        if (!primaryImage && Array.isArray(parsedColorVariations) && parsedColorVariations.length > 0) {
            const firstVar = parsedColorVariations[0];
            primaryImage = firstVar.images?.front || firstVar.images?.[Object.keys(firstVar.images || {})[0]] || '';
            console.log('🔄 No primary image found, using variation fallback:', primaryImage);
        }

        // Consolidate stock from colorVariations if provided
        let finalSizeStock = parsedSizeStock;
        let finalTotalStock = initialStock;

        if (Array.isArray(parsedColorVariations) && parsedColorVariations.length > 0) {
            const stockMap = {};
            parsedColorVariations.forEach(v => {
                if (Array.isArray(v.sizeStock)) {
                    v.sizeStock.forEach(s => {
                        stockMap[s.size] = (stockMap[s.size] || 0) + (parseInt(s.quantity) || 0);
                    });
                }
            });

            finalSizeStock = Object.keys(stockMap).map(size => ({
                size,
                quantity: stockMap[size]
            }));
            finalTotalStock = finalSizeStock.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0);
        }

        console.log('✅ Final sizeStock:', finalSizeStock);
        console.log('✅ Final total stock:', finalTotalStock);

        const newProduct = new Product({
            name,
            price: numericPrice,
            category,
            description: description || `A beautiful ${name}`,
            images: primaryImage ? [primaryImage] : [],
            attributes: {
                color: parsedColors?.[0] || '#000000',
                style: parsedStyleTags?.[0] || 'General',
                season: parsedSeasons?.[0] || 'All',
                sizes: Array.isArray(finalSizeStock) ? finalSizeStock.map(s => s.size) : []
            },
            sizeStock: finalSizeStock,
            stock: finalTotalStock,
            styleTags: parsedStyleTags,
            layerPosition: resolvedLayerPosition,
            seasons: parsedSeasons,
            gameStats: {
                rarity: 'Common',
                xpReward: 20
            },
            archetype: parsedArchetype,
            mood: parsedMood,
            occasion: parsedOccasion,
            colorVariations: parsedColorVariations,
            specifications: parsedSpecifications,
            vendorDetails: parsedVendorDetails,
            isPublished: isPublished !== undefined ? (typeof isPublished === 'string' ? isPublished === 'true' : !!isPublished) : true,
            status: req.user.role === 'admin' ? 'approved' : 'pending',
            vendorId: req.user.role === 'vendor' ? req.user.id : undefined
        });

        console.log('✅ Mongoose Object prepared. Saving...');
        await newProduct.save();
        console.log('✅ Product saved successfully to MongoDB');

        // Sync colors to central database
        if (parsedColorVariations && parsedColorVariations.length > 0) {
            console.log('🎨 Syncing colors...');
            await syncColorsToCentralDb(parsedColorVariations);
            console.log('✅ Color sync complete');
        }

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ SEVERE ERROR in createProduct:', error);
        res.status(500).json({
            message: 'Server Error creating product',
            error: error.message,
            stack: error.stack
        });
    }
};

// Bulk Delete Products (Admin)
exports.deleteBulkProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No product IDs provided' });
        }

        const result = await Product.deleteMany({ _id: { $in: ids } });

        res.json({
            message: 'Products deleted successfully',
            deletedCount: result.deletedCount,
            ids: ids
        });
    } catch (error) {
        console.error('Error in bulk deleting products:', error);
        res.status(500).json({ message: 'Server Error deleting products' });
    }
};

// Delete Product (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: You can only delete your own products' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully', productId: req.params.id });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server Error deleting product' });
    }
};

// Update Product (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const {
            name, price, salePrice, category, description,
            sizeStock, styleTags, layerPosition, seasons, attributes,
            colorVariations, isPublished, archetype, mood, occasion, specifications, vendorDetails
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (req.user.role === 'vendor' && product.vendorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied: You can only update your own products' });
        }

        // Update fields if they exist in request
        if (name) product.name = name;
        if (price !== undefined) product.price = Number(price);
        if (salePrice !== undefined) product.salePrice = Number(salePrice);
        if (category) product.category = category;
        if (description) product.description = description;
        if (archetype !== undefined) product.archetype = archetype;
        if (mood !== undefined) product.mood = mood;
        if (occasion !== undefined) product.occasion = occasion;
        if (styleTags) product.styleTags = styleTags;
        if (layerPosition) product.layerPosition = layerPosition;
        if (seasons) product.seasons = seasons;
        if (attributes) product.attributes = { ...product.attributes.toObject(), ...attributes };

        let finalSizeStock = sizeStock;

        if (colorVariations) {
            console.log('📦 Updating Color Variations. Count:', colorVariations.length);
            const parsedVariations = typeof colorVariations === 'string' ? JSON.parse(colorVariations) : colorVariations;
            product.colorVariations = parsedVariations;
            product.markModified('colorVariations');

            // Sync colors to central database
            syncColorsToCentralDb(parsedVariations);

            // Consolidated stock logic: If variations exist, the main stock should be the sum of all variations
            if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
                const stockMap = {}; // { size: totalQuantity }
                parsedVariations.forEach(v => {
                    if (Array.isArray(v.sizeStock)) {
                        v.sizeStock.forEach(s => {
                            stockMap[s.size] = (stockMap[s.size] || 0) + (parseInt(s.quantity) || 0);
                        });
                    }
                });

                // Convert map back to array format
                finalSizeStock = Object.keys(stockMap).map(size => ({
                    size,
                    quantity: stockMap[size]
                }));
            }
        }

        // Handle sizeStock update (either provided directly or consolidated from variations)
        if (finalSizeStock) {
            product.sizeStock = finalSizeStock;
            // Update total stock
            product.stock = finalSizeStock.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0);

            // Sync with attributes.sizes if needed
            product.attributes.sizes = finalSizeStock.map(s => s.size);
        }

        if (isPublished !== undefined) {
            product.isPublished = typeof isPublished === 'string' ? isPublished === 'true' : !!isPublished;
        }

        if (specifications) {
            product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        }

        if (vendorDetails) {
            product.vendorDetails = typeof vendorDetails === 'string' ? JSON.parse(vendorDetails) : vendorDetails;
        }

        // Security: Reset status if vendor updates product (requires re-approval)
        if (req.user.role === 'vendor') {
            console.log(`🛡️ Product ${product._id} updated by vendor. Resetting status to pending.`);
            product.status = 'pending';
        }

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server Error updating product' });
    }
};


// Get Product Specifications
exports.getSpecifications = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('specifications');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ specifications: product.specifications || [] });
    } catch (error) {
        console.error('Error fetching specifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update All Specifications for a Product
exports.updateSpecifications = async (req, res) => {
    try {
        const { specifications } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.specifications = specifications;
        await product.save();

        res.json({ message: 'Specifications updated successfully', specifications: product.specifications });
    } catch (error) {
        console.error('Error updating specifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add Single Specification to a Product
exports.addSpecification = async (req, res) => {
    try {
        const { key, value, icon, order } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!key || !value) {
            return res.status(400).json({ message: 'Key and Value are required' });
        }

        product.specifications.push({ key, value, icon, order: order || 0 });
        // Sort specifications by order if needed
        product.specifications.sort((a, b) => (a.order || 0) - (b.order || 0));

        await product.save();

        res.status(201).json({ message: 'Specification added successfully', specifications: product.specifications });
    } catch (error) {
        console.error('Error adding specification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Pending Products (Admin)
exports.getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching pending products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Approve/Reject Product (Admin)
exports.approveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { status, comments } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        product.status = status;
        if (comments !== undefined) {
            product.approvalComments = comments;
        }

        await product.save();

        res.json({
            message: `Product ${status}`,
            product
        });
    } catch (error) {
        console.error('Error approving product:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
