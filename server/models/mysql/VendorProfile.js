const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const VendorProfile = sequelize.define('VendorProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Matches the table name
            key: 'id'
        }
    },
    storeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    businessType: {
        type: DataTypes.ENUM('Individual', 'Proprietorship', 'Pvt Ltd', 'LLP'),
        allowNull: false
    },
    ownerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    panNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gstNumber: {
        type: DataTypes.STRING,
        allowNull: true // Some small businesses might not have GST initially? But user requirement listed it. Make it required if user said so.
    },
    pickupAddress: {
        type: DataTypes.TEXT, // Or JSON if structured
        allowNull: false
    },
    bankDetails: {
        type: DataTypes.JSON, // { accountHolder, accountNumber, ifsc, bankName }
        allowNull: false
    },
    documents: {
        type: DataTypes.JSON, // { panCard: url, gstCert: url, etc. }
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Active', 'Rejected'),
        defaultValue: 'Pending'
    },
    rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
    // Note: unique: true on storeName and foreign key on userId automatically create indexes
});

module.exports = VendorProfile;
