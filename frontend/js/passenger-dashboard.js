// =========================================================
// TRANSITPRO
// PASSENGER DASHBOARD JAVASCRIPT
// =========================================================


// =========================================================
// API
// =========================================================
const API_URL = "/api";


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

    console.error(
        "Invalid stored user:",
        error
    );

    currentUser = null;
}


// =========================================================
// PROTECT DASHBOARD
// =========================================================

if (!token || !currentUser) {

    window.location.href = "login.html";
}


// =========================================================
// GLOBAL DATA
// =========================================================

let currentPassenger = null;

let allBookings = [];


// =========================================================
// DOM ELEMENTS
// =========================================================

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


// User information

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const userName =
    document.getElementById(
        "userName"
    );

const userPhone =
    document.getElementById(
        "userPhone"
    );

const welcomeName =
    document.getElementById(
        "welcomeName"
    );


// Statistics

const totalBookingsElement =
    document.getElementById(
        "totalBookings"
    );

const confirmedBookingsElement =
    document.getElementById(
        "confirmedBookings"
    );

const pendingPaymentsElement =
    document.getElementById(
        "pendingPayments"
    );

const upcomingTripsElement =
    document.getElementById(
        "upcomingTrips"
    );


// Upcoming trip

const upcomingTripElement =
    document.getElementById(
        "upcomingTrip"
    );


// Recent bookings

const recentBookingsBody =
    document.getElementById(
        "recentBookingsBody"
    );


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    try {

        const headers = {

            "Content-Type":
                "application/json",

            ...(options.headers || {})

        };


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }


        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );


        // =================================================
        // UNAUTHORIZED
        // =================================================

        if (response.status === 401) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return null;
        }


        // =================================================
        // READ RESPONSE
        // =================================================

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Request failed"
            );
        }


        return data;

    } catch (error) {

        console.error(
            "API Request Error:",
            error
        );

        throw error;
    }
}


// =========================================================
// GET INITIAL USER
// =========================================================

function getInitialUser() {

    if (!currentUser) {
        return null;
    }


    return {

        id:
            currentUser.id || null,

        full_name:
            currentUser.full_name ||
            "Passenger",

        email:
            currentUser.email ||
            "",

        phone:
            currentUser.phone ||
            "",

        role:
            currentUser.role ||
            "passenger"

    };
}


// =========================================================
// DISPLAY USER INFORMATION
// =========================================================

function displayUser() {

    const user =
        getInitialUser();


    if (!user) {
        return;
    }


    // =====================================================
    // USER NAME
    // =====================================================

    if (userName) {

        userName.textContent =
            user.full_name;
    }


    // =====================================================
    // PHONE
    // =====================================================

    if (userPhone) {

        userPhone.textContent =
            user.phone ||
            user.email ||
            "Passenger";
    }


    // =====================================================
    // WELCOME NAME
    // =====================================================

    if (welcomeName) {

        welcomeName.textContent =
            `Welcome, ${user.full_name}`;
    }


    // =====================================================
    // AVATAR
    // =====================================================

    if (userAvatar) {

        userAvatar.textContent =
            getInitials(
                user.full_name
            );
    }
}


// =========================================================
// GET INITIALS
// =========================================================

function getInitials(name) {

    if (!name) {
        return "P";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


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
// LOAD PASSENGER PROFILE
// =========================================================
//
// Uses /passengers/me so a passenger does not need
// admin/staff permission to load the profile.
// =========================================================

async function loadPassengerProfile() {

    try {

        const result =
            await apiRequest(
                "/passengers/me"
            );


        if (
            !result ||
            !result.success
        ) {

            console.warn(
                "Unable to load passenger profile."
            );

            return;
        }


        if (result.data) {

            currentPassenger =
                result.data;


            console.log(
                "Passenger found:",
                currentPassenger
            );


            // Update displayed information
            if (userName) {

                userName.textContent =
                    currentPassenger.full_name ||
                    "Passenger";
            }


            if (userPhone) {

                userPhone.textContent =
                    currentPassenger.phone ||
                    currentPassenger.email ||
                    "Passenger";
            }


            if (welcomeName) {

                welcomeName.textContent =
                    `Welcome, ${
                        currentPassenger.full_name ||
                        "Passenger"
                    }`;
            }


            if (userAvatar) {

                userAvatar.textContent =
                    getInitials(
                        currentPassenger.full_name ||
                        "Passenger"
                    );
            }
        }

    } catch (error) {

        console.error(
            "Passenger profile error:",
            error
        );
    }
}


// =========================================================
// NORMALIZE PHONE
// =========================================================

function normalizePhone(phone) {

    if (!phone) {
        return "";
    }


    return String(phone)
        .replace(/\s+/g, "")
        .replace(/-/g, "");
}

// =========================================================
// BOOKING UI STATE
// =========================================================

let filteredBookings = [];


// =========================================================
// SHOW LOADING
// =========================================================

function showLoading() {

    if (!recentBookingsBody) {
        return;
    }

    recentBookingsBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="table-loading"
            >
                Loading your bookings...
            </td>
        </tr>
    `;
}


// =========================================================
// HIDE LOADING
// =========================================================

function hideLoading() {
    // Nothing required here.
    // renderRecentBookings() will replace the loading row.
}


// =========================================================
// SHOW ERROR
// =========================================================

function showError(message) {

    if (!recentBookingsBody) {
        return;
    }

    recentBookingsBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="table-loading"
            >
                ${escapeHTML(
                    message ||
                    "Unable to load your bookings."
                )}
            </td>
        </tr>
    `;
}


// =========================================================
// HIDE ERROR
// =========================================================

function hideError() {
    // Error message will be replaced
    // when bookings are rendered.
}


// =========================================================
// APPLY FILTERS
// =========================================================

function applyFilters() {

    // Currently no filters are required
    // on the main passenger dashboard.

    filteredBookings =
        [...allBookings];

    renderUpcomingTrip();

    renderRecentBookings();
}
// =========================================================
// =========================================================
// LOAD PASSENGER BOOKINGS
// =========================================================
// =========================================================
// LOAD PASSENGER BOOKINGS
// =========================================================

async function loadBookings() {

    showLoading();

    try {

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
                "Unable to load your bookings."
            );
        }


        // ==========================================
        // STORE BOOKINGS
        // ==========================================

        if (
            Array.isArray(
                result.data
            )
        ) {

            allBookings =
                result.data;

        } else {

            allBookings = [];

        }


        // ==========================================
        // COPY FOR FILTERING
        // ==========================================

        filteredBookings =
            [...allBookings];


        // ==========================================
        // UPDATE DASHBOARD
        // ==========================================

        updateStatistics();

        renderUpcomingTrip();

        renderRecentBookings();


        hideLoading();

        hideError();


        console.log(
            "Passenger bookings loaded:",
            allBookings
        );


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








// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics() {

    const total =
        allBookings.length;


    // =====================================================
    // CONFIRMED
    // =====================================================

    const confirmed =
        allBookings.filter(
            booking => {

                const status =
                    String(
                        booking.booking_status ||
                        ""
                    ).toLowerCase();

                return (
                    status === "confirmed" ||
                    status === "approved"
                );
            }
        ).length;


    // =====================================================
    // PENDING PAYMENTS
    // =====================================================

    const pendingPayments =
        allBookings.filter(
            booking => {

                const paymentStatus =
                    String(
                        booking.payment_status ||
                        ""
                    ).toLowerCase();

                return (
                    paymentStatus === "pending" ||
                    paymentStatus === "" ||
                    paymentStatus === "unpaid"
                );
            }
        ).length;


    // =====================================================
    // UPCOMING TRIPS
    // =====================================================

    const upcoming =
        getUpcomingBookings();


    // =====================================================
    // DISPLAY
    // =====================================================

    if (totalBookingsElement) {

        totalBookingsElement.textContent =
            total;
    }


    if (confirmedBookingsElement) {

        confirmedBookingsElement.textContent =
            confirmed;
    }


    if (pendingPaymentsElement) {

        pendingPaymentsElement.textContent =
            pendingPayments;
    }


    if (upcomingTripsElement) {

        upcomingTripsElement.textContent =
            upcoming.length;
    }
}


// =========================================================
// GET UPCOMING BOOKINGS
// =========================================================

function getUpcomingBookings() {

    const now =
        new Date();


    return allBookings
        .filter(
            booking => {

                const date =
                    getBookingDate(
                        booking
                    );


                if (!date) {
                    return false;
                }


                const status =
                    String(
                        booking.booking_status ||
                        ""
                    ).toLowerCase();


                if (
                    status === "cancelled"
                ) {

                    return false;
                }


                return date >= now;
            }
        )
        .sort(
            (a, b) => {

                return (
                    getBookingDate(a) -
                    getBookingDate(b)
                );
            }
        );
}


// =========================================================
// GET BOOKING DATE
// =========================================================

function getBookingDate(booking) {

    if (!booking) {
        return null;
    }


    if (
        !booking.departure_date
    ) {

        return null;
    }


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
        Number.isNaN(
            result.getTime()
        )
    ) {

        return null;
    }


    return result;
}


// =========================================================
// RENDER UPCOMING TRIP
// =========================================================

function renderUpcomingTrip() {

    if (!upcomingTripElement) {
        return;
    }


    const upcoming =
        getUpcomingBookings();


    if (!upcoming.length) {

        upcomingTripElement.innerHTML = `

            <div class="empty-trip">

                <div class="empty-icon">
                    🚌
                </div>

                <h4>
                    No upcoming trip
                </h4>

                <p>
                    You don't have any
                    upcoming journey yet.
                </p>

                <a
                    href="passenger-routes.html"
                    class="small-button"
                >
                    Find a Trip
                </a>

            </div>

        `;

        return;
    }


    const booking =
        upcoming[0];


    upcomingTripElement.innerHTML = `

        <div class="upcoming-trip-content">

            <div class="trip-route">

                <div class="trip-location">

                    <span>
                        FROM
                    </span>

                    <strong>
                        ${escapeHTML(
                            booking.origin ||
                            "N/A"
                        )}
                    </strong>

                </div>


                <div class="trip-arrow">
                    →
                </div>


                <div class="trip-location">

                    <span>
                        TO
                    </span>

                    <strong>
                        ${escapeHTML(
                            booking.destination ||
                            "N/A"
                        )}
                    </strong>

                </div>

            </div>


            <div class="trip-details">

                <div>
                    📅
                    ${formatDate(
                        booking.departure_date
                    )}
                </div>

                <div>
                    🕐
                    ${formatTime(
                        booking.departure_time
                    )}
                </div>

                <div>
                    💺 Seat
                    ${escapeHTML(
                        String(
                            booking.seat_number ||
                            "-"
                        )
                    )}
                </div>

            </div>


            <div class="trip-bottom">

                <span class="booking-reference">
                    ${escapeHTML(
                        booking.booking_reference ||
                        "Booking"
                    )}
                </span>

                <span class="booking-status ${getStatusClass(
                    booking.booking_status
                )}">
                    ${escapeHTML(
                        booking.booking_status ||
                        "pending"
                    )}
                </span>

            </div>

        </div>

    `;
}


// =========================================================
// RENDER RECENT BOOKINGS
// =========================================================

function renderRecentBookings() {

    if (!recentBookingsBody) {
        return;
    }


    if (!allBookings.length) {

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


    // =====================================================
    // SORT NEWEST FIRST
    // =====================================================

    const recentBookings =
        [...allBookings]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at ||
                            a.departure_date ||
                            0
                        );

                    const dateB =
                        new Date(
                            b.created_at ||
                            b.departure_date ||
                            0
                        );

                    return dateB - dateA;
                }
            )
            .slice(0, 5);


    recentBookingsBody.innerHTML =
        recentBookings
            .map(
                booking => `

                    <tr>

                        <td>

                            <strong
                                class="booking-reference"
                            >
                                ${escapeHTML(
                                    booking.booking_reference ||
                                    "N/A"
                                )}
                            </strong>

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

                            ${escapeHTML(
                                String(
                                    booking.seat_number ||
                                    "-"
                                )
                            )}

                        </td>


                        <td>

                            ₦${formatAmount(
                                booking.amount
                            )}

                        </td>


                        <td>

                            <span
                                class="booking-status ${getStatusClass(
                                    booking.booking_status
                                )}"
                            >

                                ${escapeHTML(
                                    booking.booking_status ||
                                    "pending"
                                )}

                            </span>

                        </td>

                    </tr>

                `
            )
            .join("");
}


// =========================================================
// SHOW BOOKINGS ERROR
// =========================================================

function showBookingsError(message) {

    if (!recentBookingsBody) {
        return;
    }


    recentBookingsBody.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="table-loading"
            >

                ${escapeHTML(
                    message
                )}

            </td>

        </tr>

    `;
}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {

    const value =
        String(
            status ||
            "pending"
        ).toLowerCase();


    return value;
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
// FORMAT TIME
// =========================================================

function formatTime(time) {

    if (!time) {
        return "N/A";
    }


    const parts =
        String(time).split(":");


    if (parts.length < 2) {

        return String(time);
    }


    let hour =
        Number(parts[0]);


    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;
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
// MOBILE SIDEBAR
// =========================================================

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


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                closeMobileMenu
            );
        }
    );
}


// =========================================================
// CLOSE MOBILE MENU
// =========================================================

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
// INITIALIZE DASHBOARD
// =========================================================

async function initializeDashboard() {

    console.log(
        "Initializing Passenger Dashboard..."
    );


    // Display stored user immediately
    displayUser();


    // Setup controls
    setupMobileMenu();

    setupLogout();


    // Find passenger profile
    await loadPassengerProfile();


    // Load passenger bookings
    await loadBookings();


    console.log(
        "Passenger Dashboard loaded successfully."
    );
}


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);