import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./common/config/env.js";
import { notFound, errorHandler } from "./common/middleware/error.middleware.js";
import authRoutes from "./module/auth/auth.routes.js";
import customerRoutes from "./module/customer/customer.routes.js";
import accountRoutes from "./module/account/account.routes.js";
import transactionRoutes from "./module/transaction/transaction.routes.js";
import adminRoutes from "./module/admin/admin.routes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;