const express = require("express");

const {
    getAllBookings,
    getBookingById,
    getMyBookings,
    createBooking,
    updateBooking,
    deleteBooking
} = require("../controllers/bookingController");

const {
    protect,
    adminOnly,
    passengerOnly
} = require("../middleware/authmiddleware");

const router = express.Router();


// ==========================================
// PASSENGER - MY BOOKINGS
// ==========================================

router.get(
    "/my-bookings",
    protect,
    passengerOnly,
    getMyBookings
);


// ==========================================
// ADMIN - ALL BOOKINGS
// ==========================================

router.get(
    "/",
    protect,
    adminOnly,
    getAllBookings
);


// ==========================================
// ADMIN - SINGLE BOOKING
// ==========================================

router.get(
    "/:id",
    protect,
    adminOnly,
    getBookingById
);


// ==========================================
// ADMIN - CREATE
// ==========================================
router.post(
    "/",
    protect,
    createBooking
);

// ==========================================
// ADMIN - UPDATE
// ==========================================

router.put(
    "/:id",
    protect,
    adminOnly,
    updateBooking
);


// ==========================================
// ADMIN - DELETE
// ==========================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteBooking
);


module.exports = router;