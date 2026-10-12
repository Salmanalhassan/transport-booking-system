const express = require("express");

const {
    login,
    registerPassenger
} = require("../controllers/authcontroller");

const router = express.Router();


// ==========================================
// TEST
// GET /api/auth/register-test
// ==========================================

router.get("/register-test", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Auth registration route is loaded correctly"
    });

});


// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", login);


// ==========================================
// PASSENGER REGISTER
// POST /api/auth/register
// ==========================================

router.post("/register", registerPassenger);


module.exports = router;