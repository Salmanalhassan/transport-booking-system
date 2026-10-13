
const mysql = require("mysql2/promise");
require("dotenv").config();
console.log("DB_HOST configured:", Boolean(process.env.DB_HOST));
console.log("DB_PORT configured:", Boolean(process.env.DB_PORT));
console.log("DB_NAME configured:", Boolean(process.env.DB_NAME));
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    // Use TLS for the Aiven database connection.
    ssl: {
        minVersion: "TLSv1.2"
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDatabaseConnection() {
    let connection;

    try {
        connection = await pool.getConnection();
        console.log("MySQL database connected successfully");
    } catch (error) {
        console.error("MySQL connection failed:", error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

testDatabaseConnection();

module.exports = pool;
