const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID, // Matching Order's UUID type
        allowNull: false
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    productId: {
        type: DataTypes.STRING, // MongoDB Product ID
        allowNull: false
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['orderId'],
            name: 'orderitem_orderid_idx'
        }
    ]
});

module.exports = OrderItem;
