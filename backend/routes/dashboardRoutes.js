 const express = require("express");

const {
    getDashboardStats,
    getRecentBookings,
    getUpcomingTrips
} = require("../controllers/dashboardController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Dashboard statistics
router.get(
    "/stats",
    protect,
    adminOnly,
    getDashboardStats
);


// Recent bookings
router.get(
    "/recent-bookings",
    protect,
    adminOnly,
    getRecentBookings
);


// Upcoming trips
router.get(
    "/upcoming-trips",
    protect,
    adminOnly,
    getUpcomingTrips
);


module.exports = router;