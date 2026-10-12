const express = require("express");

const {
    getAllPassengers,
    createPassenger,
    updatePassenger,
    deletePassenger
} = require("../controllers/passengerController");

const {
    protect,
    adminOnly,
    adminOrStaff
} = require("../middleware/authmiddleware");

const db = require("../config/db");

const router = express.Router();


// ==========================================
// GET ALL PASSENGERS
// ADMIN / STAFF ONLY
// ==========================================

router.get(
    "/",
    protect,
    adminOrStaff,
    getAllPassengers
);


// ==========================================
// GET MY PASSENGER PROFILE
// PASSENGER ONLY
// GET /api/passengers/me
// ==========================================

router.get(
    "/me",
    protect,
    async (req, res) => {

        try {

            const userId =
                Number(req.user.id);


            if (!userId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user information"
                });

            }


            const [passengers] =
                await db.execute(
                    `
                    SELECT
                        id,
                        user_id,
                        full_name,
                        email,
                        phone,
                        address,
                        emergency_contact,
                        emergency_phone,
                        created_at,
                        updated_at
                    FROM passengers
                    WHERE user_id = ?
                    LIMIT 1
                    `,
                    [userId]
                );


            if (passengers.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Passenger profile not found"
                });

            }


            return res.json({

                success: true,

                data:
                    passengers[0]

            });

        } catch (error) {

            console.error(
                "Get passenger profile error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Server error while loading passenger profile"

            });

        }

    }
);


// ==========================================
// CREATE PASSENGER
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    protect,
    adminOnly,
    createPassenger
);


// ==========================================
// UPDATE PASSENGER
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    protect,
    adminOnly,
    updatePassenger
);


// ==========================================
// DELETE PASSENGER
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deletePassenger
);


module.exports = router;