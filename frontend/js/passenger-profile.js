// =========================================================
// TRANSITPRO - PASSENGER PROFILE
// =========================================================

// =========================================================
// API
// =========================================================

const API_BASE_URL = "/api";


// =========================================================
// AUTHENTICATION
// =========================================================

const token = localStorage.getItem("token");

let storedUser = null;

try {

    storedUser =
        JSON.parse(
            localStorage.getItem("user") || "null"
        );

} catch (error) {

    console.error(
        "Invalid stored user:",
        error
    );

    storedUser = null;
}


// Protect page

if (!token || !storedUser) {

    window.location.href =
        "login.html";
}


// =========================================================
// CURRENT USER
// =========================================================

let currentUser = storedUser;

let currentPassenger = null;

let originalProfile = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

// Topbar

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


// Profile summary

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const profileDisplayName =
    document.getElementById(
        "profileDisplayName"
    );

const profileDisplayEmail =
    document.getElementById(
        "profileDisplayEmail"
    );

const memberSince =
    document.getElementById(
        "memberSince"
    );

const profileBookingCount =
    document.getElementById(
        "profileBookingCount"
    );


// Profile form

const profileForm =
    document.getElementById(
        "profileForm"
    );

const fullNameInput =
    document.getElementById(
        "fullName"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const phoneInput =
    document.getElementById(
        "phone"
    );

const addressInput =
    document.getElementById(
        "address"
    );

const profileMessage =
    document.getElementById(
        "profileMessage"
    );

const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );

const resetProfileButton =
    document.getElementById(
        "resetProfileButton"
    );


// Password form

const passwordForm =
    document.getElementById(
        "passwordForm"
    );

const currentPasswordInput =
    document.getElementById(
        "currentPassword"
    );

const newPasswordInput =
    document.getElementById(
        "newPassword"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );

const passwordMessage =
    document.getElementById(
        "passwordMessage"
    );

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );


// Navigation

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const passengerSidebar =
    document.getElementById(
        "passengerSidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
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

        if (
            response.status ===
            401
        ) {

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


        // Try JSON

        let data = null;

        try {

            data =
                await response.json();

        } catch {

            data = {
                success:
                    response.ok
            };
        }


        return {

            ...data,

            _httpStatus:
                response.status,

            _ok:
                response.ok

        };

    } catch (error) {

        console.error(
            "API request failed:",
            error
        );

        return {

            success: false,

            message:
                "Unable to connect to the server.",

            _networkError: true

        };
    }
}


// =========================================================
// GET USER ID
// =========================================================

function getCurrentUserId() {

    return (

        currentUser?.id ||

        currentUser?.user_id ||

        currentUser?.passenger_id ||

        null

    );
}


// =========================================================
// GET USER PHONE
// =========================================================

function getCurrentUserPhone() {

    return String(

        currentUser?.phone ||

        currentUser?.passenger_phone ||

        ""

    ).trim();
}


// =========================================================
// GET USER EMAIL
// =========================================================

function getCurrentUserEmail() {

    return String(

        currentUser?.email ||

        ""

    ).trim();
}


// =========================================================
// GET USER NAME
// =========================================================

function getCurrentUserName() {

    return (

        currentUser?.full_name ||

        currentUser?.fullname ||

        currentUser?.name ||

        "Passenger"

    );
}


// =========================================================
// INITIAL DISPLAY
// =========================================================

function displayUserHeader() {

    const name =
        getCurrentUserName();

    const phone =
        getCurrentUserPhone();


    // Name

    if (userName) {

        userName.textContent =
            name;
    }


    // Phone

    if (userPhone) {

        userPhone.textContent =
            phone || "—";
    }


    // Initials

    const initials =
        getInitials(name);


    if (userAvatar) {

        userAvatar.textContent =
            initials;
    }
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

    const value =
        String(
            name || "Passenger"
        ).trim();


    if (!value) {

        return "P";
    }


    const parts =
        value
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (

        parts[0].charAt(0) +

        parts[parts.length - 1]
            .charAt(0)

    ).toUpperCase();
}


// =========================================================
// DISPLAY PROFILE SUMMARY
// =========================================================

function displayProfileSummary() {

    const name =
        currentPassenger?.full_name ||

        currentPassenger?.fullname ||

        getCurrentUserName();


    const email =
        currentPassenger?.email ||

        getCurrentUserEmail();


    const phone =
        currentPassenger?.phone ||

        getCurrentUserPhone();


    const initials =
        getInitials(name);


    if (profileAvatar) {

        profileAvatar.textContent =
            initials;
    }


    if (profileDisplayName) {

        profileDisplayName.textContent =
            name || "Passenger";
    }


    if (profileDisplayEmail) {

        profileDisplayEmail.textContent =
            email || "—";
    }


    if (userAvatar) {

        userAvatar.textContent =
            initials;
    }


    if (userName) {

        userName.textContent =
            name || "Passenger";
    }


    if (userPhone) {

        userPhone.textContent =
            phone || "—";
    }


    // Member since

    if (memberSince) {

        const date =

            currentPassenger?.created_at ||

            currentPassenger?.createdAt ||

            currentPassenger?.member_since ||

            currentPassenger?.date_created ||

            currentUser?.created_at ||

            currentUser?.createdAt;


        memberSince.textContent =
            formatMemberDate(date);
    }
}


// =========================================================
// FORMAT MEMBER DATE
// =========================================================

function formatMemberDate(date) {

    if (!date) {

        return "—";
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
// LOAD PASSENGER
// =========================================================

async function loadPassengerProfile() {

    showProfileMessage(
        "Loading profile...",
        "info"
    );


    const result =
        await apiRequest(
            "/passengers"
        );


    if (
        !result ||
        !result.success
    ) {

        // Use localStorage data
        // if available.

        useStoredUserAsProfile();

        return;
    }


    let passengers = [];


    if (
        Array.isArray(
            result.data
        )
    ) {

        passengers =
            result.data;

    } else if (
        Array.isArray(
            result.passengers
        )
    ) {

        passengers =
            result.passengers;
    }


    if (!passengers.length) {

        useStoredUserAsProfile();

        return;
    }


    const userId =
        getCurrentUserId();


    const userPhone =
        getCurrentUserPhone();


    const userEmail =
        getCurrentUserEmail();


    // Find by ID first

    let passenger =
        passengers.find(
            item =>

                userId &&

                String(
                    item.id
                ) ===
                String(userId)
        );


    // Find by phone

    if (!passenger && userPhone) {

        passenger =
            passengers.find(
                item =>
                    String(
                        item.phone || ""
                    ).trim() ===
                    userPhone
            );
    }


    // Find by email

    if (!passenger && userEmail) {

        passenger =
            passengers.find(
                item =>
                    String(
                        item.email || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    userEmail
                        .toLowerCase()
            );
    }


    if (!passenger) {

        useStoredUserAsProfile();

        return;
    }


    currentPassenger =
        passenger;


    originalProfile =
        createProfileSnapshot(
            passenger
        );


    fillProfileForm(
        passenger
    );


    displayProfileSummary();


    clearProfileMessage();
}


// =========================================================
// USE STORED USER
// =========================================================

function useStoredUserAsProfile() {

    currentPassenger = {

        id:
            currentUser?.passenger_id ||

            currentUser?.id ||

            null,

        full_name:
            currentUser?.full_name ||

            currentUser?.fullname ||

            currentUser?.name ||

            "",

        email:
            currentUser?.email ||

            "",

        phone:
            currentUser?.phone ||

            "",

        address:
            currentUser?.address ||

            "",

        created_at:
            currentUser?.created_at ||

            currentUser?.createdAt ||

            null

    };


    originalProfile =
        createProfileSnapshot(
            currentPassenger
        );


    fillProfileForm(
        currentPassenger
    );


    displayProfileSummary();


    clearProfileMessage();
}


// =========================================================
// FILL FORM
// =========================================================

function fillProfileForm(
    profile
) {

    if (fullNameInput) {

        fullNameInput.value =

            profile?.full_name ||

            profile?.fullname ||

            profile?.name ||

            "";
    }


    if (emailInput) {

        emailInput.value =

            profile?.email ||

            "";
    }


    if (phoneInput) {

        phoneInput.value =

            profile?.phone ||

            "";
    }


    if (addressInput) {

        addressInput.value =

            profile?.address ||

            "";
    }
}


// =========================================================
// CREATE PROFILE SNAPSHOT
// =========================================================

function createProfileSnapshot(
    profile
) {

    return {

        full_name:
            profile?.full_name ||

            profile?.fullname ||

            profile?.name ||

            "",

        email:
            profile?.email ||

            "",

        phone:
            profile?.phone ||

            "",

        address:
            profile?.address ||

            ""
    };
}


// =========================================================
// GET FORM DATA
// =========================================================

function getProfileFormData() {

    return {

        full_name:
            fullNameInput
                ? fullNameInput.value.trim()
                : "",

        email:
            emailInput
                ? emailInput.value.trim()
                : "",

        phone:
            phoneInput
                ? phoneInput.value.trim()
                : "",

        address:
            addressInput
                ? addressInput.value.trim()
                : ""
    };
}


// =========================================================
// VALIDATE PROFILE
// =========================================================

function validateProfile(
    data
) {

    if (!data.full_name) {

        return {

            valid: false,

            message:
                "Please enter your full name."
        };
    }


    if (!data.email) {

        return {

            valid: false,

            message:
                "Please enter your email address."
        };
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            data.email
        )
    ) {

        return {

            valid: false,

            message:
                "Please enter a valid email address."
        };
    }


    return {

        valid: true,

        message: ""
    };
}


// =========================================================
// SAVE PROFILE
// =========================================================

async function saveProfile(
    event
) {

    if (event) {

        event.preventDefault();
    }


    const data =
        getProfileFormData();


    const validation =
        validateProfile(
            data
        );


    if (!validation.valid) {

        showProfileMessage(
            validation.message,
            "error"
        );

        return;
    }


    const passengerId =
        currentPassenger?.id ||

        getCurrentUserId();


    if (!passengerId) {

        showProfileMessage(
            "Passenger account ID was not found.",
            "error"
        );

        return;
    }


    setButtonLoading(
        saveProfileButton,
        "Saving..."
    );


    showProfileMessage(
        "Saving your profile...",
        "info"
    );


    // Existing project passenger
    // endpoint uses /passengers/:id
    // with PUT.

    const result =
        await apiRequest(
            `/passengers/${passengerId}`,
            {
                method: "PUT",

                body:
                    JSON.stringify(data)
            }
        );


    if (
        !result ||
        !result.success
    ) {

        restoreButton(
            saveProfileButton,
            "💾 Save Changes"
        );


        showProfileMessage(
            result?.message ||
            "Unable to update your profile.",
            "error"
        );

        return;
    }


    // Update current passenger

    currentPassenger = {

        ...currentPassenger,

        ...data
    };


    originalProfile =
        createProfileSnapshot(
            currentPassenger
        );


    // Update localStorage user

    updateStoredUser(
        data
    );


    fillProfileForm(
        currentPassenger
    );


    displayProfileSummary();


    restoreButton(
        saveProfileButton,
        "💾 Save Changes"
    );


    showProfileMessage(
        result.message ||
        "Profile updated successfully.",
        "success"
    );
}


// =========================================================
// UPDATE LOCAL STORAGE USER
// =========================================================

function updateStoredUser(
    data
) {

    currentUser = {

        ...currentUser,

        full_name:
            data.full_name,

        email:
            data.email,

        phone:
            data.phone,

        address:
            data.address
    };


    localStorage.setItem(
        "user",
        JSON.stringify(
            currentUser
        )
    );
}


// =========================================================
// RESET PROFILE
// =========================================================

function resetProfile() {

    if (!originalProfile) {

        fillProfileForm(
            currentPassenger ||
            currentUser
        );

        clearProfileMessage();

        return;
    }


    fillProfileForm(
        originalProfile
    );


    clearProfileMessage();
}


// =========================================================
// CHANGE PASSWORD
// =========================================================

async function changePassword(
    event
) {

    if (event) {

        event.preventDefault();
    }


    const currentPassword =
        currentPasswordInput
            ? currentPasswordInput.value
            : "";


    const newPassword =
        newPasswordInput
            ? newPasswordInput.value
            : "";


    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";


    // Current password

    if (!currentPassword) {

        showPasswordMessage(
            "Please enter your current password.",
            "error"
        );

        currentPasswordInput?.focus();

        return;
    }


    // New password

    if (!newPassword) {

        showPasswordMessage(
            "Please enter your new password.",
            "error"
        );

        newPasswordInput?.focus();

        return;
    }


    // Minimum length

    if (
        newPassword.length <
        6
    ) {

        showPasswordMessage(
            "New password must be at least 6 characters.",
            "error"
        );

        newPasswordInput?.focus();

        return;
    }


    // Confirm

    if (!confirmPassword) {

        showPasswordMessage(
            "Please confirm your new password.",
            "error"
        );

        confirmPasswordInput?.focus();

        return;
    }


    // Match

    if (
        newPassword !==
        confirmPassword
    ) {

        showPasswordMessage(
            "New passwords do not match.",
            "error"
        );

        confirmPasswordInput?.focus();

        return;
    }


    // Same password

    if (
        currentPassword ===
        newPassword
    ) {

        showPasswordMessage(
            "New password must be different from your current password.",
            "error"
        );

        return;
    }


    const userId =
        getCurrentUserId();


    if (!userId) {

        showPasswordMessage(
            "User account ID was not found.",
            "error"
        );

        return;
    }


    setButtonLoading(
        changePasswordButton,
        "Changing..."
    );


    showPasswordMessage(
        "Changing your password...",
        "info"
    );


    /*
       Password endpoint.

       This expects the backend to provide:

       POST /api/passengers/:id/change-password

       Body:

       {
           currentPassword,
           newPassword
       }
    */

    const result =
        await apiRequest(
            `/passengers/${userId}/change-password`,
            {
                method: "POST",

                body:
                    JSON.stringify({

                        currentPassword,

                        newPassword

                    })
            }
        );


    restoreButton(
        changePasswordButton,
        "🔐 Change Password"
    );


    if (
        !result ||
        !result.success
    ) {

        showPasswordMessage(
            result?.message ||
            "Unable to change password.",
            "error"
        );

        return;
    }


    // Clear password fields

    if (passwordForm) {

        passwordForm.reset();
    }


    showPasswordMessage(
        result.message ||
        "Password changed successfully.",
        "success"
    );
}


// =========================================================
// PASSWORD TOGGLE
// =========================================================

function setupPasswordToggles() {

    const buttons =
        document.querySelectorAll(
            ".password-toggle"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) {

                        return;
                    }


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                        button.textContent =
                            "🙈";

                        button.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "👁";

                        button.setAttribute(
                            "aria-label",
                            "Show password"
                        );
                    }

                }
            );

        }
    );
}


// =========================================================
// LOAD BOOKING COUNT
// =========================================================

async function loadBookingCount() {

    if (!profileBookingCount) {

        return;
    }


    const result =
        await apiRequest(
            "/bookings"
        );


    if (
        !result ||
        !result.success
    ) {

        profileBookingCount.textContent =
            "0";

        return;
    }


    let bookings = [];


    if (
        Array.isArray(
            result.data
        )
    ) {

        bookings =
            result.data;

    } else if (
        Array.isArray(
            result.bookings
        )
    ) {

        bookings =
            result.bookings;
    }


    const userId =
        getCurrentUserId();


    const phone =
        getCurrentUserPhone();


    const email =
        getCurrentUserEmail();


    const myBookings =
        bookings.filter(
            booking => {

                // Passenger ID

                if (
                    userId &&
                    booking.passenger_id &&
                    String(
                        booking.passenger_id
                    ) ===
                    String(userId)
                ) {

                    return true;
                }


                // Phone

                if (
                    phone &&
                    booking.passenger_phone &&
                    String(
                        booking.passenger_phone
                    ).trim() ===
                    phone
                ) {

                    return true;
                }


                // Email

                if (
                    email &&
                    booking.passenger_email
                ) {

                    return (

                        String(
                            booking.passenger_email
                        )
                        .trim()
                        .toLowerCase() ===
                        email.toLowerCase()

                    );
                }


                return false;
            }
        );


    profileBookingCount.textContent =
        myBookings.length;
}


// =========================================================
// PROFILE MESSAGE
// =========================================================

function showProfileMessage(
    message,
    type = "info"
) {

    if (!profileMessage) {

        return;
    }


    profileMessage.textContent =
        message;


    profileMessage.dataset.type =
        type;


    profileMessage.style.display =
        "block";


    if (type === "success") {

        profileMessage.style.color =
            "#15803d";

        profileMessage.style.background =
            "#f0fdf4";

        profileMessage.style.borderColor =
            "#bbf7d0";

    } else if (
        type === "error"
    ) {

        profileMessage.style.color =
            "#b91c1c";

        profileMessage.style.background =
            "#fef2f2";

        profileMessage.style.borderColor =
            "#fecaca";

    } else {

        profileMessage.style.color =
            "#475569";

        profileMessage.style.background =
            "#f8fafc";

        profileMessage.style.borderColor =
            "#e2e8f0";
    }
}


// =========================================================
// CLEAR PROFILE MESSAGE
// =========================================================

function clearProfileMessage() {

    if (!profileMessage) {

        return;
    }


    profileMessage.textContent = "";

    profileMessage.style.display =
        "none";
}


// =========================================================
// PASSWORD MESSAGE
// =========================================================

function showPasswordMessage(
    message,
    type = "info"
) {

    if (!passwordMessage) {

        return;
    }


    passwordMessage.textContent =
        message;


    passwordMessage.dataset.type =
        type;


    passwordMessage.style.display =
        "block";


    if (type === "success") {

        passwordMessage.style.color =
            "#15803d";

        passwordMessage.style.background =
            "#f0fdf4";

        passwordMessage.style.borderColor =
            "#bbf7d0";

    } else if (
        type === "error"
    ) {

        passwordMessage.style.color =
            "#b91c1c";

        passwordMessage.style.background =
            "#fef2f2";

        passwordMessage.style.borderColor =
            "#fecaca";

    } else {

        passwordMessage.style.color =
            "#475569";

        passwordMessage.style.background =
            "#f8fafc";

        passwordMessage.style.borderColor =
            "#e2e8f0";
    }
}


// =========================================================
// BUTTON LOADING
// =========================================================

function setButtonLoading(
    button,
    text
) {

    if (!button) {

        return;
    }


    button.dataset.originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        text;
}


// =========================================================
// RESTORE BUTTON
// =========================================================

function restoreButton(
    button,
    fallbackText
) {

    if (!button) {

        return;
    }


    button.disabled =
        false;


    button.textContent =
        button.dataset.originalText ||

        fallbackText;
}


// =========================================================
// LOGOUT
// =========================================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";
}


// =========================================================
// MOBILE MENU
// =========================================================

function openMobileMenu() {

    if (!passengerSidebar) {

        return;
    }


    passengerSidebar.classList.add(
        "open"
    );


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );
    }
}


// =========================================================
// CLOSE MOBILE MENU
// =========================================================

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


// =========================================================
// SETUP MOBILE MENU
// =========================================================

function setupMobileMenu() {

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                if (
                    passengerSidebar?.classList.contains(
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


    document
        .querySelectorAll(
            ".passenger-nav .nav-item"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );
            }
        );
}


// =========================================================
// PROFILE FORM EVENTS
// =========================================================

function setupProfileForm() {

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            saveProfile
        );
    }


    if (resetProfileButton) {

        resetProfileButton.addEventListener(
            "click",
            resetProfile
        );
    }
}


// =========================================================
// PASSWORD FORM EVENTS
// =========================================================

function setupPasswordForm() {

    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            changePassword
        );
    }
}


// =========================================================
// LOGOUT EVENT
// =========================================================

function setupLogout() {

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }
}


// =========================================================
// PREVENT ACCIDENTAL LEAVE WITH UNSAVED DATA
// =========================================================

function hasUnsavedChanges() {

    if (!originalProfile) {

        return false;
    }


    const current =
        getProfileFormData();


    return (

        current.full_name !==
            originalProfile.full_name ||

        current.email !==
            originalProfile.email ||

        current.phone !==
            originalProfile.phone ||

        current.address !==
            originalProfile.address

    );
}


// =========================================================
// BEFORE UNLOAD
// =========================================================

window.addEventListener(
    "beforeunload",
    event => {

        if (
            hasUnsavedChanges()
        ) {

            event.preventDefault();

            event.returnValue = "";
        }
    }
);


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // Header immediately

        displayUserHeader();


        // Events

        setupProfileForm();

        setupPasswordForm();

        setupPasswordToggles();

        setupLogout();

        setupMobileMenu();


        // Load profile

        await loadPassengerProfile();


        // Load booking count

        await loadBookingCount();

    }
);