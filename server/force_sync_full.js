const { connectMySQL, sequelize } = require('./config/db');

async function syncDB() {
    try {
        // Ensure DB exists first
        const initializeMySQL = require('./config/initDB');
        await initializeMySQL();

        await sequelize.authenticate();
        console.log('Connected to MySQL');

        // Sync tables based on models
        await sequelize.sync({ alter: true });
        console.log('Database synced with alter: true');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncDB();
