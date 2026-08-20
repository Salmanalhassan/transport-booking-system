const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ==========================================
// LOGIN USER
// ==========================================

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // ======================================
        // VALIDATE INPUT
        // ======================================

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        const cleanEmail =
            String(email).trim().toLowerCase();


        // ======================================
        // FIND USER
        // ======================================

        const [users] = await db.execute(
            `
            SELECT
                id,
                full_name,
                email,
                phone,
                password,
                role,
                status,
                created_at
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [cleanEmail]
        );


        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        const user = users[0];


        // ======================================
        // CHECK ACCOUNT STATUS
        // ======================================

        if (
            String(user.status).toLowerCase() !==
            "active"
        ) {

            return res.status(403).json({
                success: false,
                message: "Your account is inactive"
            });

        }


        // ======================================
        // CHECK PASSWORD
        // ======================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // ======================================
        // GET PASSENGER PROFILE
        // ======================================

        let passenger = null;


        if (
            String(user.role).toLowerCase() ===
            "passenger"
        ) {

            const [passengers] =
                await db.execute(
                    `
                    SELECT
                        id,
                        user_id,
                        full_name,
                        email,
                        phone,
                        address,
                        emergency_contact,
                        emergency_phone,
                        created_at,
                        updated_at
                    FROM passengers
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [user.id]
                );


            if (passengers.length > 0) {

                passenger =
                    passengers[0];

            }

        }


        // ======================================
        // CREATE JWT
        // ======================================

        const tokenPayload = {

            id: user.id,

            email: user.email,

            role: user.role

        };


        // Add passenger ID
        if (passenger) {

            tokenPayload.passenger_id =
                passenger.id;

        }


        const token =
            jwt.sign(
                tokenPayload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


        // ======================================
        // SUCCESS
        // ======================================

        return res.json({

            success: true,

            message: "Login successful",

            token,

            user: {

                id: user.id,

                full_name: user.full_name,

                email: user.email,

                phone: user.phone,

                role: user.role,

                status: user.status,

                passenger_id:
                    passenger
                        ? passenger.id
                        : null,

                created_at:
                    user.created_at

            },

            passenger:
                passenger

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error during login"

        });

    }
};



// ==========================================
// REGISTER PASSENGER
// ==========================================

const registerPassenger = async (req, res) => {

    let connection = null;


    try {

        const {
            full_name,
            email,
            phone,
            password,
            address,
            emergency_contact,
            emergency_phone
        } = req.body;


        // ======================================
        // CLEAN INPUT
        // ======================================

        const cleanName =
            String(
                full_name || ""
            ).trim();


        const cleanEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        const cleanPhone =
            String(
                phone || ""
            ).trim();


        const cleanAddress =
            String(
                address || ""
            ).trim();


        const cleanEmergencyContact =
            String(
                emergency_contact || ""
            ).trim();


        const cleanEmergencyPhone =
            String(
                emergency_phone || ""
            ).trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !cleanName ||
            !cleanEmail ||
            !cleanPhone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name, email, phone number and password are required"

            });

        }


        // ======================================
        // EMAIL VALIDATION
        // ======================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(cleanEmail)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid email address"

            });

        }


        // ======================================
        // PASSWORD LENGTH
        // ======================================

        if (
            String(password).length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters"

            });

        }


        // ======================================
        // CHECK EMAIL IN USERS
        // ======================================

        const [existingUserEmail] =
            await db.execute(
                `
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (
            existingUserEmail.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email already exists"

            });

        }


        // ======================================
        // CHECK PHONE IN USERS
        // ======================================

        const [existingUserPhone] =
            await db.execute(
                `
                SELECT id
                FROM users
                WHERE phone = ?
                LIMIT 1
                `,
                [cleanPhone]
            );


        if (
            existingUserPhone.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this phone number already exists"

            });

        }


        // ======================================
        // CHECK EMAIL IN PASSENGERS
        // ======================================

        const [existingPassengerEmail] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE email = ?
                LIMIT 1
                `,
                [cleanEmail]
            );


        if (
            existingPassengerEmail.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A passenger with this email already exists"

            });

        }


        // ======================================
        // CHECK PHONE IN PASSENGERS
        // ======================================

        const [existingPassengerPhone] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE phone = ?
                LIMIT 1
                `,
                [cleanPhone]
            );


        if (
            existingPassengerPhone.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "A passenger with this phone number already exists"

            });

        }


        // ======================================
        // HASH PASSWORD
        // ======================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ======================================
        // GET CONNECTION
        // ======================================

        connection =
            await db.getConnection();


        // ======================================
        // START TRANSACTION
        // ======================================

        await connection.beginTransaction();


        // ======================================
        // CREATE USER
        // ======================================

        const [userResult] =
            await connection.execute(
                `
                INSERT INTO users
                (
                    full_name,
                    email,
                    phone,
                    password,
                    role,
                    status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    'passenger',
                    'active'
                )
                `,
                [
                    cleanName,
                    cleanEmail,
                    cleanPhone,
                    hashedPassword
                ]
            );


        const userId =
            userResult.insertId;


        // ======================================
        // CREATE PASSENGER PROFILE
        // ======================================

        const [passengerResult] =
            await connection.execute(
                `
                INSERT INTO passengers
                (
                    user_id,
                    full_name,
                    email,
                    phone,
                    address,
                    emergency_contact,
                    emergency_phone
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    userId,
                    cleanName,
                    cleanEmail,
                    cleanPhone,
                    cleanAddress || null,
                    cleanEmergencyContact || null,
                    cleanEmergencyPhone || null
                ]
            );


        const passengerId =
            passengerResult.insertId;


        // ======================================
        // COMMIT TRANSACTION
        // ======================================

        await connection.commit();


        // ======================================
        // RELEASE CONNECTION
        // ======================================

        connection.release();

        connection = null;


        // ======================================
        // CREATE TOKEN
        // ======================================

        const token =
            jwt.sign(
                {
                    id: userId,
                    email: cleanEmail,
                    role: "passenger",
                    passenger_id: passengerId
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        return res.status(201).json({

            success: true,

            message:
                "Passenger registration successful",

            token,

            user: {

                id: userId,

                full_name: cleanName,

                email: cleanEmail,

                phone: cleanPhone,

                role: "passenger",

                status: "active",

                passenger_id: passengerId

            },

            passenger: {

                id: passengerId,

                user_id: userId,

                full_name: cleanName,

                email: cleanEmail,

                phone: cleanPhone,

                address:
                    cleanAddress || null,

                emergency_contact:
                    cleanEmergencyContact || null,

                emergency_phone:
                    cleanEmergencyPhone || null

            }

        });

    } catch (error) {

        console.error(
            "Passenger registration error:",
            error
        );


        // ======================================
        // ROLLBACK
        // ======================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError
                );

            }

        }


        // ======================================
        // RELEASE CONNECTION
        // ======================================

        if (connection) {

            connection.release();

        }


        // ======================================
        // DUPLICATE ERROR
        // ======================================

        if (
            error.code ===
            "ER_DUP_ENTRY"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "An account with this email or phone already exists"

            });

        }


        // ======================================
        // FOREIGN KEY ERROR
        // ======================================

        if (
            error.code ===
            "ER_NO_REFERENCED_ROW_2"
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create passenger account relationship"

            });

        }


        // ======================================
        // GENERAL ERROR
        // ======================================

        return res.status(500).json({

            success: false,

            message:
                "Server error during passenger registration",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }
};



// ==========================================
// EXPORT
// ==========================================

module.exports = {

    login,

    registerPassenger

};