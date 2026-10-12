// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE_URL =
    "/api";

// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("token");


    // ======================================
    // HEADERS
    // ======================================

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    // ======================================
    // AUTHORIZATION
    // ======================================

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    try {

        // ==================================
        // REQUEST
        // ==================================

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );


        // ==================================
        // READ RESPONSE
        // ==================================

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            data = {
                success: false,
                message:
                    text ||
                    "Server returned an unexpected response."
            };
        }


        // ==================================
        // HTTP ERROR
        // ==================================
if (!response.ok) {

    console.error(
        "SERVER ERROR RESPONSE:",
        data
    );

    throw new Error(
        data.error ||
        data.message ||
        `Request failed with status ${response.status}`
    );
}


        // ==================================
        // API ERROR
        // ==================================

        if (
            data &&
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Request failed."
            );
        }


        // ==================================
        // SUCCESS
        // ==================================

        return data;


    } catch (error) {

        console.error(
            "API Error:",
            error
        );


        // ==================================
        // NETWORK ERROR
        // ==================================

        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to the server. Please make sure the backend is running."
            );
        }


        throw error;
    }
}
