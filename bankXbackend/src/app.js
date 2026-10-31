import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./module/auth/auth.routes.js";
import customerRoutes from "./module/customer/customer.routes.js";
import accountRoutes from "./module/account/account.routes.js";

const app = express();

app.use(helmet());
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BankX API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/accounts", accountRoutes);

export default app;