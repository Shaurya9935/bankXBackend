import app from "./src/app.js";
import { env } from "./src/common/config/env.js";
import { pool } from "./src/common/config/db.js";

const server = app.listen(env.port, () => {
  console.log(`BankX API listening on port ${env.port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));