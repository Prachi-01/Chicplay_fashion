const mysql = require('mysql2/promise');
require('dotenv').config();

const initializeMySQL = async () => {
    try {
        const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

        const connection = await mysql.createConnection({
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;`);
        console.log(`✅ Database ${MYSQL_DATABASE} checked/created.`);
        await connection.end();
    } catch (error) {
        console.error('❌ Database Initialization Error:', error.message);
    }
};

module.exports = initializeMySQL;
