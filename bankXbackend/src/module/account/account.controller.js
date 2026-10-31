import accountService from "./account.service.js";

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

        const result = await accountService.deposit(accountId, customerId, {
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

export default {
    createAccount,
    getMyAccounts,
    getMyAccount,
    deposit
};
