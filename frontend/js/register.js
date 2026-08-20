document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const registerForm =
        document.getElementById("registerForm");

    const fullNameInput =
        document.getElementById("fullName");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const addressInput =
        document.getElementById("address");

    const emergencyContactInput =
        document.getElementById("emergencyContact");

    const emergencyPhoneInput =
        document.getElementById("emergencyPhone");

    const termsInput =
        document.getElementById("terms");

    const registerButton =
        document.getElementById("registerButton");

    const registerButtonText =
        document.getElementById("registerButtonText");

    const registerSpinner =
        document.getElementById("registerSpinner");

    const registerMessage =
        document.getElementById("registerMessage");



    // ==========================================
    // CHECK FORM
    // ==========================================

    if (!registerForm) {

        console.error(
            "registerForm was not found."
        );

        return;
    }



    // ==========================================
    // PASSWORD TOGGLE
    // ==========================================

    const togglePassword =
        document.getElementById("togglePassword");

    if (
        togglePassword &&
        passwordInput
    ) {

        togglePassword.addEventListener(
            "click",
            () => {

                const isPassword =
                    passwordInput.type === "password";

                passwordInput.type =
                    isPassword
                        ? "text"
                        : "password";

                togglePassword.textContent =
                    isPassword
                        ? "🙈"
                        : "👁";

                togglePassword.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );

            }
        );
    }



    // ==========================================
    // CONFIRM PASSWORD TOGGLE
    // ==========================================

    const toggleConfirmPassword =
        document.getElementById(
            "toggleConfirmPassword"
        );

    if (
        toggleConfirmPassword &&
        confirmPasswordInput
    ) {

        toggleConfirmPassword.addEventListener(
            "click",
            () => {

                const isPassword =
                    confirmPasswordInput.type ===
                    "password";

                confirmPasswordInput.type =
                    isPassword
                        ? "text"
                        : "password";

                toggleConfirmPassword.textContent =
                    isPassword
                        ? "🙈"
                        : "👁";

                toggleConfirmPassword.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );

            }
        );
    }



    // ==========================================
    // PASSWORD STRENGTH
    // ==========================================

    const passwordStrength =
        document.getElementById(
            "passwordStrength"
        );

    if (
        passwordInput &&
        passwordStrength
    ) {

        passwordInput.addEventListener(
            "input",
            () => {

                const password =
                    passwordInput.value;

                if (!password) {

                    passwordStrength.textContent = "";

                    passwordStrength.className =
                        "password-strength";

                    return;
                }


                let score = 0;


                // Length
                if (
                    password.length >= 6
                ) {
                    score++;
                }


                // Uppercase
                if (
                    /[A-Z]/.test(password)
                ) {
                    score++;
                }


                // Lowercase
                if (
                    /[a-z]/.test(password)
                ) {
                    score++;
                }


                // Number
                if (
                    /[0-9]/.test(password)
                ) {
                    score++;
                }


                // Symbol
                if (
                    /[^A-Za-z0-9]/.test(password)
                ) {
                    score++;
                }


                if (score <= 2) {

                    passwordStrength.textContent =
                        "Weak password";

                    passwordStrength.className =
                        "password-strength weak";

                } else if (score <= 4) {

                    passwordStrength.textContent =
                        "Medium password";

                    passwordStrength.className =
                        "password-strength medium";

                } else {

                    passwordStrength.textContent =
                        "Strong password";

                    passwordStrength.className =
                        "password-strength strong";
                }

            }
        );
    }



    // ==========================================
    // REGISTRATION
    // ==========================================

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ======================================
            // GET VALUES
            // ======================================

            const full_name =
                fullNameInput
                    ? fullNameInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim().toLowerCase()
                    : "";


            const phone =
                phoneInput
                    ? phoneInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            const confirm_password =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";


            const address =
                addressInput
                    ? addressInput.value.trim()
                    : "";


            const emergency_contact =
                emergencyContactInput
                    ? emergencyContactInput.value.trim()
                    : "";


            const emergency_phone =
                emergencyPhoneInput
                    ? emergencyPhoneInput.value.trim()
                    : "";



            // ======================================
            // VALIDATE REQUIRED FIELDS
            // ======================================

            if (
                !full_name ||
                !email ||
                !phone ||
                !password
            ) {

                showMessage(
                    "Full name, email, phone number and password are required.",
                    "error"
                );

                return;
            }



            // ======================================
            // TERMS
            // ======================================

            if (
                termsInput &&
                !termsInput.checked
            ) {

                showMessage(
                    "Please agree to the Terms & Conditions and Privacy Policy.",
                    "error"
                );

                termsInput.focus();

                return;
            }



            // ======================================
            // EMAIL VALIDATION
            // ======================================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(email)
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;
            }



            // ======================================
            // PASSWORD LENGTH
            // ======================================

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password must be at least 6 characters.",
                    "error"
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;
            }



            // ======================================
            // CONFIRM PASSWORD
            // ======================================

            if (
                password !==
                confirm_password
            ) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                if (confirmPasswordInput) {
                    confirmPasswordInput.focus();
                }

                return;
            }



            // ======================================
            // PHONE VALIDATION
            // ======================================

            if (
                phone.length < 10
            ) {

                showMessage(
                    "Please enter a valid phone number.",
                    "error"
                );

                if (phoneInput) {
                    phoneInput.focus();
                }

                return;
            }



            // ======================================
            // EMERGENCY PHONE VALIDATION
            // ======================================

            if (
                emergency_phone &&
                emergency_phone.length < 10
            ) {

                showMessage(
                    "Please enter a valid emergency phone number.",
                    "error"
                );

                if (emergencyPhoneInput) {
                    emergencyPhoneInput.focus();
                }

                return;
            }



            // ======================================
            // START LOADING
            // ======================================

            setLoading(true);

            hideMessage();



            try {

                // ==================================
                // API REQUEST
                // ==================================

                const data =
                    await apiRequest(
                        "/auth/register",
                        {
                            method: "POST",

                            body: JSON.stringify({

                                full_name:
                                    full_name,

                                email:
                                    email,

                                phone:
                                    phone,

                                password:
                                    password,

                                address:
                                    address || null,

                                emergency_contact:
                                    emergency_contact ||
                                    null,

                                emergency_phone:
                                    emergency_phone ||
                                    null

                            })
                        }
                    );



                console.log(
                    "Registration response:",
                    data
                );



                // ==================================
                // SUCCESS
                // ==================================

                if (
                    data &&
                    data.success
                ) {

                    showMessage(
                        data.message ||
                        "Registration successful!",
                        "success"
                    );


                    // Disable button
                    if (registerButton) {

                        registerButton.disabled =
                            true;
                    }


                    if (registerButtonText) {

                        registerButtonText.textContent =
                            "Registration Successful";
                    }


                    if (registerSpinner) {

                        registerSpinner.style.display =
                            "none";
                    }


                    // ==================================
                    // REDIRECT LOGIN
                    // ==================================

                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1500
                    );

                    return;
                }



                // ==================================
                // API ERROR
                // ==================================

                showMessage(
                    data?.message ||
                    "Registration failed. Please try again.",
                    "error"
                );

                setLoading(false);

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to connect to server.",
                    "error"
                );


                setLoading(false);
            }

        }
    );



    // ==========================================
    // SHOW MESSAGE
    // ==========================================

    function showMessage(
        message,
        type = "error"
    ) {

        if (!registerMessage) {

            alert(message);

            return;
        }


        registerMessage.textContent =
            message;


        registerMessage.className =
            `register-message show ${type}`;

    }



    // ==========================================
    // HIDE MESSAGE
    // ==========================================

    function hideMessage() {

        if (!registerMessage) {
            return;
        }


        registerMessage.textContent =
            "";


        registerMessage.className =
            "register-message";
    }



    // ==========================================
    // LOADING
    // ==========================================

    function setLoading(
        isLoading
    ) {

        if (registerButton) {

            registerButton.disabled =
                isLoading;

            registerButton.classList.toggle(
                "loading",
                isLoading
            );
        }


        if (registerButtonText) {

            registerButtonText.textContent =
                isLoading
                    ? "Creating Account..."
                    : "Create Passenger Account";
        }


        if (registerSpinner) {

            registerSpinner.style.display =
                isLoading
                    ? "inline-block"
                    : "none";
        }

    }

});