const db = require("../config/db");


// ==========================================
// GET ALL BOOKINGS
// ADMIN / STAFF
// ==========================================

const getAllBookings = async (req, res) => {

    try {

        const [bookings] = await db.execute(`
            SELECT
                b.id,
                b.booking_reference,
                b.passenger_id,
                b.trip_id,
                b.seat_number,
                b.amount,
                b.booking_status,
                b.payment_status,
                b.booked_by,
                b.created_at,

                p.full_name AS passenger_name,
                p.phone AS passenger_phone,

                t.departure_date,
                t.departure_time,
                t.arrival_time,
                t.fare,
                t.available_seats,
                t.status AS trip_status,

                r.origin,
                r.destination

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            INNER JOIN trips t
                ON b.trip_id = t.id

            INNER JOIN routes r
                ON t.route_id = r.id

            ORDER BY b.created_at DESC
        `);


        return res.status(200).json({

            success: true,

            message:
                "Bookings retrieved successfully",

            data:
                bookings

        });

    } catch (error) {

        console.error(
            "Get bookings error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve bookings",

            error:
                error.message

        });

    }

};



// ==========================================
// GET MY BOOKINGS
// PASSENGER ONLY
//
// GET /api/bookings/my-bookings
// ==========================================
//========================

// ==========================================
// GET SINGLE BOOKING
// ==========================================

const getBookingById = async (req, res) => {

    try {

        const bookingId =
            Number(
                req.params.id
            );


        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid booking ID"

            });

        }


        const [bookings] =
            await db.execute(`

                SELECT
                    b.id,
                    b.booking_reference,
                    b.passenger_id,
                    b.trip_id,
                    b.seat_number,
                    b.amount,
                    b.booking_status,
                    b.payment_status,
                    b.booked_by,
                    b.created_at,

                    p.full_name AS passenger_name,
                    p.phone AS passenger_phone,

                    t.departure_date,
                    t.departure_time,
                    t.arrival_time,
                    t.fare,
                    t.available_seats,
                    t.status AS trip_status,

                    r.origin,
                    r.destination

                FROM bookings b

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                WHERE b.id = ?

                LIMIT 1

            `, [
                bookingId
            ]);


        if (!bookings.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Booking retrieved successfully",

            data:
                bookings[0]

        });

    } catch (error) {

        console.error(
            "Get booking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve booking",

            error:
                error.message

        });

    }

};



// ==========================================
// CREATE NEW BOOKING
// ==========================================
const createBooking = async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        const {
            trip_id,
            seat_number,
            amount,
            payment_status
        } = req.body;


        // ======================================
        // LOGGED-IN USER
        // ======================================

        const userId =
            Number(req.user.id);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication is required"

            });

        }


        // ======================================
        // BOOKING VALIDATION
        // ======================================

        if (
            !trip_id ||
            !seat_number ||
            amount === undefined ||
            amount === null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Trip, seat number and amount are required"

            });

        }


        // ======================================
        // SEAT VALIDATION
        // ======================================

        if (
            Number(seat_number) < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Seat number must be at least 1"

            });

        }


        // ======================================
        // AMOUNT VALIDATION
        // ======================================

        if (
            Number(amount) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Booking amount must be greater than zero"

            });

        }


        // ======================================
        // FIND PASSENGER PROFILE
        // ======================================

        const [
            passengers
        ] = await connection.execute(`

            SELECT
                id,
                user_id,
                full_name,
                email,
                phone

            FROM passengers

            WHERE user_id = ?

            LIMIT 1

        `, [
            userId
        ]);


        if (!passengers.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger profile not found. Please complete your passenger profile first."

            });

        }


        const passenger =
            passengers[0];


        const finalPassengerId =
            passenger.id;


        // ======================================
        // START TRANSACTION
        // ======================================

        await connection.beginTransaction();


        // ======================================
        // CHECK TRIP
        // ======================================

        const [
            trips
        ] = await connection.execute(`

            SELECT
                id,
                fare,
                available_seats,
                status

            FROM trips

            WHERE id = ?

            LIMIT 1

            FOR UPDATE

        `, [
            Number(trip_id)
        ]);


        if (!trips.length) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Trip not found"

            });

        }


        const trip =
            trips[0];


        // ======================================
        // TRIP STATUS
        // ======================================

        if (
            trip.status !== "scheduled" &&
            trip.status !== "boarding"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "This trip is not available for booking"

            });

        }


        // ======================================
        // AVAILABLE SEATS
        // ======================================

        if (
            Number(
                trip.available_seats
            ) <= 0
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "No seats are available for this trip"

            });

        }


        // ======================================
        // CHECK DUPLICATE SEAT
        // ======================================

        const [
            existingBooking
        ] = await connection.execute(`

            SELECT
                id

            FROM bookings

            WHERE trip_id = ?

            AND seat_number = ?

            AND booking_status IN (
                'pending',
                'confirmed'
            )

            LIMIT 1

        `, [
            Number(trip_id),
            Number(seat_number)
        ]);


        if (
            existingBooking.length > 0
        ) {

            await connection.rollback();

            return res.status(409).json({

                success: false,

                message:
                    "This seat is already booked"

            });

        }


        // ======================================
        // BOOKING REFERENCE
        // ======================================

        const bookingReference =
            `TRP-${Date.now()}-${Math.floor(
                1000 +
                Math.random() * 9000
            )}`;


        // ======================================
        // PAYMENT STATUS
        // ======================================

        const validPaymentStatuses = [
            "pending",
            "paid",
            "failed",
            "refunded"
        ];


        /*
            IMPORTANT:

            Passenger booking should start
            as pending payment.

            We do NOT allow the frontend
            to create a fake paid booking.
        */

        const finalPaymentStatus =
            "pending";


        // ======================================
        // INSERT BOOKING
        // ======================================

        const [
            result
        ] = await connection.execute(`

            INSERT INTO bookings
            (
                booking_reference,
                passenger_id,
                trip_id,
                seat_number,
                amount,
                booking_status,
                payment_status,
                booked_by
            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                'pending',
                ?,
                ?
            )

        `, [

            bookingReference,

            finalPassengerId,

            Number(trip_id),

            Number(seat_number),

            Number(amount),

            finalPaymentStatus,

            userId

        ]);


        // ======================================
        // REDUCE AVAILABLE SEATS
        // ======================================

        await connection.execute(`

            UPDATE trips

            SET available_seats =
                available_seats - 1

            WHERE id = ?

        `, [
            Number(trip_id)
        ]);


        // ======================================
        // COMMIT
        // ======================================

        await connection.commit();


        // ======================================
        // GET CREATED BOOKING
        // ======================================

        const [
            createdBooking
        ] = await db.execute(`

            SELECT

                b.id,

                b.booking_reference,

                b.passenger_id,

                b.trip_id,

                b.seat_number,

                b.amount,

                b.booking_status,

                b.payment_status,

                b.booked_by,

                b.created_at,

                p.full_name AS passenger_name,

                p.email AS passenger_email,

                p.phone AS passenger_phone,

                t.departure_date,

                t.departure_time,

                t.arrival_time,

                t.fare,

                t.available_seats,

                t.status AS trip_status,

                r.origin,

                r.destination

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            INNER JOIN trips t
                ON b.trip_id = t.id

            INNER JOIN routes r
                ON t.route_id = r.id

            WHERE b.id = ?

            LIMIT 1

        `, [
            result.insertId
        ]);


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(201).json({

            success: true,

            message:
                "Booking created successfully. Please complete payment.",

            data:
                createdBooking[0]

        });


    } catch (error) {


        // ======================================
        // ROLLBACK
        // ======================================

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        console.error(
            "Create booking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create booking",

            error:
                error.message

        });


    } finally {

        connection.release();

    }

};





















// ==========================================
// UPDATE BOOKING
// ==========================================

const updateBooking = async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        const bookingId =
            Number(
                req.params.id
            );


        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid booking ID"

            });

        }


        const {
            passenger_id,
            passenger_name,
            passenger_phone,
            trip_id,
            seat_number,
            amount,
            booking_status,
            payment_status
        } = req.body;


        await connection.beginTransaction();


        const [
            currentBookings
        ] = await connection.execute(`

            SELECT
                id,
                passenger_id,
                trip_id,
                seat_number,
                amount,
                booking_status,
                payment_status

            FROM bookings

            WHERE id = ?

            FOR UPDATE

        `, [
            bookingId
        ]);


        if (
            !currentBookings.length
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const current =
            currentBookings[0];


        const newTripId =
            trip_id !== undefined &&
            trip_id !== null &&
            trip_id !== ""
                ? Number(trip_id)
                : Number(current.trip_id);


        const newSeatNumber =
            seat_number !== undefined &&
            seat_number !== null &&
            seat_number !== ""
                ? Number(seat_number)
                : Number(current.seat_number);


        const newBookingStatus =
            booking_status ||
            current.booking_status;


        const newPaymentStatus =
            payment_status ||
            current.payment_status;


        if (
            !newSeatNumber ||
            newSeatNumber < 1
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Invalid seat number"

            });

        }


        let newPassengerId =
            passenger_id !== undefined &&
            passenger_id !== null &&
            passenger_id !== ""
                ? Number(passenger_id)
                : Number(current.passenger_id);


        if (
            passenger_name &&
            passenger_phone
        ) {

            const [
                existingPassenger
            ] = await connection.execute(`

                SELECT id

                FROM passengers

                WHERE phone = ?

                LIMIT 1

            `, [
                passenger_phone
            ]);


            if (
                existingPassenger.length
            ) {

                newPassengerId =
                    existingPassenger[0].id;


                await connection.execute(`

                    UPDATE passengers

                    SET full_name = ?

                    WHERE id = ?

                `, [
                    passenger_name,
                    newPassengerId
                ]);

            } else {

                const [
                    newPassenger
                ] = await connection.execute(`

                    INSERT INTO passengers
                    (
                        full_name,
                        phone
                    )

                    VALUES
                    (?, ?)

                `, [
                    passenger_name,
                    passenger_phone
                ]);


                newPassengerId =
                    newPassenger.insertId;

            }

        }


        const [
            passengerCheck
        ] = await connection.execute(`

            SELECT id

            FROM passengers

            WHERE id = ?

            LIMIT 1

        `, [
            newPassengerId
        ]);


        if (
            !passengerCheck.length
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Passenger not found"

            });

        }


        const [trips] =
            await connection.execute(`

                SELECT
                    id,
                    fare,
                    available_seats,
                    status

                FROM trips

                WHERE id = ?

                LIMIT 1

            `, [
                newTripId
            ]);


        if (!trips.length) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Trip not found"

            });

        }


        const newTrip =
            trips[0];


        if (
            newTrip.status !== "scheduled" &&
            newTrip.status !== "boarding"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "The selected trip is not available"

            });

        }


        if (
            Number(newTripId) !==
            Number(current.trip_id)
        ) {

            if (
                Number(
                    newTrip.available_seats
                ) <= 0
            ) {

                await connection.rollback();

                return res.status(400).json({

                    success: false,

                    message:
                        "No seats are available on the new trip"

                });

            }

        }


        const [
            duplicateSeat
        ] = await connection.execute(`

            SELECT id

            FROM bookings

            WHERE trip_id = ?

            AND seat_number = ?

            AND booking_status IN (
                'pending',
                'confirmed'
            )

            AND id != ?

            LIMIT 1

        `, [
            newTripId,
            newSeatNumber,
            bookingId
        ]);


        if (
            duplicateSeat.length
        ) {

            await connection.rollback();

            return res.status(409).json({

                success: false,

                message:
                    "This seat is already booked"

            });

        }


        const finalAmount =
            amount !== undefined &&
            amount !== null &&
            amount !== ""
                ? Number(amount)
                : Number(newTrip.fare);


        if (
            !finalAmount ||
            finalAmount <= 0
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "Booking amount must be greater than zero"

            });

        }


        await connection.execute(`

            UPDATE bookings

            SET
                passenger_id = ?,
                trip_id = ?,
                seat_number = ?,
                amount = ?,
                booking_status = ?,
                payment_status = ?

            WHERE id = ?

        `, [
            newPassengerId,
            newTripId,
            newSeatNumber,
            finalAmount,
            newBookingStatus,
            newPaymentStatus,
            bookingId
        ]);


        if (
            Number(newTripId) !==
            Number(current.trip_id)
        ) {

            await connection.execute(`

                UPDATE trips

                SET available_seats =
                    available_seats + 1

                WHERE id = ?

            `, [
                current.trip_id
            ]);


            await connection.execute(`

                UPDATE trips

                SET available_seats =
                    available_seats - 1

                WHERE id = ?

            `, [
                newTripId
            ]);

        }


        await connection.commit();


        const [
            updatedBooking
        ] = await db.execute(`

            SELECT
                b.id,
                b.booking_reference,
                b.passenger_id,
                b.trip_id,
                b.seat_number,
                b.amount,
                b.booking_status,
                b.payment_status,
                b.booked_by,
                b.created_at,

                p.full_name AS passenger_name,
                p.phone AS passenger_phone,

                t.departure_date,
                t.departure_time,
                t.arrival_time,
                t.fare,
                t.available_seats,
                t.status AS trip_status,

                r.origin,
                r.destination

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            INNER JOIN trips t
                ON b.trip_id = t.id

            INNER JOIN routes r
                ON t.route_id = r.id

            WHERE b.id = ?

            LIMIT 1

        `, [
            bookingId
        ]);


        return res.status(200).json({

            success: true,

            message:
                "Booking updated successfully",

            data:
                updatedBooking[0]

        });

    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        console.error(
            "Update booking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update booking",

            error:
                error.message

        });

    } finally {

        connection.release();

    }

};



// ==========================================
// DELETE BOOKING
// ==========================================

const deleteBooking = async (req, res) => {

    const connection =
        await db.getConnection();

    try {

        const bookingId =
            Number(
                req.params.id
            );


        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid booking ID"

            });

        }


        await connection.beginTransaction();


        const [bookings] =
            await connection.execute(`

                SELECT
                    id,
                    trip_id,
                    seat_number,
                    booking_status

                FROM bookings

                WHERE id = ?

                FOR UPDATE

            `, [
                bookingId
            ]);


        if (
            !bookings.length
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const booking =
            bookings[0];


        await connection.execute(`

            DELETE FROM bookings

            WHERE id = ?

        `, [
            bookingId
        ]);


        if (
            booking.booking_status ===
                "pending" ||
            booking.booking_status ===
                "confirmed"
        ) {

            await connection.execute(`

                UPDATE trips

                SET available_seats =
                    available_seats + 1

                WHERE id = ?

            `, [
                booking.trip_id
            ]);

        }


        await connection.commit();


        return res.status(200).json({

            success: true,

            message:
                "Booking deleted successfully"

        });

    } catch (error) {

        try {

            await connection.rollback();

        } catch (rollbackError) {

            console.error(
                "Rollback error:",
                rollbackError
            );

        }


        console.error(
            "Delete booking error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete booking",

            error:
                error.message

        });

    } finally {

        connection.release();

    }

};

// ==========================================
// GET MY BOOKINGS
// PASSENGER ONLY
// ==========================================

const getMyBookings = async (req, res) => {

    try {

        const userId =
            Number(req.user.id);


        if (!userId) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid user information"
            });

        }


        // ==========================================
        // FIND PASSENGER CONNECTED TO LOGGED-IN USER
        // ==========================================

        const [passengers] =
            await db.execute(`
                SELECT
                    id,
                    user_id,
                    full_name,
                    email,
                    phone
                FROM passengers
                WHERE user_id = ?
                LIMIT 1
            `, [userId]);


        if (!passengers.length) {

            return res.status(404).json({
                success: false,
                message:
                    "Passenger profile not found"
            });

        }


        const passengerId =
            passengers[0].id;


        // ==========================================
        // GET ONLY THIS PASSENGER'S BOOKINGS
        // ==========================================

        const [bookings] =
            await db.execute(`
                SELECT
                    b.id,
                    b.booking_reference,
                    b.passenger_id,
                    b.trip_id,
                    b.seat_number,
                    b.amount,
                    b.booking_status,
                    b.payment_status,
                    b.booked_by,
                    b.created_at,

                    p.full_name AS passenger_name,
                    p.email AS passenger_email,
                    p.phone AS passenger_phone,

                    t.departure_date,
                    t.departure_time,
                    t.arrival_time,
                    t.fare,
                    t.available_seats,
                    t.status AS trip_status,

                    r.origin,
                    r.destination

                FROM bookings b

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                WHERE b.passenger_id = ?

                ORDER BY b.created_at DESC
            `, [passengerId]);


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Passenger bookings retrieved successfully",

            data: bookings

        });


    } catch (error) {

        console.error(
            "Get my bookings error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve passenger bookings",

            error:
                error.message

        });

    }

};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getAllBookings,
    getBookingById,
    getMyBookings,
    createBooking,
    updateBooking,
    deleteBooking
};