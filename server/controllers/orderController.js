const Order = require('../models/mysql/Order');
const OrderItem = require('../models/mysql/OrderItem');
const GameProfile = require('../models/mongo/GameProfile');
const Product = require('../models/mongo/Product');
const User = require('../models/mysql/User');
const emailService = require('../services/emailService');

// Create New Order
exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // 1. Verify Stock Availability FIRST
        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }

            const requestedSize = item.size || 'M';
            const requestedColor = item.selectedColor;

            // 1a. Variation Stock Check
            const hasVariations = product.colorVariations && product.colorVariations.length > 0;
            if (hasVariations && requestedColor) {
                const variation = product.colorVariations.find(v => v.colorName === requestedColor);
                if (variation) {
                    const sizeStock = variation.sizeStock?.find(s => s.size === requestedSize);
                    if (sizeStock) {
                        if (sizeStock.quantity < item.quantity) {
                            return res.status(400).json({
                                message: `Insufficient stock for ${item.name} (${requestedColor}, Size: ${requestedSize}). Only ${sizeStock.quantity} left.`
                            });
                        }
                    } else {
                        return res.status(400).json({ message: `Size ${requestedSize} not found for ${item.name} in color ${requestedColor}` });
                    }
                }
            } else {
                // 1b. Legacy Stock Check
                const sizeStock = product.sizeStock?.find(s => s.size === requestedSize);
                if (sizeStock) {
                    if (sizeStock.quantity < item.quantity) {
                        return res.status(400).json({
                            message: `Insufficient stock for ${item.name} (Size: ${requestedSize}). Only ${sizeStock.quantity} left.`
                        });
                    }
                } else if (product.stock < item.quantity) {
                    return res.status(400).json({
                        message: `Insufficient stock for ${item.name}. Only ${product.stock} left.`
                    });
                }
            }
        }

        console.log(`🛍️ Creating order for User ${userId}. Total: ${totalAmount}`);

        // 2. Create MySQL Order
        const addressData = req.body.address;
        const shippingAddressString = typeof addressData === 'object'
            ? `${addressData.fullName}, ${addressData.addressLine}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`
            : (addressData || 'Standard Shipping Address');

        const shippingEmail = typeof addressData === 'object' ? addressData.email : null;

        const newOrder = await Order.create({
            userId,
            email: shippingEmail,
            totalAmount,
            status: 'processing', // Default to processing after placement
            shippingAddress: shippingAddressString,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        // 3. Create MySQL Order Items & Deduct Stock
        let totalXpEarned = 0;

        for (const item of items) {
            // Fetch product to update stock and get accurate XP stats
            const product = await Product.findById(item._id);

            await OrderItem.create({
                orderId: newOrder.id,
                productId: item._id, // MongoDB ID
                productName: item.name,
                size: item.size || 'M', // Default to M if not provided
                color: item.selectedColor || 'Classic', // Store color in MySQL order item
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.displayedImage || (item.images && item.images[0]), // Store the specific variation image
                vendorId: product?.vendorId || null
            });

            if (product) {
                const requestedColor = item.selectedColor;
                const requestedSize = item.size || 'M';

                // 1. Update Variation Stock if applicable
                const hasVariations = product.colorVariations && product.colorVariations.length > 0;
                if (hasVariations && requestedColor) {
                    const varIndex = product.colorVariations.findIndex(v => v.colorName === requestedColor);
                    if (varIndex > -1) {
                        const sizeIndex = product.colorVariations[varIndex].sizeStock.findIndex(s => s.size === requestedSize);
                        if (sizeIndex > -1) {
                            product.colorVariations[varIndex].sizeStock[sizeIndex].quantity = Math.max(0, product.colorVariations[varIndex].sizeStock[sizeIndex].quantity - item.quantity);
                        }
                    }
                }

                // 2. Decrement legacy stock for backward compatibility or if no variations
                if (product.sizeStock && product.sizeStock.length > 0) {
                    const sizeIndex = product.sizeStock.findIndex(s => s.size === requestedSize);
                    if (sizeIndex > -1) {
                        product.sizeStock[sizeIndex].quantity = Math.max(0, product.sizeStock[sizeIndex].quantity - item.quantity);
                    }
                }

                // Update total stock
                product.stock = Math.max(0, product.stock - item.quantity);

                // Increment sales count
                product.salesCount = (product.salesCount || 0) + item.quantity;

                if (product.gameStats) {
                    totalXpEarned += (product.gameStats.xpReward || 0) * item.quantity;
                }

                await product.save();
            }
        }


        // 3. Update MongoDB Game Profile (Gamification!)
        console.log(`🎮 Awarding ${totalXpEarned} XP to User ${userId}`);

        // Find profile
        let profile = await GameProfile.findOne({ userId });

        // Fallback if profile doesn't exist (legacy users)
        if (!profile) {
            profile = await GameProfile.create({ userId, points: 0, level: 1 });
        }

        // Update stats
        const oldLevel = profile.level;
        profile.points += totalXpEarned;

        // Simple Level Up Logic (1000 XP per level)
        const newLevel = Math.floor(profile.points / 1000) + 1;

        let levelUpMessage = null;
        if (newLevel > oldLevel) {
            profile.level = newLevel;
            levelUpMessage = `🎉 LEVEL UP! You are now Level ${newLevel}!`;
        }


        await profile.save();

        // 4. Send Order Confirmation Email
        try {
            const user = await User.findByPk(userId);
            if (user && user.email) {
                // Fetch newly created items for the email
                const orderWithItems = await Order.findByPk(newOrder.id, {
                    include: [{ model: OrderItem, as: 'OrderItems' }]
                });

                await emailService.sendOrderConfirmation(
                    newOrder.email || user.email,
                    newOrder,
                    orderWithItems.OrderItems
                );
                console.log(`📧 Order confirmation email sent to ${newOrder.email || user.email}`);
            }
        } catch (emailErr) {
            console.error('❌ Failed to send order confirmation email:', emailErr);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: newOrder.id,
            xpEarned: totalXpEarned,
            levelUp: levelUpMessage,
            newLevel: newLevel,
            currentPoints: profile.points
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Server Error processing order' });
    }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            include: [{
                model: OrderItem,
                as: 'OrderItems' // Ensure plural matches association or use default
            }],
            order: [['createdAt', 'DESC']]
        });

        // Add mock tracking info if fields are empty to show tracking system in UI
        const enrichedOrders = orders.map((order, index) => {
            const raw = order.get({ plain: true });

            // For demo: make older orders appear as 'delivered' or 'shipped'
            if (raw.status === 'processing') {
                if (index > 2) raw.status = 'delivered';
                else if (index > 0) raw.status = 'shipped';
            }

            if (!raw.trackingNumber && raw.status !== 'cancelled' && raw.status !== 'pending') {
                raw.trackingNumber = `CHIC-${raw.id.split('-')[0].toUpperCase()}`;
                raw.shippingCarrier = 'ChicExpress Logistics';
            }
            return raw;
        });

        res.json(enrichedOrders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Server Error fetching orders' });
    }
};
