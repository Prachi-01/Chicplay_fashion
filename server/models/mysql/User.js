const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'vendor'),
        defaultValue: 'user'
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    hooks: {
        beforeSave: (user) => {
            if (user.email) {
                user.email = user.email.toLowerCase();
            }
        }
    }
    // Note: unique: true on fields automatically creates indexes, no need to duplicate here
});

module.exports = User;
