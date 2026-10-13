
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Check required environment variables
console.log("DB_HOST configured:", Boolean(process.env.DB_HOST));
console.log("DB_PORT configured:", Boolean(process.env.DB_PORT));
console.log("DB_NAME configured:", Boolean(process.env.DB_NAME));
console.log("DB_USER configured:", Boolean(process.env.DB_USER));
console.log("DB_PASSWORD configured:", Boolean(process.env.DB_PASSWORD));

// Load Aiven CA certificate
const caPath = path.join(__dirname, "../certs/ca.pem");

if (!fs.existsSync(caPath)) {
    throw new Error(
        `Aiven CA certificate not found: ${caPath}`
    );
}

const ca = fs.readFileSync(caPath, "utf8");

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        ca: ca,
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testDatabaseConnection() {
    let connection;

    try {
        connection = await pool.getConnection();

        console.log("MySQL database connected successfully");

    } catch (error) {
        console.error(
            "MySQL connection failed:",
            error.message
        );

    } finally {
        if (connection) {
            connection.release();
        }
    }
}

testDatabaseConnection();

// Export connection pool
module.exports = pool;
