import express from "express";
import transactionController from "./transaction.controller.js";
import authMiddleware from "../auth/auth.middleware.js";

const router = express.Router();

// 4. Protect all transaction routes with JWT verification
router.use(authMiddleware.verifyToken);

router.post("/deposit", transactionController.deposit);
router.post("/:accountId/deposit", transactionController.deposit);
router.post("/withdraw", transactionController.withdraw);
router.post("/:accountId/withdraw", transactionController.withdraw);
router.post("/transfer", transactionController.transfer);
router.post("/:accountId/transfer", transactionController.transfer);
router.get("/", transactionController.getTransactions);

export default router;

