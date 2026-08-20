const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createAdmin() {
    try {
        const fullName = "System Administrator";
        const email = "admin@transport.com";
        const phone = "08000000000";
        const password = "Admin@12345";
        const role = "admin";

        // Check if admin already exists
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert admin
        await db.execute(
            `INSERT INTO users
            (full_name, email, phone, password, role, status)
            VALUES (?, ?, ?, ?, ?, 'active')`,
            [
                fullName,
                email,
                phone,
                hashedPassword,
                role
            ]
        );

        console.log("Admin account created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
}

createAdmin();