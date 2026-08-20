const db = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        // Total bookings
        const [bookingResult] = await db.execute(
            "SELECT COUNT(*) AS totalBookings FROM bookings"
        );

        // Today's trips
        const [todayTripResult] = await db.execute(
            `SELECT COUNT(*) AS todayTrips
             FROM trips
             WHERE departure_date = CURDATE()
             AND status != 'cancelled'`
        );

        // Available buses
        const [busResult] = await db.execute(
            `SELECT COUNT(*) AS availableBuses
             FROM buses
             WHERE status = 'available'`
        );

        // Total passengers
        const [passengerResult] = await db.execute(
            "SELECT COUNT(*) AS totalPassengers FROM passengers"
        );

        // Total drivers
        const [driverResult] = await db.execute(
            `SELECT COUNT(*) AS totalDrivers
             FROM drivers
             WHERE status != 'inactive'`
        );

        // Total routes
        const [routeResult] = await db.execute(
            `SELECT COUNT(*) AS totalRoutes
             FROM routes
             WHERE status = 'active'`
        );

        // Total successful revenue
        const [revenueResult] = await db.execute(
            `SELECT COALESCE(SUM(amount), 0) AS totalRevenue
             FROM payments
             WHERE payment_status = 'successful'`
        );

        // Pending bookings
        const [pendingBookingResult] = await db.execute(
            `SELECT COUNT(*) AS pendingBookings
             FROM bookings
             WHERE booking_status = 'pending'`
        );

        res.json({
            success: true,
            data: {
                totalBookings: bookingResult[0].totalBookings,
                todayTrips: todayTripResult[0].todayTrips,
                availableBuses: busResult[0].availableBuses,
                totalPassengers: passengerResult[0].totalPassengers,
                totalDrivers: driverResult[0].totalDrivers,
                totalRoutes: routeResult[0].totalRoutes,
                totalRevenue: Number(revenueResult[0].totalRevenue),
                pendingBookings: pendingBookingResult[0].pendingBookings
            }
        });

    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics"
        });
    }
};


// Recent bookings
const getRecentBookings = async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT
                b.id,
                b.booking_reference,
                b.seat_number,
                b.amount,
                b.booking_status,
                b.payment_status,
                b.created_at,

                p.full_name AS passenger_name,
                p.phone AS passenger_phone,

                t.departure_date,
                t.departure_time,

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

            LIMIT 10
        `);

        res.json({
            success: true,
            data: bookings
        });

    } catch (error) {
        console.error("Recent bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load recent bookings"
        });
    }
};


// Upcoming trips
const getUpcomingTrips = async (req, res) => {
    try {
        const [trips] = await db.execute(`
            SELECT
                t.id,
                t.departure_date,
                t.departure_time,
                t.arrival_time,
                t.fare,
                t.available_seats,
                t.status,

                r.origin,
                r.destination,

                b.bus_number,
                b.plate_number,

                d.full_name AS driver_name

            FROM trips t

            INNER JOIN routes r
                ON t.route_id = r.id

            INNER JOIN buses b
                ON t.bus_id = b.id

            INNER JOIN drivers d
                ON t.driver_id = d.id

            WHERE
                t.departure_date >= CURDATE()
                AND t.status IN ('scheduled', 'boarding')

            ORDER BY
                t.departure_date ASC,
                t.departure_time ASC

            LIMIT 10
        `);

        res.json({
            success: true,
            data: trips
        });

    } catch (error) {
        console.error("Upcoming trips error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load upcoming trips"
        });
    }
};


module.exports = {
    getDashboardStats,
    getRecentBookings,
    getUpcomingTrips
};