document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ELEMENTS
    // ==========================================

    const loginForm =
        document.getElementById("loginForm");

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");


    // ==========================================
    // SAFETY CHECK
    // ==========================================

    if (
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !loginMessage
    ) {
        console.error(
            "Login page elements are missing."
        );

        return;
    }


    // ==========================================
    // SHOW / HIDE PASSWORD
    // ==========================================

    if (togglePassword) {

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
    // LOGIN
    // ==========================================

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ======================================
            // GET VALUES
            // ======================================

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ======================================
            // VALIDATION
            // ======================================

            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );

                passwordInput.focus();

                return;
            }


            // ======================================
            // START LOADING
            // ======================================

            setLoading(true);

            hideMessage();


            try {

                // ==================================
                // SEND LOGIN REQUEST
                // ==================================

                const data =
                    await apiRequest(
                        "/auth/login",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                // ==================================
                // CHECK RESPONSE
                // ==================================

                if (!data) {

                    throw new Error(
                        "No response received from server."
                    );
                }


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Invalid email or password."
                    );
                }


                if (!data.token) {

                    throw new Error(
                        "Login successful but authentication token was not received."
                    );
                }


                if (!data.user) {

                    throw new Error(
                        "Login successful but user information was not received."
                    );
                }


                // ==================================
                // STORE JWT
                // ==================================

                localStorage.setItem(
                    "token",
                    data.token
                );


                // ==================================
                // STORE USER
                // ==================================

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                // ==================================
                // LOGIN SUCCESS
                // ==================================

                showMessage(
                    "Login successful. Redirecting...",
                    "success"
                );


                // ==================================
                // GET USER ROLE
                // ==================================

                const role =
                    String(
                        data.user.role || ""
                    ).toLowerCase();


                // ==================================
                // REDIRECT BY ROLE
                // ==================================

                setTimeout(
                    () => {

                        if (
                            role === "admin" ||
                            role === "administrator"
                        ) {

                            window.location.href =
                                "dashboard.html";

                            return;
                        }


                        if (
                            role === "passenger"
                        ) {

                            window.location.href =
                                "passenger-dashboard.html";

                            return;
                        }


                        // Unknown role
                        console.warn(
                            "Unknown user role:",
                            data.user.role
                        );


                        window.location.href =
                            "dashboard.html";

                    },
                    700
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                // ==================================
                // CLEAR OLD AUTH DATA
                // ==================================

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                // ==================================
                // SHOW ERROR
                // ==================================

                showMessage(
                    error.message ||
                    "Login failed. Please try again.",
                    "error"
                );


                setLoading(false);
            }
        }
    );


    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    const forgotPassword =
        document.getElementById(
            "forgotPassword"
        );


    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showMessage(
                    "Password recovery will be available soon.",
                    "info"
                );
            }
        );
    }


    // ==========================================
    // MESSAGE
    // ==========================================

    function showMessage(
        message,
        type = "info"
    ) {

        loginMessage.textContent =
            message;

        loginMessage.className =
            `login-message show ${type}`;
    }


    function hideMessage() {

        loginMessage.className =
            "login-message";
    }


    // ==========================================
    // LOADING
    // ==========================================

    function setLoading(isLoading) {

        loginButton.disabled =
            isLoading;

        loginButton.classList.toggle(
            "loading",
            isLoading
        );


        const buttonText =
            document.getElementById(
                "loginButtonText"
            );


        const spinner =
            document.getElementById(
                "loginSpinner"
            );


        if (buttonText) {

            buttonText.textContent =
                isLoading
                    ? "Signing In..."
                    : "Sign In";
        }


        if (spinner) {

            spinner.style.display =
                isLoading
                    ? "inline-block"
                    : "none";
        }
    }

});

