document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // AUTH CHECK
    // ================================

    const token = localStorage.getItem("token");
    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }


    // ================================
    // ELEMENTS
    // ================================

    const busTableBody =
        document.getElementById("busTableBody");

    const loadingState =
        document.getElementById("loadingState");

    const emptyState =
        document.getElementById("emptyState");

    const searchBus =
        document.getElementById("searchBus");

    const statusFilter =
        document.getElementById("statusFilter");

    const busModal =
        document.getElementById("busModal");

    const busForm =
        document.getElementById("busForm");

    const openAddBus =
        document.getElementById("openAddBus");

    const closeBusModal =
        document.getElementById("closeBusModal");

    const cancelBus =
        document.getElementById("cancelBus");

    const modalTitle =
        document.getElementById("modalTitle");

    const busId =
        document.getElementById("busId");

    const busNumber =
        document.getElementById("busNumber");

    const plateNumber =
        document.getElementById("plateNumber");

    const busType =
        document.getElementById("busType");

    const totalSeats =
        document.getElementById("totalSeats");

    const busStatus =
        document.getElementById("busStatus");

    const statusField =
        document.getElementById("statusField");

    const toast =
        document.getElementById("toast");

    const logoutButton =
        document.getElementById("logoutButton");

    const userName =
        document.getElementById("userName");

    const mobileMenu =
        document.querySelector(".mobile-menu");

    const sidebar =
        document.querySelector(".sidebar");


    // ================================
    // USER INFO
    // ================================

    userName.textContent =
        user.full_name || "Administrator";


    // ================================
    // STATE
    // ================================

    let allBuses = [];

    let editingBusId = null;


    // ================================
    // LOAD BUSES
    // ================================

    async function loadBuses() {

        showLoading();

        try {

            const response =
                await apiRequest("/buses");

            allBuses =
                response.data || [];

            updateStatistics(allBuses);

            renderBuses();

        } catch (error) {

            showToast(
                error.message ||
                "Failed to load buses",
                "error"
            );

            showEmpty();

        }

    }


    // ================================
    // STATISTICS
    // ================================

    function updateStatistics(buses) {

        const total =
            buses.length;

        const available =
            buses.filter(
                bus =>
                    bus.status === "available"
            ).length;

        const onTrip =
            buses.filter(
                bus =>
                    bus.status === "on_trip"
            ).length;

        const maintenance =
            buses.filter(
                bus =>
                    bus.status === "maintenance"
            ).length;


        document.getElementById(
            "totalBuses"
        ).textContent = total;

        document.getElementById(
            "availableBuses"
        ).textContent = available;

        document.getElementById(
            "tripBuses"
        ).textContent = onTrip;

        document.getElementById(
            "maintenanceBuses"
        ).textContent = maintenance;
    }


    // ================================
    // RENDER BUSES
    // ================================

    function renderBuses() {

        const search =
            searchBus.value
                .trim()
                .toLowerCase();

        const status =
            statusFilter.value;


        const filtered =
            allBuses.filter(bus => {

                const matchesSearch =
                    bus.bus_number
                        .toLowerCase()
                        .includes(search) ||

                    bus.plate_number
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    status === "all" ||
                    bus.status === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            });


        busTableBody.innerHTML = "";


        if (filtered.length === 0) {

            showEmpty();

            return;
        }


        loadingState.classList.remove("show");

        emptyState.classList.remove("show");


        filtered.forEach(bus => {

            const row =
                document.createElement("tr");


            const formattedDate =
                formatDate(bus.created_at);


            row.innerHTML = `

                <td>

                    <div class="bus-name">

                        <div class="bus-mini-icon">
                            🚌
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(bus.bus_number)}
                            </strong>

                            <span>
                                ID #${bus.id}
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHTML(bus.plate_number)}
                </td>


                <td>
                    ${escapeHTML(bus.bus_type)}
                </td>


                <td>
                    ${bus.total_seats}
                </td>


                <td>

                    <span
                        class="status-badge ${bus.status}"
                    >
                        ${formatStatus(bus.status)}
                    </span>

                </td>


                <td>
                    ${formattedDate}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="action-button"
                            data-action="edit"
                            data-id="${bus.id}"
                            title="Edit"
                        >
                            ✏️
                        </button>

                        <button
                            class="action-button delete"
                            data-action="delete"
                            data-id="${bus.id}"
                            title="Delete"
                        >
                            🗑️
                        </button>

                    </div>

                </td>
            `;


            busTableBody.appendChild(row);

        });

    }


    // ================================
    // ADD BUS MODAL
    // ================================

    openAddBus.addEventListener(
        "click",
        () => {

            editingBusId = null;

            modalTitle.textContent =
                "Add New Bus";

            busForm.reset();

            busId.value = "";

            statusField.style.display =
                "none";

            busModal.classList.add("show");

            busNumber.focus();
        }
    );


    // ================================
    // CLOSE MODAL
    // ================================

    function closeModal() {

        busModal.classList.remove("show");

        busForm.reset();

        editingBusId = null;
    }


    closeBusModal.addEventListener(
        "click",
        closeModal
    );


    cancelBus.addEventListener(
        "click",
        closeModal
    );


    busModal.addEventListener(
        "click",
        event => {

            if (
                event.target === busModal
            ) {
                closeModal();
            }

        }
    );


    // ================================
    // SAVE BUS
    // ================================

    busForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const payload = {

                bus_number:
                    busNumber.value.trim(),

                plate_number:
                    plateNumber.value.trim(),

                bus_type:
                    busType.value,

                total_seats:
                    Number(totalSeats.value),

                status:
                    busStatus.value
            };


            const saveButton =
                document.getElementById(
                    "saveBus"
                );


            saveButton.disabled = true;

            saveButton.textContent =
                editingBusId
                    ? "Updating..."
                    : "Saving...";


            try {

                if (editingBusId) {

                    await apiRequest(
                        `/buses/${editingBusId}`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(payload)
                        }
                    );


                    showToast(
                        "Bus updated successfully",
                        "success"
                    );

                } else {

                    await apiRequest(
                        "/buses",
                        {
                            method: "POST",

                            body:
                                JSON.stringify(payload)
                        }
                    );


                    showToast(
                        "Bus created successfully",
                        "success"
                    );
                }


                closeModal();

                await loadBuses();

            } catch (error) {

                showToast(
                    error.message ||
                    "Failed to save bus",
                    "error"
                );

            } finally {

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save Bus";
            }

        }
    );


    // ================================
    // TABLE ACTIONS
    // ================================

    busTableBody.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;

            const id =
                button.dataset.id;


            if (action === "edit") {

                await editBus(id);

            }


            if (action === "delete") {

                await deleteBus(id);

            }

        }
    );


    // ================================
    // EDIT BUS
    // ================================

    async function editBus(id) {

        try {

            const response =
                await apiRequest(
                    `/buses/${id}`
                );

            const bus =
                response.data;


            editingBusId = bus.id;

            modalTitle.textContent =
                "Edit Bus";

            busId.value =
                bus.id;

            busNumber.value =
                bus.bus_number;

            plateNumber.value =
                bus.plate_number;

            busType.value =
                bus.bus_type;

            totalSeats.value =
                bus.total_seats;

            busStatus.value =
                bus.status;

            statusField.style.display =
                "flex";

            busModal.classList.add("show");

        } catch (error) {

            showToast(
                error.message ||
                "Failed to load bus",
                "error"
            );

        }

    }


    // ================================
    // DELETE BUS
    // ================================

    async function deleteBus(id) {

        const bus =
            allBuses.find(
                item =>
                    item.id === Number(id)
            );


        if (!bus) {
            return;
        }


        const confirmed =
            confirm(
                `Are you sure you want to delete ${bus.bus_number}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await apiRequest(
                `/buses/${id}`,
                {
                    method: "DELETE"
                }
            );


            showToast(
                "Bus deleted successfully",
                "success"
            );


            await loadBuses();

        } catch (error) {

            showToast(
                error.message ||
                "Failed to delete bus",
                "error"
            );

        }

    }


    // ================================
    // SEARCH / FILTER
    // ================================

    searchBus.addEventListener(
        "input",
        renderBuses
    );


    statusFilter.addEventListener(
        "change",
        renderBuses
    );


    // ================================
    // LOGOUT
    // ================================

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


    // ================================
    // MOBILE SIDEBAR
    // ================================

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    // ================================
    // HELPERS
    // ================================

    function showLoading() {

        busTableBody.innerHTML = "";

        loadingState.classList.add("show");

        emptyState.classList.remove("show");
    }


    function showEmpty() {

        loadingState.classList.remove("show");

        emptyState.classList.add("show");
    }


    function formatStatus(status) {

        const labels = {

            available: "Available",

            on_trip: "On Trip",

            maintenance: "Maintenance",

            inactive: "Inactive"
        };


        return labels[status] ||
            status;
    }


    function formatDate(date) {

        if (!date) {
            return "-";
        }


        return new Date(date)
            .toLocaleDateString(
                "en-NG",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function showToast(
        message,
        type = "success"
    ) {

        toast.textContent =
            message;

        toast.className =
            `toast show ${type}`;


        setTimeout(() => {

            toast.className =
                "toast";

        }, 3000);
    }


    // ================================
    // INITIAL LOAD
    // ================================

    loadBuses();

});