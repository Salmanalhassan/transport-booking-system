const db = require("../config/db");

// ==========================================
// GET ALL DRIVERS
// ==========================================

const getAllDrivers = async (req, res) => {

    try {

        const [drivers] = await db.execute(`
            SELECT
                id,
                full_name,
                phone,
                license_number,
                address,
                status,
                created_at,
                updated_at
            FROM drivers
            ORDER BY created_at DESC
        `);

        res.status(200).json({

            success: true,

            message: "Drivers retrieved successfully",

            data: drivers

        });

    } catch (error) {

        console.error(
            "Get drivers error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to retrieve drivers",

            error: error.message

        });

    }

};


// ==========================================
// CREATE DRIVER
// ==========================================

const createDriver = async (req, res) => {

    try {

        const {
            full_name,
            phone,
            license_number,
            address,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !full_name ||
            !phone ||
            !license_number
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name, phone and license number are required"

            });

        }


        // ======================================
        // CHECK LICENSE NUMBER
        // ======================================

        const [existingDriver] = await db.execute(
            `
            SELECT id
            FROM drivers
            WHERE license_number = ?
            LIMIT 1
            `,
            [license_number]
        );


        if (existingDriver.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "License number already exists"

            });

        }


        // ======================================
        // CREATE DRIVER
        // ======================================

        const [result] = await db.execute(
            `
            INSERT INTO drivers
            (
                full_name,
                phone,
                license_number,
                address,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                full_name,
                phone,
                license_number,
                address || null,
                status || "available"
            ]
        );


        // ======================================
        // GET CREATED DRIVER
        // ======================================

        const [createdDriver] = await db.execute(
            `
            SELECT
                id,
                full_name,
                phone,
                license_number,
                address,
                status,
                created_at,
                updated_at
            FROM drivers
            WHERE id = ?
            LIMIT 1
            `,
            [result.insertId]
        );


        res.status(201).json({

            success: true,

            message:
                "Driver created successfully",

            data:
                createdDriver[0]

        });


    } catch (error) {

        console.error(
            "Create driver error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create driver",

            error:
                error.message

        });

    }

};


// ==========================================
// UPDATE DRIVER
// ==========================================

const updateDriver = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            full_name,
            phone,
            license_number,
            address,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !full_name ||
            !phone ||
            !license_number
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name, phone and license number are required"

            });

        }


        // ======================================
        // CHECK DRIVER
        // ======================================

        const [driver] = await db.execute(
            `
            SELECT id
            FROM drivers
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (driver.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Driver not found"

            });

        }


        // ======================================
        // CHECK LICENSE NUMBER
        // ======================================

        const [existingLicense] = await db.execute(
            `
            SELECT id
            FROM drivers
            WHERE license_number = ?
            AND id != ?
            LIMIT 1
            `,
            [
                license_number,
                id
            ]
        );


        if (existingLicense.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "License number already exists"

            });

        }


        // ======================================
        // UPDATE DRIVER
        // ======================================

        await db.execute(
            `
            UPDATE drivers
            SET
                full_name = ?,
                phone = ?,
                license_number = ?,
                address = ?,
                status = ?
            WHERE id = ?
            `,
            [
                full_name,
                phone,
                license_number,
                address || null,
                status || "available",
                id
            ]
        );


        // ======================================
        // GET UPDATED DRIVER
        // ======================================

        const [updatedDriver] = await db.execute(
            `
            SELECT
                id,
                full_name,
                phone,
                license_number,
                address,
                status,
                created_at,
                updated_at
            FROM drivers
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        res.status(200).json({

            success: true,

            message:
                "Driver updated successfully",

            data:
                updatedDriver[0]

        });


    } catch (error) {

        console.error(
            "Update driver error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update driver",

            error:
                error.message

        });

    }

};

// ==========================================
// DELETE DRIVER
// ==========================================

const deleteDriver = async (req, res) => {

    try {

        const { id } = req.params;


        // ======================================
        // CHECK DRIVER
        // ======================================

        const [driver] = await db.execute(
            `
            SELECT
                id,
                full_name
            FROM drivers
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (driver.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Driver not found"

            });

        }


        // ======================================
        // DELETE DRIVER
        // ======================================

        await db.execute(
            `
            DELETE FROM drivers
            WHERE id = ?
            `,
            [id]
        );


        // ======================================
        // SUCCESS RESPONSE
        // ======================================

        res.status(200).json({

            success: true,

            message:
                "Driver deleted successfully",

            data: {

                id: Number(id),

                full_name:
                    driver[0].full_name

            }

        });


    } catch (error) {

        console.error(
            "Delete driver error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete driver",

            error:
                error.message

        });

    }

};
// ==========================================
// EXPORT
// ==========================================
module.exports = {

    getAllDrivers,

    createDriver,

    updateDriver,

    deleteDriver

};