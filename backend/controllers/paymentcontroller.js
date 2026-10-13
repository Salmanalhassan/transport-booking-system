const db = require("../config/db");

const PAYSTACK_SECRET_KEY =
    process.env.PAYSTACK_SECRET_KEY;

const PAYSTACK_BASE_URL =
    process.env.PAYSTACK_BASE_URL ||
    "https://api.paystack.co";


// ==========================================
// INITIALIZE PAYSTACK PAYMENT
// ==========================================

const initializePayment = async (req, res) => {

    try {

        const {
            booking_id
        } = req.body;


        // ==========================================
        // VALIDATE BOOKING ID
        // ==========================================

        const bookingId =
            Number(booking_id);

        if (!bookingId) {

            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });

        }


        // ==========================================
        // CHECK PAYSTACK KEY
        // ==========================================

        if (!PAYSTACK_SECRET_KEY) {

            return res.status(500).json({
                success: false,
                message: "Paystack secret key is not configured"
            });

        }


        // ==========================================
        // GET BOOKING
        // ==========================================
const [bookings] =
    await db.execute(`

        SELECT
            b.id,
            b.booking_reference,
            b.passenger_id,
            b.amount,
            b.payment_status,
            b.booking_status,

            p.full_name AS passenger_name,
            p.phone AS passenger_phone,
            p.email AS passenger_email

        FROM bookings b

        INNER JOIN passengers p
            ON b.passenger_id = p.id

        WHERE b.id = ?

        AND b.passenger_id = (
            SELECT id
            FROM passengers
            WHERE user_id = ?
            LIMIT 1
        )

        LIMIT 1

    `, [
        bookingId,
        Number(req.user.id)
    ]);

        if (!bookings.length) {

            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });

        }


        const booking =
            bookings[0];


        // ==========================================
        // CHECK PASSENGER EMAIL
        // ==========================================

        const customerEmail =
            String(
                booking.passenger_email || ""
            ).trim();


        if (!customerEmail) {

            return res.status(400).json({
                success: false,
                message:
                    "Passenger email is required for Paystack payment"
            });

        }


        // ==========================================
        // BASIC EMAIL VALIDATION
        // ==========================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(customerEmail)) {

            return res.status(400).json({
                success: false,
                message:
                    "Passenger email address is invalid"
            });

        }


        // ==========================================
        // CHECK BOOKING PAYMENT STATUS
        // ==========================================

        if (
            booking.payment_status === "paid"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "This booking has already been paid"
            });

        }


        // ==========================================
        // CHECK AMOUNT
        // ==========================================

        const amount =
            Number(booking.amount);


        if (!amount || amount <= 0) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid booking amount"
            });

        }


        // ==========================================
        // GENERATE PAYMENT REFERENCE
        // ==========================================

        const paymentReference =
            `TRP-PAY-${Date.now()}-${Math.floor(
                1000 + Math.random() * 9000
            )}`;


        // ==========================================
        // CREATE PAYMENT RECORD
        // ==========================================

        await db.execute(`

            INSERT INTO payments
            (
                booking_id,
                payment_reference,
                amount,
                payment_method,
                payment_status
            )

            VALUES
            (
                ?,
                ?,
                ?,
                'online',
                'pending'
            )

        `, [
            booking.id,
            paymentReference,
            amount
        ]);


        // ==========================================
        // INITIALIZE PAYSTACK
        // ==========================================

        const paystackResponse =
            await fetch(
                `${PAYSTACK_BASE_URL}/transaction/initialize`,
                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${PAYSTACK_SECRET_KEY}`,

                        "Content-Type":
                            "application/json"

                    },
              body: JSON.stringify({

                     email:
                       customerEmail,

                      amount:
                    Math.round(
                    amount * 100
                 ),

                   reference:
                   paymentReference,

                currency:
                    "NGN",

callback_url:
    "https://transport-booking-system-jz2z.onrender.com/frontend/passenger-bookings.html",


                 metadata: {

                            booking_id:
                                booking.id,

                            booking_reference:
                                booking.booking_reference,

                            passenger_id:
                                booking.passenger_id,

                            passenger_name:
                                booking.passenger_name,

                            passenger_phone:
                                booking.passenger_phone,

                            passenger_email:
                                customerEmail

                        }

                    })

                }
            );


        const paystackData =
            await paystackResponse.json();


        // ==========================================
        // PAYSTACK ERROR
        // ==========================================

        if (
            !paystackResponse.ok ||
            !paystackData.status
        ) {

            await db.execute(`

                UPDATE payments

                SET
                    payment_status = 'failed'

                WHERE payment_reference = ?

            `, [
                paymentReference
            ]);


            return res.status(400).json({

                success: false,

                message:
                    paystackData.message ||
                    "Unable to initialize Paystack payment"

            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Payment initialized successfully",

            data: {

                payment_reference:
                    paymentReference,

                authorization_url:
                    paystackData.data.authorization_url,

                access_code:
                    paystackData.data.access_code,

                amount:
                    amount,

                currency:
                    "NGN",

                customer_email:
                    customerEmail

            }

        });


    } catch (error) {

        console.error(
            "Initialize payment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to initialize payment",

            error:
                error.message

        });

    }

};


// ==========================================
// VERIFY PAYSTACK PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {

    try {

        const reference =
            String(
                req.params.reference ||
                req.query.reference ||
                ""
            ).trim();


        if (!reference) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment reference is required"

            });

        }


        // ==========================================
        // CHECK PAYSTACK KEY
        // ==========================================

        if (!PAYSTACK_SECRET_KEY) {

            return res.status(500).json({

                success: false,

                message:
                    "Paystack secret key is not configured"

            });

        }


        // ==========================================
        // VERIFY WITH PAYSTACK
        // ==========================================

        const response =
            await fetch(
                `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(
                    reference
                )}`,
                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${PAYSTACK_SECRET_KEY}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const paystackData =
            await response.json();


        // ==========================================
        // PAYSTACK VERIFICATION ERROR
        // ==========================================

        if (
            !response.ok ||
            !paystackData.status
        ) {

            return res.status(400).json({

                success: false,

                message:
                    paystackData.message ||
                    "Payment verification failed"

            });

        }


        const transaction =
            paystackData.data;


        // ==========================================
        // CHECK TRANSACTION STATUS
        // ==========================================

        if (
            transaction.status !== "success"
        ) {

            await db.execute(`

                UPDATE payments

                SET
                    payment_status = 'failed'

                WHERE payment_reference = ?

            `, [
                reference
            ]);


            return res.status(400).json({

                success: false,

                message:
                    "Payment was not successful"

            });

        }


        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const [payments] =
            await db.execute(`

                SELECT

                    id,
                    booking_id,
                    payment_reference,
                    amount,
                    payment_method,
                    payment_status,
                    paid_at

                FROM payments

                WHERE payment_reference = ?

                LIMIT 1

            `, [
                reference
            ]);


        if (!payments.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment record not found"

            });

        }


        const payment =
            payments[0];

//////// gyaran
// ==========================================
// CHECK USER ACCESS TO PAYMENT
// ==========================================

const userRole =
    String(req.user?.role || "")
        .toLowerCase();


// ==========================================
// ADMIN
// ADMIN CAN VERIFY ANY PAYMENT
// ==========================================

if (userRole === "admin") {

    // Admin is allowed to verify
    // payment for any booking.

} else {

    // ======================================
    // PASSENGER
    // ONLY HIS/HER OWN BOOKING
    // ======================================

    const [ownedBookings] =
        await db.execute(
            `
            SELECT
                b.id

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            WHERE b.id = ?

            AND p.user_id = ?

            LIMIT 1
            `,
            [
                payment.booking_id,
                Number(req.user.id)
            ]
        );


    if (!ownedBookings.length) {

        return res.status(403).json({

            success: false,

            message:
                "You are not authorized to verify this payment"

        });

    }

}
        // ==========================================
        // VERIFY AMOUNT
        // ==========================================

        const expectedAmount =
            Math.round(
                Number(payment.amount) * 100
            );


        const receivedAmount =
            Number(
                transaction.amount
            );


        if (
            expectedAmount !==
            receivedAmount
        ) {

            await db.execute(`

                UPDATE payments

                SET
                    payment_status = 'failed'

                WHERE id = ?

            `, [
                payment.id
            ]);


            return res.status(400).json({

                success: false,

                message:
                    "Payment amount does not match booking amount"

            });

        }


        // ==========================================
        // UPDATE PAYMENT
        // ==========================================

        await db.execute(`

            UPDATE payments

            SET

                payment_status = 'successful',

                payment_method = 'online',

                paid_at = CURRENT_TIMESTAMP

            WHERE id = ?

        `, [
            payment.id
        ]);


        // ==========================================
        // UPDATE BOOKING
        // ==========================================

        await db.execute(`

            UPDATE bookings

            SET

                payment_status = 'paid',

                booking_status =
                    CASE

                        WHEN booking_status = 'pending'

                        THEN 'confirmed'

                        ELSE booking_status

                    END

            WHERE id = ?

        `, [
            payment.booking_id
        ]);


        // ==========================================
        // GET COMPLETE PAYMENT DATA
        // ==========================================

        const [updatedPayments] =
            await db.execute(`

                SELECT

                    py.id,

                    py.booking_id,

                    py.payment_reference,

                    py.amount,

                    py.payment_method,

                    py.payment_status,

                    py.paid_at,

                    py.created_at,

                    b.booking_reference,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email

                FROM payments py

                INNER JOIN bookings b
                    ON py.booking_id = b.id

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                WHERE py.id = ?

                LIMIT 1

            `, [
                payment.id
            ]);


        const updatedPayment =
            updatedPayments[0];


        // ==========================================
        // SUCCESS
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            data: {

                id:
                    updatedPayment.id,

                payment_reference:
                    updatedPayment.payment_reference,

                booking_id:
                    updatedPayment.booking_id,

                booking_reference:
                    updatedPayment.booking_reference,

                passenger_name:
                    updatedPayment.passenger_name,

                passenger_phone:
                    updatedPayment.passenger_phone,

                amount:
                    updatedPayment.amount,

                payment_method:
                    updatedPayment.payment_method,

                payment_status:
                    updatedPayment.payment_status,

                paid_at:
                    updatedPayment.paid_at,

                currency:
                    "NGN",

                receipt_available:
                    true

            }

        });


    } catch (error) {

        console.error(
            "Verify payment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to verify payment",

            error:
                error.message

        });

    }
////////////////////////////////
};


// ==========================================
// GET ALL PAYMENTS
// ==========================================

const getAllPayments = async (req, res) => {

    try {

        const [payments] =
            await db.execute(`

                SELECT

                    py.id,

                    py.booking_id,

                    py.payment_reference,

                    py.amount,

                    py.payment_method,

                    py.payment_status,

                    py.paid_at,

                    py.created_at,

                    b.booking_reference,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email

                FROM payments py

                INNER JOIN bookings b
                    ON py.booking_id = b.id

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                ORDER BY
                    py.created_at DESC

            `);


        return res.status(200).json({

            success: true,

            message:
                "Payments retrieved successfully",

            data:
                payments

        });


    } catch (error) {

        console.error(
            "Get payments error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve payments",

            error:
                error.message

        });

    }

};


// ==========================================
// GET PAYMENT BY ID
// ==========================================

const getPaymentById = async (req, res) => {

    try {

        const paymentId =
            Number(req.params.id);


        if (!paymentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment ID"

            });

        }


        const [payments] =
            await db.execute(`

                SELECT

                    py.id,

                    py.booking_id,

                    py.payment_reference,

                    py.amount,

                    py.payment_method,

                    py.payment_status,

                    py.paid_at,

                    py.created_at,

                    b.booking_reference,

                    b.seat_number,

                    b.booking_status,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email,

                    t.departure_date,

                    t.departure_time,

                    t.arrival_time,

                    r.origin,

                    r.destination

                FROM payments py

                INNER JOIN bookings b
                    ON py.booking_id = b.id

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                WHERE py.id = ?

                LIMIT 1

            `, [
                paymentId
            ]);


        if (!payments.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Payment retrieved successfully",

            data:
                payments[0]

        });


    } catch (error) {

        console.error(
            "Get payment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve payment",

            error:
                error.message

        });

    }

};


// ==========================================
// GENERATE PAYMENT RECEIPT
// ==========================================

const getPaymentReceipt = async (req, res) => {

    try {

        const paymentId =
            Number(req.params.id);


        if (!paymentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment ID"

            });

        }


        const [receipts] =
            await db.execute(`

                SELECT

                    py.id,

                    py.payment_reference,

                    py.amount,

                    py.payment_method,

                    py.payment_status,

                    py.paid_at,

                    py.created_at,

                    b.id AS booking_id,

                    b.booking_reference,

                    b.seat_number,

                    b.booking_status,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email,

                    t.departure_date,

                    t.departure_time,

                    t.arrival_time,

                    r.origin,

                    r.destination

                FROM payments py

                INNER JOIN bookings b
                    ON py.booking_id = b.id

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                WHERE py.id = ?

                LIMIT 1

            `, [
                paymentId
            ]);


        if (!receipts.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Payment receipt not found"

            });

        }


        const receipt =
            receipts[0];


        if (
            receipt.payment_status !==
            "successful"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Receipt is only available for successful payments"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Payment receipt retrieved successfully",

            data:
                receipt

        });


    } catch (error) {

        console.error(
            "Receipt error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate payment receipt",

            error:
                error.message

        });

    }

};

// ==========================================
// GET MY PAYMENTS
// PASSENGER ONLY
// GET /api/payments/my-payments
// ==========================================

const getMyPayments = async (req, res) => {

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


        // ==========================================
        // FIND PASSENGER CONNECTED TO USER
        // ==========================================

        const [passengers] =
            await db.execute(`

                SELECT
                    id,
                    user_id,
                    full_name,
                    email,
                    phone

                FROM passengers

                WHERE user_id = ?

                LIMIT 1

            `, [
                userId
            ]);


        if (!passengers.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Passenger profile not found"

            });

        }


        const passengerId =
            passengers[0].id;


        // ==========================================
        // GET ONLY THIS PASSENGER'S PAYMENTS
        // ==========================================

        const [payments] =
            await db.execute(`

                SELECT

                    py.id,

                    py.booking_id,

                    py.payment_reference,

                    py.amount,

                    py.payment_method,

                    py.payment_status,

                    py.paid_at,

                    py.created_at,

                    b.booking_reference,

                    b.seat_number,

                    b.booking_status,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email,

                    t.departure_date,

                    t.departure_time,

                    t.arrival_time,

                    t.fare,

                    r.origin,

                    r.destination

                FROM payments py

                INNER JOIN bookings b
                    ON py.booking_id = b.id

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                WHERE b.passenger_id = ?

                ORDER BY py.created_at DESC

            `, [
                passengerId
            ]);


        return res.status(200).json({

            success: true,

            message:
                "Passenger payments retrieved successfully",

            data:
                payments

        });


    } catch (error) {

        console.error(
            "Get my payments error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve passenger payments",

            error:
                error.message

        });

    }

};

// ==========================================
// GET MY TICKET
// PASSENGER ONLY
// GET /api/payments/ticket/:bookingId
// ==========================================

const getMyTicket = async (req, res) => {

    try {

        const bookingId =
            Number(req.params.bookingId);


        // ==========================================
        // VALIDATE BOOKING ID
        // ==========================================

        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid booking ID"

            });

        }


        // ==========================================
        // GET TICKET
        // ONLY FOR LOGGED-IN PASSENGER
        // ==========================================

        const [tickets] =
            await db.execute(`

                SELECT

                    b.id AS booking_id,

                    b.booking_reference,

                    b.seat_number,

                    b.amount,

                    b.booking_status,

                    b.payment_status,

                    p.full_name AS passenger_name,

                    p.phone AS passenger_phone,

                    p.email AS passenger_email,

                    py.payment_reference,

                    py.payment_status AS transaction_status,

                    py.paid_at,

                    t.departure_date,

                    t.departure_time,

                    t.arrival_time,

                    t.fare,

                    r.origin,

                    r.destination

                FROM bookings b

                INNER JOIN passengers p
                    ON b.passenger_id = p.id

                INNER JOIN trips t
                    ON b.trip_id = t.id

                INNER JOIN routes r
                    ON t.route_id = r.id

                LEFT JOIN payments py
                    ON py.booking_id = b.id
                    AND py.payment_status = 'successful'

                WHERE b.id = ?

                AND b.passenger_id = (

                    SELECT id

                    FROM passengers

                    WHERE user_id = ?

                    LIMIT 1

                )

                LIMIT 1

            `, [

                bookingId,

                Number(req.user.id)

            ]);


        // ==========================================
        // BOOKING NOT FOUND
        // ==========================================

        if (!tickets.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const ticket =
            tickets[0];


        // ==========================================
        // PAYMENT CHECK
        // ==========================================

        if (
            String(
                ticket.payment_status || ""
            ).toLowerCase() !== "paid"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Ticket is only available after successful payment"

            });

        }


        // ==========================================
        // PAYMENT TRANSACTION CHECK
        // ==========================================

        if (
            String(
                ticket.transaction_status || ""
            ).toLowerCase() !== "successful"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Successful payment transaction not found"

            });

        }


        // ==========================================
        // RETURN TICKET
        // ==========================================

        return res.status(200).json({

            success: true,

            message:
                "Ticket retrieved successfully",

            data: {
               ticket_number:
                 ticket.booking_reference,

                booking_id:
                    ticket.booking_id,

                booking_reference:
                    ticket.booking_reference,

                passenger_name:
                    ticket.passenger_name,

                passenger_phone:
                    ticket.passenger_phone,

                passenger_email:
                    ticket.passenger_email,

                origin:
                    ticket.origin,

                destination:
                    ticket.destination,

                departure_date:
                    ticket.departure_date,

                departure_time:
                    ticket.departure_time,

                arrival_time:
                    ticket.arrival_time,

                seat_number:
                    ticket.seat_number,

                amount:
                    ticket.amount,

                fare:
                    ticket.fare,

                booking_status:
                    ticket.booking_status,

                payment_status:
                    "paid",

                payment_reference:
                    ticket.payment_reference,

                paid_at:
                    ticket.paid_at,

                currency:
                    "NGN"

            }

        });


    } catch (error) {

        console.error(
            "Get ticket error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to retrieve ticket",

            error:
                error.message

        });

    }

};

// ==========================================
// ADMIN INITIALIZE PAYMENT FOR ANY BOOKING
// ADMIN ONLY
// ==========================================

const adminInitializePayment = async (req, res) => {

    try {

        const bookingId =
            Number(req.body.booking_id);


        // ======================================
        // VALIDATE BOOKING ID
        // ======================================

        if (!bookingId) {

            return res.status(400).json({

                success: false,

                message:
                    "Booking ID is required"

            });

        }


        // ======================================
        // CHECK PAYSTACK KEY
        // ======================================

        if (!PAYSTACK_SECRET_KEY) {

            return res.status(500).json({

                success: false,

                message:
                    "Paystack secret key is not configured"

            });

        }


        // ======================================
        // GET ANY BOOKING
        // IMPORTANT:
        // NO passenger user_id restriction
        // ======================================
const userRole =
    String(req.user.role || "").toLowerCase();

let bookings;

if (userRole === "admin") {

    // ==========================================
    // ADMIN CAN PAY FOR ANY BOOKING
    // ==========================================

    [bookings] =
        await db.execute(`
            SELECT
                b.id,
                b.booking_reference,
                b.passenger_id,
                b.amount,
                b.payment_status,
                b.booking_status,

                p.full_name AS passenger_name,
                p.phone AS passenger_phone,
                p.email AS passenger_email

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            WHERE b.id = ?

            LIMIT 1

        `, [
            bookingId
        ]);

} else {

    // ==========================================
    // PASSENGER CAN PAY ONLY HIS OWN BOOKING
    // ==========================================

    [bookings] =
        await db.execute(`
            SELECT
                b.id,
                b.booking_reference,
                b.passenger_id,
                b.amount,
                b.payment_status,
                b.booking_status,

                p.full_name AS passenger_name,
                p.phone AS passenger_phone,
                p.email AS passenger_email

            FROM bookings b

            INNER JOIN passengers p
                ON b.passenger_id = p.id

            WHERE b.id = ?

            AND b.passenger_id = (
                SELECT id
                FROM passengers
                WHERE user_id = ?
                LIMIT 1
            )

            LIMIT 1

        `, [
            bookingId,
            Number(req.user.id)
        ]);
}

        // ======================================
        // BOOKING NOT FOUND
        // ======================================

        if (!bookings.length) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found"

            });

        }


        const booking =
            bookings[0];


        // ======================================
        // CHECK ALREADY PAID
        // ======================================

        if (
            String(
                booking.payment_status || ""
            ).toLowerCase() === "paid"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This booking has already been paid"

            });

        }


        // ======================================
        // CHECK AMOUNT
        // ======================================

        const amount =
            Number(booking.amount);


        if (!amount || amount <= 0) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid booking amount"

            });

        }


        // ======================================
        // PASSENGER EMAIL
        // ======================================

        const customerEmail =
            String(
                booking.passenger_email || ""
            ).trim();


        if (!customerEmail) {

            return res.status(400).json({

                success: false,

                message:
                    "Passenger email is required for Paystack payment"

            });

        }


        // ======================================
        // EMAIL VALIDATION
        // ======================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                customerEmail
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Passenger email address is invalid"

            });

        }


        // ======================================
        // GENERATE PAYMENT REFERENCE
        // ======================================

        const paymentReference =
            `TRP-ADMIN-PAY-${Date.now()}-${Math.floor(
                1000 + Math.random() * 9000
            )}`;


        // ======================================
        // CREATE PAYMENT RECORD
        // ======================================

        await db.execute(
            `
            INSERT INTO payments
            (
                booking_id,
                payment_reference,
                amount,
                payment_method,
                payment_status
            )

            VALUES
            (
                ?,
                ?,
                ?,
                'online',
                'pending'
            )
            `,
            [
                booking.id,
                paymentReference,
                amount
            ]
        );


        // ======================================
        // INITIALIZE PAYSTACK
        // ======================================

        const paystackResponse =
            await fetch(
                `${PAYSTACK_BASE_URL}/transaction/initialize`,
                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${PAYSTACK_SECRET_KEY}`,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email:
                            customerEmail,

                        amount:
                            Math.round(
                                amount * 100
                            ),

                        reference:
                            paymentReference,

                        currency:
                            "NGN",

callback_url:
    "https://transport-booking-system-jz2z.onrender.com/frontend/admin-payments.html",

                        metadata: {

                            booking_id:
                                booking.id,

                            booking_reference:
                                booking.booking_reference,

                            passenger_id:
                                booking.passenger_id,

                            passenger_name:
                                booking.passenger_name,

                            passenger_phone:
                                booking.passenger_phone,

                            passenger_email:
                                customerEmail,

                            payment_by:
                                "admin",

                            admin_user_id:
                                Number(req.user.id)

                        }

                    })

                }
            );


        const paystackData =
            await paystackResponse.json();


        // ======================================
        // PAYSTACK ERROR
        // ======================================

        if (
            !paystackResponse.ok ||
            !paystackData.status
        ) {

            await db.execute(
                `
                UPDATE payments

                SET
                    payment_status = 'failed'

                WHERE payment_reference = ?
                `,
                [paymentReference]
            );


            return res.status(400).json({

                success: false,

                message:
                    paystackData.message ||
                    "Unable to initialize admin payment"

            });

        }


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                "Admin payment initialized successfully",

            data: {

                payment_reference:
                    paymentReference,

                authorization_url:
                    paystackData.data.authorization_url,

                access_code:
                    paystackData.data.access_code,

                booking_id:
                    booking.id,

                booking_reference:
                    booking.booking_reference,

                passenger_name:
                    booking.passenger_name,

                amount:
                    amount,

                currency:
                    "NGN"

            }

        });


    } catch (error) {

        console.error(
            "Admin initialize payment error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to initialize admin payment",

            error:
                error.message

        });

    }

};
// ==========================================
// EXPORT
module.exports = {

    initializePayment,

    adminInitializePayment,

    verifyPayment,

    getMyPayments,

    getMyTicket,

    getAllPayments,

    getPaymentById,

    getPaymentReceipt

};