// =========================================================
// TRANSITPRO — SETTINGS JAVASCRIPT
// =========================================================

const API_URL = "http://localhost:5000/api";

// =========================================================
// AUTHENTICATION
// =========================================================

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


// =========================================================
// PROTECT PAGE
// =========================================================

if (!token || !currentUser) {
    window.location.href = "login.html";
}


// =========================================================
// DOM ELEMENTS
// =========================================================

// Sidebar
const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logout");


// User display
const userName =
    document.getElementById("userName");

const userRole =
    document.getElementById("userRole");

const avatar =
    document.getElementById("avatar");


// Profile form
const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");


// Password form
const passwordForm =
    document.getElementById("passwordForm");

const currentPasswordInput =
    document.getElementById("currentPassword");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`,

                        ...(options.headers || {})
                    }
                }
            );


        // =================================================
        // UNAUTHORIZED
        // =================================================

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "login.html";

            return null;
        }


        // =================================================
        // RESPONSE
        // =================================================

        let data = null;

        try {

            data =
                await response.json();

        } catch (error) {

            data = null;
        }


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Request failed."
            );
        }


        return data;

    } catch (error) {

        console.error(
            "Settings API Error:",
            error
        );

        throw error;
    }
}


// =========================================================
// DISPLAY USER
// =========================================================

function displayUser() {

    if (!currentUser) {
        return;
    }


    const name =
        currentUser.full_name ||
        currentUser.name ||
        "Administrator";


    const role =
        currentUser.role ||
        "Administrator";


    if (userName) {

        userName.textContent =
            name;
    }


    if (userRole) {

        userRole.textContent =
            role;
    }


    if (avatar) {

        avatar.textContent =
            getInitials(name);
    }
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

    if (!name) {
        return "A";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {
        return "A";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


// =========================================================
// LOAD USER SETTINGS
// =========================================================

function loadUserSettings() {

    if (!currentUser) {
        return;
    }


    if (fullNameInput) {

        fullNameInput.value =
            currentUser.full_name ||
            currentUser.name ||
            "";
    }


    if (emailInput) {

        emailInput.value =
            currentUser.email ||
            "";
    }


    if (phoneInput) {

        phoneInput.value =
            currentUser.phone ||
            "";
    }
}


// =========================================================
// UPDATE PROFILE
// =========================================================

async function updateProfile(event) {

    event.preventDefault();


    const full_name =
        fullNameInput
            ? fullNameInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!full_name) {

        alert(
            "Please enter your full name."
        );

        if (fullNameInput) {
            fullNameInput.focus();
        }

        return;
    }


    if (!email) {

        alert(
            "Please enter your email."
        );

        if (emailInput) {
            emailInput.focus();
        }

        return;
    }


    // =====================================================
    // BUTTON
    // =====================================================

    const submitButton =
        profileForm
            ? profileForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    const originalText =
        submitButton
            ? submitButton.textContent
            : "Save Changes";


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Saving...";
    }


    try {

        // =================================================
        // UPDATE USER
        // =================================================

        const result =
            await apiRequest(
                `/users/${currentUser.id}`,
                {
                    method: "PUT",

                    body: JSON.stringify({

                        full_name,

                        email,

                        phone

                    })
                }
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to update profile."
            );
        }


        // =================================================
        // UPDATE LOCAL STORAGE
        // =================================================

        const updatedUser =
            result.data ||
            {
                ...currentUser,

                full_name,

                email,

                phone
            };


        currentUser =
            {
                ...currentUser,
                ...updatedUser
            };


        localStorage.setItem(
            "user",
            JSON.stringify(
                currentUser
            )
        );


        displayUser();


        alert(
            "Profile updated successfully."
        );

    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update profile."
        );

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                originalText;
        }
    }
}


// =========================================================
// CHANGE PASSWORD
// =========================================================

async function changePassword(event) {

    event.preventDefault();


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


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!currentPassword) {

        alert(
            "Please enter your current password."
        );

        if (currentPasswordInput) {
            currentPasswordInput.focus();
        }

        return;
    }


    if (!newPassword) {

        alert(
            "Please enter your new password."
        );

        if (newPasswordInput) {
            newPasswordInput.focus();
        }

        return;
    }


    if (newPassword.length < 6) {

        alert(
            "New password must contain at least 6 characters."
        );

        if (newPasswordInput) {
            newPasswordInput.focus();
        }

        return;
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        alert(
            "New password and confirm password do not match."
        );

        if (confirmPasswordInput) {
            confirmPasswordInput.focus();
        }

        return;
    }


    if (
        newPassword ===
        currentPassword
    ) {

        alert(
            "New password must be different from your current password."
        );

        return;
    }


    // =====================================================
    // BUTTON
    // =====================================================

    const submitButton =
        passwordForm
            ? passwordForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    const originalText =
        submitButton
            ? submitButton.textContent
            : "Change Password";


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            "Changing...";
    }


    try {

        // =================================================
        // CHANGE PASSWORD
        // =================================================

        const result =
            await apiRequest(
                `/users/${currentUser.id}/password`,
                {
                    method: "PUT",

                    body: JSON.stringify({

                        currentPassword,

                        newPassword

                    })
                }
            );


        if (
            !result ||
            result.success === false
        ) {

            throw new Error(
                result?.message ||
                "Unable to change password."
            );
        }


        // =================================================
        // CLEAR PASSWORD FIELDS
        // =================================================

        if (passwordForm) {

            passwordForm.reset();
        }


        alert(
            "Password changed successfully."
        );

    } catch (error) {

        console.error(
            "Password change error:",
            error
        );


        alert(
            error.message ||
            "Unable to change password."
        );

    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                originalText;
        }
    }
}


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

function setupPasswordToggle() {

    const toggleButtons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );


    toggleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.getAttribute(
                            "data-password-toggle"
                        );


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

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "👁️";
                    }

                }
            );
        }
    );
}


// =========================================================
// MOBILE SIDEBAR
// =========================================================

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


    const navLinks =
        sidebar.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );
        }
    );
}


// =========================================================
// LOGOUT
// =========================================================

function setupLogout() {

    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


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


// =========================================================
// PROFILE FORM
// =========================================================

function setupForms() {

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            updateProfile
        );
    }


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            changePassword
        );
    }
}


// =========================================================
// CANCEL / RESET PROFILE
// =========================================================

function setupResetButtons() {

    const resetButtons =
        document.querySelectorAll(
            "[data-reset-profile]"
        );


    resetButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    loadUserSettings();

                }
            );
        }
    );
}


// =========================================================
// INITIALIZE
// =========================================================

function initializeSettings() {

    console.log(
        "Initializing TransitPro Settings..."
    );


    displayUser();

    loadUserSettings();

    setupMobileMenu();

    setupLogout();

    setupForms();

    setupPasswordToggle();

    setupResetButtons();


    console.log(
        "TransitPro Settings loaded successfully."
    );
}


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeSettings
);