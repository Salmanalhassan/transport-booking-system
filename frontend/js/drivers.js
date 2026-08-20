// ==========================================
// DRIVERS PAGE JAVASCRIPT
// ==========================================

const API_URL = "http://localhost:5000/api/drivers";

let drivers = [];
let editingDriverId = null;
let deletingDriverId = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

const driverModal = document.getElementById("driverModal");
const deleteModal = document.getElementById("deleteModal");

const driverForm = document.getElementById("driverForm");

const openAddDriverBtn =
    document.getElementById("openAddDriverBtn");

const emptyAddDriverBtn =
    document.getElementById("emptyAddDriverBtn");

const closeDriverModal =
    document.getElementById("closeDriverModal");

const cancelDriverBtn =
    document.getElementById("cancelDriverBtn");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");

const searchDriver =
    document.getElementById("searchDriver");

const statusFilter =
    document.getElementById("statusFilter");

const refreshDriversBtn =
    document.getElementById("refreshDriversBtn");

const driversTableBody =
    document.getElementById("driversTableBody");

const modalTitle =
    document.getElementById("modalTitle");

const driverId =
    document.getElementById("driverId");

const fullName =
    document.getElementById("fullName");

const phone =
    document.getElementById("phone");

const licenseNumber =
    document.getElementById("licenseNumber");

const address =
    document.getElementById("address");

const driverStatus =
    document.getElementById("driverStatus");

const totalDrivers =
    document.getElementById("totalDrivers");

const availableDrivers =
    document.getElementById("availableDrivers");

const onTripDrivers =
    document.getElementById("onTripDrivers");

const inactiveDrivers =
    document.getElementById("inactiveDrivers");

const driverCount =
    document.getElementById("driverCount");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadDrivers();

});


// ==========================================
// GET ALL DRIVERS
// ==========================================

async function loadDrivers() {

    try {

        showLoading();

        const response =
            await fetch(API_URL);

        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to load drivers"
            );

        }


        drivers = result.data || [];

        updateStatistics();

        renderDrivers();


    } catch (error) {

        console.error(
            "Load drivers error:",
            error
        );

        showError(
            error.message ||
            "Unable to load drivers"
        );

    }

}


// ==========================================
// RENDER DRIVERS
// ==========================================

function renderDrivers() {

    const searchValue =
        searchDriver.value
            .trim()
            .toLowerCase();

    const statusValue =
        statusFilter.value;


    let filteredDrivers =
        drivers.filter((driver) => {

            const matchesSearch =
                !searchValue ||

                driver.full_name
                    ?.toLowerCase()
                    .includes(searchValue) ||

                driver.phone
                    ?.toLowerCase()
                    .includes(searchValue) ||

                driver.license_number
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesStatus =
                statusValue === "all" ||
                driver.status === statusValue;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    updateDriverCount(
        filteredDrivers.length
    );


    if (filteredDrivers.length === 0) {

        showEmptyState();

        return;

    }


    driversTableBody.innerHTML =
        filteredDrivers
            .map(driver => createDriverRow(driver))
            .join("");

}


// ==========================================
// CREATE DRIVER ROW
// ==========================================

function createDriverRow(driver) {

    const initials =
        getInitials(driver.full_name);


    const statusClass =
        getStatusClass(driver.status);


    const statusText =
        formatStatus(driver.status);


    const createdDate =
        formatDate(driver.created_at);


    return `

        <tr>

            <td>

                <div class="driver-cell">

                    <div class="driver-avatar">

                        ${escapeHtml(initials)}

                    </div>

                    <div class="driver-info">

                        <span class="driver-name">

                            ${escapeHtml(
                                driver.full_name
                            )}

                        </span>

                        <span class="driver-id">

                            Driver #${driver.id}

                        </span>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHtml(
                    driver.phone || "-"
                )}

            </td>


            <td>

                <strong>

                    ${escapeHtml(
                        driver.license_number || "-"
                    )}

                </strong>

            </td>


            <td>

                ${escapeHtml(
                    driver.address || "-"
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

                ${createdDate}

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="action-btn edit"
                        title="Edit Driver"
                        onclick="openEditDriver(${driver.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="action-btn delete"
                        title="Delete Driver"
                        onclick="openDeleteDriver(${driver.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


// ==========================================
// OPEN ADD DRIVER MODAL
// ==========================================

function openAddDriver() {

    editingDriverId = null;

    driverForm.reset();

    driverId.value = "";

    modalTitle.textContent =
        "Add New Driver";

    document.getElementById(
        "saveDriverBtn"
    ).innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Save Driver
    `;

    driverStatus.value =
        "available";


    openModal(driverModal);

    setTimeout(() => {

        fullName.focus();

    }, 100);

}


// ==========================================
// OPEN EDIT DRIVER
// ==========================================

function openEditDriver(id) {

    const driver =
        drivers.find(
            item => Number(item.id) === Number(id)
        );


    if (!driver) {

        showToast(
            "Driver not found",
            "error"
        );

        return;

    }


    editingDriverId =
        driver.id;


    driverId.value =
        driver.id;

    fullName.value =
        driver.full_name || "";

    phone.value =
        driver.phone || "";

    licenseNumber.value =
        driver.license_number || "";

    address.value =
        driver.address || "";

    driverStatus.value =
        driver.status || "available";


    modalTitle.textContent =
        "Edit Driver";


    document.getElementById(
        "saveDriverBtn"
    ).innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Driver
    `;


    openModal(driverModal);

}


// ==========================================
// SAVE DRIVER
// CREATE / UPDATE
// ==========================================

async function saveDriver(event) {

    event.preventDefault();


    const data = {

        full_name:
            fullName.value.trim(),

        phone:
            phone.value.trim(),

        license_number:
            licenseNumber.value.trim(),

        address:
            address.value.trim(),

        status:
            driverStatus.value

    };


    if (
        !data.full_name ||
        !data.phone ||
        !data.license_number
    ) {

        showToast(
            "Please fill all required fields",
            "error"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "saveDriverBtn"
        );


    const originalText =
        saveButton.innerHTML;


    saveButton.disabled = true;

    saveButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;


    try {

        let url =
            API_URL;

        let method =
            "POST";


        if (editingDriverId) {

            url =
                `${API_URL}/${editingDriverId}`;

            method =
                "PUT";

        }


        const response =
            await fetch(url, {

                method,

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(data)

            });


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to save driver"
            );

        }


        closeModal(driverModal);

        driverForm.reset();

        editingDriverId = null;


        await loadDrivers();


        showToast(
            result.message ||
            "Driver saved successfully"
        );


    } catch (error) {

        console.error(
            "Save driver error:",
            error
        );


        showToast(
            error.message ||
            "Failed to save driver",
            "error"
        );


    } finally {

        saveButton.disabled = false;

        saveButton.innerHTML =
            originalText;

    }

}


// ==========================================
// OPEN DELETE MODAL
// ==========================================

function openDeleteDriver(id) {

    const driver =
        drivers.find(
            item => Number(item.id) === Number(id)
        );


    if (!driver) {

        showToast(
            "Driver not found",
            "error"
        );

        return;

    }


    deletingDriverId =
        driver.id;


    const deleteMessage =
        document.getElementById(
            "deleteMessage"
        );


    deleteMessage.textContent =
        `Are you sure you want to delete ${driver.full_name}? This action cannot be undone.`;


    openModal(deleteModal);

}


// ==========================================
// DELETE DRIVER
// ==========================================

async function deleteDriver() {

    if (!deletingDriverId) {

        return;

    }


    const originalText =
        confirmDeleteBtn.innerHTML;


    confirmDeleteBtn.disabled =
        true;


    confirmDeleteBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Deleting...
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/${deletingDriverId}`,
                {
                    method: "DELETE"
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
                "Failed to delete driver"
            );

        }


        closeModal(deleteModal);

        deletingDriverId = null;


        await loadDrivers();


        showToast(
            result.message ||
            "Driver deleted successfully"
        );


    } catch (error) {

        console.error(
            "Delete driver error:",
            error
        );


        showToast(
            error.message ||
            "Failed to delete driver",
            "error"
        );


    } finally {

        confirmDeleteBtn.disabled =
            false;

        confirmDeleteBtn.innerHTML =
            originalText;

    }

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        drivers.length;


    const available =
        drivers.filter(
            driver =>
                driver.status === "available"
        ).length;


    const onTrip =
        drivers.filter(
            driver =>
                driver.status === "on_trip"
        ).length;


    const inactive =
        drivers.filter(
            driver =>
                driver.status === "inactive"
        ).length;


    totalDrivers.textContent =
        total;

    availableDrivers.textContent =
        available;

    onTripDrivers.textContent =
        onTrip;

    inactiveDrivers.textContent =
        inactive;

}


// ==========================================
// DRIVER COUNT
// ==========================================

function updateDriverCount(count) {

    driverCount.textContent =
        `${count} ${count === 1 ? "driver" : "drivers"}`;

}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState() {

    driversTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="empty-state"
            >

                <div class="empty-icon">

                    <i class="fa-solid fa-users"></i>

                </div>

                <h3>
                    No drivers found
                </h3>

                <p>
                    No driver matches your current search or filter.
                </p>

                <button
                    class="btn-primary small"
                    onclick="openAddDriver()"
                >

                    <i class="fa-solid fa-plus"></i>

                    Add Driver

                </button>

            </td>

        </tr>

    `;

}


// ==========================================
// LOADING STATE
// ==========================================

function showLoading() {

    driversTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="empty-state"
            >

                <div class="empty-icon">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                </div>

                <h3>
                    Loading drivers...
                </h3>

                <p>
                    Please wait while drivers are being loaded.
                </p>

            </td>

        </tr>

    `;

}


// ==========================================
// ERROR STATE
// ==========================================

function showError(message) {

    driversTableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="empty-state"
            >

                <div class="empty-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <h3>
                    Unable to load drivers
                </h3>

                <p>
                    ${escapeHtml(message)}
                </p>

                <button
                    class="btn-primary small"
                    onclick="loadDrivers()"
                >

                    <i class="fa-solid fa-rotate"></i>

                    Try Again

                </button>

            </td>

        </tr>

    `;

}


// ==========================================
// MODAL HELPERS
// ==========================================

function openModal(modal) {

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal.classList.remove("active");

    document.body.style.overflow =
        "";

}


// ==========================================
// FORMAT STATUS
// ==========================================

function getStatusClass(status) {

    if (status === "on_trip") {

        return "on-trip";

    }

    if (status === "inactive") {

        return "inactive";

    }

    return "available";

}


function formatStatus(status) {

    if (status === "on_trip") {

        return "On Trip";

    }

    if (status === "inactive") {

        return "Inactive";

    }

    return "Available";

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    if (!name) {

        return "DR";

    }


    const parts =
        name.trim().split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// TOAST
// ==========================================

function showToast(
    message,
    type = "success"
) {

    toastMessage.textContent =
        message;


    const icon =
        document.getElementById(
            "toastIcon"
        );


    if (type === "error") {

        icon.className =
            "fa-solid fa-circle-exclamation";

        icon.style.color =
            "#f87171";

    } else {

        icon.className =
            "fa-solid fa-circle-check";

        icon.style.color =
            "#4ade80";

    }


    toast.classList.add("show");


    clearTimeout(
        window.toastTimeout
    );


    window.toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

}


// ==========================================
// EVENT LISTENERS
// ==========================================

openAddDriverBtn.addEventListener(
    "click",
    openAddDriver
);


if (emptyAddDriverBtn) {

    emptyAddDriverBtn.addEventListener(
        "click",
        openAddDriver
    );

}


closeDriverModal.addEventListener(
    "click",
    () => {

        closeModal(driverModal);

    }
);


cancelDriverBtn.addEventListener(
    "click",
    () => {

        closeModal(driverModal);

    }
);


cancelDeleteBtn.addEventListener(
    "click",
    () => {

        closeModal(deleteModal);

        deletingDriverId = null;

    }
);


confirmDeleteBtn.addEventListener(
    "click",
    deleteDriver
);


driverForm.addEventListener(
    "submit",
    saveDriver
);


searchDriver.addEventListener(
    "input",
    renderDrivers
);


statusFilter.addEventListener(
    "change",
    renderDrivers
);


refreshDriversBtn.addEventListener(
    "click",
    async () => {

        refreshDriversBtn.disabled =
            true;

        await loadDrivers();

        refreshDriversBtn.disabled =
            false;

    }
);


// ==========================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ==========================================

driverModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === driverModal
        ) {

            closeModal(driverModal);

        }

    }
);


deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === deleteModal
        ) {

            closeModal(deleteModal);

            deletingDriverId = null;

        }

    }
);


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {

            return;

        }


        if (
            driverModal.classList.contains(
                "active"
            )
        ) {

            closeModal(driverModal);

        }


        if (
            deleteModal.classList.contains(
                "active"
            )
        ) {

            closeModal(deleteModal);

            deletingDriverId = null;

        }

    }
);