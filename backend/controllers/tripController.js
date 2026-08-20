const db = require("../config/db");


// ==========================================
// GET ALL TRIPS
// ==========================================

const getAllTrips = async (req, res) => {

    try {

        const [trips] = await db.execute(`

            SELECT

                t.id,

                t.route_id,
                t.bus_id,
                t.driver_id,

                t.departure_date,
                t.departure_time,
                t.arrival_time,

                t.fare,
                t.available_seats,
                t.status,

                t.created_at,
                t.updated_at,


                r.origin,
                r.destination,


                b.bus_number,
                b.plate_number,
                b.bus_type,


                d.full_name AS driver_name,
                d.phone AS driver_phone


            FROM trips t


            INNER JOIN routes r
                ON t.route_id = r.id


            INNER JOIN buses b
                ON t.bus_id = b.id


            INNER JOIN drivers d
                ON t.driver_id = d.id


            ORDER BY
                t.departure_date ASC,
                t.departure_time ASC

        `);


        res.status(200).json({

            success: true,

            message:
                "Trips retrieved successfully",

            data: trips

        });

    } catch (error) {

        console.error(
            "Get trips error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to retrieve trips",

            error:
                error.message

        });

    }

};

// ==========================================
// CREATE TRIP
// ==========================================

const createTrip = async (req, res) => {

    try {

        const {
            route_id,
            bus_id,
            driver_id,
            departure_date,
            departure_time,
            arrival_time,
            fare,
            available_seats,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !route_id ||
            !bus_id ||
            !driver_id ||
            !departure_date ||
            !departure_time ||
            fare === undefined ||
            available_seats === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Route, bus, driver, departure date, departure time, fare and available seats are required"

            });

        }


        if (Number(fare) <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Fare must be greater than zero"

            });

        }


        if (Number(available_seats) < 1) {

            return res.status(400).json({

                success: false,

                message:
                    "Available seats must be at least 1"

            });

        }


        // ======================================
        // CHECK ROUTE
        // ======================================

        const [route] =
            await db.execute(
                `
                SELECT id
                FROM routes
                WHERE id = ?
                LIMIT 1
                `,
                [route_id]
            );


        if (route.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Route not found"

            });

        }


        // ======================================
        // CHECK BUS
        // ======================================

        const [bus] =
            await db.execute(
                `
                SELECT
                    id,
                    total_seats,
                    status
                FROM buses
                WHERE id = ?
                LIMIT 1
                `,
                [bus_id]
            );


        if (bus.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Bus not found"

            });

        }


        // ======================================
        // CHECK BUS CAPACITY
        // ======================================

        if (
            Number(available_seats) >
            Number(bus[0].total_seats)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Available seats cannot exceed bus capacity of ${bus[0].total_seats}`

            });

        }


        // ======================================
        // CHECK DRIVER
        // ======================================

        const [driver] =
            await db.execute(
                `
                SELECT id
                FROM drivers
                WHERE id = ?
                LIMIT 1
                `,
                [driver_id]
            );


        if (driver.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Driver not found"

            });

        }


        // ======================================
        // CREATE TRIP
        // ======================================

        const [result] =
            await db.execute(
                `
                INSERT INTO trips
                (
                    route_id,
                    bus_id,
                    driver_id,
                    departure_date,
                    departure_time,
                    arrival_time,
                    fare,
                    available_seats,
                    status
                )

                VALUES
                (
                    ?,
                    ?,
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
                    route_id,
                    bus_id,
                    driver_id,
                    departure_date,
                    departure_time,
                    arrival_time || null,
                    fare,
                    available_seats,
                    status || "scheduled"
                ]
            );


        // ======================================
        // GET CREATED TRIP
        // ======================================

        const [createdTrip] =
            await db.execute(
                `
                SELECT

                    t.id,

                    t.route_id,
                    t.bus_id,
                    t.driver_id,

                    t.departure_date,
                    t.departure_time,
                    t.arrival_time,

                    t.fare,
                    t.available_seats,
                    t.status,

                    t.created_at,
                    t.updated_at,

                    r.origin,
                    r.destination,

                    b.bus_number,
                    b.plate_number,
                    b.bus_type,

                    d.full_name AS driver_name,
                    d.phone AS driver_phone

                FROM trips t

                INNER JOIN routes r
                    ON t.route_id = r.id

                INNER JOIN buses b
                    ON t.bus_id = b.id

                INNER JOIN drivers d
                    ON t.driver_id = d.id

                WHERE t.id = ?

                LIMIT 1
                `,
                [result.insertId]
            );


        res.status(201).json({

            success: true,

            message:
                "Trip created successfully",

            data:
                createdTrip[0]

        });


    } catch (error) {

        console.error(
            "Create trip error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create trip",

            error:
                error.message

        });

    }

};

// ==========================================
// UPDATE TRIP
// ==========================================

const updateTrip = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            route_id,
            bus_id,
            driver_id,
            departure_date,
            departure_time,
            arrival_time,
            fare,
            available_seats,
            status
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !route_id ||
            !bus_id ||
            !driver_id ||
            !departure_date ||
            !departure_time ||
            fare === undefined ||
            available_seats === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Route, bus, driver, departure date, departure time, fare and available seats are required"

            });

        }


        if (Number(fare) <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Fare must be greater than zero"

            });

        }


        if (Number(available_seats) < 1) {

            return res.status(400).json({

                success: false,

                message:
                    "Available seats must be at least 1"

            });

        }


        // ======================================
        // CHECK TRIP
        // ======================================

        const [trip] = await db.execute(
            `
            SELECT id
            FROM trips
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (trip.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Trip not found"

            });

        }


        // ======================================
        // CHECK ROUTE
        // ======================================

        const [route] = await db.execute(
            `
            SELECT id
            FROM routes
            WHERE id = ?
            LIMIT 1
            `,
            [route_id]
        );


        if (route.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Route not found"

            });

        }


        // ======================================
        // CHECK BUS
        // ======================================

        const [bus] = await db.execute(
            `
            SELECT
                id,
                total_seats
            FROM buses
            WHERE id = ?
            LIMIT 1
            `,
            [bus_id]
        );


        if (bus.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Bus not found"

            });

        }


        // ======================================
        // CHECK BUS CAPACITY
        // ======================================

        if (
            Number(available_seats) >
            Number(bus[0].total_seats)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Available seats cannot exceed bus capacity of ${bus[0].total_seats}`

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
            [driver_id]
        );


        if (driver.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Driver not found"

            });

        }


        // ======================================
        // UPDATE TRIP
        // ======================================

        await db.execute(
            `
            UPDATE trips

            SET

                route_id = ?,
                bus_id = ?,
                driver_id = ?,
                departure_date = ?,
                departure_time = ?,
                arrival_time = ?,
                fare = ?,
                available_seats = ?,
                status = ?

            WHERE id = ?
            `,
            [
                route_id,
                bus_id,
                driver_id,
                departure_date,
                departure_time,
                arrival_time || null,
                fare,
                available_seats,
                status || "scheduled",
                id
            ]
        );


        // ======================================
        // GET UPDATED TRIP
        // ======================================

        const [updatedTrip] = await db.execute(
            `
            SELECT

                t.id,

                t.route_id,
                t.bus_id,
                t.driver_id,

                t.departure_date,
                t.departure_time,
                t.arrival_time,

                t.fare,
                t.available_seats,
                t.status,

                t.created_at,
                t.updated_at,

                r.origin,
                r.destination,

                b.bus_number,
                b.plate_number,
                b.bus_type,

                d.full_name AS driver_name,
                d.phone AS driver_phone

            FROM trips t

            INNER JOIN routes r
                ON t.route_id = r.id

            INNER JOIN buses b
                ON t.bus_id = b.id

            INNER JOIN drivers d
                ON t.driver_id = d.id

            WHERE t.id = ?

            LIMIT 1
            `,
            [id]
        );


        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({

            success: true,

            message:
                "Trip updated successfully",

            data:
                updatedTrip[0]

        });


    } catch (error) {

        console.error(
            "Update trip error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update trip",

            error:
                error.message

        });

    }

};

// ==========================================
// DELETE TRIP
// ==========================================

const deleteTrip = async (req, res) => {

    try {

        const { id } = req.params;


        // ======================================
        // CHECK TRIP
        // ======================================

        const [trip] = await db.execute(
            `
            SELECT
                id,
                route_id,
                bus_id,
                driver_id
            FROM trips
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );


        if (trip.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Trip not found"

            });

        }


        // ======================================
        // DELETE TRIP
        // ======================================

        await db.execute(
            `
            DELETE FROM trips
            WHERE id = ?
            `,
            [id]
        );


        // ======================================
        // RESPONSE
        // ======================================

        res.status(200).json({

            success: true,

            message: "Trip deleted successfully",

            data: {
                id: trip[0].id
            }

        });


    } catch (error) {

        console.error(
            "Delete trip error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete trip",

            error:
                error.message

        });

    }

};
// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getAllTrips,
    createTrip,
    updateTrip,
    deleteTrip
};