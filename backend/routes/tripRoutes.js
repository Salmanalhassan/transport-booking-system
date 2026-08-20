const express = require("express");

const router = express.Router();


// ==========================================
// CONTROLLER
// ==========================================
const {
    getAllTrips,
    createTrip,
    updateTrip,
    deleteTrip
} = require("../controllers/tripController");


// ==========================================
// MIDDLEWARE
// ==========================================

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


// ==========================================
// GET ALL TRIPS
// ==========================================

router.get(
    "/",
    protect,
    getAllTrips
);


// ==========================================
// CREATE TRIP
// ==========================================

router.post(
    "/",
    protect,
    adminOnly,
    createTrip
);


// ==========================================
// UPDATE TRIP
// ==========================================

router.put(
    "/:id",
    protect,
    adminOnly,
    updateTrip
);

// ==========================================
// DELETE TRIP
// ==========================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteTrip
);
// ==========================================
// EXPORT
// ==========================================

module.exports = router;