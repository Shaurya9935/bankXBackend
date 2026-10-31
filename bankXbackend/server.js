import app from "./src/app.js";
import env from "./src/common/config/env.js";
import pool from "./src/common/config/db.js";

const startServer = async () => {
    try {
        // Test database connection
        const connection = await pool.getConnection();

        console.log("MySQL connected successfully!");

        connection.release();

        app.listen(env.PORT, () => {
            console.log(`BankX server running on port ${env.PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();