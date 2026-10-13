
const API_BASE_URL = "/api";

// ==========================================
// ELEMENTS
// ==========================================

const bookingSelect = document.getElementById("bookingSelect");
const bookingInformation = document.getElementById("bookingInformation");
const emptyBookingMessage = document.getElementById("emptyBookingMessage");
const successCard = document.getElementById("successCard");

const payNowButton = document.getElementById("payNowButton");
const viewReceiptButton = document.getElementById("viewReceiptButton");
const newPaymentButton = document.getElementById("newPaymentButton");

// ==========================================
// BOOKING INFORMATION
// ==========================================

const bookingReference = document.getElementById("bookingReference");
const passengerName = document.getElementById("passengerName");
const passengerPhone = document.getElementById("passengerPhone");
const route = document.getElementById("route");
const departure = document.getElementById("departure");
const seatNumber = document.getElementById("seatNumber");
const paymentAmount = document.getElementById("paymentAmount");
const paymentStatus = document.getElementById("paymentStatus");

// ==========================================
// SUCCESS INFORMATION
// ==========================================

const successPaymentReference =
    document.getElementById("successPaymentReference");

const successBookingReference =
    document.getElementById("successBookingReference");

const successAmount =
    document.getElementById("successAmount");

// ==========================================
// VARIABLES
// ==========================================

let bookings = [];
let selectedBooking = null;

let currentPaymentReference = null;
let currentPaymentId = null;
let currentPayment = null;

// ==========================================
// TOKEN
// ==========================================

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        ""
    );
}

// ==========================================
// HEADERS
// ==========================================

function getHeaders() {
    const headers = {
        "Content-Type": "application/json"
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// ==========================================
// MONEY
// ==========================================

function formatMoney(amount) {
    const value = Number(amount || 0);

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(value);
}

// ==========================================
// DATE
// ==========================================

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return date.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// ==========================================
// TIME
// ==========================================

function formatTime(timeValue) {
    if (!timeValue) {
        return "—";
    }

    return String(timeValue).substring(0, 5);
}

// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {
    if (!bookingSelect) {
        console.error("bookingSelect element not found.");
        return;
    }

    try {
        bookingSelect.disabled = true;

        bookingSelect.innerHTML = `
            <option value="">Loading bookings...</option>
        `;

        const response = await fetch(
            `${API_BASE_URL}/bookings`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Unable to load bookings."
            );
        }

        bookings = Array.isArray(result.data)
            ? result.data
            : [];

        bookingSelect.innerHTML = `
            <option value="">Select a booking</option>
        `;

        if (!bookings.length) {
            bookingSelect.innerHTML = `
                <option value="">No bookings available</option>
            `;

            return;
        }

        bookings.forEach((booking) => {
            const option = document.createElement("option");

            option.value = booking.id;

            const reference =
                booking.booking_reference ||
                `Booking #${booking.id}`;

            const passenger =
                booking.passenger_name ||
                "Unknown passenger";

            const amount =
                formatMoney(booking.amount);

            option.textContent =
                `${reference} — ${passenger} — ${amount}`;

            bookingSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Load bookings error:", error);

        bookingSelect.innerHTML = `
            <option value="">Failed to load bookings</option>
        `;

        showMessage(
            error.message || "Failed to load bookings.",
            "error"
        );

    } finally {
        bookingSelect.disabled = false;
    }
}

// ==========================================
// SELECT BOOKING
// ==========================================

if (bookingSelect) {
    bookingSelect.addEventListener(
        "change",
        function () {

            const bookingId =
                Number(this.value);

            if (!bookingId) {

                selectedBooking = null;

                hideBookingInformation();

                return;
            }

            selectedBooking =
                bookings.find(
                    (booking) =>
                        Number(booking.id) === bookingId
                );

            if (!selectedBooking) {

                hideBookingInformation();

                return;
            }

            displayBooking(selectedBooking);
        }
    );
}

// ==========================================
// DISPLAY BOOKING
// ==========================================

function displayBooking(booking) {

    if (bookingInformation) {
        bookingInformation.style.display = "block";
    }

    if (emptyBookingMessage) {
        emptyBookingMessage.style.display = "none";
    }

    if (successCard) {
        successCard.style.display = "none";
    }

    if (bookingReference) {
        bookingReference.textContent =
            booking.booking_reference || "—";
    }

    if (passengerName) {
        passengerName.textContent =
            booking.passenger_name || "—";
    }

    if (passengerPhone) {
        passengerPhone.textContent =
            booking.passenger_phone || "—";
    }

    if (route) {
        route.textContent =
            `${booking.origin || "—"} → ${
                booking.destination || "—"
            }`;
    }

    if (departure) {
        departure.textContent =
            `${formatDate(
                booking.departure_date
            )} ${formatTime(
                booking.departure_time
            )}`;
    }

    if (seatNumber) {
        seatNumber.textContent =
            booking.seat_number || "—";
    }

    if (paymentAmount) {
        paymentAmount.textContent =
            formatMoney(booking.amount);
    }

    updatePaymentStatus(
        booking.payment_status
    );

    const status =
        String(
            booking.payment_status || ""
        ).toLowerCase();

    if (
        status === "paid" ||
        status === "successful"
    ) {

        if (payNowButton) {
            payNowButton.disabled = true;
            payNowButton.textContent =
                "Already Paid";
        }

    } else {

        if (payNowButton) {
            payNowButton.disabled = false;
            payNowButton.textContent =
                "Pay with Paystack";
        }
    }
}

// ==========================================
// HIDE BOOKING
// ==========================================

function hideBookingInformation() {

    if (bookingInformation) {
        bookingInformation.style.display = "none";
    }

    if (emptyBookingMessage) {
        emptyBookingMessage.style.display = "block";
    }

    if (successCard) {
        successCard.style.display = "none";
    }
}

// ==========================================
// PAYMENT STATUS
// ==========================================

function updatePaymentStatus(status) {

    if (!paymentStatus) {
        return;
    }

    const normalized =
        String(
            status || "pending"
        ).toLowerCase();

    paymentStatus.textContent =
        normalized;

    paymentStatus.className =
        "status";

    if (
        normalized === "paid" ||
        normalized === "successful"
    ) {

        paymentStatus.classList.add(
            "successful"
        );

    } else if (
        normalized === "failed"
    ) {

        paymentStatus.classList.add(
            "failed"
        );

    } else {

        paymentStatus.classList.add(
            "pending"
        );
    }
}

// ==========================================
// PAY NOW
// ==========================================

if (payNowButton) {

    payNowButton.addEventListener(
        "click",
        async function () {

            if (!selectedBooking) {

                showMessage(
                    "Please select a booking first.",
                    "error"
                );

                return;
            }

            const bookingStatus =
                String(
                    selectedBooking.payment_status || ""
                ).toLowerCase();

            if (
                bookingStatus === "paid" ||
                bookingStatus === "successful"
            ) {

                showMessage(
                    "This booking has already been paid.",
                    "error"
                );

                return;
            }

            try {

                payNowButton.disabled = true;

                payNowButton.textContent =
                    "Initializing Paystack...";

                const response =
                    await fetch(
                        `${API_BASE_URL}/payments/initialize`,
                        {
                            method: "POST",

                            headers: getHeaders(),

                            body: JSON.stringify({
                                booking_id:
                                    selectedBooking.id
                            })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Payment initialization failed."
                    );
                }

                const paymentData =
                    result.data || {};

                currentPaymentReference =
                    paymentData.payment_reference ||
                    paymentData.reference ||
                    paymentData.data?.payment_reference ||
                    paymentData.data?.reference ||
                    null;

                if (currentPaymentReference) {

                    localStorage.setItem(
                        "currentPaymentReference",
                        currentPaymentReference
                    );
                }

                const authorizationUrl =
                    paymentData.authorization_url ||
                    paymentData.authorizationUrl ||
                    paymentData.data?.authorization_url;

                if (!authorizationUrl) {

                    throw new Error(
                        "Paystack authorization URL was not returned."
                    );
                }

                showMessage(
                    "Redirecting to Paystack...",
                    "success"
                );

                window.location.href =
                    authorizationUrl;

            } catch (error) {

                console.error(
                    "Payment initialization error:",
                    error
                );

                payNowButton.disabled = false;

                payNowButton.textContent =
                    "Pay with Paystack";

                showMessage(
                    error.message ||
                    "Unable to initialize payment.",
                    "error"
                );
            }
        }
    );
}

// ==========================================
// PAYSTACK CALLBACK
// ==========================================

async function checkPaymentCallback() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const reference =
        params.get("reference") ||
        params.get("trxref");

    if (!reference) {
        return;
    }

    currentPaymentReference =
        reference;

    localStorage.setItem(
        "currentPaymentReference",
        reference
    );

    await verifyPayment(reference);
}

// ==========================================
// VERIFY PAYMENT
// ==========================================

async function verifyPayment(reference) {

    try {

        showMessage(
            "Verifying payment...",
            "success"
        );

        const response =
            await fetch(
                `${API_BASE_URL}/payments/verify/${encodeURIComponent(
                    reference
                )}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );
        }

        const payment =
            result.data || {};

        currentPayment =
            payment;

        currentPaymentReference =
            payment.payment_reference ||
            payment.reference ||
            reference;

        currentPaymentId =
            payment.id ||
            payment.payment_id ||
            payment.payment?.id ||
            null;

        localStorage.setItem(
            "currentPaymentReference",
            currentPaymentReference
        );

        if (currentPaymentId) {

            localStorage.setItem(
                "currentPaymentId",
                String(currentPaymentId)
            );
        }

        showPaymentSuccess(payment);

        await loadBookings();

        /*
         * Try to restore the selected booking
         * after bookings are reloaded.
         */

        const returnedBookingId =
            payment.booking_id ||
            payment.booking?.id;

        if (returnedBookingId) {

            selectedBooking =
                bookings.find(
                    (booking) =>
                        Number(booking.id) ===
                        Number(returnedBookingId)
                ) || selectedBooking;
        }

        /*
         * Remove Paystack callback parameters
         * from browser URL.
         */

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        showMessage(
            error.message ||
            "Payment verification failed.",
            "error"
        );
    }
}

// ==========================================
// SHOW PAYMENT SUCCESS
// ==========================================

function showPaymentSuccess(payment) {

    if (bookingInformation) {
        bookingInformation.style.display =
            "none";
    }

    if (emptyBookingMessage) {
        emptyBookingMessage.style.display =
            "none";
    }

    if (successCard) {
        successCard.style.display =
            "block";
    }

    const paymentReference =
        payment.payment_reference ||
        payment.reference ||
        currentPaymentReference ||
        "—";

    const bookingRef =
        payment.booking_reference ||
        payment.booking?.booking_reference ||
        (
            selectedBooking
                ? selectedBooking.booking_reference
                : "—"
        );

    const amount =
        payment.amount ??
        payment.amount_paid ??
        payment.data?.amount ??
        (
            selectedBooking
                ? selectedBooking.amount
                : 0
        );

    if (successPaymentReference) {
        successPaymentReference.textContent =
            paymentReference;
    }

    if (successBookingReference) {
        successBookingReference.textContent =
            bookingRef;
    }

    if (successAmount) {
        successAmount.textContent =
            formatMoney(amount);
    }

    /*
     * Keep complete receipt information.
     */

    currentPayment = {

        ...payment,

        payment_reference:
            paymentReference,

        booking_reference:
            bookingRef,

        amount:
            amount,

        passenger_name:
            payment.passenger_name ||
            payment.passenger?.full_name ||
            (
                selectedBooking
                    ? selectedBooking.passenger_name
                    : "—"
            ),

        passenger_phone:
            payment.passenger_phone ||
            payment.passenger?.phone ||
            (
                selectedBooking
                    ? selectedBooking.passenger_phone
                    : "—"
            ),

        origin:
            payment.origin ||
            payment.trip?.origin ||
            (
                selectedBooking
                    ? selectedBooking.origin
                    : "—"
            ),

        destination:
            payment.destination ||
            payment.trip?.destination ||
            (
                selectedBooking
                    ? selectedBooking.destination
                    : "—"
            ),

        departure_date:
            payment.departure_date ||
            payment.trip?.departure_date ||
            (
                selectedBooking
                    ? selectedBooking.departure_date
                    : null
            ),

        departure_time:
            payment.departure_time ||
            payment.trip?.departure_time ||
            (
                selectedBooking
                    ? selectedBooking.departure_time
                    : null
            ),

        seat_number:
            payment.seat_number ||
            (
                selectedBooking
                    ? selectedBooking.seat_number
                    : "—"
            ),

        payment_method:
            payment.payment_method ||
            "Paystack",

        paid_at:
            payment.paid_at ||
            payment.paidAt ||
            payment.created_at ||
            new Date().toISOString()
    };
}

// ==========================================
// GET OFFICIAL RECEIPT
// ==========================================

async function getOfficialReceipt(paymentId) {

    if (!paymentId) {
        return null;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments/${paymentId}/receipt`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const result =
            await response.json();

        if (
            response.ok &&
            result.success &&
            result.data
        ) {

            return result.data;
        }

        console.warn(
            "Official receipt endpoint did not return receipt:",
            result.message
        );

        return null;

    } catch (error) {

        console.warn(
            "Official receipt endpoint unavailable:",
            error
        );

        return null;
    }
}

// ==========================================
// FIND PAYMENT BY REFERENCE
// ==========================================

async function findPaymentByReference(reference) {

    if (!reference) {
        return null;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success ||
            !Array.isArray(result.data)
        ) {

            return null;
        }

        const found =
            result.data.find(
                (item) =>
                    String(
                        item.payment_reference ||
                        item.reference ||
                        ""
                    ) === String(reference)
            );

        return found || null;

    } catch (error) {

        console.warn(
            "Unable to search payment records:",
            error
        );

        return null;
    }
}

// ==========================================
// VIEW RECEIPT
// ==========================================

if (viewReceiptButton) {

    viewReceiptButton.addEventListener(
        "click",
        async function () {

            /*
             * IMPORTANT:
             * Open the receipt window immediately.
             * This prevents popup blockers from blocking
             * the receipt after an await/fetch.
             */

            const receiptWindow =
                window.open(
                    "",
                    "_blank",
                    "width=750,height=900"
                );

            if (!receiptWindow) {

                showMessage(
                    "Please allow popups in your browser to view the receipt.",
                    "error"
                );

                return;
            }

            /*
             * Show loading inside the new window.
             */

            receiptWindow.document.write(`
                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <title>
                        TransitPro - Preparing Receipt
                    </title>

                    <style>

                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: #f5f7fb;
                            color: #374151;
                        }

                        .loading {
                            background: white;
                            padding: 35px;
                            border-radius: 12px;
                            text-align: center;
                            box-shadow:
                                0 10px 30px
                                rgba(0,0,0,0.08);
                        }

                    </style>

                </head>

                <body>

                    <div class="loading">

                        <h2>
                            TransitPro
                        </h2>

                        <p>
                            Preparing your payment receipt...
                        </p>

                    </div>

                </body>

                </html>
            `);

            receiptWindow.document.close();

            try {

                viewReceiptButton.disabled =
                    true;

                viewReceiptButton.textContent =
                    "Preparing Receipt...";

                let receipt = null;

                /*
                 * ======================================
                 * FIRST SOURCE:
                 * Current verified payment
                 * ======================================
                 */

                if (currentPayment) {

                    receipt = {
                        ...currentPayment
                    };
                }

                /*
                 * ======================================
                 * SECOND SOURCE:
                 * Payment ID from memory/localStorage
                 * ======================================
                 */

                let paymentId =
                    currentPaymentId ||
                    localStorage.getItem(
                        "currentPaymentId"
                    );

                /*
                 * ======================================
                 * THIRD SOURCE:
                 * Get payment ID using reference
                 * ======================================
                 */

                if (!paymentId) {

                    const reference =
                        currentPaymentReference ||
                        localStorage.getItem(
                            "currentPaymentReference"
                        );

                    if (reference) {

                        const foundPayment =
                            await findPaymentByReference(
                                reference
                            );

                        if (foundPayment) {

                            paymentId =
                                foundPayment.id ||
                                foundPayment.payment_id ||
                                null;

                            currentPaymentId =
                                paymentId;

                            receipt = {
                                ...receipt,
                                ...foundPayment
                            };

                            if (paymentId) {

                                localStorage.setItem(
                                    "currentPaymentId",
                                    String(paymentId)
                                );
                            }
                        }
                    }
                }

                /*
                 * ======================================
                 * FOURTH SOURCE:
                 * Official backend receipt
                 * ======================================
                 */

                if (paymentId) {

                    const officialReceipt =
                        await getOfficialReceipt(
                            paymentId
                        );

                    if (officialReceipt) {

                        receipt = {
                            ...receipt,
                            ...officialReceipt
                        };
                    }
                }

                /*
                 * ======================================
                 * FINAL FALLBACK
                 * ======================================
                 *
                 * Even if the backend does not have
                 * /receipt endpoint, the receipt will
                 * still be generated from verified
                 * payment + booking information.
                 */

                if (!receipt) {

                    if (!selectedBooking) {

                        throw new Error(
                            "Payment information was not found."
                        );
                    }

                    receipt = {

                        payment_reference:
                            currentPaymentReference ||
                            "—",

                        booking_reference:
                            selectedBooking.booking_reference ||
                            "—",

                        passenger_name:
                            selectedBooking.passenger_name ||
                            "—",

                        passenger_phone:
                            selectedBooking.passenger_phone ||
                            "—",

                        origin:
                            selectedBooking.origin ||
                            "—",

                        destination:
                            selectedBooking.destination ||
                            "—",

                        departure_date:
                            selectedBooking.departure_date ||
                            null,

                        departure_time:
                            selectedBooking.departure_time ||
                            null,

                        seat_number:
                            selectedBooking.seat_number ||
                            "—",

                        amount:
                            selectedBooking.amount ||
                            0,

                        payment_method:
                            "Paystack",

                        paid_at:
                            new Date().toISOString()
                    };
                }

                /*
                 * ======================================
                 * DISPLAY RECEIPT
                 * ======================================
                 */

                displayReceipt(
                    receipt,
                    receiptWindow
                );

            } catch (error) {

                console.error(
                    "Receipt error:",
                    error
                );

                try {

                    receiptWindow.close();

                } catch (closeError) {

                    console.warn(
                        "Could not close receipt window.",
                        closeError
                    );
                }

                showMessage(
                    error.message ||
                    "Unable to generate receipt.",
                    "error"
                );

            } finally {

                viewReceiptButton.disabled =
                    false;

                viewReceiptButton.textContent =
                    "View Receipt";
            }
        }
    );
}

// ==========================================
// DISPLAY RECEIPT
// ==========================================

function displayReceipt(
    receipt,
    receiptWindow = null
) {

    /*
     * If no window was supplied,
     * open one.
     */

    if (!receiptWindow) {

        receiptWindow =
            window.open(
                "",
                "_blank",
                "width=750,height=900"
            );

        if (!receiptWindow) {

            showMessage(
                "Please allow popups to view the receipt.",
                "error"
            );

            return;
        }
    }

    const paymentRef =
        receipt.payment_reference ||
        receipt.reference ||
        currentPaymentReference ||
        "—";

    const bookingRef =
        receipt.booking_reference ||
        receipt.booking?.booking_reference ||
        "—";

    const passenger =
        receipt.passenger_name ||
        receipt.passenger?.full_name ||
        "—";

    const phone =
        receipt.passenger_phone ||
        receipt.passenger?.phone ||
        "—";

    const origin =
        receipt.origin ||
        receipt.trip?.origin ||
        "—";

    const destination =
        receipt.destination ||
        receipt.trip?.destination ||
        "—";

    const departureDate =
        receipt.departure_date ||
        receipt.trip?.departure_date ||
        null;

    const departureTime =
        receipt.departure_time ||
        receipt.trip?.departure_time ||
        null;

    const seat =
        receipt.seat_number ||
        "—";

    const method =
        receipt.payment_method ||
        receipt.channel ||
        "Paystack";

    const amount =
        receipt.amount ??
        receipt.amount_paid ??
        0;

    const paidAt =
        receipt.paid_at ||
        receipt.paidAt ||
        receipt.created_at ||
        null;

    const paidAtText =
        paidAt
            ? new Date(
                paidAt
            ).toLocaleString("en-NG")
            : new Date().toLocaleString("en-NG");

    const departureText =
        departureDate
            ? `${formatDate(
                departureDate
            )} ${
                departureTime
                    ? formatTime(departureTime)
                    : ""
            }`
            : "—";

    receiptWindow.document.open();

    receiptWindow.document.write(`
        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                TransitPro Payment Receipt
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {

                    margin: 0;

                    padding: 30px;

                    background: #f5f7fb;

                    font-family:
                        Arial,
                        Helvetica,
                        sans-serif;

                    color: #1f2937;
                }

                .receipt {

                    width: 100%;

                    max-width: 700px;

                    margin: 0 auto;

                    background: #ffffff;

                    border-radius: 14px;

                    padding: 35px;

                    box-shadow:
                        0 10px 30px
                        rgba(
                            0,
                            0,
                            0,
                            0.08
                        );
                }

                .header {

                    text-align: center;

                    padding-bottom: 22px;

                    border-bottom:
                        2px solid #4338ca;

                    margin-bottom: 25px;
                }

                .logo {

                    font-size: 30px;

                    font-weight: 800;

                    color: #4338ca;

                    margin-bottom: 6px;
                }

                .subtitle {

                    color: #6b7280;

                    font-size: 14px;
                }

                .success {

                    text-align: center;

                    margin-bottom: 25px;
                }

                .success-icon {

                    width: 65px;

                    height: 65px;

                    margin:
                        0 auto 12px;

                    border-radius: 50%;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    background: #dcfce7;

                    color: #15803d;

                    font-size: 34px;

                    font-weight: 800;
                }

                .success h2 {

                    margin:
                        0 0 6px;

                    color: #166534;

                    font-size: 24px;
                }

                .success p {

                    margin: 0;

                    color: #6b7280;

                    font-size: 14px;
                }

                .receipt-info {

                    border:
                        1px solid #e5e7eb;

                    border-radius: 10px;

                    overflow: hidden;
                }

                .row {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    gap: 25px;

                    padding:
                        14px 16px;

                    border-bottom:
                        1px solid #e5e7eb;
                }

                .row:last-child {

                    border-bottom: none;
                }

                .label {

                    color: #6b7280;

                    font-size: 13px;
                }

                .value {

                    color: #111827;

                    font-size: 13px;

                    font-weight: 700;

                    text-align: right;

                    word-break:
                        break-word;
                }

                .amount {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    margin-top: 20px;

                    padding: 20px;

                    border-radius: 10px;

                    background: #eef2ff;

                    color: #111827;
                }

                .amount span {

                    font-size: 14px;

                    font-weight: 700;
                }

                .amount strong {

                    font-size: 25px;

                    color: #4338ca;
                }

                .footer {

                    margin-top: 25px;

                    text-align: center;

                    color: #9ca3af;

                    font-size: 12px;

                    line-height: 1.6;
                }

                .print-button {

                    width: 100%;

                    height: 48px;

                    margin-top: 25px;

                    border: none;

                    border-radius: 8px;

                    background: #4338ca;

                    color: #ffffff;

                    font-size: 15px;

                    font-weight: 700;

                    cursor: pointer;
                }

                .print-button:hover {

                    background: #3730a3;
                }

                @media print {

                    body {

                        padding: 0;

                        background: #ffffff;
                    }

                    .receipt {

                        max-width: none;

                        box-shadow: none;

                        border-radius: 0;
                    }

                    .print-button {

                        display: none;
                    }

                }

                @media (max-width: 600px) {

                    body {

                        padding: 10px;
                    }

                    .receipt {

                        padding: 20px;
                    }

                    .row {

                        flex-direction:
                            column;

                        align-items:
                            flex-start;

                        gap: 5px;
                    }

                    .value {

                        text-align:
                            left;
                    }

                    .amount {

                        flex-direction:
                            column;

                        align-items:
                            flex-start;

                        gap: 8px;
                    }

                }

            </style>

        </head>

        <body>

            <div class="receipt">

                <div class="header">

                    <div class="logo">
                        TransitPro
                    </div>

                    <div class="subtitle">
                        Transport Booking Payment Receipt
                    </div>

                </div>

                <div class="success">

                    <div class="success-icon">
                        ✓
                    </div>

                    <h2>
                        Payment Successful
                    </h2>

                    <p>
                        Your payment has been verified successfully.
                    </p>

                </div>

                <div class="receipt-info">

                    <div class="row">

                        <span class="label">
                            Payment Reference
                        </span>

                        <strong class="value">
                            ${escapeHtml(paymentRef)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Booking Reference
                        </span>

                        <strong class="value">
                            ${escapeHtml(bookingRef)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Passenger
                        </span>

                        <strong class="value">
                            ${escapeHtml(passenger)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Phone
                        </span>

                        <strong class="value">
                            ${escapeHtml(phone)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Route
                        </span>

                        <strong class="value">
                            ${escapeHtml(origin)}
                            →
                            ${escapeHtml(destination)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Departure
                        </span>

                        <strong class="value">
                            ${escapeHtml(departureText)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Seat Number
                        </span>

                        <strong class="value">
                            ${escapeHtml(seat)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Payment Method
                        </span>

                        <strong class="value">
                            ${escapeHtml(method)}
                        </strong>

                    </div>

                    <div class="row">

                        <span class="label">
                            Paid At
                        </span>

                        <strong class="value">
                            ${escapeHtml(paidAtText)}
                        </strong>

                    </div>

                </div>

                <div class="amount">

                    <span>
                        Amount Paid
                    </span>

                    <strong>
                        ${formatMoney(amount)}
                    </strong>

                </div>

                <button
                    class="print-button"
                    onclick="window.print()"
                >
                    🖨 Print Receipt
                </button>

                <div class="footer">

                    Thank you for choosing TransitPro.

                    <br>

                    This receipt confirms your successful payment.

                </div>

            </div>

        </body>

        </html>
    `);

    receiptWindow.document.close();

    /*
     * Focus the receipt window.
     */

    receiptWindow.focus();
}

// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

// ==========================================
// NEW PAYMENT
// ==========================================

if (newPaymentButton) {

    newPaymentButton.addEventListener(
        "click",
        function () {

            currentPaymentReference = null;

            currentPaymentId = null;

            currentPayment = null;

            selectedBooking = null;

            localStorage.removeItem(
                "currentPaymentReference"
            );

            localStorage.removeItem(
                "currentPaymentId"
            );

            if (successCard) {
                successCard.style.display =
                    "none";
            }

            if (bookingInformation) {
                bookingInformation.style.display =
                    "none";
            }

            if (emptyBookingMessage) {
                emptyBookingMessage.style.display =
                    "block";
            }

            if (bookingSelect) {
                bookingSelect.value = "";
            }
        }
    );
}

// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    message,
    type = "info"
) {

    const oldMessage =
        document.getElementById(
            "paymentMessage"
        );

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageBox =
        document.createElement(
            "div"
        );

    messageBox.id =
        "paymentMessage";

    messageBox.textContent =
        message;

    messageBox.style.position =
        "fixed";

    messageBox.style.top =
        "20px";

    messageBox.style.right =
        "20px";

    messageBox.style.zIndex =
        "99999";

    messageBox.style.maxWidth =
        "380px";

    messageBox.style.padding =
        "14px 18px";

    messageBox.style.borderRadius =
        "8px";

    messageBox.style.fontSize =
        "14px";

    messageBox.style.fontWeight =
        "600";

    messageBox.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.12)";

    if (type === "error") {

        messageBox.style.background =
            "#fee2e2";

        messageBox.style.color =
            "#991b1b";

    } else if (type === "success") {

        messageBox.style.background =
            "#dcfce7";

        messageBox.style.color =
            "#166534";

    } else {

        messageBox.style.background =
            "#e0e7ff";

        messageBox.style.color =
            "#3730a3";
    }

    document.body.appendChild(
        messageBox
    );

    setTimeout(
        () => {

            if (messageBox) {
                messageBox.remove();
            }

        },
        4000
    );
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadBookings();

        await checkPaymentCallback();

    }
);

