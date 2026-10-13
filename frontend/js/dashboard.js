// ==========================================
// TRANSITPRO DASHBOARD JAVASCRIPT
// ==========================================

const API_URL = "";


// ==========================================
// AUTHENTICATION
// ==========================================

const token = localStorage.getItem("token");

const storedUser = localStorage.getItem("user");

let user = null;

try {
    user = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
    console.error("Invalid user data:", error);
}


// Protect dashboard
if (!token || !user) {
    window.location.href = "login.html";
}


// ==========================================
// DISPLAY USER INFORMATION
// ==========================================

function displayUser() {

    if (!user) {
        return;
    }

    const welcomeElement =
        document.getElementById("welcome");

    const userNameElement =
        document.getElementById("userName");

    const userRoleElement =
        document.getElementById("userRole");

    const avatarElement =
        document.getElementById("avatar");


    if (welcomeElement) {

        welcomeElement.textContent =
            `Welcome back, ${user.full_name}`;

    }


    if (userNameElement) {

        userNameElement.textContent =
            user.full_name;

    }


    if (userRoleElement) {

        userRoleElement.textContent =
            user.role;

    }


    if (avatarElement) {

        const initials =
            user.full_name
                .split(" ")
                .map(name => name.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();

        avatarElement.textContent =
            initials;

    }

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logout");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// API REQUEST HELPER
// ==========================================

async function apiRequest(endpoint) {

    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return null;
        }


        const data =
            await response.json();


        return data;

    } catch (error) {

        console.error(
            "API request failed:",
            error
        );

        return null;

    }

}


// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================
async function loadStatistics() {

    try {

        const result = await apiRequest(
            "/api/dashboard/stats"
        );

        if (!result || !result.success) {
            console.warn("Could not load dashboard statistics");
            return;
        }

        const data = result.data;

        document.getElementById("totalBuses").textContent =
            data.availableBuses ?? 0;

        document.getElementById("totalBookings").textContent =
            data.totalBookings ?? 0;

        document.getElementById("activeTrips").textContent =
            data.todayTrips ?? 0;

        document.getElementById("totalPassengers").textContent =
            data.totalPassengers ?? 0;

    } catch (error) {

        console.error(
            "Statistics loading error:",
            error
        );

    }
}




// ==========================================
// MOBILE SIDEBAR
// ==========================================

function setupMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");


    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );

}


// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayUser();

        setupLogout();

        setupMobileMenu();

        loadStatistics();

        loadRecentBookings();

        loadUpcomingTrips();


    }
);

// ==========================================
// LOAD RECENT BOOKINGS
// ==========================================

async function loadRecentBookings() {

    const loading =
        document.getElementById(
            "recentBookingsLoading"
        );

    const empty =
        document.getElementById(
            "recentBookingsEmpty"
        );

    const list =
        document.getElementById(
            "recentBookingsList"
        );


    if (!loading || !empty || !list) {
        return;
    }


    try {

        const result =
            await apiRequest(
                "/api/dashboard/recent-bookings"
            );


        loading.style.display = "none";


        if (
            !result ||
            !result.success ||
            !Array.isArray(result.data) ||
            result.data.length === 0
        ) {

            empty.style.display = "flex";

            return;
        }


        list.innerHTML = "";


        result.data.forEach(
            booking => {

                const item =
                    document.createElement("div");

                item.className =
                    "booking-row";


                const status =
                    booking.booking_status || "pending";


                item.innerHTML = `

                    <div class="booking-passenger">

                        <div class="booking-avatar">
                            ${getInitials(
                                booking.passenger_name
                            )}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    booking.passenger_name || "Unknown"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    booking.booking_reference || "N/A"
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="booking-route">

                        <strong>
                            ${escapeHTML(
                                booking.origin || "N/A"
                            )}
                        </strong>

                        <span>→</span>

                        <strong>
                            ${escapeHTML(
                                booking.destination || "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="booking-seat">

                        Seat
                        <strong>
                            ${escapeHTML(
                                String(
                                    booking.seat_number || "-"
                                )
                            )}
                        </strong>

                    </div>


                    <div class="booking-status ${getStatusClass(status)}">

                        ${escapeHTML(status)}

                    </div>

                `;


                list.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Recent bookings error:",
            error
        );

        loading.style.display = "none";

        empty.style.display = "flex";

    }

}


// ==========================================
// HELPERS
// ==========================================

function getInitials(name) {

    if (!name) {
        return "NA";
    }


    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


function getStatusClass(status) {

    const value =
        String(status)
            .toLowerCase();


    if (value === "confirmed") {
        return "status-confirmed";
    }

    if (value === "cancelled") {
        return "status-cancelled";
    }

    if (value === "completed") {
        return "status-completed";
    }

    return "status-pending";

}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}
///////////////
// ==========================================
// LOAD UPCOMING TRIPS
// ==========================================

async function loadUpcomingTrips() {

    const loading =
        document.getElementById(
            "upcomingTripsLoading"
        );

    const empty =
        document.getElementById(
            "upcomingTripsEmpty"
        );

    const list =
        document.getElementById(
            "upcomingTripsList"
        );


    if (!loading || !empty || !list) {
        return;
    }


    try {

        const result =
            await apiRequest(
                "/api/dashboard/upcoming-trips"
            );


        loading.style.display = "none";


        if (
            !result ||
            !result.success ||
            !Array.isArray(result.data) ||
            result.data.length === 0
        ) {

            empty.style.display = "flex";

            return;
        }


        list.innerHTML = "";


        result.data.forEach(
            trip => {

                const item =
                    document.createElement("div");

                item.className =
                    "trip-row";


                item.innerHTML = `

                    <div class="trip-date">

                        <strong>
                            ${formatTripDate(
                                trip.departure_date
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                trip.departure_time || "--:--"
                            )}
                        </span>

                    </div>


                    <div class="trip-route">

                        <strong>
                            ${escapeHTML(
                                trip.origin || "N/A"
                            )}
                        </strong>

                        <span>
                            →
                        </span>

                        <strong>
                            ${escapeHTML(
                                trip.destination || "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="trip-bus">

                        <span>
                            Bus
                        </span>

                        <strong>
                            ${escapeHTML(
                                trip.bus_number || "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="trip-driver">

                        <span>
                            Driver
                        </span>

                        <strong>
                            ${escapeHTML(
                                trip.driver_name || "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="trip-status">

                        ${escapeHTML(
                            trip.trip_status || "scheduled"
                        )}

                    </div>

                `;


                list.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Upcoming trips error:",
            error
        );

        loading.style.display = "none";

        empty.style.display = "flex";

    }

}


// ==========================================
// FORMAT TRIP DATE
// ==========================================

function formatTripDate(date) {

    if (!date) {
        return "N/A";
    }


    const tripDate =
        new Date(date);


    if (Number.isNaN(
        tripDate.getTime()
    )) {

        return date;

    }


    return tripDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}
