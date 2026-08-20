const db = require("../config/db");


// ================================
// GET ALL BUSES
// ================================

const getAllBuses = async (req, res) => {
    try {

        const [buses] = await db.execute(`
            SELECT
                id,
                bus_number,
                plate_number,
                bus_type,
                total_seats,
                status,
                created_at,
                updated_at
            FROM buses
            ORDER BY id DESC
        `);

        res.json({
            success: true,
            count: buses.length,
            data: buses
        });

    } catch (error) {

        console.error("Get buses error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch buses"
        });
    }
};


// ================================
// GET SINGLE BUS
// ================================

const getBusById = async (req, res) => {
    try {

        const { id } = req.params;

        const [buses] = await db.execute(
            `
            SELECT
                id,
                bus_number,
                plate_number,
                bus_type,
                total_seats,
                status,
                created_at,
                updated_at
            FROM buses
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        if (buses.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Bus not found"
            });
        }

        res.json({
            success: true,
            data: buses[0]
        });

    } catch (error) {

        console.error("Get bus error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bus"
        });
    }
};


// ================================
// CREATE BUS
// ================================

const createBus = async (req, res) => {

    try {

        const {
            bus_number,
            plate_number,
            bus_type,
            total_seats,
            status
        } = req.body;


        // Validation
        if (
            !bus_number ||
            !plate_number ||
            !bus_type ||
            !total_seats
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Bus number, plate number, bus type and total seats are required"
            });
        }


        if (Number(total_seats) <= 0) {

            return res.status(400).json({
                success: false,
                message: "Total seats must be greater than zero"
            });
        }


        // Check duplicate bus number
        const [existingBus] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE bus_number = ?
            LIMIT 1
            `,
            [bus_number]
        );


        if (existingBus.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Bus number already exists"
            });
        }


        // Check duplicate plate number
        const [existingPlate] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE plate_number = ?
            LIMIT 1
            `,
            [plate_number]
        );


        if (existingPlate.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Plate number already exists"
            });
        }


        const [result] = await db.execute(
            `
            INSERT INTO buses
            (
                bus_number,
                plate_number,
                bus_type,
                total_seats,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                bus_number,
                plate_number,
                bus_type,
                Number(total_seats),
                status || "available"
            ]
        );


        const [newBus] = await db.execute(
            `
            SELECT *
            FROM buses
            WHERE id = ?
            `,
            [result.insertId]
        );


        res.status(201).json({
            success: true,
            message: "Bus created successfully",
            data: newBus[0]
        });

    } catch (error) {

        console.error("Create bus error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create bus"
        });
    }
};


// ================================
// UPDATE BUS
// ================================

const updateBus = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            bus_number,
            plate_number,
            bus_type,
            total_seats,
            status
        } = req.body;


        // Check bus exists
        const [existing] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE id = ?
            `,
            [id]
        );


        if (existing.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Bus not found"
            });
        }


        if (
            !bus_number ||
            !plate_number ||
            !bus_type ||
            !total_seats
        ) {

            return res.status(400).json({
                success: false,
                message: "All bus fields are required"
            });
        }


        // Check duplicate bus number
        const [duplicateBus] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE bus_number = ?
            AND id != ?
            LIMIT 1
            `,
            [bus_number, id]
        );


        if (duplicateBus.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Bus number already exists"
            });
        }


        // Check duplicate plate
        const [duplicatePlate] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE plate_number = ?
            AND id != ?
            LIMIT 1
            `,
            [plate_number, id]
        );


        if (duplicatePlate.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Plate number already exists"
            });
        }


        await db.execute(
            `
            UPDATE buses
            SET
                bus_number = ?,
                plate_number = ?,
                bus_type = ?,
                total_seats = ?,
                status = ?
            WHERE id = ?
            `,
            [
                bus_number,
                plate_number,
                bus_type,
                Number(total_seats),
                status || "available",
                id
            ]
        );


        const [updatedBus] = await db.execute(
            `
            SELECT *
            FROM buses
            WHERE id = ?
            `,
            [id]
        );


        res.json({
            success: true,
            message: "Bus updated successfully",
            data: updatedBus[0]
        });

    } catch (error) {

        console.error("Update bus error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update bus"
        });
    }
};


// ================================
// DELETE BUS
// ================================

const deleteBus = async (req, res) => {

    try {

        const { id } = req.params;


        const [existing] = await db.execute(
            `
            SELECT id
            FROM buses
            WHERE id = ?
            `,
            [id]
        );


        if (existing.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Bus not found"
            });
        }


        // Check whether bus is already used by trips
        const [trips] = await db.execute(
            `
            SELECT id
            FROM trips
            WHERE bus_id = ?
            LIMIT 1
            `,
            [id]
        );


        if (trips.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "This bus cannot be deleted because it is already assigned to a trip"
            });
        }


        await db.execute(
            `
            DELETE FROM buses
            WHERE id = ?
            `,
            [id]
        );


        res.json({
            success: true,
            message: "Bus deleted successfully"
        });

    } catch (error) {

        console.error("Delete bus error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete bus"
        });
    }
};


module.exports = {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus
};