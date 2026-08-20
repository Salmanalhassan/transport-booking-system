//AUTHENTICATION
const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

let currentUser = null;

try {

    currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;

} catch (error) {

    console.error(
        "Invalid stored user:",
        error
    );

}


/* =========================================================
   PROTECT PAGE
========================================================= */

if (!token || !currentUser) {

    window.location.href = "login.html";

}


/* =========================================================
   DATA
========================================================= */

let allBookings = [];

let filteredBookings = [];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar =
    document.getElementById(
        "passengerSidebar"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* USER */

const userName =
    document.getElementById(
        "userName"
    );

const userPhone =
    document.getElementById(
        "userPhone"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );


/* STATISTICS */

const totalBookings =
    document.getElementById(
        "totalBookings"
    );

const confirmedBookings =
    document.getElementById(
        "confirmedBookings"
    );

const pendingBookings =
    document.getElementById(
        "pendingBookings"
    );

const cancelledBookings =
    document.getElementById(
        "cancelledBookings"
    );


/* FILTERS */

const bookingSearch =
    document.getElementById(
        "bookingSearch"
    );

const bookingStatusFilter =
    document.getElementById(
        "bookingStatusFilter"
    );

const bookingDateFilter =
    document.getElementById(
        "bookingDateFilter"
    );

const clearFilters =
    document.getElementById(
        "clearFilters"
    );


/* RESULTS */

const resultsCount =
    document.getElementById(
        "resultsCount"
    );


/* LOADING / ERROR */

const loadingState =
    document.getElementById(
        "loadingState"
    );

const errorState =
    document.getElementById(
        "errorState"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const retryButton =
    document.getElementById(
        "retryButton"
    );


/* BOOKINGS */

const bookingsContainer =
    document.getElementById(
        "bookingsContainer"
    );

const bookingsTableBody =
    document.getElementById(
        "bookingsTableBody"
    );


/* EMPTY */

const emptyState =
    document.getElementById(
        "emptyState"
    );


/* MODAL */

const bookingModal =
    document.getElementById(
        "bookingModal"
    );

const bookingDetails =
    document.getElementById(
        "bookingDetails"
    );

const closeBookingModal =
    document.getElementById(
        "closeBookingModal"
    );

const closeBookingModalBottom =
    document.getElementById(
        "closeBookingModalBottom"
    );


/* =========================================================
   DISPLAY USER
========================================================= */

function displayUser() {

    if (!currentUser) {
        return;
    }


    const name =
        currentUser.full_name ||
        currentUser.name ||
        currentUser.username ||
        "Passenger";


    const phone =
        currentUser.phone ||
        currentUser.phone_number ||
        "—";


    if (userName) {

        userName.textContent =
            name;

    }


    if (userPhone) {

        userPhone.textContent =
            phone;

    }


    if (userAvatar) {

        const initials =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map(
                    word =>
                        word
                            .charAt(0)
                            .toUpperCase()
                )
                .join("")
                .substring(0, 2);


        userAvatar.textContent =
            initials || "P";

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupMobileMenu() {

    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );


            if (sidebarOverlay) {

                sidebarOverlay.classList.toggle(
                    "active"
                );

            }

        }
    );


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }

}


function closeMobileMenu() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================================
   LOAD BOOKINGS
========================================================= */

async function loadBookings() {

    showLoading();


    try {

        /*
         * api.js already contains apiRequest().
         *
         * API_BASE_URL:
         * http://localhost:5000/api
         *
         * Therefore:
         * /bookings
         * becomes:
         * http://localhost:5000/api/bookings
         */
           const result =
                await apiRequest(
                    "/bookings/my-bookings"
    );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to load bookings."
            );

        }


        /*
         * Support:
         *
         * {
         *   success: true,
         *   data: [...]
         * }
         */

        if (Array.isArray(result.data)) {

            allBookings =
                result.data;

        } else if (
            Array.isArray(result)
        ) {

            allBookings =
                result;

        } else {

            allBookings = [];

        }


        /*
         * IMPORTANT:
         *
         * The backend should return bookings
         * belonging to the logged-in passenger.
         */

        filteredBookings =
            [...allBookings];


        hideLoading();

        hideError();

        updateStatistics();

        applyFilters();


    } catch (error) {

        console.error(
            "Bookings loading error:",
            error
        );


        hideLoading();

        showError(
            error.message ||
            "Unable to load your bookings."
        );

    }

}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoading() {

    if (loadingState) {

        loadingState.style.display =
            "flex";

    }


    if (bookingsContainer) {

        bookingsContainer.style.display =
            "none";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    hideError();

}


function hideLoading() {

    if (loadingState) {

        loadingState.style.display =
            "none";

    }

}


/* =========================================================
   ERROR STATE
========================================================= */

function showError(message) {

    if (errorState) {

        errorState.style.display =
            "flex";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message;

    }


    if (bookingsContainer) {

        bookingsContainer.style.display =
            "none";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }

}


function hideError() {

    if (errorState) {

        errorState.style.display =
            "none";

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        allBookings.length;


    const confirmed =
        allBookings.filter(
            booking =>
                normalizeStatus(
                    booking.booking_status ||
                    booking.status
                ) === "confirmed"
        ).length;


    const pending =
        allBookings.filter(
            booking =>
                normalizeStatus(
                    booking.booking_status ||
                    booking.status
                ) === "pending"
        ).length;


    const cancelled =
        allBookings.filter(
            booking =>
                normalizeStatus(
                    booking.booking_status ||
                    booking.status
                ) === "cancelled"
        ).length;


    if (totalBookings) {

        totalBookings.textContent =
            total;

    }


    if (confirmedBookings) {

        confirmedBookings.textContent =
            confirmed;

    }


    if (pendingBookings) {

        pendingBookings.textContent =
            pending;

    }


    if (cancelledBookings) {

        cancelledBookings.textContent =
            cancelled;

    }

}


/* =========================================================
   FILTER BOOKINGS
========================================================= */

function applyFilters() {

    const search =
        bookingSearch
            ? bookingSearch.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        bookingStatusFilter
            ? bookingStatusFilter.value
            : "all";


    const selectedDate =
        bookingDateFilter
            ? bookingDateFilter.value
            : "";


    filteredBookings =
        allBookings.filter(
            booking => {

                /* =========================
                   SEARCH
                ========================= */

                const searchableText = [

                    booking.booking_reference,

                    booking.reference,

                    booking.origin,

                    booking.destination,

                    booking.route,

                    booking.passenger_name,

                    booking.seat_number,

                    booking.payment_status,

                    booking.booking_status

                ]
                    .filter(
                        value =>
                            value !==
                            undefined &&
                            value !== null
                    )
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                /* =========================
                   STATUS
                ========================= */

                const bookingStatus =
                    normalizeStatus(
                        booking.booking_status ||
                        booking.status
                    );


                const matchesStatus =
                    status === "all" ||
                    bookingStatus ===
                        status;


                /* =========================
                   DATE
                ========================= */

                const bookingDate =
                    getBookingDate(
                        booking
                    );


                const matchesDate =
                    !selectedDate ||
                    bookingDate ===
                        selectedDate;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );

            }
        );


    renderBookings(
        filteredBookings
    );

}


/* =========================================================
   RENDER BOOKINGS
========================================================= */

function renderBookings(bookings) {

    if (resultsCount) {

        resultsCount.textContent =
            bookings.length;

    }


    /* NO BOOKINGS */

    if (!bookings.length) {

        if (bookingsContainer) {

            bookingsContainer.style.display =
                "none";

        }


        if (emptyState) {

            emptyState.style.display =
                "flex";

        }


        return;

    }


    /* SHOW TABLE */

    if (bookingsContainer) {

        bookingsContainer.style.display =
            "block";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (!bookingsTableBody) {
        return;
    }


    bookingsTableBody.innerHTML =
        "";


    bookings.forEach(
        booking => {

            const row =
                document.createElement(
                    "tr"
                );


            const reference =
                booking.booking_reference ||
                booking.reference ||
                "N/A";


            const origin =
                booking.origin ||
                booking.from ||
                "N/A";


            const destination =
                booking.destination ||
                booking.to ||
                "N/A";


            const travelDate =
                getBookingDate(
                    booking
                );


            const departureTime =
                booking.departure_time ||
                booking.time ||
                "N/A";


            const seat =
                booking.seat_number ||
                booking.seat ||
                "—";


            const amount =
                booking.amount ??
                booking.fare ??
                0;


            const status =
                normalizeStatus(
                    booking.booking_status ||
                    booking.status ||
                    "pending"
                );


            const paymentStatus =
                normalizeStatus(
                    booking.payment_status ||
                    "pending"
                );


            row.innerHTML = `

                <td>

                    <strong
                        class="booking-reference"
                    >
                        ${escapeHTML(
                            reference
                        )}
                    </strong>

                </td>


                <td>

                    <div
                        class="booking-route"
                    >

                        <span>
                            ${escapeHTML(
                                origin
                            )}
                        </span>

                        <span class="route-arrow">
                            →
                        </span>

                        <span>
                            ${escapeHTML(
                                destination
                            )}
                        </span>

                    </div>

                </td>


                <td>
                    ${formatDate(
                        travelDate
                    )}
                </td>


                <td>
                    ${formatTime(
                        departureTime
                    )}
                </td>


                <td>

                    <span
                        class="seat-number"
                    >
                        ${escapeHTML(
                            String(seat)
                        )}
                    </span>

                </td>


                <td>

                    <strong>
                        ₦${formatAmount(
                            amount
                        )}
                    </strong>

                </td>


                <td>

                    <span
                        class="booking-status ${getStatusClass(
                            status
                        )}"
                    >
                        ${escapeHTML(
                            status
                        )}
                    </span>

                </td>


                <td>

                    <span
                        class="booking-status ${getStatusClass(
                            paymentStatus
                        )}"
                    >
                        ${escapeHTML(
                            paymentStatus
                        )}
                    </span>

                </td>

<td>

    <div class="booking-actions">

        <button
            type="button"
            class="view-booking-button"
            data-id="${escapeHTML(
                String(
                    booking.id
                )
            )}"
        >
            👁 View
        </button>
${
    paymentStatus !== "paid" &&
    paymentStatus !== "successful"
        ? `
            <button
                type="button"
                class="pay-now-button"
                data-id="${escapeHTML(
                    String(booking.id)
                )}"
            >
                💳 Pay Now
            </button>
        `
        : `
            <button
                type="button"
                class="view-ticket-button"
                data-id="${escapeHTML(
                    String(booking.id)
                )}"
            >
                🎫 View Ticket
            </button>
        `
}

    </div>

</td>

            `;


            bookingsTableBody.appendChild(
                row
            );

        }
    );


    attachBookingButtons();

}

// ==========================================
// PAY NOW
// ==========================================

async function payNow(bookingId) {

    if (!bookingId) {

        alert(
            "Invalid booking."
        );

        return;
    }


    const button =
        document.querySelector(
            `.pay-now-button[data-id="${bookingId}"]`
        );


    const originalText =
        button
            ? button.textContent
            : "💳 Pay Now";


    try {

        if (button) {

            button.disabled = true;

            button.textContent =
                "Processing...";

        }


        const result =
            await apiRequest(
                "/payments/initialize",
                {
                    method: "POST",

                    body: JSON.stringify({

                        booking_id:
                            Number(
                                bookingId
                            )

                    })

                }
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to initialize payment."
            );

        }


        const authorizationUrl =
            result?.data?.authorization_url;


        if (!authorizationUrl) {

            throw new Error(
                "Paystack payment URL was not returned."
            );

        }


        // ======================================
        // OPEN PAYSTACK
        // ======================================

        window.location.href =
            authorizationUrl;


    } catch (error) {

        console.error(
            "Pay Now error:",
            error
        );


        alert(
            error.message ||
            "Unable to start payment."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                originalText;

        }

    }

}
/* =========================================================
   BOOKING ACTION BUTTONS
========================================================= */
/* =========================================================
   BOOKING ACTION BUTTONS
========================================================= */

function attachBookingButtons() {

    /* =====================================================
       VIEW BOOKING / TICKET
    ===================================================== */

    const viewButtons =
        document.querySelectorAll(
            ".view-booking-button"
        );


    viewButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const bookingId =
                        button.dataset.id;


                    if (!bookingId) {

                        alert(
                            "Invalid booking ID."
                        );

                        return;
                    }


                    const originalText =
                        button.textContent;


                    try {

                        /* =================================
                           DISABLE BUTTON
                        ================================= */

                        button.disabled = true;

                        button.textContent =
                            "Loading...";


                        /* =================================
                           GET REAL TICKET
                           FROM BACKEND
                        ================================= */

                        const result =
                            await apiRequest(
                                `/payments/ticket/${encodeURIComponent(
                                    bookingId
                                )}`
                            );


                        /* =================================
                           API ERROR
                        ================================= */

                        if (
                            !result ||
                            result.success === false
                        ) {

                            throw new Error(
                                result?.message ||
                                "Unable to retrieve ticket."
                            );

                        }


                        /* =================================
                           GET TICKET DATA
                        ================================= */

                        const ticket =
                            result?.data?.ticket ||
                            result?.data;


                        if (!ticket) {

                            throw new Error(
                                "Ticket information was not returned."
                            );

                        }


                        /* =================================
                           OPEN TICKET MODAL
                        ================================= */

                        openTicketModal(
                            ticket
                        );


                    } catch (error) {

                        console.error(
                            "View ticket error:",
                            error
                        );


                        alert(
                            error.message ||
                            "Unable to load ticket."
                        );


                    } finally {

                        button.disabled = false;

                        button.textContent =
                            originalText;

                    }

                }
            );

        }
    );


    /* =====================================================
       PAY NOW
    ===================================================== */

    const payButtons =
        document.querySelectorAll(
            ".pay-now-button"
        );


    payButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const bookingId =
                        button.dataset.id;


                    payNow(
                        bookingId
                    );

                }
            );

        }
    );


    // ==========================================
// VIEW TICKET BUTTONS
// ==========================================

const viewTicketButtons =
    document.querySelectorAll(
        ".view-ticket-button"
    );


viewTicketButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                const bookingId =
                    button.dataset.id;


                await openTicket(
                    bookingId
                );

            }
        );

    }
);
}

/* =========================================================
   OPEN REAL TICKET MODAL
========================================================= */

function openTicketModal(ticket) {

    if (
        !bookingModal ||
        !bookingDetails
    ) {

        return;
    }


    /* =====================================================
       TICKET DATA
    ===================================================== */

    const ticketNumber =
        ticket.ticket_number ||
        ticket.booking_reference ||
        "N/A";


    const reference =
        ticket.booking_reference ||
        "N/A";


    const passengerName =
        ticket.passenger_name ||
        "Passenger";


    const passengerPhone =
        ticket.passenger_phone ||
        "—";


    const passengerEmail =
        ticket.passenger_email ||
        "—";


    const origin =
        ticket.origin ||
        "N/A";


    const destination =
        ticket.destination ||
        "N/A";


    const departureDate =
        ticket.departure_date ||
        "";


    const departureTime =
        ticket.departure_time ||
        "N/A";


    const arrivalTime =
        ticket.arrival_time ||
        "N/A";


    const seatNumber =
        ticket.seat_number ||
        "—";


    const amount =
        ticket.amount ??
        ticket.fare ??
        0;


    const bookingStatus =
        normalizeStatus(
            ticket.booking_status ||
            "confirmed"
        );


    const paymentStatus =
        normalizeStatus(
            ticket.payment_status ||
            "paid"
        );


    const paymentReference =
        ticket.payment_reference ||
        "N/A";


    const paidAt =
        ticket.paid_at ||
        "";


    /* =====================================================
       PAYMENT CHECK
    ===================================================== */

    if (
        paymentStatus !== "paid"
    ) {

        alert(
            "This ticket is only available after successful payment."
        );

        return;

    }


    /* =====================================================
       BUILD TICKET
    ===================================================== */

    bookingDetails.innerHTML = `

        <div class="ticket-details-grid">

            <!-- TICKET NUMBER -->

            <div class="ticket-detail-item">

                <span>
                    Ticket Number
                </span>

                <strong>
                    ${escapeHTML(
                        ticketNumber
                    )}
                </strong>

            </div>


            <!-- BOOKING REFERENCE -->

            <div class="ticket-detail-item">

                <span>
                    Booking Reference
                </span>

                <strong>
                    ${escapeHTML(
                        reference
                    )}
                </strong>

            </div>


            <!-- PASSENGER -->

            <div class="ticket-detail-item">

                <span>
                    Passenger
                </span>

                <strong>
                    ${escapeHTML(
                        passengerName
                    )}
                </strong>

            </div>


            <!-- PHONE -->

            <div class="ticket-detail-item">

                <span>
                    Phone
                </span>

                <strong>
                    ${escapeHTML(
                        passengerPhone
                    )}
                </strong>

            </div>


            <!-- EMAIL -->

            <div class="ticket-detail-item">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        passengerEmail
                    )}
                </strong>

            </div>


            <!-- ROUTE -->

            <div class="ticket-detail-item">

                <span>
                    Route
                </span>

                <strong>

                    ${escapeHTML(
                        origin
                    )}

                    →

                    ${escapeHTML(
                        destination
                    )}

                </strong>

            </div>


            <!-- TRAVEL DATE -->

            <div class="ticket-detail-item">

                <span>
                    Travel Date
                </span>

                <strong>
                    ${formatDate(
                        departureDate
                    )}
                </strong>

            </div>


            <!-- DEPARTURE -->

            <div class="ticket-detail-item">

                <span>
                    Departure
                </span>

                <strong>
                    ${formatTime(
                        departureTime
                    )}
                </strong>

            </div>


            <!-- ARRIVAL -->

            <div class="ticket-detail-item">

                <span>
                    Arrival
                </span>

                <strong>
                    ${formatTime(
                        arrivalTime
                    )}
                </strong>

            </div>


            <!-- SEAT -->

            <div class="ticket-detail-item">

                <span>
                    Seat Number
                </span>

                <strong>
                    ${escapeHTML(
                        String(
                            seatNumber
                        )
                    )}
                </strong>

            </div>


            <!-- AMOUNT -->

            <div class="ticket-detail-item">

                <span>
                    Amount
                </span>

                <strong>
                    ₦${formatAmount(
                        amount
                    )}
                </strong>

            </div>


            <!-- BOOKING STATUS -->

            <div class="ticket-detail-item">

                <span>
                    Booking Status
                </span>

                <strong>

                    <span
                        class="booking-status ${getStatusClass(
                            bookingStatus
                        )}"
                    >
                        ${escapeHTML(
                            bookingStatus
                        )}
                    </span>

                </strong>

            </div>


            <!-- PAYMENT STATUS -->

            <div class="ticket-detail-item">

                <span>
                    Payment Status
                </span>

                <strong>

                    <span
                        class="booking-status paid"
                    >
                        ✓ Paid
                    </span>

                </strong>

            </div>


            <!-- PAYMENT REFERENCE -->

            <div class="ticket-detail-item">

                <span>
                    Payment Reference
                </span>

                <strong>
                    ${escapeHTML(
                        paymentReference
                    )}
                </strong>

            </div>


            <!-- PAID AT -->

            <div class="ticket-detail-item">

                <span>
                    Paid At
                </span>

                <strong>
                    ${formatDateTime(
                        paidAt
                    )}
                </strong>

            </div>

        </div>

    `;


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    bookingModal.classList.add(
        "active"
    );


    bookingModal.setAttribute(
        "aria-hidden",
        "false"
    );

}












// ==========================================
// OPEN TICKET
// ==========================================

async function openTicket(bookingId) {

    if (!bookingId) {

        alert(
            "Invalid booking."
        );

        return;
    }


    try {

        const result =
            await apiRequest(
                `/payments/ticket/${encodeURIComponent(
                    bookingId
                )}`
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to load ticket."
            );

        }


        const ticket =
            result.data;


        if (!ticket) {

            throw new Error(
                "Ticket information was not returned."
            );

        }


        // ======================================
        // FILL TICKET
        // ======================================

        const ticketOrigin =
            document.getElementById(
                "ticketOrigin"
            );

        const ticketDestination =
            document.getElementById(
                "ticketDestination"
            );

        const ticketNumber =
            document.getElementById(
                "ticketNumber"
            );

        const ticketPassengerName =
            document.getElementById(
                "ticketPassengerName"
            );

        const ticketPassengerPhone =
            document.getElementById(
                "ticketPassengerPhone"
            );

        const ticketSeat =
            document.getElementById(
                "ticketSeat"
            );

        const ticketBookingReference =
            document.getElementById(
                "ticketBookingReference"
            );

        const ticketTravelDate =
            document.getElementById(
                "ticketTravelDate"
            );

        const ticketDeparture =
            document.getElementById(
                "ticketDeparture"
            );

        const ticketArrival =
            document.getElementById(
                "ticketArrival"
            );

        const ticketAmount =
            document.getElementById(
                "ticketAmount"
            );

        const ticketPaymentReference =
            document.getElementById(
                "ticketPaymentReference"
            );


        // ======================================
        // SUPPORT DIFFERENT BACKEND FIELD NAMES
        // ======================================

        const origin =
            ticket.origin ||
            ticket.from ||
            "N/A";


        const destination =
            ticket.destination ||
            ticket.to ||
            "N/A";


        const passengerName =
            ticket.passenger_name ||
            ticket.full_name ||
            currentUser?.full_name ||
            "Passenger";


        const passengerPhone =
            ticket.passenger_phone ||
            ticket.phone ||
            currentUser?.phone ||
            "—";


        const seat =
            ticket.seat_number ||
            ticket.seat ||
            "—";


        const bookingReference =
            ticket.booking_reference ||
            ticket.reference ||
            "N/A";


        const travelDate =
            ticket.departure_date ||
            ticket.travel_date ||
            ticket.trip_date ||
            ticket.date ||
            "";


        const departure =
            ticket.departure_time ||
            ticket.departure ||
            ticket.time ||
            "";


        const arrival =
            ticket.arrival_time ||
            ticket.arrival ||
            "—";


        const amount =
            ticket.amount ??
            ticket.fare ??
            0;


        const paymentReference =
            ticket.payment_reference ||
            ticket.reference ||
            ticket.transaction_reference ||
            "—";


        const ticketId =
            ticket.ticket_number ||
            ticket.ticket_id ||
            bookingReference ||
            `TKT-${bookingId}`;


        // ======================================
        // INSERT DATA
        // ======================================

        if (ticketOrigin) {

            ticketOrigin.textContent =
                origin;
        }


        if (ticketDestination) {

            ticketDestination.textContent =
                destination;
        }


        if (ticketNumber) {

            ticketNumber.textContent =
                ticketId;
        }


        if (ticketPassengerName) {

            ticketPassengerName.textContent =
                passengerName;
        }


        if (ticketPassengerPhone) {

            ticketPassengerPhone.textContent =
                passengerPhone;
        }


        if (ticketSeat) {

            ticketSeat.textContent =
                seat;
        }


        if (ticketBookingReference) {

            ticketBookingReference.textContent =
                bookingReference;
        }


        if (ticketTravelDate) {

            ticketTravelDate.textContent =
                formatDate(
                    travelDate
                );
        }


        if (ticketDeparture) {

            ticketDeparture.textContent =
                formatTime(
                    departure
                );
        }


        if (ticketArrival) {

            ticketArrival.textContent =
                formatTime(
                    arrival
                );
        }


        if (ticketAmount) {

            ticketAmount.textContent =
                `₦${formatAmount(
                    amount
                )}`;
        }


        if (ticketPaymentReference) {

            ticketPaymentReference.textContent =
                paymentReference;
        }


        // ======================================
        // OPEN TICKET MODAL
        // ======================================

        const ticketModal =
            document.getElementById(
                "ticketModal"
            );


        if (!ticketModal) {

            throw new Error(
                "Ticket modal was not found in the HTML."
            );

        }


        ticketModal.classList.add(
            "active"
        );


        ticketModal.setAttribute(
            "aria-hidden",
            "false"
        );


    } catch (error) {

        console.error(
            "Open Ticket error:",
            error
        );


        alert(
            error.message ||
            "Unable to load your ticket."
        );

    }

}

//////
// ==========================================
// CLOSE TICKET MODAL
// ==========================================

function closeTicketModal() {

    const ticketModal =
        document.getElementById(
            "ticketModal"
        );


    if (!ticketModal) {
        return;
    }


    if (
        document.activeElement &&
        ticketModal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    ticketModal.classList.remove(
        "active"
    );


    ticketModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ==========================================
// TICKET MODAL EVENTS
// ==========================================

const closeTicketModalButton =
    document.getElementById(
        "closeTicketModal"
    );


const closeTicketButton =
    document.getElementById(
        "closeTicketButton"
    );


if (closeTicketModalButton) {

    closeTicketModalButton.addEventListener(
        "click",
        closeTicketModal
    );

}


if (closeTicketButton) {

    closeTicketButton.addEventListener(
        "click",
        closeTicketModal
    );

}


const ticketModal =
    document.getElementById(
        "ticketModal"
    );


if (ticketModal) {

    ticketModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                ticketModal
            ) {

                closeTicketModal();

            }

        }
    );

}

// ==========================================
// PRINT TICKET
// ==========================================

const printTicketButton =
    document.getElementById(
        "printTicketButton"
    );


if (printTicketButton) {

    printTicketButton.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}

/////////////////////////////////////// sabon gyara
// ==========================================
// VERIFY PAYSTACK PAYMENT AFTER CALLBACK
// ==========================================

async function verifyPaystackPayment() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const reference =
        urlParams.get("reference");


    if (!reference) {
        return;
    }


    try {

        // ======================================
        // SHOW VERIFYING MESSAGE
        // ======================================

        alert(
            "Payment received. Verifying payment..."
        );


        // ======================================
        // VERIFY WITH BACKEND
        // ======================================

        const result =
            await apiRequest(
                `/payments/verify/${encodeURIComponent(
                    reference
                )}`
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Payment verification failed."
            );

        }


        // ======================================
        // SUCCESS
        // ======================================

        alert(
            "Payment successful!\n\n" +
            "Your booking has been confirmed."
        );


        // ======================================
        // REMOVE REFERENCE FROM URL
        // ======================================

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        // ======================================
        // RELOAD BOOKINGS
        // ======================================

        await loadBookings();


    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        alert(
            error.message ||
            "Unable to verify payment."
        );

    }

}

/* =========================================================
   OPEN BOOKING MODAL
========================================================= */

function openBookingModal(booking) {

    if (!bookingModal || !bookingDetails) {
        return;
    }


    const reference =
        booking.booking_reference ||
        booking.reference ||
        "N/A";


    const origin =
        booking.origin ||
        booking.from ||
        "N/A";


    const destination =
        booking.destination ||
        booking.to ||
        "N/A";


    const travelDate =
        getBookingDate(
            booking
        );


    const departureTime =
        booking.departure_time ||
        booking.time ||
        "N/A";


    const seat =
        booking.seat_number ||
        booking.seat ||
        "—";


    const amount =
        booking.amount ??
        booking.fare ??
        0;


    const status =
        normalizeStatus(
            booking.booking_status ||
            booking.status ||
            "pending"
        );


    const payment =
        normalizeStatus(
            booking.payment_status ||
            "pending"
        );


    const passengerName =
        booking.passenger_name ||
        currentUser?.full_name ||
        "Passenger";


    const passengerPhone =
        booking.passenger_phone ||
        currentUser?.phone ||
        "—";


    bookingDetails.innerHTML = `

        <div class="ticket-details-grid">


            <div class="ticket-detail-item">

                <span>
                    Booking Reference
                </span>

                <strong>
                    ${escapeHTML(
                        reference
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Passenger
                </span>

                <strong>
                    ${escapeHTML(
                        passengerName
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Phone
                </span>

                <strong>
                    ${escapeHTML(
                        passengerPhone
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Route
                </span>

                <strong>

                    ${escapeHTML(
                        origin
                    )}

                    →

                    ${escapeHTML(
                        destination
                    )}

                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Travel Date
                </span>

                <strong>
                    ${formatDate(
                        travelDate
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Departure
                </span>

                <strong>
                    ${formatTime(
                        departureTime
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Seat Number
                </span>

                <strong>
                    ${escapeHTML(
                        String(seat)
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Amount
                </span>

                <strong>
                    ₦${formatAmount(
                        amount
                    )}
                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Booking Status
                </span>

                <strong>

                    <span
                        class="booking-status ${getStatusClass(
                            status
                        )}"
                    >
                        ${escapeHTML(
                            status
                        )}
                    </span>

                </strong>

            </div>


            <div class="ticket-detail-item">

                <span>
                    Payment Status
                </span>

                <strong>

                    <span
                        class="booking-status ${getStatusClass(
                            payment
                        )}"
                    >
                        ${escapeHTML(
                            payment
                        )}
                    </span>

                </strong>

            </div>


        </div>

    `;


    bookingModal.classList.add(
        "active"
    );


    bookingModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CLOSE BOOKING MODAL
========================================================= */

function closeBookingDetailsModal() {

    if (!bookingModal) {
        return;
    }


    if (
        document.activeElement &&
        bookingModal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    bookingModal.classList.remove(
        "active"
    );


    bookingModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   MODAL EVENTS
========================================================= */

if (closeBookingModal) {

    closeBookingModal.addEventListener(
        "click",
        closeBookingDetailsModal
    );

}


if (closeBookingModalBottom) {

    closeBookingModalBottom.addEventListener(
        "click",
        closeBookingDetailsModal
    );

}


if (bookingModal) {

    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {

                closeBookingDetailsModal();

            }

        }
    );

}


/* =========================================================
   SEARCH EVENT
========================================================= */

if (bookingSearch) {

    bookingSearch.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================================
   STATUS FILTER
========================================================= */

if (bookingStatusFilter) {

    bookingStatusFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   DATE FILTER
========================================================= */

if (bookingDateFilter) {

    bookingDateFilter.addEventListener(
        "change",
        applyFilters
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        () => {

            if (bookingSearch) {

                bookingSearch.value =
                    "";

            }


            if (bookingStatusFilter) {

                bookingStatusFilter.value =
                    "all";

            }


            if (bookingDateFilter) {

                bookingDateFilter.value =
                    "";

            }


            applyFilters();

        }
    );

}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadBookings
    );

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    const value =
        normalizeStatus(
            status
        );


    if (
        value === "confirmed" ||
        value === "paid" ||
        value === "successful" ||
        value === "completed"
    ) {

        return value;

    }


    if (
        value === "cancelled" ||
        value === "canceled" ||
        value === "failed"
    ) {

        return "cancelled";

    }


    return "pending";

}


/* =========================================================
   GET BOOKING DATE
========================================================= */

function getBookingDate(booking) {

    if (!booking) {
        return "";
    }


    /*
     * Prefer trip departure date.
     */

    const date =
        booking.departure_date ||
        booking.travel_date ||
        booking.trip_date ||
        booking.date;


    if (!date) {
        return "";
    }


    /*
     * If backend returns:
     * 2026-08-12
     *
     * return exactly that for
     * date input comparison.
     */

    const value =
        String(date)
            .substring(0, 10);


    return value;

}

/* =========================================================
   FORMAT DATE + TIME
========================================================= */

function formatDateTime(value) {

    if (!value) {

        return "N/A";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit"
        }
    );

}
/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    /*
     * Prevent timezone from changing
     * YYYY-MM-DD.
     */

    const value =
        String(date)
            .substring(0, 10);


    const parts =
        value.split("-");


    if (parts.length !== 3) {

        return String(date);

    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    if (
        !year ||
        !month ||
        !day
    ) {

        return String(date);

    }


    const parsedDate =
        new Date(
            year,
            month - 1,
            day
        );


    return parsedDate.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(time) {

    if (!time) {
        return "N/A";
    }


    const value =
        String(time);


    /*
     * Already formatted
     */

    if (
        value.toLowerCase().includes("am") ||
        value.toLowerCase().includes("pm")
    ) {

        return value;

    }


    const parts =
        value.split(":");


    if (parts.length < 2) {

        return value;

    }


    let hour =
        Number(parts[0]);


    const minute =
        parts[1];


    if (
        Number.isNaN(hour)
    ) {

        return value;

    }


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatAmount(amount) {

    const number =
        Number(
            amount || 0
        );


    return number.toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================================
   INITIALIZE
========================================================= */
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        displayUser();

        setupMobileMenu();

        setupLogout();

        await verifyPaystackPayment();

        await loadBookings();

    }
);