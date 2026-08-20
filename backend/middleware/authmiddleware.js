const jwt = require("jsonwebtoken");


// ==========================================
// PROTECT ROUTES
// ==========================================

const protect = (req, res, next) => {
    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }


        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });

        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = decoded;


        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }
};



// ==========================================
// ADMIN ONLY
// ==========================================

const adminOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }


    if (
        String(req.user.role).toLowerCase() !==
        "admin"
    ) {

        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });

    }


    next();
};



// ==========================================
// ADMIN OR STAFF
// ==========================================

const adminOrStaff = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }


    const role =
        String(
            req.user.role || ""
        ).toLowerCase();


    if (
        role !== "admin" &&
        role !== "staff"
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Admin or staff access required"
        });

    }


    next();
};



// ==========================================
// ADMIN, STAFF OR PASSENGER
// ==========================================

const authenticatedUser = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }


    next();
};



// ==========================================
// PASSENGER ONLY
// ==========================================

const passengerOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }


    if (
        String(req.user.role).toLowerCase() !==
        "passenger"
    ) {

        return res.status(403).json({
            success: false,
            message: "Passenger access required"
        });

    }


    next();
};



// ==========================================
// ROLE CHECK
// ==========================================

const allowRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }


        const userRole =
            String(
                req.user.role || ""
            ).toLowerCase();


        const roles =
            allowedRoles.map(
                role =>
                    String(role).toLowerCase()
            );


        if (!roles.includes(userRole)) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to access this resource"
            });

        }


        next();

    };

};


// ==========================================
// ADMIN OR PASSENGER
// ==========================================

const adminOrPassenger = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });

    }

    const role =
        String(req.user.role || "").toLowerCase();

    if (
        role !== "admin" &&
        role !== "passenger"
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Admin or passenger access required"
        });

    }

    next();
};
// ==========================================
// EXPORT
// ==========================================
module.exports = {

    protect,

    adminOnly,

    adminOrStaff,

    adminOrPassenger,

    authenticatedUser,

    passengerOnly,

    allowRoles

};