const express = require("express");

const {
    changePassword
} = require("../controllers/userController");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CHANGE PASSWORD
// PUT /api/users/:id/password
// ==========================================

router.put(
    "/:id/password",
    protect,
    changePassword
);


module.exports = router;