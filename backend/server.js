const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authroutes");
const testRoutes = require("./routes/testRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const busRoutes = require("./routes/busRoutes");
const bookingRoutes = require("./routes/bookingroutes");
const passengerRoutes = require("./routes/passengerRoutes");
const tripRoutes = require("./routes/tripRoutes");
const routeRoutes = require("./routes/routeroutes");
const driverRoutes = require("./routes/driverroutes");
const paymentRoutes = require("./routes/paymentroutes");
const userRoutes = require("./routes/userroutes");

require("dotenv").config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/buses", busRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/passengers", passengerRoutes);

app.use("/api/trips", tripRoutes);

app.use("/api/routes", routeRoutes);

app.use("/api/drivers", driverRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/users", userRoutes);


// ==========================================
// FRONTEND
// ==========================================
//
// backend/
//     server.js
//
// frontend/
//     login.html
//     dashboard.html
//     css/
//     js/
//     images/
//

const frontendPath =
    path.join(__dirname, "../frontend");


// Serve frontend files
app.use(
    express.static(frontendPath)
);


// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "login.html"
        )
    );
});


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Frontend available at http://localhost:${PORT}`
        );
    }
);