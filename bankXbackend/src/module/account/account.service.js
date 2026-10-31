import pool from "../../common/config/db.js";
import accountRepository from "./account.repository.js";
import ApiError from "../../common/utils/api-error.js";

const generateAccountNumber = () => {
    // Generate a 12-digit numeric account number starting with "1001"
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `1001${randomSuffix}`;
};

const createAccount = async (accountData) => {
    const { customerId, account_type, branch_id } = accountData;

    // Validate account type against schema enum ('SAVINGS', 'CURRENT')
    const type = (account_type || "SAVINGS").toUpperCase();
    if (!["SAVINGS", "CURRENT"].includes(type)) {
        throw ApiError.badRequest("Invalid account_type. Must be 'SAVINGS' or 'CURRENT'");
    }

    // Resolve branch
    let resolvedBranchId = branch_id;
    if (!resolvedBranchId) {
        resolvedBranchId = await accountRepository.getDefaultBranchId();
    }

    // Generate unique account number
    const accountNumber = generateAccountNumber();

    // Create account
    const accountId = await accountRepository.createAccount({
        customerId,
        branchId: resolvedBranchId,
        accountNumber,
        account_type: type
    });

    return await accountRepository.findAccountById(accountId);
};

const getMyAccounts = async (customerId) => {
    return await accountRepository.findAccountsByCustomerId(customerId);
};

const getMyAccount = async (accountId, customerId) => {
    const account = await accountRepository.findAccountByAccountId(accountId, customerId);

    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    return account;
};

const deposit = async (accountId, customerId, depositData) => {
    const { amount, description } = depositData;

    // 1. Confirm account belongs to customer
    const account = await accountRepository.findAccountByAccountId(accountId, customerId);
    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    if (account.status !== "ACTIVE") {
        throw ApiError.badRequest(`Cannot deposit to account with status '${account.status}'`);
    }

    // 2. Validate amount > 0
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw ApiError.badRequest("Deposit amount must be greater than zero");
    }

    // 3. Start MySQL transaction
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 4. Increase account balance
        await accountRepository.updateAccountBalance(account.account_id, numAmount, connection);

        // 5. Insert DEPOSIT record into transactions
        const transactionId = await accountRepository.createTransaction({
            fromAccountId: null,
            toAccountId: account.account_id,
            amount: numAmount,
            transactionType: "DEPOSIT",
            status: "SUCCESS",
            description: description ? description.trim() : null
        }, connection);

        // 6. Commit transaction
        await connection.commit();

        // Fetch transaction details and updated account
        const transaction = await accountRepository.findTransactionById(transactionId);
        const updatedAccount = await accountRepository.findAccountById(account.account_id);

        return {
            ...transaction,
            new_balance: updatedAccount.balance,
            account: updatedAccount
        };
    } catch (error) {
        // Rollback both changes on failure
        await connection.rollback();
        throw error;
    } finally {
        // Ensure connection is always returned to the pool
        connection.release();
    }
};

export default {
    createAccount,
    getMyAccounts,
    getMyAccount,
    deposit
};
