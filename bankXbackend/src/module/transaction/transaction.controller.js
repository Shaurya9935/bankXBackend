import transactionService from "./transaction.service.js";

const deposit = async (req, res, next) => {
    try {
        const accountId = req.params.accountId || req.body.to_account_id || req.body.accountId;
        const customerId = req.user.customerId;
        const { amount, description } = req.body;

        const result = await transactionService.deposit(accountId, customerId, {
            amount,
            description
        });

        return res.status(200).json({
            success: true,
            message: "Deposit completed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getTransactions = async (req, res, next) => {
    try {
        const customerId = req.user.customerId;
        const result = await transactionService.getTransactions(customerId);

        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const withdraw = async (req, res, next) => {
    try {
        const accountId = req.params.accountId || req.body.from_account_id || req.body.accountId;
        const customerId = req.user.customerId;
        const { amount, description } = req.body;

        const result = await transactionService.withdraw(accountId, customerId, {
            amount,
            description
        });

        return res.status(200).json({
            success: true,
            message: "Withdrawal completed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const transfer = async (req, res, next) => {
    try {
        const fromAccountId = req.params.accountId || req.body.from_account_id || req.body.fromAccountId;
        const customerId = req.user.customerId;
        const { toAccountNumber, to_account_number, to_account_id, toAccountId, amount, description } = req.body;

        const result = await transactionService.transfer(fromAccountId, customerId, {
            toAccountNumber: toAccountNumber || to_account_number || to_account_id || toAccountId,
            amount,
            description
        });

        return res.status(200).json({
            success: true,
            message: "Transfer completed successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    deposit,
    withdraw,
    transfer,
    getTransactions
};

