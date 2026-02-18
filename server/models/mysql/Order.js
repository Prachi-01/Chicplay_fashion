const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    shippingAddress: {
        type: DataTypes.TEXT, // Text is better for full addresses
        allowNull: true
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shippingCarrier: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estimatedDelivery: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
            name: 'order_userid_idx'
        },
        {
            fields: ['status'],
            name: 'order_status_idx'
        }
    ]
});

module.exports = Order;
