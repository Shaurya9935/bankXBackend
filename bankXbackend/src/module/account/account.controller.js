import accountService from "./account.service.js";
import transactionService from "../transaction/transaction.service.js";

const createAccount = async (req, res, next) => {
    try {
        const { account_type, branch_id } = req.body;
        const customerId = req.user.customerId;

        const result = await accountService.createAccount({
            customerId,
            account_type,
            branch_id
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMyAccounts = async (req, res, next) => {
    try {
        const result = await accountService.getMyAccounts(req.user.customerId);

        return res.status(200).json({
            success: true,
            message: "Accounts fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMyAccount = async (req, res, next) => {
    try {
        const accountId = req.params.accountId || req.params.id;
        const result = await accountService.getMyAccount(accountId, req.user.customerId);

        return res.status(200).json({
            success: true,
            message: "Account fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deposit = async (req, res, next) => {
    try {
        const accountId = req.params.accountId;
        const customerId = req.user.customerId;
        const { amount, description } = req.body;

        const result = await transactionService.deposit(accountId, customerId, {
            amount,
            description
        });

        return res.status(200).json({
            success: true,
            message: "Deposit successful",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const withdraw = async (req, res, next) => {
    try {
        const accountId = req.params.accountId;
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

const getAccountTransactions = async (req, res, next) => {
    try {
        const accountId = req.params.accountId;
        const customerId = req.user.customerId;
        const { limit, offset, page } = req.query;

        const options = {};
        if (limit) {
            options.limit = parseInt(limit, 10);
            options.offset = offset ? parseInt(offset, 10) : page ? (parseInt(page, 10) - 1) * options.limit : 0;
        }

        const result = await transactionService.getAccountTransactions(accountId, customerId, options);

        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createAccount,
    getMyAccounts,
    getMyAccount,
    deposit,
    withdraw,
    transfer,
    getAccountTransactions
};
