const express = require("express");

const router = express.Router();
const {
    getAllDrivers,
    createDriver,
    updateDriver,
    deleteDriver
} = require("../controllers/drivercontroller");
// ==========================================
// GET ALL DRIVERS
// GET /api/drivers
// ==========================================

router.get(
    "/",
    getAllDrivers
);


// ==========================================
// CREATE DRIVER
// POST /api/drivers
// ==========================================

router.post(
    "/",
    createDriver
);

// ==========================================
// UPDATE DRIVER
// PUT /api/drivers/:id
// ==========================================

router.put(
    "/:id",
    updateDriver
);

// ==========================================
// DELETE DRIVER
// DELETE /api/drivers/:id
// ==========================================

router.delete(
    "/:id",
    deleteDriver
);
// ==========================================
// EXPORT
// ==========================================

module.exports = router;