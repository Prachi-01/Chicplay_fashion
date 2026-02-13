const mongoose = require('mongoose');
const sequelize = require('./sequelize');
const initializeMySQL = require('./initDB');
require('dotenv').config();

// MongoDB Connection (Game Data, Products)
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected (Game & Product Data)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
    }
};

// Load Models
const User = require('../models/mysql/User');
const Order = require('../models/mysql/Order');
const OrderItem = require('../models/mysql/OrderItem');
const Address = require('../models/mysql/Address');
const VendorProfile = require('../models/mysql/VendorProfile');

// Define Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'Order' });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(VendorProfile, { foreignKey: 'userId' });
VendorProfile.belongsTo(User, { foreignKey: 'userId' });

const connectMySQL = async () => {
    try {
        // Ensure DB exists first
        await initializeMySQL();

        await sequelize.authenticate();
        console.log('✅ MySQL Connected (Auth & Orders)');

        // Sync models (creates tables if they don't exist)
        // Manual schema changes are safer than alter: true due to index duplication issues
        await sequelize.sync();
        console.log('✅ MySQL Tables Synced');
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error.message);
    }
};

module.exports = { connectMongoDB, connectMySQL, sequelize, User, Order, OrderItem, Address, VendorProfile };
