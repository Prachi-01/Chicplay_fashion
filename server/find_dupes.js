require('dotenv').config();
const { User } = require('./config/db');
const { Op } = require('sequelize');

async function findPotentialDuplicates() {
    try {
        const email = 'zuuzeeeeee@gmail.com';
        const users = await User.findAll({
            where: {
                email: { [Op.like]: `%${email.split('@')[0]}%` }
            }
        });

        console.log(`Found ${users.length} matching users:`);
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Username: ${u.username}, Email: ${u.email}`);
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findPotentialDuplicates();
