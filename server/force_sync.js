const { connectMySQL, sequelize } = require('./config/db');

async function syncDB() {
    try {
        await connectMySQL();
        console.log('Database synced with alter: true');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncDB();
