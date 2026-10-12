const express = require("express");

const {
    protect,
    adminOnly
} = require("../middleware/authmiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
    res.json({
        success: true,
        message: "You have access to the protected route",
        user: req.user
    });
});

router.get("/admin", protect, adminOnly, (req, res) => {
    res.json({
        success: true,
        message: "Welcome Admin. You have admin access.",
        user: req.user
    });
});

module.exports = router;