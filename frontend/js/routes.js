// ==========================================
// API
// ==========================================

const API_URL = "";
    


// ==========================================
// AUTH
// ==========================================

const token =
    localStorage.getItem("token");

const user =
    JSON.parse(
        localStorage.getItem("user")
    );


if (!token || !user) {

    window.location.href =
        "login.html";

}


// ==========================================
// STATE
// ==========================================

let routes = [];


// ==========================================
// DOM
// ==========================================

const tableBody =
    document.getElementById(
        "routesTableBody"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const searchInput =
    document.getElementById(
        "routeSearch"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const refreshButton =
    document.getElementById(
        "refreshRoutes"
    );


// Statistics

const totalRoutes =
    document.getElementById(
        "totalRoutes"
    );

const activeRoutes =
    document.getElementById(
        "activeRoutes"
    );

const inactiveRoutes =
    document.getElementById(
        "inactiveRoutes"
    );

const averageFare =
    document.getElementById(
        "averageFare"
    );

// edittttte
// ==========================================
// EDIT MODAL
// ==========================================

const editRouteModal =
    document.getElementById(
        "editRouteModal"
    );

const closeEditRouteButton =
    document.getElementById(
        "closeEditRouteModal"
    );

const cancelEditRouteButton =
    document.getElementById(
        "cancelEditRoute"
    );

const editRouteForm =
    document.getElementById(
        "editRouteForm"
    );

const editRouteFormMessage =
    document.getElementById(
        "editRouteFormMessage"
    );

const updateRouteButton =
    document.getElementById(
        "updateRouteButton"
    );


// Edit fields

const editOriginInput =
    document.getElementById(
        "editOrigin"
    );

const editDestinationInput =
    document.getElementById(
        "editDestination"
    );

const editDistanceInput =
    document.getElementById(
        "editDistance"
    );

const editDurationInput =
    document.getElementById(
        "editDuration"
    );

const editFareInput =
    document.getElementById(
        "editFare"
    );

const editStatusInput =
    document.getElementById(
        "editStatus"
    );


// Currently editing route

let editingRouteId = null;
// Modal

const addRouteModal =
    document.getElementById(
        "addRouteModal"
    );

const openAddRouteButton =
    document.getElementById(
        "openAddRouteModal"
    );

const closeAddRouteButton =
    document.getElementById(
        "closeAddRouteModal"
    );

const cancelAddRouteButton =
    document.getElementById(
        "cancelAddRoute"
    );

const addRouteForm =
    document.getElementById(
        "addRouteForm"
    );

const routeFormMessage =
    document.getElementById(
        "routeFormMessage"
    );

const saveRouteButton =
    document.getElementById(
        "saveRouteButton"
    );


// Form fields

const originInput =
    document.getElementById(
        "origin"
    );

const destinationInput =
    document.getElementById(
        "destination"
    );

const distanceInput =
    document.getElementById(
        "distance"
    );

const durationInput =
    document.getElementById(
        "duration"
    );

const fareInput =
    document.getElementById(
        "fare"
    );

const routeStatusInput =
    document.getElementById(
        "routeStatus"
    );

// ==========================================
// DELETE MODAL
// ==========================================

const deleteRouteModal =
    document.getElementById(
        "deleteRouteModal"
    );

const deleteRoutePreview =
    document.getElementById(
        "deleteRoutePreview"
    );

const cancelDeleteButton =
    document.getElementById(
        "cancelDeleteRoute"
    );

const confirmDeleteButton =
    document.getElementById(
        "confirmDeleteRoute"
    );


let deletingRouteId = null;
// ==========================================
// LOAD ROUTES
// ==========================================

async function loadRoutes() {

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="loading-cell"
            >
                Loading routes...
            </td>
        </tr>
    `;


    emptyState.hidden = true;


    try {

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
                "Failed to retrieve routes"
            );

        }


        routes =
            result.data || [];


        updateStatistics();

        renderRoutes();


    } catch (error) {

        console.error(
            "Load routes error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading-cell"
                >
                    Failed to load routes.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        routes.length;


    const active =
        routes.filter(
            route =>
                route.status === "active"
        ).length;


    const inactive =
        routes.filter(
            route =>
                route.status === "inactive"
        ).length;


    const fareTotal =
        routes.reduce(
            (sum, route) =>
                sum +
                Number(route.fare || 0),
            0
        );


    const average =
        total > 0
            ? fareTotal / total
            : 0;


    totalRoutes.textContent =
        total;


    activeRoutes.textContent =
        active;


    inactiveRoutes.textContent =
        inactive;


    averageFare.textContent =
        formatCurrency(average);

}


// ==========================================
// RENDER ROUTES
// ==========================================

function renderRoutes() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filteredRoutes =
        routes.filter(route => {


            const matchesSearch =

                route.origin
                    .toLowerCase()
                    .includes(search)

                ||

                route.destination
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =

                selectedStatus === "all"

                ||

                route.status ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    if (
        filteredRoutes.length === 0
    ) {

        tableBody.innerHTML = "";

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    tableBody.innerHTML =
        filteredRoutes
            .map(
                route =>
                    createRouteRow(
                        route
                    )
            )
            .join("");

}


// ==========================================
// CREATE TABLE ROW
// ==========================================

function createRouteRow(route) {

    const statusClass =
        route.status === "active"
            ? "status-active"
            : "status-inactive";


    const statusText =
        route.status === "active"
            ? "Active"
            : "Inactive";


    return `

        <tr>

            <td>

                <div class="route-name">

                    <div class="route-icon">
                        ⇄
                    </div>

                    <div>

                        <div class="route-origin">

                            ${escapeHTML(
                                route.origin
                            )}

                            →

                            ${escapeHTML(
                                route.destination
                            )}

                        </div>

                        <div class="route-destination">

                            Route #${route.id}

                        </div>

                    </div>

                </div>

            </td>


            <td>

                ${Number(
                    route.distance_km
                ).toLocaleString()}

                km

            </td>


            <td>

                ${escapeHTML(
                    route.estimated_duration
                )}

            </td>


            <td>

                ${formatCurrency(
                    route.fare
                )}

            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >

                    ${statusText}

                </span>

            </td>


            <td>

                <div
                    class="action-buttons"
                >

                    <button
                        type="button"
                        class="action-btn"
                        title="Edit"
                        onclick="editRoute(${route.id})"
                    >

                        ✏️

                    </button>


                    <button
                        type="button"
                        class="action-btn"
                        title="Delete"
                        onclick="deleteRoute(${route.id})"
                    >

                        🗑️

                    </button>

                </div>

            </td>

        </tr>

    `;

}


// ==========================================
// OPEN MODAL
// ==========================================

function openAddRouteModal() {

    addRouteForm.reset();

    clearFormMessage();

    addRouteModal.classList.add(
        "active"
    );

    originInput.focus();

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeAddRouteModal() {

    addRouteModal.classList.remove(
        "active"
    );

    addRouteForm.reset();

    clearFormMessage();

}

function closeEditRouteModal() {

    editRouteModal.classList.remove(
        "active"
    );

    editRouteForm.reset();

    clearEditFormMessage();

    editingRouteId = null;

}

function showEditFormMessage(
    message,
    type
) {

    editRouteFormMessage.textContent =
        message;

    editRouteFormMessage.className =
        `form-message ${type}`;

}


function clearEditFormMessage() {

    editRouteFormMessage.textContent =
        "";

    editRouteFormMessage.className =
        "form-message";

}
// ==========================================
// CREATE ROUTE
// ==========================================

async function createRoute(event) {

    event.preventDefault();


    clearFormMessage();


    const origin =
        originInput.value.trim();

    const destination =
        destinationInput.value.trim();

    const distance =
        distanceInput.value;

    const duration =
        durationInput.value.trim();

    const fare =
        fareInput.value;

    const status =
        routeStatusInput.value;


    if (
        !origin ||
        !destination ||
        !distance ||
        !duration ||
        !fare
    ) {

        showFormMessage(
            "Please fill all required fields.",
            "error"
        );

        return;

    }


    try {

        saveRouteButton.disabled =
            true;

        saveRouteButton.textContent =
            "Creating...";


        const response =
            await fetch(
                `${API_URL}/api/routes`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        origin,

                        destination,

                        distance_km:
                            Number(distance),

                        estimated_duration:
                            duration,

                        fare:
                            Number(fare),

                        status

                    })

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

            showFormMessage(
                result.message ||
                "Failed to create route.",
                "error"
            );

            return;

        }


        showFormMessage(
            "Route created successfully.",
            "success"
        );


        await loadRoutes();


        setTimeout(
            () => {

                closeAddRouteModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "Create route error:",
            error
        );


        showFormMessage(
            "Unable to connect to the server.",
            "error"
        );


    } finally {

        saveRouteButton.disabled =
            false;

        saveRouteButton.textContent =
            "Create Route";

    }

}


// ==========================================
// EDIT
// ==========================================
function editRoute(id) {

    const route =
        routes.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!route) {

        alert(
            "Route not found."
        );

        return;

    }


    editingRouteId =
        route.id;


    editOriginInput.value =
        route.origin || "";


    editDestinationInput.value =
        route.destination || "";


    editDistanceInput.value =
        route.distance_km || "";


    editDurationInput.value =
        route.estimated_duration || "";


    editFareInput.value =
        route.fare || "";


    editStatusInput.value =
        route.status || "active";


    clearEditFormMessage();


    editRouteModal.classList.add(
        "active"
    );


    editOriginInput.focus();

}

// ==========================================
// UPDATE ROUTE
// ==========================================

async function submitRouteUpdate(event) {

    event.preventDefault();


    clearEditFormMessage();


    if (!editingRouteId) {

        showEditFormMessage(
            "No route selected.",
            "error"
        );

        return;

    }


    const origin =
        editOriginInput.value.trim();

    const destination =
        editDestinationInput.value.trim();

    const distance =
        editDistanceInput.value;

    const duration =
        editDurationInput.value.trim();

    const fare =
        editFareInput.value;

    const status =
        editStatusInput.value;


    if (
        !origin ||
        !destination ||
        !distance ||
        !duration ||
        !fare
    ) {

        showEditFormMessage(
            "Please fill all required fields.",
            "error"
        );

        return;

    }


    try {

        updateRouteButton.disabled =
            true;

        updateRouteButton.textContent =
            "Saving...";


        const response =
            await fetch(
                `${API_URL}/api/routes/${editingRouteId}`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        origin,

                        destination,

                        distance_km:
                            Number(distance),

                        estimated_duration:
                            duration,

                        fare:
                            Number(fare),

                        status

                    })

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

            showEditFormMessage(
                result.message ||
                "Failed to update route.",
                "error"
            );

            return;

        }


        showEditFormMessage(
            "Route updated successfully.",
            "success"
        );


        await loadRoutes();


        setTimeout(
            () => {

                closeEditRouteModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "Update route error:",
            error
        );


        showEditFormMessage(
            "Unable to connect to the server.",
            "error"
        );


    } finally {

        updateRouteButton.disabled =
            false;

        updateRouteButton.textContent =
            "Save Changes";

    }

}
// ==========================================
// DELETE
// ==========================================
// ==========================================
// OPEN DELETE MODAL
// ==========================================

function deleteRoute(id) {

    const route =
        routes.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!route) {

        alert(
            "Route not found."
        );

        return;

    }


    deletingRouteId =
        route.id;


    deleteRoutePreview.innerHTML = `

        ${escapeHTML(route.origin)}

        →

        ${escapeHTML(route.destination)}

    `;


    deleteRouteModal.classList.add(
        "active"
    );

}

/////
// ==========================================
// CONFIRM DELETE
// ==========================================

async function confirmDeleteRoute() {

    if (!deletingRouteId) {

        return;

    }


    try {

        confirmDeleteButton.disabled =
            true;

        confirmDeleteButton.textContent =
            "Deleting...";


        const response =
            await fetch(
                `${API_URL}/api/routes/${deletingRouteId}`,
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

            alert(
                result.message ||
                "Failed to delete route."
            );

            return;

        }


        closeDeleteRouteModal();


        await loadRoutes();


    } catch (error) {

        console.error(
            "Delete route error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );


    } finally {

        confirmDeleteButton.disabled =
            false;

        confirmDeleteButton.textContent =
            "Delete Route";

    }

}
// ==========================================
// FORM MESSAGE
// ==========================================

function showFormMessage(
    message,
    type
) {

    routeFormMessage.textContent =
        message;

    routeFormMessage.className =
        `form-message ${type}`;

}


function clearFormMessage() {

    routeFormMessage.textContent =
        "";

    routeFormMessage.className =
        "form-message";

}


// ==========================================
// CURRENCY
// ==========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {

            style: "currency",

            currency: "NGN",

            maximumFractionDigits: 0

        }
    ).format(
        Number(amount || 0)
    );

}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value || "")
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
// EVENTS
// ==========================================

openAddRouteButton.addEventListener(
    "click",
    openAddRouteModal
);


closeAddRouteButton.addEventListener(
    "click",
    closeAddRouteModal
);


cancelAddRouteButton.addEventListener(
    "click",
    closeAddRouteModal
);


addRouteForm.addEventListener(
    "submit",
    createRoute
);


searchInput.addEventListener(
    "input",
    renderRoutes
);


statusFilter.addEventListener(
    "change",
    renderRoutes
);


refreshButton.addEventListener(
    "click",
    loadRoutes
);

// ==========================================
// EDIT EVENTS
// ==========================================

closeEditRouteButton.addEventListener(
    "click",
    closeEditRouteModal
);


cancelEditRouteButton.addEventListener(
    "click",
    closeEditRouteModal
);


editRouteForm.addEventListener(
    "submit",
    submitRouteUpdate
);


editRouteModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editRouteModal
        ) {

            closeEditRouteModal();

        }

    }
);
// Close when clicking outside

addRouteModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            addRouteModal
        ) {

            closeAddRouteModal();

        }

    }
);

/////
// ==========================================
// CLOSE DELETE MODAL
// ==========================================

function closeDeleteRouteModal() {

    deleteRouteModal.classList.remove(
        "active"
    );

    deletingRouteId = null;

}
////////////////////
// ==========================================
// DELETE EVENTS
// ==========================================

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteRouteModal
);


confirmDeleteButton.addEventListener(
    "click",
    confirmDeleteRoute
);


deleteRouteModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            deleteRouteModal
        ) {

            closeDeleteRouteModal();

        }

    }
);

// ESC
document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAddRouteModal();

            closeEditRouteModal();

            closeDeleteRouteModal();

        }

    }
);
// ==========================================
// INITIAL LOAD
// ==========================================

loadRoutes();