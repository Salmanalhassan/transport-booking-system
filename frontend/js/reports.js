// =========================================================
// TRANSITPRO — REPORTS JAVASCRIPT
// Matches the current reports.html
// =========================================================


// =========================================================
// API
// =========================================================

const API_URL = "http://localhost:5000/api";


// =========================================================
// AUTHENTICATION
// =========================================================

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

let currentUser = null;

try {
    currentUser = storedUser
        ? JSON.parse(storedUser)
        : null;
} catch (error) {
    console.error("Invalid stored user:", error);
    currentUser = null;
}


// =========================================================
// PROTECT PAGE
// =========================================================

if (!token || !currentUser) {
    window.location.href = "login.html";
}


// =========================================================
// GLOBAL DATA
// =========================================================

let allBookings = [];
let allPassengers = [];
let allTrips = [];
let allBuses = [];


// =========================================================
// DOM ELEMENTS
// =========================================================

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logout");


// =========================================================
// REPORT ELEMENTS
// =========================================================

const reportFilterForm =
    document.getElementById("reportFilterForm");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const reportType =
    document.getElementById("reportType");

const printReportButton =
    document.getElementById("printReport");


// =========================================================
// SUMMARY
// =========================================================

const totalBookingsElement =
    document.getElementById("totalBookings");

const totalRevenueElement =
    document.getElementById("totalRevenue");

const totalPassengersElement =
    document.getElementById("totalPassengers");

const totalTripsElement =
    document.getElementById("totalTrips");


// =========================================================
// BOOKING STATUS
// =========================================================

const pendingBookingsElement =
    document.getElementById("pendingBookings");

const confirmedBookingsElement =
    document.getElementById("confirmedBookings");

const cancelledBookingsElement =
    document.getElementById("cancelledBookings");

const completedBookingsElement =
    document.getElementById("completedBookings");


// =========================================================
// PAYMENT SUMMARY
// =========================================================

const paidAmountElement =
    document.getElementById("paidAmount");

const pendingAmountElement =
    document.getElementById("pendingAmount");

const failedAmountElement =
    document.getElementById("failedAmount");

const paymentTotalElement =
    document.getElementById("paymentTotal");


// =========================================================
// TABLES
// =========================================================

const topRoutesBody =
    document.getElementById("topRoutesBody");

const recentBookingsBody =
    document.getElementById("recentBookingsBody");


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`,

                        ...(options.headers || {})
                    }
                }
            );


        // =====================================================
        // UNAUTHORIZED
        // =====================================================

        if (response.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return null;
        }


        // =====================================================
        // READ RESPONSE
        // =====================================================

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Request failed."
            );
        }


        return data;

    } catch (error) {

        console.error(
            "Reports API Error:",
            error
        );

        throw error;
    }
}


// =========================================================
// LOAD BOOKINGS
// =========================================================

async function loadBookings() {

    try {

        const result =
            await apiRequest(
                "/bookings"
            );


        if (
            result &&
            result.success &&
            Array.isArray(result.data)
        ) {

            allBookings =
                result.data;

        } else {

            allBookings = [];

        }

    } catch (error) {

        console.error(
            "Unable to load bookings:",
            error
        );

        allBookings = [];
    }
}


// =========================================================
// LOAD PASSENGERS
// =========================================================

async function loadPassengers() {

    try {

        const result =
            await apiRequest(
                "/passengers"
            );


        if (
            result &&
            result.success &&
            Array.isArray(result.data)
        ) {

            allPassengers =
                result.data;

        } else {

            allPassengers = [];

        }

    } catch (error) {

        console.warn(
            "Unable to load passengers:",
            error.message
        );

        allPassengers = [];
    }
}


// =========================================================
// LOAD TRIPS
// =========================================================

async function loadTrips() {

    try {

        const result =
            await apiRequest(
                "/trips"
            );


        if (
            result &&
            result.success &&
            Array.isArray(result.data)
        ) {

            allTrips =
                result.data;

        } else {

            allTrips = [];

        }

    } catch (error) {

        console.warn(
            "Unable to load trips:",
            error.message
        );

        allTrips = [];
    }
}


// =========================================================
// LOAD BUSES
// =========================================================

async function loadBuses() {

    try {

        const result =
            await apiRequest(
                "/buses"
            );


        if (
            result &&
            result.success &&
            Array.isArray(result.data)
        ) {

            allBuses =
                result.data;

        } else {

            allBuses = [];

        }

    } catch (error) {

        console.warn(
            "Unable to load buses:",
            error.message
        );

        allBuses = [];
    }
}


// =========================================================
// LOAD ALL REPORT DATA
// =========================================================

async function loadReportData() {

    showTableLoading(
        topRoutesBody,
        4,
        "Loading report..."
    );

    showTableLoading(
        recentBookingsBody,
        6,
        "Loading bookings..."
    );


    try {

        await Promise.all([
            loadBookings(),
            loadPassengers(),
            loadTrips(),
            loadBuses()
        ]);


        console.log(
            "Bookings loaded:",
            allBookings.length
        );


        console.log(
            "Passengers loaded:",
            allPassengers.length
        );


        console.log(
            "Trips loaded:",
            allTrips.length
        );


        console.log(
            "Buses loaded:",
            allBuses.length
        );


        generateReport();


    } catch (error) {

        console.error(
            "Report data error:",
            error
        );


        showTableError(
            topRoutesBody,
            4,
            error.message ||
            "Unable to load report."
        );


        showTableError(
            recentBookingsBody,
            6,
            error.message ||
            "Unable to load bookings."
        );
    }
}


// =========================================================
// GET FILTERED BOOKINGS
// =========================================================

function getFilteredBookings() {

    let bookings =
        [...allBookings];


    // =====================================================
    // START DATE
    // =====================================================

    if (
        startDate &&
        startDate.value
    ) {

        const from =
            new Date(
                `${startDate.value}T00:00:00`
            );


        bookings =
            bookings.filter(
                booking => {

                    const date =
                        getBookingDate(
                            booking
                        );


                    return (
                        date &&
                        date >= from
                    );
                }
            );
    }


    // =====================================================
    // END DATE
    // =====================================================

    if (
        endDate &&
        endDate.value
    ) {

        const to =
            new Date(
                `${endDate.value}T23:59:59`
            );


        bookings =
            bookings.filter(
                booking => {

                    const date =
                        getBookingDate(
                            booking
                        );


                    return (
                        date &&
                        date <= to
                    );
                }
            );
    }


    return bookings;
}


// =========================================================
// GENERATE REPORT
// =========================================================

function generateReport() {

    const bookings =
        getFilteredBookings();


    console.log(
        "Generating report:",
        bookings.length,
        "bookings"
    );


    updateSummary(
        bookings
    );


    updateBookingStatus(
        bookings
    );


    updatePaymentSummary(
        bookings
    );


    renderTopRoutes(
        bookings
    );


    renderRecentBookings(
        bookings
    );
}


// =========================================================
// REPORT FORM
// =========================================================

if (reportFilterForm) {

    reportFilterForm.addEventListener(
        "submit",
        event => {

            // VERY IMPORTANT:
            // Prevent page reload.
            event.preventDefault();


            generateReport();
        }
    );
}


// =========================================================
// REPORT TYPE
// =========================================================

if (reportType) {

    reportType.addEventListener(
        "change",
        () => {

            generateReport();
        }
    );
}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateSummary(bookings) {

    const total =
        bookings.length;


    // =====================================================
    // REVENUE
    // =====================================================

    const revenue =
        bookings
            .filter(
                booking =>
                    isPaid(
                        booking.payment_status
                    )
            )
            .reduce(
                (sum, booking) => {

                    return (
                        sum +
                        Number(
                            booking.amount || 0
                        )
                    );
                },
                0
            );


    // =====================================================
    // PASSENGERS
    // =====================================================

    const passengerIds =
        new Set();


    bookings.forEach(
        booking => {

            if (
                booking.passenger_id !==
                undefined &&
                booking.passenger_id !==
                null
            ) {

                passengerIds.add(
                    String(
                        booking.passenger_id
                    )
                );

            } else if (
                booking.passenger_name
            ) {

                passengerIds.add(
                    String(
                        booking.passenger_name
                    ).toLowerCase()
                );
            }
        }
    );


    // =====================================================
    // DISPLAY
    // =====================================================

    if (totalBookingsElement) {

        totalBookingsElement.textContent =
            total;
    }


    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            `₦${formatAmount(revenue)}`;
    }


    if (totalPassengersElement) {

        totalPassengersElement.textContent =
            passengerIds.size ||
            allPassengers.length;
    }


    if (totalTripsElement) {

        const tripIds =
            new Set();


        bookings.forEach(
            booking => {

                if (
                    booking.trip_id !==
                    undefined &&
                    booking.trip_id !==
                    null
                ) {

                    tripIds.add(
                        String(
                            booking.trip_id
                        )
                    );
                }
            }
        );


        totalTripsElement.textContent =
            tripIds.size ||
            allTrips.length;
    }
}


// =========================================================
// BOOKING STATUS SUMMARY
// =========================================================

function updateBookingStatus(bookings) {

    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;
    let completed = 0;


    bookings.forEach(
        booking => {

            const status =
                normalizeStatus(
                    booking.booking_status
                );


            switch (status) {

                case "pending":
                    pending++;
                    break;

                case "confirmed":
                case "approved":
                    confirmed++;
                    break;

                case "cancelled":
                case "canceled":
                    cancelled++;
                    break;

                case "completed":
                    completed++;
                    break;

                default:
                    break;
            }
        }
    );


    if (pendingBookingsElement) {

        pendingBookingsElement.textContent =
            pending;
    }


    if (confirmedBookingsElement) {

        confirmedBookingsElement.textContent =
            confirmed;
    }


    if (cancelledBookingsElement) {

        cancelledBookingsElement.textContent =
            cancelled;
    }


    if (completedBookingsElement) {

        completedBookingsElement.textContent =
            completed;
    }
}


// =========================================================
// PAYMENT SUMMARY
// =========================================================

function updatePaymentSummary(bookings) {

    let paid = 0;
    let pending = 0;
    let failed = 0;


    bookings.forEach(
        booking => {

            const amount =
                Number(
                    booking.amount || 0
                );


            const status =
                normalizeStatus(
                    booking.payment_status
                );


            if (
                status === "paid" ||
                status === "successful" ||
                status === "completed"
            ) {

                paid += amount;

            } else if (
                status === "failed" ||
                status === "cancelled" ||
                status === "canceled"
            ) {

                failed += amount;

            } else {

                pending += amount;
            }
        }
    );


    const total =
        paid +
        pending +
        failed;


    if (paidAmountElement) {

        paidAmountElement.textContent =
            `₦${formatAmount(paid)}`;
    }


    if (pendingAmountElement) {

        pendingAmountElement.textContent =
            `₦${formatAmount(pending)}`;
    }


    if (failedAmountElement) {

        failedAmountElement.textContent =
            `₦${formatAmount(failed)}`;
    }


    if (paymentTotalElement) {

        paymentTotalElement.textContent =
            `₦${formatAmount(total)}`;
    }
}


// =========================================================
// TOP ROUTES
// =========================================================

function renderTopRoutes(bookings) {

    if (!topRoutesBody) {
        return;
    }


    if (!bookings.length) {

        topRoutesBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="table-loading"
                >
                    No route data available.
                </td>

            </tr>

        `;

        return;
    }


    const routes = {};


    bookings.forEach(
        booking => {

            const origin =
                booking.origin ||
                "Unknown";


            const destination =
                booking.destination ||
                "Unknown";


            const routeKey =
                `${origin} → ${destination}`;


            if (!routes[routeKey]) {

                routes[routeKey] = {

                    route:
                        routeKey,

                    bookings:
                        0,

                    revenue:
                        0
                };
            }


            routes[routeKey].bookings++;


            routes[routeKey].revenue +=
                Number(
                    booking.amount || 0
                );
        }
    );


    const sortedRoutes =
        Object.values(routes)
            .sort(
                (a, b) => {

                    return (
                        b.bookings -
                        a.bookings
                    );
                }
            )
            .slice(0, 10);


    topRoutesBody.innerHTML =
        sortedRoutes
            .map(
                (route, index) => `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    route.route
                                )}
                            </strong>
                        </td>

                        <td>
                            ${route.bookings}
                        </td>

                        <td>
                            ₦${formatAmount(
                                route.revenue
                            )}
                        </td>

                    </tr>

                `
            )
            .join("");
}


// =========================================================
// RECENT BOOKINGS
// =========================================================

function renderRecentBookings(bookings) {

    if (!recentBookingsBody) {
        return;
    }


    if (!bookings.length) {

        recentBookingsBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-loading"
                >
                    No bookings found.
                </td>

            </tr>

        `;

        return;
    }


    const recent =
        [...bookings]
            .sort(
                (a, b) => {

                    const dateA =
                        getBookingDate(a);


                    const dateB =
                        getBookingDate(b);


                    return (
                        (dateB?.getTime() || 0) -
                        (dateA?.getTime() || 0)
                    );
                }
            )
            .slice(0, 10);


    recentBookingsBody.innerHTML =
        recent
            .map(
                booking => {

                    const status =
                        normalizeStatus(
                            booking.booking_status
                        ) ||
                        "pending";


                    return `

                        <tr>

                            <td>

                                <strong
                                    class="booking-reference"
                                >
                                    ${escapeHTML(
                                        booking.booking_reference ||
                                        booking.reference ||
                                        "N/A"
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escapeHTML(
                                    booking.passenger_name ||
                                    "Unknown"
                                )}

                            </td>


                            <td>

                                ${escapeHTML(
                                    booking.origin ||
                                    "N/A"
                                )}

                                →

                                ${escapeHTML(
                                    booking.destination ||
                                    "N/A"
                                )}

                            </td>


                            <td>

                                ${formatDate(
                                    booking.departure_date
                                )}

                            </td>


                            <td>

                                ₦${formatAmount(
                                    booking.amount
                                )}

                            </td>


                            <td>

                                <span
                                    class="booking-status ${escapeHTML(
                                        status
                                    )}"
                                >

                                    ${escapeHTML(
                                        status
                                    )}

                                </span>

                            </td>

                        </tr>

                    `;
                }
            )
            .join("");
}


// =========================================================
// CHECK PAID
// =========================================================

function isPaid(status) {

    const value =
        normalizeStatus(status);


    return (
        value === "paid" ||
        value === "successful" ||
        value === "completed"
    );
}


// =========================================================
// GET BOOKING DATE
// =========================================================

function getBookingDate(booking) {

    if (!booking) {
        return null;
    }


    // =====================================================
    // DEPARTURE DATE
    // =====================================================

    if (booking.departure_date) {

        const date =
            String(
                booking.departure_date
            ).split("T")[0];


        const time =
            booking.departure_time ||
            "00:00:00";


        const result =
            new Date(
                `${date}T${time}`
            );


        if (
            !Number.isNaN(
                result.getTime()
            )
        ) {

            return result;
        }
    }


    // =====================================================
    // CREATED DATE
    // =====================================================

    if (booking.created_at) {

        const created =
            new Date(
                booking.created_at
            );


        if (
            !Number.isNaN(
                created.getTime()
            )
        ) {

            return created;
        }
    }


    return null;
}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase();
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return String(date);
    }


    return parsed.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================================
// FORMAT MONEY
// =========================================================

function formatAmount(amount) {

    const value =
        Number(
            amount || 0
        );


    return value.toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


// =========================================================
// TABLE LOADING
// =========================================================

function showTableLoading(
    element,
    colspan,
    message
) {

    if (!element) {
        return;
    }


    element.innerHTML = `

        <tr>

            <td
                colspan="${colspan}"
                class="table-loading"
            >
                ${escapeHTML(message)}
            </td>

        </tr>

    `;
}


// =========================================================
// TABLE ERROR
// =========================================================

function showTableError(
    element,
    colspan,
    message
) {

    if (!element) {
        return;
    }


    element.innerHTML = `

        <tr>

            <td
                colspan="${colspan}"
                class="table-loading"
            >
                ${escapeHTML(message)}
            </td>

        </tr>

    `;
}


// =========================================================
// DISPLAY USER
// =========================================================

function displayUser() {

    if (!currentUser) {
        return;
    }


    const userNameElement =
        document.getElementById(
            "userName"
        );


    const userRoleElement =
        document.getElementById(
            "userRole"
        );


    const avatarElement =
        document.getElementById(
            "avatar"
        );


    const name =
        currentUser.full_name ||
        currentUser.name ||
        "Administrator";


    const role =
        currentUser.role ||
        "Administrator";


    if (userNameElement) {

        userNameElement.textContent =
            name;
    }


    if (userRoleElement) {

        userRoleElement.textContent =
            role;
    }


    if (avatarElement) {

        avatarElement.textContent =
            getInitials(
                name
            );
    }
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

    const words =
        String(
            name || ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {
        return "AD";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


// =========================================================
// MOBILE MENU
// =========================================================

function setupMobileMenu() {

    if (
        !menuButton ||
        !sidebar
    ) {

        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );
        }
    );
}


// =========================================================
// LOGOUT
// =========================================================

function setupLogout() {

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


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


// =========================================================
// PRINT REPORT
// =========================================================

if (printReportButton) {

    printReportButton.addEventListener(
        "click",
        () => {

            window.print();
        }
    );
}


// =========================================================
// INITIALIZE
// =========================================================

async function initializeReports() {

    console.log(
        "Initializing TransitPro Reports..."
    );


    displayUser();


    setupMobileMenu();


    setupLogout();


    await loadReportData();


    console.log(
        "TransitPro Reports loaded successfully."
    );
}


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeReports
);