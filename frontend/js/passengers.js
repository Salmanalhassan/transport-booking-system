// =========================================
// PASSENGERS MANAGEMENT
// =========================================

const API_URL = "http://localhost:5000";


// =========================================
// GET AUTH DATA
// =========================================

const token = localStorage.getItem("token");

const user = JSON.parse(
    localStorage.getItem("user") || "null"
);


// =========================================
// PROTECT PAGE
// =========================================

if (!token || !user) {

    window.location.href = "login.html";

}


// =========================================
// DOM ELEMENTS
// =========================================

const tableBody =
    document.getElementById(
        "passengersTableBody"
    );

const searchInput =
    document.getElementById(
        "searchPassenger"
    );

const refreshButton =
    document.getElementById(
        "refreshPassengers"
    );

const openAddButton =
    document.getElementById(
        "openAddPassenger"
    );

const modal =
    document.getElementById(
        "passengerModal"
    );

const closeModalButton =
    document.getElementById(
        "closePassengerModal"
    );

const cancelButton =
    document.getElementById(
        "cancelPassenger"
    );

const passengerForm =
    document.getElementById(
        "passengerForm"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );

const saveButton =
    document.getElementById(
        "savePassenger"
    );
////////
// =========================================
// EDIT MODAL ELEMENTS
// =========================================

const editModal =
    document.getElementById(
        "editPassengerModal"
    );

const editForm =
    document.getElementById(
        "editPassengerForm"
    );

const closeEditModalButton =
    document.getElementById(
        "closeEditPassengerModal"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditPassenger"
    );

const updateButton =
    document.getElementById(
        "updatePassengerButton"
    );

const editFormMessage =
    document.getElementById(
        "editFormMessage"
    );

const editFullName =
    document.getElementById(
        "editFullName"
    );

const editPhone =
    document.getElementById(
        "editPhone"
    );

const editEmail =
    document.getElementById(
        "editEmail"
    );

const editAddress =
    document.getElementById(
        "editAddress"
    );

const editEmergencyContact =
    document.getElementById(
        "editEmergencyContact"
    );

const editEmergencyPhone =
    document.getElementById(
        "editEmergencyPhone"
    );


// Currently editing passenger

let editingPassengerId = null;

// Statistics

const totalPassengers =
    document.getElementById(
        "totalPassengers"
    );

const passengersWithPhone =
    document.getElementById(
        "passengersWithPhone"
    );

const passengersWithEmail =
    document.getElementById(
        "passengersWithEmail"
    );


// =========================================
// DATA
// =========================================

let passengers = [];


// =========================================
// LOAD PASSENGERS
// =========================================

async function loadPassengers() {

    try {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-cell"
                >

                    Loading passengers...

                </td>

            </tr>

        `;


        const response =
            await fetch(
                `${API_URL}/api/passengers`,
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


        // =====================================
        // INVALID / EXPIRED TOKEN
        // =====================================

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
                "Failed to load passengers"
            );

        }


        passengers =
            result.data || [];


        updateStatistics();

        renderPassengers(
            passengers
        );


    } catch (error) {

        console.error(
            "Load passengers error:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-cell"
                >

                    Failed to load passengers.

                    <br>

                    Please refresh the page.

                </td>

            </tr>

        `;

    }

}


// =========================================
// UPDATE STATISTICS
// =========================================

function updateStatistics() {

    totalPassengers.textContent =
        passengers.length;


    const withPhone =
        passengers.filter(
            passenger =>
                passenger.phone &&
                passenger.phone.trim() !== ""
        ).length;


    const withEmail =
        passengers.filter(
            passenger =>
                passenger.email &&
                passenger.email.trim() !== ""
        ).length;


    passengersWithPhone.textContent =
        withPhone;


    passengersWithEmail.textContent =
        withEmail;

}


// =========================================
// RENDER PASSENGERS
// =========================================

function renderPassengers(
    data
) {

    if (!data.length) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-cell"
                >

                    No passengers found.

                </td>

            </tr>

        `;

        return;

    }


    tableBody.innerHTML =
        data.map(
            (passenger, index) => {

                const initials =
                    getInitials(
                        passenger.full_name
                    );


                return `

                    <tr>

                        <td>
                            ${index + 1}
                        </td>


                        <td>

                            <div
                                class="passenger-name"
                            >

                                <div
                                    class="passenger-avatar"
                                >

                                    ${initials}

                                </div>


                                <div
                                    class="passenger-name-text"
                                >

                                    <strong>
                                        ${escapeHTML(
                                            passenger.full_name
                                        )}
                                    </strong>

                                    <small>
                                        ID: #${passenger.id}
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>

                            <span
                                class="phone-cell"
                            >

                                ${escapeHTML(
                                    passenger.phone || "-"
                                )}

                            </span>

                        </td>


                        <td>

                            <span
                                class="email-cell"
                                title="${escapeHTML(
                                    passenger.email || ""
                                )}"
                            >

                                ${escapeHTML(
                                    passenger.email || "-"
                                )}

                            </span>

                        </td>


                        <td>

                            <span
                                class="address-cell"
                                title="${escapeHTML(
                                    passenger.address || ""
                                )}"
                            >

                                ${escapeHTML(
                                    passenger.address || "-"
                                )}

                            </span>

                        </td>


                        <td>

                            <div
                                class="emergency-cell"
                            >

                                <strong>

                                    ${escapeHTML(
                                        passenger.emergency_contact ||
                                        "-"
                                    )}

                                </strong>


                                <small>

                                    ${escapeHTML(
                                        passenger.emergency_phone ||
                                        ""
                                    )}

                                </small>

                            </div>

                        </td>


                        <td>

                            ${formatDate(
                                passenger.created_at
                            )}

                        </td>


                        <td>

                            <div
                                class="actions"
                            >

                                <button
                                    type="button"
                                    class="action-btn edit"
                                    title="Edit passenger"
                                    onclick="editPassenger(${passenger.id})"
                                >

                                    ✏️

                                </button>


                                <button
                                    type="button"
                                    class="action-btn delete"
                                    title="Delete passenger"
                                    onclick="deletePassenger(${passenger.id})"
                                >

                                    🗑️

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


// =========================================
// SEARCH
// =========================================

function searchPassengers() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        renderPassengers(
            passengers
        );

        return;

    }


    const filtered =
        passengers.filter(
            passenger => {

                const name =
                    passenger.full_name
                        ?.toLowerCase() || "";

                const phone =
                    passenger.phone
                        ?.toLowerCase() || "";

                const email =
                    passenger.email
                        ?.toLowerCase() || "";

                const address =
                    passenger.address
                        ?.toLowerCase() || "";


                return (

                    name.includes(
                        searchTerm
                    ) ||

                    phone.includes(
                        searchTerm
                    ) ||

                    email.includes(
                        searchTerm
                    ) ||

                    address.includes(
                        searchTerm
                    )

                );

            }
        );


    renderPassengers(
        filtered
    );

}


// =========================================
// OPEN ADD MODAL
// =========================================

function openAddPassengerModal() {

    passengerForm.reset();

    clearFormMessage();


    modal.classList.add(
        "active"
    );


    document
        .getElementById("fullName")
        .focus();

}


// =========================================
// CLOSE MODAL
// =========================================

function closePassengerModal() {

    modal.classList.remove(
        "active"
    );

    passengerForm.reset();

    clearFormMessage();

}


// =========================================
// CREATE PASSENGER
// =========================================

async function createPassenger(
    event
) {

    event.preventDefault();


    clearFormMessage();


    const fullName =
        document
            .getElementById("fullName")
            .value
            .trim();


    const phone =
        document
            .getElementById("phone")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const address =
        document
            .getElementById("address")
            .value
            .trim();


    const emergencyContact =
        document
            .getElementById(
                "emergencyContact"
            )
            .value
            .trim();


    const emergencyPhone =
        document
            .getElementById(
                "emergencyPhone"
            )
            .value
            .trim();


    if (!fullName || !phone) {

        showFormMessage(
            "Full name and phone are required.",
            "error"
        );

        return;

    }


    const passengerData = {

        full_name: fullName,

        email:
            email || null,

        phone,

        address:
            address || null,

        emergency_contact:
            emergencyContact || null,

        emergency_phone:
            emergencyPhone || null

    };


    try {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Creating...";


        const response =
            await fetch(
                `${API_URL}/api/passengers`,
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
                            passengerData
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

            showFormMessage(
                result.message ||
                "Failed to create passenger.",
                "error"
            );

            return;

        }


        showFormMessage(
            "Passenger created successfully.",
            "success"
        );


        passengerForm.reset();


        await loadPassengers();


        setTimeout(
            () => {

                closePassengerModal();

            },
            800
        );


    } catch (error) {

        console.error(
            "Create passenger error:",
            error
        );


        showFormMessage(
            "Unable to connect to the server.",
            "error"
        );

    } finally {

        saveButton.disabled =
            false;

        saveButton.textContent =
            "Create Passenger";

    }

}


// =========================================
// EDIT PASSENGER
// =========================================

// =========================================
// OPEN EDIT PASSENGER MODAL
// =========================================

function editPassenger(id) {

    const passenger =
        passengers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!passenger) {

        return;

    }


    editingPassengerId =
        passenger.id;


    // Fill form

    editFullName.value =
        passenger.full_name || "";

    editPhone.value =
        passenger.phone || "";

    editEmail.value =
        passenger.email || "";

    editAddress.value =
        passenger.address || "";

    editEmergencyContact.value =
        passenger.emergency_contact || "";

    editEmergencyPhone.value =
        passenger.emergency_phone || "";


    clearEditFormMessage();


    editModal.classList.add(
        "active"
    );


    editFullName.focus();

}

// =========================================
// DELETE PASSENGER
// =========================================

async function deletePassenger(id) {

    const passenger =
        passengers.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!passenger) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete ${passenger.full_name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/passengers/${id}`,
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


        if (!result.success) {

            alert(
                result.message ||
                "Failed to delete passenger."
            );

            return;

        }


        alert(
            "Passenger deleted successfully."
        );


        await loadPassengers();


    } catch (error) {

        console.error(
            "Delete passenger error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}



// =========================================
// FORM MESSAGE
// =========================================

function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


function clearFormMessage() {

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


// =========================================
// GET INITIALS
// =========================================

function getInitials(
    name
) {

    if (!name) {

        return "P";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "-";

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


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(
    value
) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
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


// =========================================
// EVENT LISTENERS
// =========================================

searchInput.addEventListener(
    "input",
    searchPassengers
);


refreshButton.addEventListener(
    "click",
    loadPassengers
);


openAddButton.addEventListener(
    "click",
    openAddPassengerModal
);


closeModalButton.addEventListener(
    "click",
    closePassengerModal
);


cancelButton.addEventListener(
    "click",
    closePassengerModal
);


passengerForm.addEventListener(
    "submit",
    createPassenger
);

// =========================================
// EDIT MODAL EVENTS
// =========================================

closeEditModalButton.addEventListener(
    "click",
    closeEditPassengerModal
);


cancelEditButton.addEventListener(
    "click",
    closeEditPassengerModal
);


editForm.addEventListener(
    "submit",
    updatePassenger
);


// Close when clicking outside

editModal.addEventListener(
    "click",
    event => {

        if (
            event.target === editModal
        ) {

            closeEditPassengerModal();

        }

    }
);
// =========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =========================================

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closePassengerModal();

        }

    }
);


// =========================================
// ESC KEY
// =========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        if (
            modal.classList.contains(
                "active"
            )
        ) {

            closePassengerModal();

        }


        if (
            editModal.classList.contains(
                "active"
            )
        ) {

            closeEditPassengerModal();

        }

    }
);


// =========================================
// INITIAL LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPassengers();

    }
);
// =========================================
// UPDATE PASSENGER
// =========================================

async function updatePassenger(
    event
) {

    event.preventDefault();


    if (!editingPassengerId) {

        return;

    }


    clearEditFormMessage();


    const fullName =
        editFullName.value.trim();

    const phone =
        editPhone.value.trim();

    const email =
        editEmail.value.trim();

    const address =
        editAddress.value.trim();

    const emergencyContact =
        editEmergencyContact.value.trim();

    const emergencyPhone =
        editEmergencyPhone.value.trim();


    if (!fullName || !phone) {

        showEditFormMessage(
            "Full name and phone are required.",
            "error"
        );

        return;

    }


    try {

        updateButton.disabled =
            true;

        updateButton.textContent =
            "Saving...";


        const response =
            await fetch(
                `${API_URL}/api/passengers/${editingPassengerId}`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        full_name:
                            fullName,

                        phone:
                            phone,

                        email:
                            email || null,

                        address:
                            address || null,

                        emergency_contact:
                            emergencyContact || null,

                        emergency_phone:
                            emergencyPhone || null

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
                "Failed to update passenger.",
                "error"
            );

            return;

        }


        showEditFormMessage(
            "Passenger updated successfully.",
            "success"
        );


        await loadPassengers();


        setTimeout(
            () => {

                closeEditPassengerModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "Update passenger error:",
            error
        );


        showEditFormMessage(
            "Unable to connect to the server.",
            "error"
        );


    } finally {

        updateButton.disabled =
            false;

        updateButton.textContent =
            "Save Changes";

    }

}

// =========================================
// CLOSE EDIT MODAL
// =========================================

function closeEditPassengerModal() {

    editModal.classList.remove(
        "active"
    );

    editForm.reset();

    clearEditFormMessage();

    editingPassengerId = null;

}

// =========================================
// EDIT FORM MESSAGE
// =========================================

function showEditFormMessage(
    message,
    type
) {

    editFormMessage.textContent =
        message;

    editFormMessage.className =
        `form-message ${type}`;

}


function clearEditFormMessage() {

    editFormMessage.textContent =
        "";

    editFormMessage.className =
        "form-message";

}