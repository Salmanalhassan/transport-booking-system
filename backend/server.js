const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const busRoutes = require("./routes/busRoutes");
const bookingRoutes =require("./routes/bookingRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const tripRoutes = require("./routes/tripRoutes");
const routeRoutes =require("./routes/routeRoutes");
const driverRoutes = require("./routes/driverRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/passengers",passengerRoutes);
app.use("/api/trips",tripRoutes);
app.use("/api/routes",routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Transport Booking Management System API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});