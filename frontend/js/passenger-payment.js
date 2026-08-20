// ==========================================================
// TRANSITPRO - PASSENGER PAYMENT PAGE
// ==========================================================


// ==========================================================
// API CONFIGURATION
// ==========================================================

const API_URL = "http://localhost:5000";


// ==========================================================
// AUTHENTICATION
// ==========================================================

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


// Protect passenger page

if (!token || !currentUser) {

    window.location.href = "login.html";

}


// ==========================================================
// DOM ELEMENTS
// ==========================================================

// User

const userName =
    document.getElementById("userName");

const userPhone =
    document.getElementById("userPhone");

const userAvatar =
    document.getElementById("userAvatar");


// Navigation

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const passengerSidebar =
    document.getElementById("passengerSidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


// Statistics

const totalPaidElement =
    document.getElementById("totalPaid");

const successfulPaymentsElement =
    document.getElementById("successfulPayments");

const pendingPaymentsElement =
    document.getElementById("pendingPayments");

const failedPaymentsElement =
    document.getElementById("failedPayments");


// Filters

const paymentSearch =
    document.getElementById("paymentSearch");

const paymentStatusFilter =
    document.getElementById("paymentStatusFilter");

const paymentDateFilter =
    document.getElementById("paymentDateFilter");

const clearPaymentFilters =
    document.getElementById("clearPaymentFilters");


// Buttons

const refreshPayments =
    document.getElementById("refreshPayments");

const retryButton =
    document.getElementById("retryButton");


// Results

const resultsCount =
    document.getElementById("resultsCount");

const paymentsTableBody =
    document.getElementById("paymentsTableBody");

const paymentsContainer =
    document.getElementById("paymentsContainer");


// States

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const emptyState =
    document.getElementById("emptyState");


// Modal

const paymentModal =
    document.getElementById("paymentModal");

const paymentDetails =
    document.getElementById("paymentDetails");

const closePaymentModal =
    document.getElementById("closePaymentModal");

const closePaymentModalBottom =
    document.getElementById(
        "closePaymentModalBottom"
    );


// ==========================================================
// DATA
// ==========================================================

let allPayments = [];

let filteredPayments = [];


// ==========================================================
// API REQUEST
// ==========================================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})

                }
            }
        );


        // Unauthorized

        if (response.status === 401) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return null;
        }


        // Try JSON response

        let data = null;

        try {

            data = await response.json();

        } catch (error) {

            data = null;

        }


        if (!response.ok) {

            return {

                success: false,

                message:
                    data?.message ||
                    `Request failed with status ${response.status}`

            };

        }


        return data;

    } catch (error) {

        console.error(
            "Payment API Error:",
            error
        );

        return {

            success: false,

            message:
                "Unable to connect to the server."

        };

    }

}


// ==========================================================
// DISPLAY USER
// ==========================================================

function displayUser() {

    if (!currentUser) {
        return;
    }


    const name =
        currentUser.full_name ||
        currentUser.name ||
        currentUser.username ||
        "Passenger";


    const phone =
        currentUser.phone ||
        currentUser.phone_number ||
        "—";


    if (userName) {

        userName.textContent =
            name;

    }


    if (userPhone) {

        userPhone.textContent =
            phone;

    }


    if (userAvatar) {

        const initials =
            name
                .split(" ")
                .filter(Boolean)
                .map(
                    word =>
                        word.charAt(0)
                )
                .join("")
                .substring(0, 2)
                .toUpperCase();


        userAvatar.textContent =
            initials || "P";

    }

}


// ==========================================================
// LOGOUT
// ==========================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


// ==========================================================
// MOBILE MENU
// ==========================================================

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


if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            if (
                passengerSidebar &&
                passengerSidebar.classList.contains(
                    "open"
                )
            ) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeMobileMenu
    );

}


// ==========================================================
// LOADING STATE
// ==========================================================

function showLoading() {

    if (loadingState) {

        loadingState.style.display =
            "flex";

    }


    if (errorState) {

        errorState.style.display =
            "none";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (paymentsContainer) {

        paymentsContainer.style.display =
            "none";

    }

}


// ==========================================================
// HIDE LOADING
// ==========================================================

function hideLoading() {

    if (loadingState) {

        loadingState.style.display =
            "none";

    }

}


// ==========================================================
// SHOW ERROR
// ==========================================================

function showError(message) {

    hideLoading();


    if (paymentsContainer) {

        paymentsContainer.style.display =
            "none";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.textContent =
            message ||
            "Something went wrong.";

    }


    if (errorState) {

        errorState.style.display =
            "flex";

    }

}


// ==========================================================
// HIDE ERROR
// ==========================================================

function hideError() {

    if (errorState) {

        errorState.style.display =
            "none";

    }

}


// ==========================================================
// FORMAT MONEY
// ==========================================================

function formatAmount(amount) {

    const number =
        Number(amount || 0);


    return number.toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================================
// FORMAT DATE
// ==========================================================

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


// ==========================================================
// FORMAT DATETIME
// ==========================================================

function formatDateTime(date) {

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


    return parsed.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ==========================================================
// NORMALIZE PAYMENT STATUS
// ==========================================================

function normalizePaymentStatus(status) {

    const value =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "paid" ||
        value === "success" ||
        value === "successful" ||
        value === "completed"
    ) {

        return "successful";

    }


    if (
        value === "pending" ||
        value === "processing"
    ) {

        return "pending";

    }


    if (
        value === "failed" ||
        value === "failure"
    ) {

        return "failed";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    return value || "pending";

}


// ==========================================================
// STATUS CLASS
// ==========================================================

function getStatusClass(status) {

    return `payment-status-${normalizePaymentStatus(status)}`;

}


// ==========================================================
// GET PAYMENT ID
// ==========================================================

function getPaymentId(payment) {

    return (
        payment.id ||
        payment.payment_id ||
        payment.transaction_id ||
        payment.reference ||
        ""
    );

}


// ==========================================================
// GET TRANSACTION REFERENCE
// ==========================================================

function getTransactionReference(payment) {

    return (
        payment.transaction_reference ||
        payment.transaction_ref ||
        payment.transaction_id ||
        payment.payment_reference ||
        payment.reference ||
        `PAY-${payment.id || "N/A"}`
    );

}


// ==========================================================
// GET BOOKING REFERENCE
// ==========================================================

function getBookingReference(payment) {

    return (
        payment.booking_reference ||
        payment.booking_ref ||
        payment.booking?.booking_reference ||
        payment.booking?.reference ||
        "N/A"
    );

}


// ==========================================================
// GET ROUTE
// ==========================================================

function getRoute(payment) {

    const origin =
        payment.origin ||
        payment.trip_origin ||
        payment.booking?.origin ||
        payment.trip?.origin ||
        "N/A";


    const destination =
        payment.destination ||
        payment.trip_destination ||
        payment.booking?.destination ||
        payment.trip?.destination ||
        "N/A";


    return {
        origin,
        destination
    };

}


// ==========================================================
// GET PAYMENT DATE
// ==========================================================

function getPaymentDate(payment) {

    return (
        payment.payment_date ||
        payment.paid_at ||
        payment.transaction_date ||
        payment.created_at ||
        payment.date ||
        null
    );

}


// ==========================================================
// GET PAYMENT AMOUNT
// ==========================================================

function getPaymentAmount(payment) {

    return Number(
        payment.amount ??
        payment.payment_amount ??
        payment.total_amount ??
        payment.booking?.amount ??
        0
    );

}


// ==========================================================
// GET PAYMENT METHOD
// ==========================================================

function getPaymentMethod(payment) {

    return (
        payment.payment_method ||
        payment.method ||
        payment.channel ||
        "N/A"
    );

}


// ==========================================================
// LOAD PAYMENTS
// ==========================================================

async function loadPayments() {

    showLoading();

    hideError();

const result =
    await apiRequest(
        "/api/payments/my-payments"
    );


    if (
        !result ||
        !result.success
    ) {

        showError(
            result?.message ||
            "Unable to load payment history."
        );

        return;

    }


    const data =
        Array.isArray(result.data)
            ? result.data
            : [];


    allPayments =
        data;


    updateStatistics();


    applyFilters();

}


// ==========================================================
// UPDATE STATISTICS
// ==========================================================

function updateStatistics() {

    let totalPaid = 0;

    let successful = 0;

    let pending = 0;

    let failed = 0;


    allPayments.forEach(
        payment => {

            const status =
                normalizePaymentStatus(
                    payment.payment_status ||
                    payment.status
                );


            const amount =
                getPaymentAmount(
                    payment
                );


            if (
                status ===
                "successful"
            ) {

                totalPaid += amount;

                successful++;

            }


            if (
                status ===
                "pending"
            ) {

                pending++;

            }


            if (
                status ===
                "failed"
            ) {

                failed++;

            }

        }
    );


    if (totalPaidElement) {

        totalPaidElement.textContent =
            `₦${formatAmount(totalPaid)}`;

    }


    if (
        successfulPaymentsElement
    ) {

        successfulPaymentsElement.textContent =
            successful;

    }


    if (pendingPaymentsElement) {

        pendingPaymentsElement.textContent =
            pending;

    }


    if (failedPaymentsElement) {

        failedPaymentsElement.textContent =
            failed;

    }

}


// ==========================================================
// APPLY FILTERS
// ==========================================================

function applyFilters() {

    const search =
        paymentSearch
            ? paymentSearch.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        paymentStatusFilter
            ? paymentStatusFilter.value
            : "all";


    const selectedDate =
        paymentDateFilter
            ? paymentDateFilter.value
            : "";


    filteredPayments =
        allPayments.filter(
            payment => {

                // ------------------------------
                // SEARCH
                // ------------------------------

                const route =
                    getRoute(payment);


                const searchableText = [

                    getTransactionReference(
                        payment
                    ),

                    getBookingReference(
                        payment
                    ),

                    route.origin,

                    route.destination,

                    getPaymentMethod(
                        payment
                    )

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );


                // ------------------------------
                // STATUS
                // ------------------------------

                const paymentStatus =
                    normalizePaymentStatus(
                        payment.payment_status ||
                        payment.status
                    );


                const matchesStatus =
                    status === "all" ||
                    paymentStatus === status;


                // ------------------------------
                // DATE
                // ------------------------------

                let matchesDate = true;


                if (selectedDate) {

                    const paymentDate =
                        getPaymentDate(
                            payment
                        );


                    if (paymentDate) {

                        const date =
                            new Date(
                                paymentDate
                            );


                        if (
                            !Number.isNaN(
                                date.getTime()
                            )
                        ) {

                            const year =
                                date.getFullYear();


                            const month =
                                String(
                                    date.getMonth() + 1
                                )
                                .padStart(
                                    2,
                                    "0"
                                );


                            const day =
                                String(
                                    date.getDate()
                                )
                                .padStart(
                                    2,
                                    "0"
                                );


                            const formatted =
                                `${year}-${month}-${day}`;


                            matchesDate =
                                formatted ===
                                selectedDate;

                        } else {

                            matchesDate =
                                false;

                        }

                    } else {

                        matchesDate =
                            false;

                    }

                }


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDate
                );

            }
        );


    renderPayments(
        filteredPayments
    );

}


// ==========================================================
// RENDER PAYMENTS
// ==========================================================

function renderPayments(payments) {

    hideLoading();

    hideError();


    if (resultsCount) {

        resultsCount.textContent =
            payments.length;

    }


    // No payments

    if (!payments.length) {

        if (paymentsContainer) {

            paymentsContainer.style.display =
                "none";

        }


        if (emptyState) {

            emptyState.style.display =
                "flex";

        }


        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (paymentsContainer) {

        paymentsContainer.style.display =
            "block";

    }


    if (!paymentsTableBody) {
        return;
    }


    paymentsTableBody.innerHTML = "";


    payments.forEach(
        payment => {

            const row =
                document.createElement(
                    "tr"
                );


            const transaction =
                getTransactionReference(
                    payment
                );


            const bookingReference =
                getBookingReference(
                    payment
                );


            const route =
                getRoute(payment);


            const paymentDate =
                getPaymentDate(payment);


            const amount =
                getPaymentAmount(payment);


            const method =
                getPaymentMethod(payment);


            const status =
                normalizePaymentStatus(
                    payment.payment_status ||
                    payment.status
                );


            row.innerHTML = `

                <td>

                    <strong class="transaction-reference">

                        ${escapeHTML(
                            transaction
                        )}

                    </strong>

                </td>


                <td>

                    <span class="booking-reference">

                        ${escapeHTML(
                            bookingReference
                        )}

                    </span>

                </td>


                <td>

                    <div class="payment-route">

                        <span>
                            ${escapeHTML(
                                route.origin
                            )}
                        </span>

                        <span class="route-arrow">
                            →
                        </span>

                        <span>
                            ${escapeHTML(
                                route.destination
                            )}
                        </span>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        formatDate(
                            paymentDate
                        )
                    )}

                </td>


                <td>

                    <strong class="payment-amount">

                        ₦${formatAmount(
                            amount
                        )}

                    </strong>

                </td>


                <td>

                    <span class="payment-method">

                        ${escapeHTML(
                            method
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="payment-status ${getStatusClass(
                            status
                        )}"
                    >

                        ${escapeHTML(
                            capitalizeStatus(
                                status
                            )
                        )}

                    </span>

                </td>


                <td>

                    <button
                        type="button"
                        class="payment-view-button"
                        data-payment-id="${escapeHTML(
                            String(
                                getPaymentId(
                                    payment
                                )
                            )
                        )}"
                    >

                        👁 View

                    </button>

                </td>

            `;


            paymentsTableBody.appendChild(
                row
            );

        }
    );


    attachPaymentButtons();

}


// ==========================================================
// CAPITALIZE STATUS
// ==========================================================

function capitalizeStatus(status) {

    const value =
        String(
            status || ""
        );


    return value.charAt(0).toUpperCase() +
        value.slice(1);

}


// ==========================================================
// ATTACH VIEW BUTTONS
// ==========================================================

function attachPaymentButtons() {

    const buttons =
        document.querySelectorAll(
            ".payment-view-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.paymentId;


                    const payment =
                        allPayments.find(
                            item =>
                                String(
                                    getPaymentId(
                                        item
                                    )
                                ) ===
                                String(id)
                        );


                    if (!payment) {

                        alert(
                            "Payment information not found."
                        );

                        return;

                    }


                    openPaymentModal(
                        payment
                    );

                }
            );

        }
    );

}


// ==========================================================
// OPEN PAYMENT MODAL
// ==========================================================

function openPaymentModal(payment) {

    if (!paymentModal) {
        return;
    }


    const transaction =
        getTransactionReference(
            payment
        );


    const bookingReference =
        getBookingReference(
            payment
        );


    const route =
        getRoute(payment);


    const paymentDate =
        getPaymentDate(payment);


    const amount =
        getPaymentAmount(payment);


    const method =
        getPaymentMethod(payment);


    const status =
        normalizePaymentStatus(
            payment.payment_status ||
            payment.status
        );


    const paymentId =
        getPaymentId(payment);


    if (paymentDetails) {

        paymentDetails.innerHTML = `

            <div class="payment-detail-grid">


                <div class="payment-detail-item">

                    <span>
                        Transaction
                    </span>

                    <strong>
                        ${escapeHTML(
                            transaction
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Payment ID
                    </span>

                    <strong>
                        ${escapeHTML(
                            String(
                                paymentId ||
                                "N/A"
                            )
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Booking Reference
                    </span>

                    <strong>
                        ${escapeHTML(
                            bookingReference
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Payment Date
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDateTime(
                                paymentDate
                            )
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Route
                    </span>

                    <strong>
                        ${escapeHTML(
                            route.origin
                        )}
                        →
                        ${escapeHTML(
                            route.destination
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Amount
                    </span>

                    <strong class="modal-amount">

                        ₦${formatAmount(
                            amount
                        )}

                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Payment Method
                    </span>

                    <strong>
                        ${escapeHTML(
                            method
                        )}
                    </strong>

                </div>


                <div class="payment-detail-item">

                    <span>
                        Status
                    </span>

                    <strong>

                        <span
                            class="payment-status ${getStatusClass(
                                status
                            )}"
                        >

                            ${escapeHTML(
                                capitalizeStatus(
                                    status
                                )
                            )}

                        </span>

                    </strong>

                </div>

            </div>

        `;

    }


    paymentModal.classList.add(
        "active"
    );


    paymentModal.setAttribute(
        "aria-hidden",
        "false"
    );


    paymentModal.removeAttribute(
        "inert"
    );

}


// ==========================================================
// CLOSE PAYMENT MODAL
// ==========================================================

function closePaymentModalFunction() {

    if (!paymentModal) {
        return;
    }


    // Remove focus before hiding modal

    if (
        document.activeElement &&
        paymentModal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    paymentModal.classList.remove(
        "active"
    );


    paymentModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ==========================================================
// MODAL EVENTS
// ==========================================================

if (closePaymentModal) {

    closePaymentModal.addEventListener(
        "click",
        closePaymentModalFunction
    );

}


if (closePaymentModalBottom) {

    closePaymentModalBottom.addEventListener(
        "click",
        closePaymentModalFunction
    );

}


if (paymentModal) {

    paymentModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                paymentModal
            ) {

                closePaymentModalFunction();

            }

        }
    );

}


// ==========================================================
// ESC KEY CLOSE MODAL
// ==========================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            paymentModal &&
            paymentModal.classList.contains(
                "active"
            )
        ) {

            closePaymentModalFunction();

        }

    }
);


// ==========================================================
// SEARCH FILTER
// ==========================================================

if (paymentSearch) {

    paymentSearch.addEventListener(
        "input",
        applyFilters
    );

}


// ==========================================================
// STATUS FILTER
// ==========================================================

if (paymentStatusFilter) {

    paymentStatusFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ==========================================================
// DATE FILTER
// ==========================================================

if (paymentDateFilter) {

    paymentDateFilter.addEventListener(
        "change",
        applyFilters
    );

}


// ==========================================================
// CLEAR FILTERS
// ==========================================================

if (clearPaymentFilters) {

    clearPaymentFilters.addEventListener(
        "click",
        () => {

            if (paymentSearch) {

                paymentSearch.value = "";

            }


            if (paymentStatusFilter) {

                paymentStatusFilter.value =
                    "all";

            }


            if (paymentDateFilter) {

                paymentDateFilter.value = "";

            }


            applyFilters();

        }
    );

}


// ==========================================================
// REFRESH PAYMENTS
// ==========================================================

if (refreshPayments) {

    refreshPayments.addEventListener(
        "click",
        async () => {

            const originalText =
                refreshPayments.innerHTML;


            refreshPayments.disabled =
                true;


            refreshPayments.innerHTML =
                "⏳ Loading...";


            await loadPayments();


            refreshPayments.disabled =
                false;


            refreshPayments.innerHTML =
                originalText;

        }
    );

}


// ==========================================================
// RETRY
// ==========================================================

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadPayments
    );

}


// ==========================================================
// INITIALIZE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayUser();

        loadPayments();

    }
);