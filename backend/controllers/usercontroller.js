const bcrypt = require("bcrypt");
const db = require("../config/db");

// ==========================================
// CHANGE USER PASSWORD
// PUT /api/users/:id/password
// ==========================================

const changePassword = async (req, res) => {

    try {

        const userId = Number(req.params.id);

        const {
            currentPassword,
            newPassword
        } = req.body;


        // ======================================
        // VALIDATION
        // ======================================

        if (!userId) {

            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });

        }


        if (!currentPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });

        }


        // ======================================
        // SECURITY
        // User can only change own password
        // ======================================

        if (
            Number(req.user?.id) !== userId
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can only change your own password"
            });

        }


        // ======================================
        // GET USER
        // ======================================

        const [users] =
            await db.execute(
                `
                SELECT
                    id,
                    password
                FROM users
                WHERE id = ?
                LIMIT 1
                `,
                [userId]
            );


        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const user =
            users[0];


        // ======================================
        // CHECK CURRENT PASSWORD
        // ======================================

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatches) {

            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect"
            });

        }


        // ======================================
        // HASH NEW PASSWORD
        // ======================================

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        // ======================================
        // UPDATE PASSWORD
        // ======================================

        await db.execute(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [
                hashedPassword,
                userId
            ]
        );


        // ======================================
        // SUCCESS
        // ======================================

        return res.status(200).json({

            success: true,

            message:
                "Password changed successfully"

        });

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to change password"

        });

    }

};


module.exports = {
    changePassword
};