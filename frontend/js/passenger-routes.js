// ==========================================
// DOM ELEMENTS
// ==========================================

const passengerSidebar =
    document.getElementById("passengerSidebar");

const menuButton =
    document.getElementById("menuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutButton =
    document.getElementById("logoutButton");

const userName =
    document.getElementById("userName");

const userPhone =
    document.getElementById("userPhone");

const userAvatar =
    document.getElementById("userAvatar");

const routeSearchForm =
    document.getElementById("routeSearchForm");

const originInput =
    document.getElementById("origin");

const destinationInput =
    document.getElementById("destination");

const departureDateInput =
    document.getElementById("departureDate");

const searchButton =
    document.getElementById("searchButton");

const clearSearch =
    document.getElementById("clearSearch");

const retryButton =
    document.getElementById("retryButton");

const showAllButton =
    document.getElementById("showAllButton");

const routesGrid =
    document.getElementById("routesGrid");

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const emptyState =
    document.getElementById("emptyState");

const resultsCount =
    document.getElementById("resultsCount");


// ==========================================
// DATA
// ==========================================

let allTrips = [];


// ==========================================
// GET LOGGED-IN USER
// ==========================================

function getCurrentUser() {

    const storedUser =
        localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(
            storedUser
        );

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        return null;
    }
}


// ==========================================
// PROTECT PAGE
// ==========================================

function protectPage() {

    const token =
        localStorage.getItem("token");

    const user =
        getCurrentUser();

    if (!token || !user) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ==========================================
// DISPLAY USER
// ==========================================

function displayUser() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    if (userName) {

        userName.textContent =
            user.full_name ||
            "Passenger";
    }


    if (userPhone) {

        userPhone.textContent =
            user.phone ||
            "Passenger";
    }


    if (userAvatar) {

        const fullName =
            user.full_name ||
            "Passenger";


        const initials =
            fullName
                .split(" ")
                .filter(Boolean)
                .map(
                    name =>
                        name
                            .charAt(0)
                            .toUpperCase()
                )
                .join("")
                .substring(0, 2);


        userAvatar.textContent =
            initials || "P";
    }
}


// ==========================================
// MOBILE MENU
// ==========================================

function openMobileMenu() {

    if (passengerSidebar) {

        passengerSidebar.classList.add(
            "open"
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );
    }
}


function closeMobileMenu() {

    if (passengerSidebar) {

        passengerSidebar.classList.remove(
            "open"
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );
    }
}


function setupMobileMenu() {

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openMobileMenu
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeMobileMenu
        );
    }
}


// ==========================================
// LOGOUT
// ==========================================

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


// ==========================================
// LOAD TRIPS
// ==========================================

async function loadTrips() {

    showLoading();

    hideError();

    hideEmpty();


    try {

        const data =
            await apiRequest(
                "/trips"
            );


        if (
            !data ||
            !data.success
        ) {

            throw new Error(
                data?.message ||
                "Unable to load trips."
            );
        }


        allTrips =
            Array.isArray(data.data)
                ? data.data
                : [];


        renderTrips(
            allTrips
        );


    } catch (error) {

        console.error(
            "Load trips error:",
            error
        );


        showError(
            error.message ||
            "Unable to load available trips."
        );
    }
}


// ==========================================
// RENDER TRIPS
// ==========================================

function renderTrips(trips) {

    hideLoading();

    hideError();


    if (resultsCount) {

        resultsCount.textContent =
            trips.length;
    }


    if (!routesGrid) {
        return;
    }


    routesGrid.innerHTML = "";


    if (!trips.length) {

        showEmpty();

        return;
    }


    hideEmpty();


    trips.forEach(
        trip => {

            const card =
                createTripCard(
                    trip
                );


            routesGrid.appendChild(
                card
            );
        }
    );
}


// ==========================================
// CREATE TRIP CARD
// ==========================================

function createTripCard(trip) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "route-card";


    const availableSeats =
        Number(
            trip.available_seats ?? 0
        );


    const fare =
        Number(
            trip.fare ?? 0
        );


    const origin =
        trip.origin ||
        "Unknown";


    const destination =
        trip.destination ||
        "Unknown";


    const departureDate =
        formatDate(
            trip.departure_date
        );


    const departureTime =
        formatTime(
            trip.departure_time
        );


    const isAvailable =
        availableSeats > 0;


    card.innerHTML = `

        <div class="route-card-top">

            <div class="route-bus-icon">
                🚌
            </div>

            <span
                class="availability-badge ${
                    isAvailable
                        ? "available"
                        : "full"
                }"
            >
                ${
                    isAvailable
                        ? "Available"
                        : "Fully Booked"
                }
            </span>

        </div>


        <div class="route-path">

            <div class="route-location">

                <span class="route-dot"></span>

                <div>

                    <small>
                        FROM
                    </small>

                    <strong>
                        ${escapeHTML(origin)}
                    </strong>

                </div>

            </div>


            <div class="route-line"></div>


            <div class="route-location">

                <span class="route-dot destination-dot"></span>

                <div>

                    <small>
                        TO
                    </small>

                    <strong>
                        ${escapeHTML(destination)}
                    </strong>

                </div>

            </div>

        </div>


        <div class="route-details">

            <div class="route-detail">

                <span>
                    📅
                </span>

                <div>

                    <small>
                        Date
                    </small>

                    <strong>
                        ${departureDate}
                    </strong>

                </div>

            </div>


            <div class="route-detail">

                <span>
                    🕐
                </span>

                <div>

                    <small>
                        Departure
                    </small>

                    <strong>
                        ${departureTime}
                    </strong>

                </div>

            </div>


            <div class="route-detail">

                <span>
                    💺
                </span>

                <div>

                    <small>
                        Seats
                    </small>

                    <strong>
                        ${availableSeats}
                    </strong>

                </div>

            </div>

        </div>


        <div class="route-card-footer">

            <div class="route-fare">

                <small>
                    Ticket Fare
                </small>

                <strong>
                    ₦${formatAmount(fare)}
                </strong>

            </div>


            <button
                type="button"
                class="book-trip-button"
                data-trip-id="${trip.id}"
                ${
                    !isAvailable
                        ? "disabled"
                        : ""
                }
            >

                ${
                    isAvailable
                        ? "🎫 Book Now"
                        : "Fully Booked"
                }

            </button>

        </div>

    `;


    const bookButton =
        card.querySelector(
            ".book-trip-button"
        );


    if (
        bookButton &&
        isAvailable
    ) {

        bookButton.addEventListener(
            "click",
            () => {

                handleBooking(
                    trip
                );
            }
        );
    }


    return card;
}


// ==========================================
// HANDLE PASSENGER BOOKING
// ==========================================

async function handleBooking(trip) {

    if (!trip || !trip.id) {

        alert(
            "Invalid trip selected."
        );

        return;
    }


    // ======================================
    // CHECK AVAILABLE SEATS
    // ======================================

    const availableSeats =
        Number(
            trip.available_seats ?? 0
        );


    if (availableSeats <= 0) {

        alert(
            "Sorry, this trip is fully booked."
        );

        return;
    }


    // ======================================
    // GET PASSENGER PROFILE
    // ======================================

    try {

        const passengerResult =
            await apiRequest(
                "/passengers/me"
            );


        if (
            !passengerResult ||
            passengerResult.success === false
        ) {

            throw new Error(
                passengerResult?.message ||
                "Unable to load your passenger profile."
            );
        }


        const passenger =
            passengerResult.data;


        if (
            !passenger ||
            !passenger.id
        ) {

            throw new Error(
                "Passenger profile was not found."
            );
        }


        // ==================================
        // ASK FOR SEAT NUMBER
        // ==================================

        const seatInput =
            prompt(
                `Enter your seat number.\n\n` +
                `Available seats: ${availableSeats}`
            );


        // User cancelled
        if (seatInput === null) {

            return;
        }


        const seatNumber =
            Number(
                seatInput
            );


        // ==================================
        // VALIDATE SEAT
        // ==================================

        if (
            !Number.isInteger(
                seatNumber
            ) ||
            seatNumber < 1
        ) {

            alert(
                "Please enter a valid seat number."
            );

            return;
        }


        // ==================================
        // CHECK TOTAL SEATS
        // ==================================

        if (
            trip.total_seats !== undefined &&
            trip.total_seats !== null &&
            seatNumber >
                Number(
                    trip.total_seats
                )
        ) {

            alert(
                `Seat number cannot be greater than ` +
                `${trip.total_seats}.`
            );

            return;
        }


        // ==================================
        // BUTTON
        // ==================================

        const button =
            document.querySelector(
                `.book-trip-button[data-trip-id="${trip.id}"]`
            );


        const originalText =
            button
                ? button.textContent
                : "🎫 Book Now";


        if (button) {

            button.disabled = true;

            button.textContent =
                "Creating Booking...";
        }


        // ==================================
        // CREATE BOOKING
        // ==================================

        const bookingResult =
            await apiRequest(
                "/bookings",
                {
                    method: "POST",

                    body: JSON.stringify({

                        passenger_id:
                            Number(
                                passenger.id
                            ),

                        trip_id:
                            Number(
                                trip.id
                            ),

                        seat_number:
                            seatNumber,

                        amount:
                            Number(
                                trip.fare || 0
                            ),

                        payment_status:
                            "pending",

                        booking_status:
                            "pending",

                        booked_by:
                            getCurrentUser()?.id ||
                            null

                    })
                }
            );


        // ==================================
        // SUCCESS
        // ==================================

        if (
            !bookingResult ||
            bookingResult.success === false
        ) {

            throw new Error(
                bookingResult?.message ||
                "Unable to create booking."
            );
        }


        // ==================================
        // SUCCESS MESSAGE
        // ==================================

        const booking =
            bookingResult.data || {};


        const reference =
            booking.booking_reference ||
            booking.reference ||
            "N/A";


        alert(
            `Booking created successfully!\n\n` +
            `Booking Reference: ${reference}\n` +
            `Seat: ${seatNumber}\n` +
            `Amount: ₦${formatAmount(
                trip.fare
            )}\n\n` +
            `Your booking is currently pending payment.`
        );


        // ==================================
        // GO TO MY BOOKINGS
        // ==================================

        window.location.href =
            "passenger-bookings.html";


    } catch (error) {

        console.error(
            "Passenger booking error:",
            error
        );


        alert(
            error.message ||
            "Unable to create booking."
        );


        // ==================================
        // RESTORE BUTTON
        // ==================================

        const button =
            document.querySelector(
                `.book-trip-button[data-trip-id="${trip.id}"]`
            );


        if (button) {

            button.disabled = false;

            button.textContent =
                "🎫 Book Now";
        }

    }

}






// ==========================================
// SEARCH
// ==========================================

function searchTrips() {

    const origin =
        originInput
            ? originInput.value
                .trim()
                .toLowerCase()
            : "";


    const destination =
        destinationInput
            ? destinationInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedDate =
        departureDateInput
            ? departureDateInput.value
            : "";


    const filteredTrips =
        allTrips.filter(
            trip => {

                const tripOrigin =
                    String(
                        trip.origin || ""
                    )
                        .trim()
                        .toLowerCase();


                const tripDestination =
                    String(
                        trip.destination || ""
                    )
                        .trim()
                        .toLowerCase();


                const tripDate =
                    normalizeDate(
                        trip.departure_date
                    );


                const matchesOrigin =
                    !origin ||
                    tripOrigin.includes(
                        origin
                    );


                const matchesDestination =
                    !destination ||
                    tripDestination.includes(
                        destination
                    );


                const matchesDate =
                    !selectedDate ||
                    tripDate ===
                        selectedDate;


                return (
                    matchesOrigin &&
                    matchesDestination &&
                    matchesDate
                );
            }
        );


    renderTrips(
        filteredTrips
    );
}


// ==========================================
// SEARCH FORM
// ==========================================

function setupSearch() {

    if (!routeSearchForm) {
        return;
    }


    routeSearchForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            setSearchLoading(
                true
            );

            setTimeout(
                () => {

                    searchTrips();

                    setSearchLoading(
                        false
                    );

                },
                250
            );
        }
    );
}


// ==========================================
// CLEAR SEARCH
// ==========================================

function setupClearSearch() {

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                if (originInput) {
                    originInput.value = "";
                }

                if (destinationInput) {
                    destinationInput.value = "";
                }

                if (departureDateInput) {
                    departureDateInput.value = "";
                }

                renderTrips(
                    allTrips
                );
            }
        );
    }


    if (showAllButton) {

        showAllButton.addEventListener(
            "click",
            () => {

                if (originInput) {
                    originInput.value = "";
                }

                if (destinationInput) {
                    destinationInput.value = "";
                }

                if (departureDateInput) {
                    departureDateInput.value = "";
                }

                renderTrips(
                    allTrips
                );
            }
        );
    }
}


// ==========================================
// RETRY
// ==========================================

function setupRetry() {

    if (!retryButton) {
        return;
    }


    retryButton.addEventListener(
        "click",
        loadTrips
    );
}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    if (loadingState) {

        loadingState.style.display =
            "flex";
    }


    if (routesGrid) {

        routesGrid.style.display =
            "none";
    }
}


function hideLoading() {

    if (loadingState) {

        loadingState.style.display =
            "none";
    }


    if (routesGrid) {

        routesGrid.style.display =
            "grid";
    }
}


function setSearchLoading(
    loading
) {

    if (!searchButton) {
        return;
    }


    searchButton.disabled =
        loading;


    searchButton.textContent =
        loading
            ? "Searching..."
            : "🔍 Search Trips";
}


// ==========================================
// ERROR
// ==========================================

function showError(message) {

    hideLoading();

    hideEmpty();


    if (routesGrid) {

        routesGrid.innerHTML = "";

        routesGrid.style.display =
            "none";
    }


    if (errorMessage) {

        errorMessage.textContent =
            message;
    }


    if (errorState) {

        errorState.style.display =
            "block";
    }
}


function hideError() {

    if (errorState) {

        errorState.style.display =
            "none";
    }
}


// ==========================================
// EMPTY
// ==========================================

function showEmpty() {

    if (emptyState) {

        emptyState.style.display =
            "block";
    }


    if (routesGrid) {

        routesGrid.style.display =
            "none";
    }
}


function hideEmpty() {

    if (emptyState) {

        emptyState.style.display =
            "none";
    }
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return String(date);
    }


    return parsedDate.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==========================================
// NORMALIZE DATE
// ==========================================

function normalizeDate(date) {

    if (!date) {
        return "";
    }


    /*
        Handles:
        2026-08-12
        2026-08-12T00:00:00.000Z
    */

    const value =
        String(date);


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        return value;
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return value.substring(
            0,
            10
        );
    }


    const year =
        parsedDate.getFullYear();


    const month =
        String(
            parsedDate.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            parsedDate.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(time) {

    if (!time) {
        return "N/A";
    }


    const value =
        String(time);


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


// ==========================================
// FORMAT AMOUNT
// ==========================================

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


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!protectPage()) {
            return;
        }


        displayUser();

        setupMobileMenu();

        setupLogout();

        setupSearch();

        setupClearSearch();

        setupRetry();

        loadTrips();

    }
);