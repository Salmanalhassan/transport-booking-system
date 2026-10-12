const express = require("express");

const {
    changePassword
} = require("../controllers/usercontroller");

const {
    protect
} = require("../middleware/authmiddleware");

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