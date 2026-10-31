import pool from "../../common/config/db.js";
import transactionRepository from "./transaction.repository.js";
import ApiError from "../../common/utils/api-error.js";

const deposit = async (accountId, customerId, depositData) => {
    const { amount, description } = depositData;

    if (!accountId) {
        throw ApiError.badRequest("Account identifier is required");
    }

    // 1. Confirm account belongs to the logged-in customer
    const account = await transactionRepository.findAccountByIdAndCustomer(accountId, customerId);
    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    if (account.status !== "ACTIVE") {
        throw ApiError.badRequest(`Cannot deposit to account with status '${account.status}'`);
    }

    // 2. Validate that amount is greater than zero
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw ApiError.badRequest("Deposit amount must be greater than zero");
    }

    // 3. Coordinate MySQL transaction
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 4. Increase account balance
        await transactionRepository.updateBalance(account.account_id, numAmount, connection);

        // 5. Insert DEPOSIT record into transactions
        const transactionId = await transactionRepository.createTransaction({
            fromAccountId: null,
            toAccountId: account.account_id,
            amount: numAmount,
            transactionType: "DEPOSIT",
            status: "SUCCESS",
            description: description ? description.trim() : null
        }, connection);

        // 6. Commit both changes together
        await connection.commit();

        // Fetch transaction record and updated account
        const transaction = await transactionRepository.findTransactionById(transactionId);
        const updatedAccount = await transactionRepository.getAccountById(account.account_id);

        return {
            ...transaction,
            new_balance: updatedAccount.balance,
            account: updatedAccount
        };
    } catch (error) {
        // Rollback both operations if either fails
        await connection.rollback();
        throw error;
    } finally {
        // Always release connection back to pool
        connection.release();
    }
};

const getTransactions = async (customerId) => {
    return await transactionRepository.findTransactionsByCustomerId(customerId);
};

export default {
    deposit,
    getTransactions
};

