const express = require("express");

const {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus
} = require("../controllers/busController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get all buses
router.get(
    "/",
    protect,
    adminOnly,
    getAllBuses
);


// Get single bus
router.get(
    "/:id",
    protect,
    adminOnly,
    getBusById
);


// Create bus
router.post(
    "/",
    protect,
    adminOnly,
    createBus
);


// Update bus
router.put(
    "/:id",
    protect,
    adminOnly,
    updateBus
);


// Delete bus
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteBus
);


module.exports = router;