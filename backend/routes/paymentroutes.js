const express = require("express");
const {
    initializePayment,
    adminInitializePayment,
    verifyPayment,
    getMyPayments,
    getMyTicket,
    getAllPayments,
    getPaymentById,
    getPaymentReceipt
} = require("../controllers/paymentcontroller");
const {
    protect,
    adminOnly,
    passengerOnly,
    adminOrPassenger
} = require("../middleware/authmiddleware");

const router = express.Router();


// ==========================================
// PASSENGER — INITIALIZE PAYMENT
// POST /api/payments/initialize
// ==========================================
router.post(
    "/initialize",
    protect,
    adminOrPassenger,
    initializePayment
);
// ==========================================
// ADMIN — INITIALIZE PAYMENT FOR ANY BOOKING
// POST /api/payments/admin/initialize
// ==========================================

router.post(
    "/admin/initialize",
    protect,
    adminOnly,
    adminInitializePayment
);
// ==========================================
// PASSENGER — VERIFY PAYMENT
// GET /api/payments/verify/:reference
// ========================================
router.get(
    "/verify/:reference",
    protect,
    adminOrPassenger,
    verifyPayment
);
// PASSENGER — MY TICKET
// GET /api/payments/ticket/:bookingId
// ==========================================

router.get(
    "/ticket/:bookingId",
    protect,
    passengerOnly,
    getMyTicket
);
// ==========================================
// PASSENGER — MY PAYMENTS
// GET /api/payments/my-payments
// ==========================================

router.get(
    "/my-payments",
    protect,
    passengerOnly,
    getMyPayments
);


// ==========================================
// ADMIN — ALL PAYMENTS
// GET /api/payments
// ==========================================

router.get(
    "/",
    protect,
    adminOnly,
    getAllPayments
);


// ==========================================
// ADMIN — SINGLE PAYMENT
// GET /api/payments/:id
// ==========================================

router.get(
    "/:id",
    protect,
    adminOnly,
    getPaymentById
);


// ==========================================
// ADMIN — RECEIPT
// GET /api/payments/:id/receipt
// ==========================================

router.get(
    "/:id/receipt",
    protect,
    adminOnly,
    getPaymentReceipt
);


module.exports = router;