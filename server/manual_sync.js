const { sequelize, User, Order, OrderItem, Address } = require('./config/db');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Connected');
        await sequelize.sync({ alter: true });
        console.log('Synced with alter: true');
        process.exit(0);
    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

sync();
