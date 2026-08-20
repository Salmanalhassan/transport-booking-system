const db = require("../config/db");

// ==========================================
// GET ALL ROUTES
// ==========================================

const getAllRoutes = async (req, res) => {

    try {

        const [routes] = await db.execute(`

            SELECT

                id,
                origin,
                destination,
                distance_km,
                estimated_duration,
                fare,
                status,
                created_at,
                updated_at

            FROM routes

            ORDER BY
                origin ASC,
                destination ASC

        `);


        res.status(200).json({

            success: true,

            message:
                "Routes retrieved successfully",

            data: routes

        });


    } catch (error) {

        console.error(
            "Get routes error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to retrieve routes",

            error:
                error.message

        });

    }

};


// ==========================================
// CREATE ROUTE
// ==========================================

const createRoute = async (req, res) => {

    try {

        const {
            origin,
            destination,
            distance_km,
            estimated_duration,
            fare,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !origin ||
            !destination ||
            distance_km === undefined ||
            !estimated_duration ||
            fare === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Origin, destination, distance, duration and fare are required"

            });

        }


        if (
            Number(distance_km) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Distance must be greater than zero"

            });

        }


        if (
            Number(fare) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Fare must be greater than zero"

            });

        }


        // ======================================
        // CHECK DUPLICATE ROUTE
        // ======================================

        const [existing] =
            await db.execute(
                `
                SELECT id

                FROM routes

                WHERE LOWER(origin) = LOWER(?)

                AND LOWER(destination) = LOWER(?)

                LIMIT 1
                `,
                [
                    origin.trim(),
                    destination.trim()
                ]
            );


        if (existing.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "This route already exists"

            });

        }


        // ======================================
        // CREATE ROUTE
        // ======================================

        const [result] =
            await db.execute(
                `
                INSERT INTO routes
                (
                    origin,
                    destination,
                    distance_km,
                    estimated_duration,
                    fare,
                    status
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                `,
                [
                    origin.trim(),
                    destination.trim(),
                    distance_km,
                    estimated_duration.trim(),
                    fare,
                    status || "active"
                ]
            );


        // ======================================
        // GET CREATED ROUTE
        // ======================================

        const [createdRoute] =
            await db.execute(
                `
                SELECT *

                FROM routes

                WHERE id = ?

                LIMIT 1
                `,
                [result.insertId]
            );


        res.status(201).json({

            success: true,

            message:
                "Route created successfully",

            data:
                createdRoute[0]

        });


    } catch (error) {

        console.error(
            "Create route error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create route",

            error:
                error.message

        });

    }

};
// ==========================================
// UPDATE ROUTE
// ==========================================

const updateRoute = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            origin,
            destination,
            distance_km,
            estimated_duration,
            fare,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !origin ||
            !destination ||
            distance_km === undefined ||
            !estimated_duration ||
            fare === undefined ||
            !status
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Origin, destination, distance, duration, fare and status are required"

            });

        }


        if (Number(distance_km) <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Distance must be greater than zero"

            });

        }


        if (Number(fare) <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Fare must be greater than zero"

            });

        }


        // ======================================
        // CHECK ROUTE EXISTS
        // ======================================

        const [existingRoute] =
            await db.execute(
                `
                SELECT id
                FROM routes
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (existingRoute.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Route not found"

            });

        }


        // ======================================
        // CHECK DUPLICATE ROUTE
        // ======================================

        const [duplicate] =
            await db.execute(
                `
                SELECT id

                FROM routes

                WHERE LOWER(origin) = LOWER(?)

                AND LOWER(destination) = LOWER(?)

                AND id != ?

                LIMIT 1
                `,
                [
                    origin.trim(),
                    destination.trim(),
                    id
                ]
            );


        if (duplicate.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Another route with this origin and destination already exists"

            });

        }


        // ======================================
        // UPDATE
        // ======================================

        await db.execute(
            `
            UPDATE routes

            SET

                origin = ?,

                destination = ?,

                distance_km = ?,

                estimated_duration = ?,

                fare = ?,

                status = ?

            WHERE id = ?
            `,
            [
                origin.trim(),
                destination.trim(),
                distance_km,
                estimated_duration.trim(),
                fare,
                status,
                id
            ]
        );


        // ======================================
        // GET UPDATED ROUTE
        // ======================================

        const [updatedRoute] =
            await db.execute(
                `
                SELECT *

                FROM routes

                WHERE id = ?

                LIMIT 1
                `,
                [id]
            );


        res.status(200).json({

            success: true,

            message:
                "Route updated successfully",

            data:
                updatedRoute[0]

        });


    } catch (error) {

        console.error(
            "Update route error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update route",

            error:
                error.message

        });

    }

};

// ==========================================
// DELETE ROUTE
// ==========================================

const deleteRoute = async (req, res) => {

    try {

        const { id } = req.params;


        // ======================================
        // CHECK ROUTE EXISTS
        // ======================================

        const [existingRoute] =
            await db.execute(
                `
                SELECT id
                FROM routes
                WHERE id = ?
                LIMIT 1
                `,
                [id]
            );


        if (existingRoute.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Route not found"

            });

        }


        // ======================================
        // CHECK IF ROUTE IS USED BY A TRIP
        // ======================================

        const [trips] =
            await db.execute(
                `
                SELECT id
                FROM trips
                WHERE route_id = ?
                LIMIT 1
                `,
                [id]
            );


        if (trips.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "This route cannot be deleted because it is already assigned to a trip"

            });

        }


        // ======================================
        // DELETE ROUTE
        // ======================================

        await db.execute(
            `
            DELETE FROM routes
            WHERE id = ?
            `,
            [id]
        );


        res.status(200).json({

            success: true,

            message:
                "Route deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete route error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete route",

            error:
                error.message

        });

    }

};
// ==========================================
// EXPORT
// ==========================================
module.exports = {

    getAllRoutes,

    createRoute,

    updateRoute,

    deleteRoute

};