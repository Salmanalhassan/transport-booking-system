// ==========================================
// TRANSITPRO BOOKINGS
// ==========================================

const API_URL = "http://localhost:5000";

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

// Protect page
if (!token || !user) {
    window.location.href = "login.html";
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const tableBody =
    document.getElementById("bookingsTableBody");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const logoutButton =
    document.getElementById("logout");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");


// ==========================================
// BOOKING MODAL
// ==========================================

const newBookingBtn =
    document.getElementById("newBookingBtn");

const bookingModal =
    document.getElementById("bookingModal");

const closeBookingModal =
    document.getElementById("closeBookingModal");

const cancelBookingModal =
    document.getElementById("cancelBookingModal");

const bookingForm =
    document.getElementById("bookingForm");


// ==========================================
// PASSENGER ELEMENTS
// ==========================================

const passengerSelect =
    document.getElementById("passengerSelect");

const passengerNameInput =
    document.getElementById("passengerName");

const passengerPhoneInput =
    document.getElementById("passengerPhone");


// ==========================================
// TRIP ELEMENTS
// ==========================================

const tripSelect =
    document.getElementById("tripSelect");

const seatNumberInput =
    document.getElementById("seatNumber");

const bookingStatusInput =
    document.getElementById("bookingStatus");

const paymentStatusInput =
    document.getElementById("paymentStatus");

const bookingAmount =
    document.getElementById("bookingAmount");

const createBookingButton =
    document.getElementById("createBookingButton");


// ==========================================
// STORE DATA
// ==========================================

let allBookings = [];
let allTrips = [];
let allPassengers = [];


// ==========================================
// EDIT MODE
// ==========================================

let editingBookingId = null;


// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Authorization": `Bearer ${token}`,

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );


        // ======================================
        // UNAUTHORIZED
        // ======================================

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "login.html";

            return null;
        }


        // ======================================
        // READ RESPONSE
        // ======================================

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("API Error:", error);

        return null;
    }
}


// ==========================================
// OPEN NEW BOOKING MODAL
// ==========================================

async function openBookingModal() {

    if (!bookingModal) {

        console.error(
            "bookingModal not found."
        );

        return;
    }


    // ======================================
    // NEW MODE
    // ======================================

    editingBookingId = null;


    if (bookingForm) {
        bookingForm.reset();
    }


    // ======================================
    // RESET TITLE
    // ======================================

    const modalTitle =
        document.getElementById(
            "bookingModalTitle"
        );

    if (modalTitle) {

        modalTitle.textContent =
            "Create New Booking";
    }


    // ======================================
    // RESET BUTTON
    // ======================================

    if (createBookingButton) {

        createBookingButton.textContent =
            "Create Booking";
    }


    // ======================================
    // RESET AMOUNT
    // ======================================

    if (bookingAmount) {

        bookingAmount.value =
            "0.00";
    }


    // ======================================
    // OPEN MODAL
    // ======================================

    bookingModal.classList.add("active");

    bookingModal.setAttribute(
        "aria-hidden",
        "false"
    );


    // ======================================
    // LOAD DATA
    // ======================================

    await Promise.all([
        loadBookingPassengers(),
        loadBookingTrips()
    ]);
}


// ==========================================
// CLOSE BOOKING MODAL
// ==========================================

function closeBookingModalFunction() {

    if (!bookingModal) {
        return;
    }


    // ======================================
    // REMOVE FOCUS
    // ======================================

    if (
        document.activeElement &&
        bookingModal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();
    }


    // ======================================
    // CLOSE
    // ======================================

    bookingModal.classList.remove("active");

    bookingModal.setAttribute(
        "aria-hidden",
        "true"
    );


    // ======================================
    // RESET EDIT MODE
    // ======================================

    editingBookingId = null;


    // ======================================
    // RESET FORM
    // ======================================

    if (bookingForm) {
        bookingForm.reset();
    }


    // ======================================
    // RESET TITLE
    // ======================================

    const modalTitle =
        document.getElementById(
            "bookingModalTitle"
        );

    if (modalTitle) {

        modalTitle.textContent =
            "Create New Booking";
    }


    // ======================================
    // RESET BUTTON
    // ======================================

    if (createBookingButton) {

        createBookingButton.textContent =
            "Create Booking";

        createBookingButton.disabled =
            false;
    }


    // ======================================
    // RESET TRIP
    // ======================================

    if (tripSelect) {

        tripSelect.innerHTML = `
            <option value="">
                Select Trip
            </option>
        `;
    }


    // ======================================
    // RESET PASSENGER
    // ======================================

    if (passengerSelect) {

        passengerSelect.innerHTML = `
            <option value="">
                Select Passenger
            </option>
        `;
    }


    // ======================================
    // RESET OLD PASSENGER FIELDS
    // ======================================

    if (passengerNameInput) {
        passengerNameInput.value = "";
    }

    if (passengerPhoneInput) {
        passengerPhoneInput.value = "";
    }


    // ======================================
    // RESET AMOUNT
    // ======================================

    if (bookingAmount) {

        bookingAmount.value =
            "0.00";
    }


    // ======================================
    // RESET TRIP INFO
    // ======================================

    const tripInfo =
        document.getElementById(
            "selectedTripInfo"
        );

    if (tripInfo) {

        tripInfo.innerHTML = "";

        tripInfo.style.display =
            "none";
    }
}


// ==========================================
// MODAL EVENTS
// ==========================================

if (newBookingBtn) {

    newBookingBtn.addEventListener(
        "click",
        openBookingModal
    );
}


if (closeBookingModal) {

    closeBookingModal.addEventListener(
        "click",
        closeBookingModalFunction
    );
}


if (cancelBookingModal) {

    cancelBookingModal.addEventListener(
        "click",
        closeBookingModalFunction
    );
}


// ==========================================
// CLOSE MODAL OUTSIDE
// ==========================================

if (bookingModal) {

    bookingModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                bookingModal
            ) {

                closeBookingModalFunction();
            }
        }
    );
}


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            bookingModal &&
            bookingModal.classList.contains(
                "active"
            )
        ) {

            closeBookingModalFunction();
        }
    }
);


// ==========================================
// LOAD PASSENGERS
// ==========================================

async function loadBookingPassengers() {

    if (passengerSelect) {

        passengerSelect.innerHTML = `
            <option value="">
                Loading passengers...
            </option>
        `;
    }


    const result =
        await apiRequest(
            "/api/passengers"
        );


    if (
        !result ||
        !result.success
    ) {

        if (passengerSelect) {

            passengerSelect.innerHTML = `
                <option value="">
                    Unable to load passengers
                </option>
            `;
        }

        return;
    }


    allPassengers =
        Array.isArray(result.data)
            ? result.data
            : [];


    // ======================================
    // NO PASSENGERS
    // ======================================

    if (!allPassengers.length) {

        if (passengerSelect) {

            passengerSelect.innerHTML = `
                <option value="">
                    No passengers found
                </option>
            `;
        }

        return;
    }


    // ======================================
    // POPULATE DROPDOWN
    // ======================================

    if (passengerSelect) {

        passengerSelect.innerHTML = `
            <option value="">
                Select Passenger
            </option>
        `;


        allPassengers.forEach(
            passenger => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    passenger.id;


                option.textContent =
                    `${passenger.full_name} — ${passenger.phone}`;


                passengerSelect.appendChild(
                    option
                );
            }
        );
    }
}


// ==========================================
// LOAD TRIPS
// ==========================================

async function loadBookingTrips() {

    if (!tripSelect) {

        console.error(
            "Trip select element not found."
        );

        return;
    }


    tripSelect.innerHTML = `
        <option value="">
            Loading trips...
        </option>
    `;


    const result =
        await apiRequest(
            "/api/trips"
        );


    if (
        !result ||
        !result.success
    ) {

        tripSelect.innerHTML = `
            <option value="">
                Unable to load trips
            </option>
        `;

        return;
    }


    allTrips =
        Array.isArray(result.data)
            ? result.data
            : [];


    // ======================================
    // NO TRIPS
    // ======================================

    if (!allTrips.length) {

        tripSelect.innerHTML = `
            <option value="">
                No trips available
            </option>
        `;

        return;
    }


    // ======================================
    // DEFAULT
    // ======================================

    tripSelect.innerHTML = `
        <option value="">
            Select Trip
        </option>
    `;


    // ======================================
    // ADD TRIPS
    // ======================================

    allTrips.forEach(
        trip => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                trip.id;


            option.textContent =
                `${trip.origin} → ${trip.destination} | ` +
                `${formatDate(trip.departure_date)} | ` +
                `${formatTime(trip.departure_time)} | ` +
                `₦${formatAmount(trip.fare)}`;


            tripSelect.appendChild(
                option
            );
        }
    );
}


// ==========================================
// GET SELECTED TRIP
// ==========================================

function getSelectedTrip() {

    if (!tripSelect) {
        return null;
    }


    const tripId =
        Number(
            tripSelect.value
        );


    if (!tripId) {
        return null;
    }


    return (
        allTrips.find(
            trip =>
                Number(trip.id) ===
                tripId
        ) || null
    );
}


// ==========================================
// GET SELECTED PASSENGER
// ==========================================

function getSelectedPassenger() {

    if (!passengerSelect) {
        return null;
    }


    const passengerId =
        Number(
            passengerSelect.value
        );


    if (!passengerId) {
        return null;
    }


    return (
        allPassengers.find(
            passenger =>
                Number(
                    passenger.id
                ) === passengerId
        ) || null
    );
}


// ==========================================
// TRIP CHANGE
// ==========================================

if (tripSelect) {

    tripSelect.addEventListener(
        "change",
        () => {

            const trip =
                getSelectedTrip();

            showSelectedTripInfo(
                trip
            );

            updateBookingAmount();
        }
    );
}


// ==========================================
// SHOW SELECTED TRIP INFO
// ==========================================

function showSelectedTripInfo(trip) {

    let tripInfo =
        document.getElementById(
            "selectedTripInfo"
        );


    // If element does not exist
    if (!tripInfo) {
        return;
    }


    if (!trip) {

        tripInfo.innerHTML = "";

        tripInfo.style.display =
            "none";

        return;
    }


    tripInfo.style.display =
        "block";


    tripInfo.innerHTML = `

        <div class="selected-trip-card">

            <div class="selected-trip-title">
                Selected Trip
            </div>

            <div class="selected-trip-route">

                ${escapeHTML(
                    trip.origin ||
                    "N/A"
                )}

                <span>→</span>

                ${escapeHTML(
                    trip.destination ||
                    "N/A"
                )}

            </div>

            <div class="selected-trip-details">

                <span>
                    📅
                    ${formatDate(
                        trip.departure_date
                    )}
                </span>

                <span>
                    🕐
                    ${formatTime(
                        trip.departure_time
                    )}
                </span>

                <span>
                    💰
                    ₦${formatAmount(
                        trip.fare
                    )}
                </span>

                <span>
                    💺
                    ${escapeHTML(
                        String(
                            trip.available_seats ??
                            "-"
                        )
                    )}
                    seats left
                </span>

            </div>

        </div>
    `;
}


// ==========================================
// UPDATE AMOUNT
// ==========================================

function updateBookingAmount() {

    if (
        !bookingAmount ||
        !tripSelect
    ) {
        return;
    }


    const selectedTrip =
        getSelectedTrip();


    if (!selectedTrip) {

        bookingAmount.value =
            "0.00";

        return;
    }


    const fare =
        Number(
            selectedTrip.fare || 0
        );


    bookingAmount.value =
        formatAmount(fare);
}


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="loading-cell"
            >
                Loading bookings...
            </td>
        </tr>
    `;


    const result =
        await apiRequest(
            "/api/bookings"
        );


    if (
        !result ||
        !result.success
    ) {

        showEmptyState(
            result?.message ||
            "Unable to load bookings."
        );

        return;
    }


    allBookings =
        Array.isArray(result.data)
            ? result.data
            : [];


    updateStatistics();

    renderBookings(
        allBookings
    );
}


// ==========================================
// RENDER BOOKINGS
// ==========================================

function renderBookings(bookings) {

    if (!bookings.length) {

        showEmptyState(
            "No bookings found."
        );

        return;
    }


    tableBody.innerHTML = "";


    bookings.forEach(
        booking => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            booking.booking_reference ||
                            "N/A"
                        )}
                    </strong>
                </td>


                <td>

                    ${escapeHTML(
                        booking.passenger_name ||
                        "Unknown"
                    )}

                    <br>

                    <small>
                        ${escapeHTML(
                            booking.passenger_phone ||
                            ""
                        )}
                    </small>

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


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-button view"
                            data-id="${booking.id}"
                            title="View"
                        >
                            👁
                        </button>


                        <button
                            type="button"
                            class="action-button edit"
                            data-id="${booking.id}"
                            title="Edit"
                        >
                            ✏
                        </button>


                        <button
                            type="button"
                            class="action-button delete"
                            data-id="${booking.id}"
                            title="Delete"
                        >
                            🗑
                        </button>

                    </div>

                </td>
            `;


            tableBody.appendChild(
                row
            );
        }
    );


    attachActionButtons();
}


// ==========================================
// CREATE / FIND PASSENGER
// ==========================================

async function getOrCreatePassenger() {

    // ======================================
    // DROPDOWN
    // ======================================

    if (passengerSelect) {

        const selectedPassenger =
            getSelectedPassenger();


        if (selectedPassenger) {

            return {
                success: true,
                passenger:
                    selectedPassenger
            };
        }
    }


    // ======================================
    // NAME + PHONE
    // ======================================

    const full_name =
        passengerNameInput
            ? passengerNameInput.value.trim()
            : "";


    const phone =
        passengerPhoneInput
            ? passengerPhoneInput.value.trim()
            : "";


    if (!full_name || !phone) {

        return {
            success: false,

            message:
                "Passenger name and phone are required."
        };
    }


    // ======================================
    // TRY CREATE
    // ======================================

    const createResult =
        await apiRequest(
            "/api/passengers",
            {
                method: "POST",

                body: JSON.stringify({

                    full_name,

                    phone
                })
            }
        );


    // ======================================
    // CREATED
    // ======================================

    if (
        createResult &&
        createResult.success
    ) {

        return {
            success: true,

            passenger:
                createResult.data
        };
    }


    // ======================================
    // ALREADY EXISTS
    // ======================================

    if (
        createResult &&
        createResult.message &&
        createResult.message
            .toLowerCase()
            .includes(
                "already exists"
            )
    ) {

        const passengersResult =
            await apiRequest(
                "/api/passengers"
            );


        if (
            passengersResult &&
            passengersResult.success
        ) {

            const passengers =
                Array.isArray(
                    passengersResult.data
                )
                    ? passengersResult.data
                    : [];


            const existingPassenger =
                passengers.find(
                    passenger =>
                        String(
                            passenger.phone
                        ).trim() ===
                        phone
                );


            if (existingPassenger) {

                return {
                    success: true,

                    passenger:
                        existingPassenger
                };
            }
        }
    }


    return {

        success: false,

        message:
            createResult?.message ||
            "Unable to create or find passenger."
    };
}


// ==========================================
// CREATE BOOKING
// ==========================================

async function createBooking() {

    if (!bookingForm) {
        return;
    }


    // ======================================
    // GET VALUES
    // ======================================

    let passengerName =
        passengerNameInput
            ? passengerNameInput.value.trim()
            : "";


    let passengerPhone =
        passengerPhoneInput
            ? passengerPhoneInput.value.trim()
            : "";


    const tripId =
        tripSelect
            ? Number(
                tripSelect.value
            )
            : 0;


    const seatNumber =
        seatNumberInput
            ? Number(
                seatNumberInput.value
            )
            : 0;


    const bookingStatus =
        bookingStatusInput
            ? bookingStatusInput.value
            : "pending";


    const paymentStatus =
        paymentStatusInput
            ? paymentStatusInput.value
            : "pending";


    // ======================================
    // PASSENGER
    // ======================================

    let passenger =
        getSelectedPassenger();


    // If dropdown selected
    if (passenger) {

        passengerName =
            passenger.full_name ||
            passengerName;

        passengerPhone =
            passenger.phone ||
            passengerPhone;
    }


    // ======================================
    // IF NO PASSENGER DATA
    // ======================================

    if (
        !passengerName ||
        !passengerPhone
    ) {

        // Try create/find passenger
        const passengerResult =
            await getOrCreatePassenger();


        if (
            !passengerResult ||
            !passengerResult.success
        ) {

            showBookingError(
                passengerResult?.message ||
                "Passenger information is missing."
            );

            return;
        }


        passenger =
            passengerResult.passenger;


        passengerName =
            passenger?.full_name ||
            passengerName;


        passengerPhone =
            passenger?.phone ||
            passengerPhone;
    }


    // ======================================
    // FINAL PASSENGER CHECK
    // ======================================

    if (
        !passengerName ||
        !passengerPhone
    ) {

        showBookingError(
            "Passenger name and phone are required."
        );

        return;
    }


    // ======================================
    // TRIP
    // ======================================

    if (!tripId) {

        showBookingError(
            "Please select a trip."
        );

        return;
    }


    const selectedTrip =
        getSelectedTrip();


    if (!selectedTrip) {

        showBookingError(
            "Selected trip was not found."
        );

        return;
    }


    // ======================================
    // SEAT
    // ======================================

    if (
        !seatNumber ||
        seatNumber < 1
    ) {

        showBookingError(
            "Please enter a valid seat number."
        );

        return;
    }


    // ======================================
    // AVAILABLE SEATS
    // ======================================

    if (
        selectedTrip.available_seats !==
        undefined &&
        Number(
            selectedTrip.available_seats
        ) <= 0
    ) {

        showBookingError(
            "There are no available seats on this trip."
        );

        return;
    }


    // ======================================
    // TOTAL SEATS
    // ======================================

    if (
        selectedTrip.total_seats !==
        undefined &&
        seatNumber >
        Number(
            selectedTrip.total_seats
        )
    ) {

        showBookingError(
            `Seat number cannot be greater than ${selectedTrip.total_seats}.`
        );

        return;
    }


    // ======================================
    // AMOUNT
    // ======================================

    const amount =
        Number(
            selectedTrip.fare || 0
        );


    if (
        !amount ||
        amount <= 0
    ) {

        showBookingError(
            "The selected trip has an invalid fare."
        );

        return;
    }


    // ======================================
    // BUTTON
    // ======================================

    const submitButton =
        bookingForm.querySelector(
            'button[type="submit"]'
        );


    const originalText =
        submitButton
            ? submitButton.textContent.trim()
            : "Create Booking";


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Creating Booking...";
    }


    // ======================================
    // CREATE API
    // ======================================

    const bookingResult =
        await apiRequest(
            "/api/bookings",
            {
                method: "POST",

                body: JSON.stringify({

                    passenger_name:
                        passengerName,

                    passenger_phone:
                        passengerPhone,

                    trip_id:
                        Number(
                            tripId
                        ),

                    seat_number:
                        Number(
                            seatNumber
                        ),

                    amount:
                        amount,

                    booking_status:
                        bookingStatus,

                    payment_status:
                        paymentStatus,

                    booked_by:
                        user?.id || null
                })
            }
        );


    // ======================================
    // RESTORE BUTTON
    // ======================================

    if (submitButton) {

        submitButton.disabled = false;

        submitButton.textContent =
            originalText;
    }


    // ======================================
    // SUCCESS
    // ======================================

    if (
        bookingResult &&
        bookingResult.success
    ) {

        showBookingSuccess(
            bookingResult.data
        );


        closeBookingModalFunction();


        await loadBookings();


        return;
    }


    // ======================================
    // ERROR
    // ======================================

    showBookingError(
        bookingResult?.message ||
        "Failed to create booking."
    );
}


// ==========================================
// EDIT BOOKING
// ==========================================

async function editBooking(bookingId) {

    if (!bookingId) {
        return;
    }


    const booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    if (!booking) {

        alert(
            "Booking not found."
        );

        return;
    }


    if (!bookingModal) {
        return;
    }


    // ======================================
    // SET EDIT MODE
    // ======================================

    editingBookingId =
        bookingId;


    // ======================================
    // LOAD DATA
    // ======================================

    await Promise.all([
        loadBookingPassengers(),
        loadBookingTrips()
    ]);


    // ======================================
    // MODAL TITLE
    // ======================================

    const modalTitle =
        document.getElementById(
            "bookingModalTitle"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Booking";
    }


    // ======================================
    // BUTTON
    // ======================================

    if (createBookingButton) {

        createBookingButton.textContent =
            "Update Booking";
    }


    // ======================================
    // PASSENGER
    // ======================================

    if (passengerNameInput) {

        passengerNameInput.value =
            booking.passenger_name ||
            "";
    }


    if (passengerPhoneInput) {

        passengerPhoneInput.value =
            booking.passenger_phone ||
            "";
    }


    // ======================================
    // PASSENGER DROPDOWN
    // ======================================

    if (
        passengerSelect &&
        booking.passenger_id
    ) {

        passengerSelect.value =
            String(
                booking.passenger_id
            );
    }


    // ======================================
    // TRIP
    // ======================================

    if (tripSelect) {

        tripSelect.value =
            String(
                booking.trip_id
            );


        const selectedTrip =
            getSelectedTrip();


        if (selectedTrip) {

            showSelectedTripInfo(
                selectedTrip
            );

            updateBookingAmount();
        }
    }


    // ======================================
    // SEAT
    // ======================================

    if (seatNumberInput) {

        seatNumberInput.value =
            booking.seat_number ||
            "";
    }


    // ======================================
    // STATUS
    // ======================================

    if (bookingStatusInput) {

        bookingStatusInput.value =
            booking.booking_status ||
            "pending";
    }


    // ======================================
    // PAYMENT
    // ======================================

    if (paymentStatusInput) {

        paymentStatusInput.value =
            booking.payment_status ||
            "pending";
    }


    // ======================================
    // AMOUNT
    // ======================================

    if (bookingAmount) {

        bookingAmount.value =
            formatAmount(
                booking.amount
            );
    }


    // ======================================
    // OPEN
    // ======================================

    bookingModal.classList.add(
        "active"
    );

    bookingModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


// ==========================================
// UPDATE BOOKING API
// ==========================================

async function updateBooking() {

    if (
        !editingBookingId ||
        !bookingForm
    ) {

        return;
    }


    // ======================================
    // VALUES
    // ======================================

    const passengerName =
        passengerNameInput
            ? passengerNameInput.value.trim()
            : "";


    const passengerPhone =
        passengerPhoneInput
            ? passengerPhoneInput.value.trim()
            : "";


    const tripId =
        tripSelect
            ? Number(
                tripSelect.value
            )
            : 0;


    const seatNumber =
        seatNumberInput
            ? Number(
                seatNumberInput.value
            )
            : 0;


    const bookingStatus =
        bookingStatusInput
            ? bookingStatusInput.value
            : "pending";


    const paymentStatus =
        paymentStatusInput
            ? paymentStatusInput.value
            : "pending";


    // ======================================
    // VALIDATION
    // ======================================

    if (
        !passengerName ||
        !passengerPhone
    ) {

        showBookingError(
            "Passenger name and phone are required."
        );

        return;
    }


    if (!tripId) {

        showBookingError(
            "Please select a trip."
        );

        return;
    }


    if (
        !seatNumber ||
        seatNumber < 1
    ) {

        showBookingError(
            "Please enter a valid seat number."
        );

        return;
    }


    const selectedTrip =
        getSelectedTrip();


    if (!selectedTrip) {

        showBookingError(
            "Selected trip was not found."
        );

        return;
    }


    // ======================================
    // AMOUNT FROM TRIP FARE
    // ======================================

    const amount =
        Number(
            selectedTrip.fare || 0
        );


    if (
        !amount ||
        amount <= 0
    ) {

        showBookingError(
            "The selected trip has an invalid fare."
        );

        return;
    }


    // ======================================
    // BUTTON
    // ======================================

    const submitButton =
        bookingForm.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Updating Booking...";
    }


    // ======================================
    // UPDATE API
    // ======================================

    const result =
        await apiRequest(
            `/api/bookings/${editingBookingId}`,
            {
                method: "PUT",

                body: JSON.stringify({

                    passenger_name:
                        passengerName,

                    passenger_phone:
                        passengerPhone,

                    trip_id:
                        Number(
                            tripId
                        ),

                    seat_number:
                        Number(
                            seatNumber
                        ),

                    amount:
                        amount,

                    booking_status:
                        bookingStatus,

                    payment_status:
                        paymentStatus
                })
            }
        );


    // ======================================
    // RESTORE BUTTON
    // ======================================

    if (submitButton) {

        submitButton.disabled =
            false;

        submitButton.textContent =
            "Update Booking";
    }


    // ======================================
    // SUCCESS
    // ======================================

    if (
        result &&
        result.success
    ) {

        alert(
            "Booking updated successfully."
        );


        closeBookingModalFunction();


        await loadBookings();


        return;
    }


    // ======================================
    // ERROR
    // ======================================

    showBookingError(
        result?.message ||
        "Failed to update booking."
    );
}


// ==========================================
// DELETE BOOKING
// ==========================================

async function deleteBooking(bookingId) {

    if (!bookingId) {
        return;
    }


    const booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    if (!booking) {

        alert(
            "Booking not found."
        );

        return;
    }


    // ======================================
    // CONFIRM
    // ======================================

    const reference =
        booking.booking_reference ||
        `Booking #${bookingId}`;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${reference}?\n\n` +
            `Passenger: ${
                booking.passenger_name ||
                "N/A"
            }\n` +
            `Route: ${
                booking.origin ||
                "N/A"
            } → ${
                booking.destination ||
                "N/A"
            }\n\n` +
            `This action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    // ======================================
    // DELETE API
    // ======================================

    const result =
        await apiRequest(
            `/api/bookings/${bookingId}`,
            {
                method: "DELETE"
            }
        );


    // ======================================
    // SUCCESS
    // ======================================

    if (
        result &&
        result.success
    ) {

        alert(
            "Booking deleted successfully."
        );


        await loadBookings();


        return;
    }


    // ======================================
    // ERROR
    // ======================================

    alert(
        result?.message ||
        "Failed to delete booking."
    );
}


// ==========================================
// VIEW BOOKING
// ==========================================

async function viewBooking(bookingId) {

    if (!bookingId) {
        return;
    }


    let booking =
        allBookings.find(
            item =>
                String(item.id) ===
                String(bookingId)
        );


    // ======================================
    // TRY GET SINGLE BOOKING
    // ======================================

    const result =
        await apiRequest(
            `/api/bookings/${bookingId}`
        );


    if (
        result &&
        result.success &&
        result.data
    ) {

        booking =
            result.data;
    }


    if (!booking) {

        alert(
            "Booking not found."
        );

        return;
    }


    // ======================================
    // DETAILS
    // ======================================

    alert(

        `BOOKING DETAILS\n\n` +

        `Reference: ${
            booking.booking_reference ||
            "N/A"
        }\n\n` +

        `Passenger: ${
            booking.passenger_name ||
            "N/A"
        }\n` +

        `Phone: ${
            booking.passenger_phone ||
            "N/A"
        }\n\n` +

        `Route: ${
            booking.origin ||
            "N/A"
        } → ${
            booking.destination ||
            "N/A"
        }\n\n` +

        `Date: ${
            formatDate(
                booking.departure_date
            )
        }\n` +

        `Departure: ${
            formatTime(
                booking.departure_time
            )
        }\n\n` +

        `Seat: ${
            booking.seat_number ||
            "N/A"
        }\n` +

        `Amount: ₦${
            formatAmount(
                booking.amount
            )
        }\n\n` +

        `Booking Status: ${
            booking.booking_status ||
            "N/A"
        }\n` +

        `Payment Status: ${
            booking.payment_status ||
            "N/A"
        }`
    );
}


// ==========================================
// BOOKING FORM SUBMIT
// ==========================================

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            // ==================================
            // EDIT
            // ==================================

            if (editingBookingId) {

                updateBooking();

                return;
            }


            // ==================================
            // CREATE
            // ==================================

            createBooking();
        }
    );
}


// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showBookingSuccess(data) {

    const reference =
        data?.booking_reference ||
        "N/A";


    alert(
        `Booking created successfully!\n\n` +
        `Reference: ${reference}`
    );
}


// ==========================================
// ERROR MESSAGE
// ==========================================

function showBookingError(message) {

    alert(
        `Booking Error\n\n${message}`
    );
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        allBookings.length;


    const pending =
        allBookings.filter(
            booking =>
                String(
                    booking.booking_status
                ).toLowerCase() ===
                "pending"
        ).length;


    const confirmed =
        allBookings.filter(
            booking =>
                String(
                    booking.booking_status
                ).toLowerCase() ===
                "confirmed"
        ).length;


    const cancelled =
        allBookings.filter(
            booking =>
                String(
                    booking.booking_status
                ).toLowerCase() ===
                "cancelled"
        ).length;


    const totalElement =
        document.getElementById(
            "totalBookings"
        );


    const pendingElement =
        document.getElementById(
            "pendingBookings"
        );


    const confirmedElement =
        document.getElementById(
            "confirmedBookings"
        );


    const cancelledElement =
        document.getElementById(
            "cancelledBookings"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;
    }


    if (confirmedElement) {

        confirmedElement.textContent =
            confirmed;
    }


    if (cancelledElement) {

        cancelledElement.textContent =
            cancelled;
    }
}


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterBookings() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        allBookings.filter(
            booking => {

                const searchableText = [

                    booking.booking_reference,

                    booking.passenger_name,

                    booking.passenger_phone,

                    booking.origin,

                    booking.destination,

                    booking.seat_number

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                const bookingStatus =
                    String(
                        booking.booking_status ||
                        ""
                    ).toLowerCase();


                const matchesStatus =
                    status === "all" ||
                    bookingStatus ===
                    status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    renderBookings(
        filtered
    );
}


// ==========================================
// ACTION BUTTONS
// ==========================================

function attachActionButtons() {

    const viewButtons =
        document.querySelectorAll(
            ".action-button.view"
        );


    const editButtons =
        document.querySelectorAll(
            ".action-button.edit"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".action-button.delete"
        );


    // ======================================
    // VIEW
    // ======================================

    viewButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    viewBooking(id);
                }
            );
        }
    );


    // ======================================
    // EDIT
    // ======================================

    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    editBooking(id);
                }
            );
        }
    );


    // ======================================
    // DELETE
    // ======================================

    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    deleteBooking(id);
                }
            );
        }
    );
}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState(message) {

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="loading-cell"
            >

                ${escapeHTML(
                    message
                )}

            </td>

        </tr>

    `;
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

        return date;
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
// FORMAT TIME
// ==========================================

function formatTime(time) {

    if (!time) {
        return "N/A";
    }


    const parts =
        String(time).split(":");


    if (parts.length < 2) {
        return time;
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
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    const value =
        String(
            status || "pending"
        ).toLowerCase();


    return `status-${value}`;
}


// ==========================================
// SECURITY HELPER
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
// DISPLAY USER
// ==========================================

function displayUser() {

    if (!user) {
        return;
    }


    const userName =
        document.getElementById(
            "userName"
        );


    const userRole =
        document.getElementById(
            "userRole"
        );


    const avatar =
        document.getElementById(
            "avatar"
        );


    if (userName) {

        userName.textContent =
            user.full_name ||
            "Administrator";
    }


    if (userRole) {

        userRole.textContent =
            user.role ||
            "Administrator";
    }


    if (avatar) {

        const fullName =
            user.full_name ||
            "Administrator";


        const initials =
            fullName
                .split(" ")
                .filter(Boolean)
                .map(
                    name =>
                        name.charAt(0)
                )
                .join("")
                .substring(
                    0,
                    2
                )
                .toUpperCase();


        avatar.textContent =
            initials;
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
// MOBILE MENU
// ==========================================

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


// ==========================================
// SEARCH EVENTS
// ==========================================

function setupFilters() {

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterBookings
        );
    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterBookings
        );
    }
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Make sure modal starts hidden
        if (bookingModal) {

            bookingModal.setAttribute(
                "aria-hidden",
                "true"
            );
        }


        displayUser();

        setupLogout();

        setupMobileMenu();

        setupFilters();

        loadBookings();
    }
);