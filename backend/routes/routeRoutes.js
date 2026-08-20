const express = require("express");

const router =
    express.Router();
const {
    getAllRoutes,
    createRoute,
    updateRoute,
    deleteRoute
} = require(
    "../controllers/routeController"
);

const {
    protect,
    adminOnly
} = require(
    "../middleware/authMiddleware"
);


// ==========================================
// GET ALL ROUTES
// ==========================================

router.get(
    "/",
    protect,
    getAllRoutes
);


// ==========================================
// CREATE ROUTE
// ==========================================

router.post(
    "/",
    protect,
    adminOnly,
    createRoute
);

// ==========================================
// UPDATE ROUTE
// ==========================================

router.put(
    "/:id",
    protect,
    adminOnly,
    updateRoute
);

// ==========================================
// DELETE ROUTE
// ==========================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteRoute
);
module.exports = router;