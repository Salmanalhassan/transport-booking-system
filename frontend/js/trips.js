// ==========================================
// TRIPS PAGE
// ==========================================

const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );


// ==========================================
// PROTECT PAGE
// ==========================================

if (!token || !user) {

    window.location.href =
        "login.html";

}


// ==========================================
// API
// ==========================================

const API_URL =
    "http://localhost:5000";


// ==========================================
// DOM
// ==========================================

const tripsTableBody =
    document.getElementById(
        "tripsTableBody"
    );

const emptyTrips =
    document.getElementById(
        "emptyTrips"
    );

const tripSearch =
    document.getElementById(
        "tripSearch"
    );


// Statistics

const totalTrips =
    document.getElementById(
        "totalTrips"
    );

const scheduledTrips =
    document.getElementById(
        "scheduledTrips"
    );

const boardingTrips =
    document.getElementById(
        "boardingTrips"
    );

const completedTrips =
    document.getElementById(
        "completedTrips"
    );


// ==========================================
// DATA
// ==========================================

let trips = [];


// ==========================================
// LOAD TRIPS
// ==========================================

async function loadTrips() {

    try {

        tripsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="loading-cell"
                >
                    Loading trips...
                </td>

            </tr>

        `;


        const response =
            await fetch(
                `${API_URL}/api/trips`,
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


        const result =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to retrieve trips"
            );

        }


        trips =
            result.data || [];


        updateStatistics();

        renderTrips(trips);


    } catch (error) {

        console.error(
            "Load trips error:",
            error
        );


        tripsTableBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="loading-cell"
                >

                    Failed to load trips.

                </td>

            </tr>

        `;

    }

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        trips.length;


    const scheduled =
        trips.filter(
            trip =>
                trip.status ===
                "scheduled"
        ).length;


    const boarding =
        trips.filter(
            trip =>
                trip.status ===
                "boarding"
        ).length;


    const completed =
        trips.filter(
            trip =>
                trip.status ===
                "completed"
        ).length;


    totalTrips.textContent =
        total;

    scheduledTrips.textContent =
        scheduled;

    boardingTrips.textContent =
        boarding;

    completedTrips.textContent =
        completed;

}


// ==========================================
// RENDER TRIPS
// ==========================================

function renderTrips(data) {

    if (!data.length) {

        tripsTableBody.innerHTML = "";

        emptyTrips.style.display =
            "block";

        return;

    }


    emptyTrips.style.display =
        "none";


    tripsTableBody.innerHTML =
        data.map(
            trip => `

            <tr>

                <td>

                    <strong>
                        TRIP-${trip.id}
                    </strong>

                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            trip.origin
                        )}
                    </strong>

                    →

                    ${escapeHTML(
                        trip.destination
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        trip.bus_number || "-"
                    )}

                    <br>

                    <small>
                        ${escapeHTML(
                            trip.plate_number || ""
                        )}
                    </small>

                </td>


                <td>

                    ${escapeHTML(
                        trip.driver_name || "-"
                    )}

                </td>


                <td>

                    ${formatDate(
                        trip.departure_date
                    )}

                    <br>

                    <small>
                        ${formatTime(
                            trip.departure_time
                        )}
                    </small>

                </td>


                <td>

                    ₦${formatMoney(
                        trip.fare
                    )}

                </td>


                <td>

                    ${trip.available_seats}

                </td>


                <td>

                    <span
                        class="trip-status ${trip.status}"
                    >

                        ${formatStatus(
                            trip.status
                        )}

                    </span>

                </td>


                <td>

                    <div
                        class="action-buttons"
                    >

                        <button
                            class="edit-btn"
                            onclick="editTrip(${trip.id})"
                            title="Edit"
                        >
                            ✏️
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteTrip(${trip.id})"
                            title="Delete"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            </tr>

        `
        ).join("");

}



// ==========================================
// DELETE TRIP
// ==========================================

async function deleteTrip(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this trip?"
    );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/trips/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );


        const result =
            await response.json();


        // ==================================
        // AUTH ERROR
        // ==================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return;

        }


        // ==================================
        // API ERROR
        // ==================================

        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to delete trip"
            );

        }


        // ==================================
        // SUCCESS
        // ==================================

        alert(
            "Trip deleted successfully"
        );


        // Reload trips

        await loadTrips();


    } catch (error) {

        console.error(
            "Delete trip error:",
            error
        );

        alert(
            error.message ||
            "Failed to delete trip"
        );

    }

}








// ==========================================
// SEARCH
// ==========================================

tripSearch.addEventListener(
    "input",
    () => {

        const search =
            tripSearch.value
                .toLowerCase()
                .trim();


        const filtered =
            trips.filter(
                trip =>

                    String(
                        trip.id
                    )
                    .includes(search)

                    ||

                    String(
                        trip.origin || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        trip.destination || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        trip.bus_number || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        trip.driver_name || ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        trip.status || ""
                    )
                    .toLowerCase()
                    .includes(search)
            );


        renderTrips(filtered);

    }
);


// ==========================================
// HELPERS
// ==========================================

function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 2
            }
        );

}


function formatDate(value) {

    if (!value) return "-";


    const date =
        new Date(value);


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatTime(value) {

    if (!value) return "-";


    return String(value)
        .substring(0, 5);

}


function formatStatus(status) {

    if (!status) return "-";


    return status
        .charAt(0)
        .toUpperCase()
        +
        status.slice(1);

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            char => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[char])
        );

}


// ==========================================
// TEMPORARY ACTIONS
// ==========================================
// ==========================================
// EDIT TRIP
// ==========================================

const editTripModal =
    document.getElementById(
        "editTripModal"
    );

const closeEditTripButton =
    document.getElementById(
        "closeEditTrip"
    );

const cancelEditTripButton =
    document.getElementById(
        "cancelEditTrip"
    );

const editTripForm =
    document.getElementById(
        "editTripForm"
    );

const editRoute =
    document.getElementById(
        "edit_route_id"
    );

const editBus =
    document.getElementById(
        "edit_bus_id"
    );

const editDriver =
    document.getElementById(
        "edit_driver_id"
    );

const editDepartureDate =
    document.getElementById(
        "edit_departure_date"
    );

const editDepartureTime =
    document.getElementById(
        "edit_departure_time"
    );

const editArrivalTime =
    document.getElementById(
        "edit_arrival_time"
    );

const editFare =
    document.getElementById(
        "edit_fare"
    );

const editAvailableSeats =
    document.getElementById(
        "edit_available_seats"
    );

const editStatus =
    document.getElementById(
        "edit_status"
    );

const updateTripButton =
    document.getElementById(
        "updateTripButton"
    );


let editingTripId = null;


// ==========================================
// LOAD ROUTES FOR EDIT
// ==========================================
async function loadEditRoutes(selectedId) {

    try {

        const response = await fetch(
            `${API_URL}/api/routes`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        console.log("EDIT ROUTES:", result);

        if (!result.success) {
            throw new Error(
                result.message || "Failed to load routes"
            );
        }

        editRoute.innerHTML =
            `<option value="">Select Route</option>`;

        result.data.forEach(route => {

            const option =
                document.createElement("option");

            option.value = route.id;

            option.textContent =
                `${route.origin} → ${route.destination}`;

            editRoute.appendChild(option);

        });

        editRoute.value = String(selectedId);

    } catch (error) {

        console.error(
            "Edit routes error:",
            error
        );

    }

}


// ==========================================
// LOAD BUSES FOR EDIT
// ==========================================
async function loadEditBuses(selectedId) {

    try {

        const response = await fetch(
            `${API_URL}/api/buses`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        console.log("EDIT BUSES:", result);

        if (!result.success) {
            throw new Error(
                result.message || "Failed to load buses"
            );
        }

        editBus.innerHTML =
            `<option value="">Select Bus</option>`;

        result.data.forEach(bus => {

            const option =
                document.createElement("option");

            option.value = bus.id;

            option.textContent =
                `${bus.bus_number} - ${bus.plate_number}`;

            editBus.appendChild(option);

        });

        editBus.value = String(selectedId);

    } catch (error) {

        console.error(
            "Edit buses error:",
            error
        );

    }

}


// ==========================================
// LOAD DRIVERS FOR EDIT
// ==========================================
async function loadEditDrivers(selectedId) {

    try {

        const response = await fetch(
            `${API_URL}/api/drivers`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const result = await response.json();

        console.log("EDIT DRIVERS:", result);

        if (!result.success) {
            throw new Error(
                result.message || "Failed to load drivers"
            );
        }

        editDriver.innerHTML =
            `<option value="">Select Driver</option>`;

        result.data.forEach(driver => {

            const option =
                document.createElement("option");

            option.value = driver.id;

            option.textContent =
                `${driver.full_name} - ${driver.license_number}`;

            editDriver.appendChild(option);

        });

        editDriver.value = String(selectedId);

    } catch (error) {

        console.error(
            "Edit drivers error:",
            error
        );

    }

}



// ==========================================
// OPEN EDIT MODAL
// ==========================================
async function editTrip(id) {

    const trip = trips.find(
        item => Number(item.id) === Number(id)
    );

    if (!trip) {

        alert("Trip information not found");

        return;
    }

    editingTripId = trip.id;

    await Promise.all([

        loadEditRoutes(trip.route_id),

        loadEditBuses(trip.bus_id),

        loadEditDrivers(trip.driver_id)

    ]);

    editDepartureDate.value =
        trip.departure_date
            ? String(trip.departure_date).substring(0, 10)
            : "";

    editDepartureTime.value =
        trip.departure_time
            ? String(trip.departure_time).substring(0, 5)
            : "";

    editArrivalTime.value =
        trip.arrival_time
            ? String(trip.arrival_time).substring(0, 5)
            : "";

    editFare.value =
        trip.fare ?? "";

    editAvailableSeats.value =
        trip.available_seats ?? "";

    editStatus.value =
        trip.status || "scheduled";

    editTripModal.style.display = "flex";
}
    // Load drop

// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    editTripModal.style.display =
        "none";

    editingTripId = null;

}


closeEditTripButton.addEventListener(
    "click",
    closeEditModal
);


cancelEditTripButton.addEventListener(
    "click",
    closeEditModal
);


editTripModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editTripModal
        ) {

            closeEditModal();

        }

    }
);


// ==========================================
// UPDATE TRIP
// ==========================================

editTripForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!editingTripId) {

            return;

        }


        const payload = {

            route_id:
                Number(
                    editRoute.value
                ),

            bus_id:
                Number(
                    editBus.value
                ),

            driver_id:
                Number(
                    editDriver.value
                ),

            departure_date:
                editDepartureDate.value,

            departure_time:
                editDepartureTime.value,

            arrival_time:
                editArrivalTime.value ||
                null,

            fare:
                Number(
                    editFare.value
                ),

            available_seats:
                Number(
                    editAvailableSeats.value
                ),

            status:
                editStatus.value

        };


        try {

            updateTripButton.disabled =
                true;

            updateTripButton.textContent =
                "Updating...";


            const response =
                await fetch(
                    `${API_URL}/api/trips/${editingTripId}`,
                    {

                        method: "PUT",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );


            const result =
                await response.json();


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

                return;

            }


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Failed to update trip"
                );

            }


            alert(
                "Trip updated successfully"
            );


            closeEditModal();


            await loadTrips();


        } catch (error) {

            console.error(
                "Update trip error:",
                error
            );

            alert(
                error.message ||
                "Failed to update trip"
            );

        } finally {

            updateTripButton.disabled =
                false;

            updateTripButton.textContent =
                "Update Trip";

        }

    }
);


// ==========================================
// CREATE BUTTON
// ==========================================
// CREATE TRIP MODAL
// ==========================================

const createTripModal =
    document.getElementById("createTripModal");

const openCreateTripButton =
    document.getElementById("openCreateTrip");

const closeCreateTripButton =
    document.getElementById("closeCreateTrip");

const cancelCreateTripButton =
    document.getElementById("cancelCreateTrip");

const createTripForm =
    document.getElementById("createTripForm");


// ==========================================
// CREATE FORM FIELDS
// ==========================================

const routeSelect =
    document.getElementById("route_id");

const busSelect =
    document.getElementById("bus_id");

const driverSelect =
    document.getElementById("driver_id");

const departureDate =
    document.getElementById("departure_date");

const departureTime =
    document.getElementById("departure_time");

const arrivalTime =
    document.getElementById("arrival_time");

const fare =
    document.getElementById("fare");

const availableSeats =
    document.getElementById("available_seats");

const statusSelect =
    document.getElementById("status");


// ==========================================
// LOAD ROUTES
// ==========================================

async function loadCreateRoutes() {

    try {

        routeSelect.innerHTML =
            `<option value="">Loading routes...</option>`;

        const response =
            await fetch(
                `${API_URL}/api/routes`,
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

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load routes"
            );

        }

        routeSelect.innerHTML =
            `<option value="">Select route</option>`;

        (result.data || []).forEach(
            route => {

                const option =
                    document.createElement("option");

                option.value =
                    route.id;

                option.textContent =
                    `${route.origin} → ${route.destination}`;

                routeSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Load create routes error:",
            error
        );

        routeSelect.innerHTML =
            `<option value="">Unable to load routes</option>`;

    }

}


// ==========================================
// LOAD BUSES
// ==========================================

async function loadCreateBuses() {

    try {

        busSelect.innerHTML =
            `<option value="">Loading buses...</option>`;

        const response =
            await fetch(
                `${API_URL}/api/buses`,
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

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load buses"
            );

        }

        busSelect.innerHTML =
            `<option value="">Select bus</option>`;

        (result.data || []).forEach(
            bus => {

                const option =
                    document.createElement("option");

                option.value =
                    bus.id;

                option.textContent =
                    `${bus.bus_number} - ${bus.plate_number} (${bus.total_seats} seats)`;

                busSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Load create buses error:",
            error
        );

        busSelect.innerHTML =
            `<option value="">Unable to load buses</option>`;

    }

}


// ==========================================
// LOAD DRIVERS
// ==========================================

async function loadCreateDrivers() {

    try {

        driverSelect.innerHTML =
            `<option value="">Loading drivers...</option>`;

        const response =
            await fetch(
                `${API_URL}/api/drivers`,
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

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load drivers"
            );

        }

        driverSelect.innerHTML =
            `<option value="">Select driver</option>`;

        (result.data || []).forEach(
            driver => {

                const option =
                    document.createElement("option");

                option.value =
                    driver.id;

                option.textContent =
                    `${driver.full_name} - ${driver.license_number}`;

                driverSelect.appendChild(
                    option
                );

            }
        );

    } catch (error) {

        console.error(
            "Load create drivers error:",
            error
        );

        driverSelect.innerHTML =
            `<option value="">Unable to load drivers</option>`;

    }

}


// ==========================================
// LOAD ALL CREATE DROPDOWNS
// ==========================================

async function loadCreateTripOptions() {

    await Promise.all([

        loadCreateRoutes(),

        loadCreateBuses(),

        loadCreateDrivers()

    ]);

}


// ==========================================
// OPEN CREATE MODAL
// ==========================================

openCreateTripButton.addEventListener(
    "click",
    async () => {

        createTripModal.style.display =
            "flex";

        await loadCreateTripOptions();

    }
);


// ==========================================
// CLOSE CREATE MODAL
// ==========================================

closeCreateTripButton.addEventListener(
    "click",
    () => {

        createTripModal.style.display =
            "none";

    }
);


// ==========================================
// CANCEL CREATE
// ==========================================

cancelCreateTripButton.addEventListener(
    "click",
    () => {

        createTripModal.style.display =
            "none";

    }
);


// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================

createTripModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            createTripModal
        ) {

            createTripModal.style.display =
                "none";

        }

    }
);


// ==========================================
// CREATE TRIP
// ==========================================

createTripForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const payload = {

            route_id:
                Number(
                    routeSelect.value
                ),

            bus_id:
                Number(
                    busSelect.value
                ),

            driver_id:
                Number(
                    driverSelect.value
                ),

            departure_date:
                departureDate.value,

            departure_time:
                departureTime.value,

            arrival_time:
                arrivalTime.value ||
                null,

            fare:
                Number(
                    fare.value
                ),

            available_seats:
                Number(
                    availableSeats.value
                ),

            status:
                statusSelect.value ||
                "scheduled"

        };


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !payload.route_id ||
            !payload.bus_id ||
            !payload.driver_id ||
            !payload.departure_date ||
            !payload.departure_time ||
            !payload.fare ||
            !payload.available_seats
        ) {

            alert(
                "Please fill all required fields"
            );

            return;

        }


        try {

            const submitButton =
                createTripForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating...";

            }


            const response =
                await fetch(
                    `${API_URL}/api/trips`,
                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );


            const result =
                await response.json();


            // ==================================
            // AUTH ERROR
            // ==================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

                return;

            }


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Failed to create trip"
                );

            }


            // ==================================
            // SUCCESS
            // ==================================

            alert(
                "Trip created successfully"
            );


            createTripModal.style.display =
                "none";


            createTripForm.reset();


            await loadTrips();


        } catch (error) {

            console.error(
                "Create trip error:",
                error
            );

            alert(
                error.message ||
                "Failed to create trip"
            );

        } finally {

            const submitButton =
                createTripForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create Trip";

            }

        }

    }
);


// ==========================================
// START
// ==========================================

loadTrips();