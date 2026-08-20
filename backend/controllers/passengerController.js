const db = require("../config/db");


// ==========================================
// GET ALL PASSENGERS
// ADMIN / STAFF
// ==========================================

const getAllPassengers = async (req, res) => {

    try {

        const [passengers] = await db.execute(`

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

            ORDER BY created_at DESC

        `);


        return res.status(200).json({

            success: true,

            message:
                "Passengers retrieved successfully",

            data: passengers

        });

    } catch (error) {

        console.error(
            "Get passengers error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve passengers"

        });

    }

};



// ==========================================
// GET MY PASSENGER PROFILE
// PASSENGER
// GET /api/passengers/me
// ==========================================

const getMyProfile = async (req, res) => {

    try {

        // ======================================
        // GET LOGGED-IN USER ID FROM JWT
        // ======================================

        const userId =
            Number(req.user?.id);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user authentication"

            });

        }


        // ======================================
        // FIND PASSENGER USING user_id
        // ======================================

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
                [userId]
            );


        // ======================================
        // NOT FOUND
        // ======================================

        if (passengers.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger profile not found"

            });

        }


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                "Passenger profile retrieved successfully",

            data:
                passengers[0]

        });

    } catch (error) {

        console.error(
            "Get my passenger profile error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve passenger profile"

        });

    }

};



// ==========================================
// CREATE PASSENGER
// ADMIN ONLY
// ==========================================

const createPassenger = async (req, res) => {

    try {

        const {
            full_name,
            email,
            phone,
            address,
            emergency_contact,
            emergency_phone
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (!full_name || !phone) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name and phone are required"

            });

        }


        // ======================================
        // CHECK DUPLICATE PHONE
        // ======================================

        const [existingPassenger] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE phone = ?
                LIMIT 1
                `,
                [phone]
            );


        if (existingPassenger.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "A passenger with this phone number already exists"

            });

        }


        // ======================================
        // CREATE PASSENGER
        // ======================================

        const [result] =
            await db.execute(
                `
                INSERT INTO passengers
                (
                    full_name,
                    email,
                    phone,
                    address,
                    emergency_contact,
                    emergency_phone
                )

                VALUES
                (?, ?, ?, ?, ?, ?)
                `,
                [
                    full_name,
                    email || null,
                    phone,
                    address || null,
                    emergency_contact || null,
                    emergency_phone || null
                ]
            );


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(201).json({

            success: true,

            message:
                "Passenger created successfully",

            data: {

                id:
                    result.insertId,

                user_id:
                    null,

                full_name,

                email:
                    email || null,

                phone,

                address:
                    address || null,

                emergency_contact:
                    emergency_contact || null,

                emergency_phone:
                    emergency_phone || null

            }

        });

    } catch (error) {

        console.error(
            "Create passenger error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create passenger"

        });

    }

};



// ==========================================
// UPDATE PASSENGER
// ADMIN ONLY
// ==========================================

const updatePassenger = async (req, res) => {

    try {

        const { id } =
            req.params;


        const {
            full_name,
            email,
            phone,
            address,
            emergency_contact,
            emergency_phone
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (!full_name || !phone) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name and phone are required"

            });

        }


        // ======================================
        // CHECK PASSENGER
        // ======================================

        const [passenger] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (passenger.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger not found"

            });

        }


        // ======================================
        // CHECK DUPLICATE PHONE
        // ======================================

        const [duplicate] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE phone = ?
                AND id != ?
                LIMIT 1
                `,
                [
                    phone,
                    id
                ]
            );


        if (duplicate.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Another passenger already uses this phone number"

            });

        }


        // ======================================
        // UPDATE
        // ======================================

        await db.execute(
            `
            UPDATE passengers

            SET
                full_name = ?,
                email = ?,
                phone = ?,
                address = ?,
                emergency_contact = ?,
                emergency_phone = ?

            WHERE id = ?
            `,
            [
                full_name,
                email || null,
                phone,
                address || null,
                emergency_contact || null,
                emergency_phone || null,
                id
            ]
        );


        // ======================================
        // SUCCESS
        // ======================================

        return res.json({

            success: true,

            message:
                "Passenger updated successfully",

            data: {

                id:
                    Number(id),

                full_name,

                email:
                    email || null,

                phone,

                address:
                    address || null,

                emergency_contact:
                    emergency_contact || null,

                emergency_phone:
                    emergency_phone || null

            }

        });

    } catch (error) {

        console.error(
            "Update passenger error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update passenger"

        });

    }

};



// ==========================================
// DELETE PASSENGER
// ADMIN ONLY
// ==========================================

const deletePassenger = async (req, res) => {

    try {

        const { id } =
            req.params;


        // ======================================
        // CHECK PASSENGER
        // ======================================

        const [passenger] =
            await db.execute(
                `
                SELECT id
                FROM passengers
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (passenger.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger not found"

            });

        }


        // ======================================
        // DELETE
        // ======================================

        await db.execute(
            `
            DELETE FROM passengers
            WHERE id = ?
            `,
            [id]
        );


        // ======================================
        // SUCCESS
        // ======================================

        return res.json({

            success: true,

            message:
                "Passenger deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete passenger error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete passenger"

        });

    }

};


// ==========================================
// GET CURRENT LOGGED-IN PASSENGER
// ==========================================

const getMyPassengerProfile = async (req, res) => {

    try {

        // User ID comes from JWT
        const userId = req.user.id;

        const [passengers] = await db.execute(
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
            [userId]
        );


        if (passengers.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger profile not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Passenger profile retrieved successfully",

            data:
                passengers[0]

        });

    } catch (error) {

        console.error(
            "Get my passenger profile error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve passenger profile"

        });

    }

};
// ==========================================
// EXPORT
// ==========================================
// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllPassengers,

    getMyPassengerProfile,

    createPassenger,

    updatePassenger,

    deletePassenger

};