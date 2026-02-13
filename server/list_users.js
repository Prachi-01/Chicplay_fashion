const User = require('./models/mysql/User');
const sequelize = require('./config/sequelize');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL');
        const users = await User.findAll({ attributes: ['email', 'role'] });
        console.log('--- User Roles Report ---');
        users.forEach(u => {
            console.log(`${u.email}: ${u.role}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
