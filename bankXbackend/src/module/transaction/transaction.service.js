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

const withdraw = async (accountId, customerId, withdrawData) => {
    const { amount, description } = withdrawData;

    if (!accountId) {
        throw ApiError.badRequest("Account identifier is required");
    }

    // 1. Confirm account belongs to the logged-in customer
    const account = await transactionRepository.findAccountByIdAndCustomer(accountId, customerId);
    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    // 2. Check the account is ACTIVE
    if (account.status !== "ACTIVE") {
        throw ApiError.badRequest(`Cannot withdraw from account with status '${account.status}'`);
    }

    // 3. Validate that the amount is positive
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw ApiError.badRequest("Withdrawal amount must be greater than zero");
    }

    // 4. Ensure sufficient balance
    const currentBalance = Number(account.balance);
    if (currentBalance < numAmount) {
        throw ApiError.badRequest("Insufficient balance for withdrawal");
    }

    // 5. Start MySQL transaction
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Deduct the amount
        const updateResult = await transactionRepository.deductBalance(account.account_id, numAmount, connection);
        if (updateResult.affectedRows === 0) {
            throw ApiError.badRequest("Insufficient balance for withdrawal");
        }

        // Insert WITHDRAWL record into transactions
        const transactionId = await transactionRepository.createTransaction({
            fromAccountId: account.account_id,
            toAccountId: null,
            amount: numAmount,
            transactionType: "WITHDRAWL",
            status: "SUCCESS",
            description: description ? description.trim() : null
        }, connection);

        // Commit both changes together
        await connection.commit();

        const transaction = await transactionRepository.findTransactionById(transactionId);
        const updatedAccount = await transactionRepository.getAccountById(account.account_id);

        return {
            ...transaction,
            new_balance: updatedAccount.balance,
            account: updatedAccount
        };
    } catch (error) {
        // 6. Roll back both changes if anything fails
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const transfer = async (fromAccountId, customerId, transferData) => {
    const { toAccountNumber, to_account_number, to_account_id, toAccountId, amount, description } = transferData;
    const recipientIdentifier = toAccountNumber || to_account_number || to_account_id || toAccountId;

    if (!fromAccountId) {
        throw ApiError.badRequest("Sender account identifier is required");
    }

    if (!recipientIdentifier) {
        throw ApiError.badRequest("Recipient account number or ID is required");
    }

    // 1. Verify the sender account belongs to the logged-in customer
    const senderAccount = await transactionRepository.findAccountByIdAndCustomer(fromAccountId, customerId);
    if (!senderAccount) {
        throw ApiError.notFound("Sender account not found or does not belong to you");
    }

    // 2. Find the recipient account using the account number
    const recipientAccount = await transactionRepository.findAccountByIdentifier(recipientIdentifier);
    if (!recipientAccount) {
        throw ApiError.notFound("Recipient account not found");
    }

    // 3. Validate both accounts are active and different
    if (senderAccount.account_id === recipientAccount.account_id) {
        throw ApiError.badRequest("Sender and recipient accounts must be different");
    }

    if (senderAccount.status !== "ACTIVE") {
        throw ApiError.badRequest(`Sender account is not active (status: ${senderAccount.status})`);
    }

    if (recipientAccount.status !== "ACTIVE") {
        throw ApiError.badRequest(`Recipient account is not active (status: ${recipientAccount.status})`);
    }

    // 4. Validate amount is positive and sender has sufficient balance
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw ApiError.badRequest("Transfer amount must be greater than zero");
    }

    const currentSenderBalance = Number(senderAccount.balance);
    if (currentSenderBalance < numAmount) {
        throw ApiError.badRequest("Insufficient balance for transfer");
    }

    // 5. Start MySQL transaction
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Deduct from sender
        const deductResult = await transactionRepository.deductBalance(senderAccount.account_id, numAmount, connection);
        if (deductResult.affectedRows === 0) {
            throw ApiError.badRequest("Insufficient balance for transfer");
        }

        // Credit recipient
        await transactionRepository.updateBalance(recipientAccount.account_id, numAmount, connection);

        // 6. Insert a TRANSFER transaction record
        const transactionId = await transactionRepository.createTransaction({
            fromAccountId: senderAccount.account_id,
            toAccountId: recipientAccount.account_id,
            amount: numAmount,
            transactionType: "TRANSFER",
            status: "SUCCESS",
            description: description ? description.trim() : null
        }, connection);

        // 7. Commit changes together
        await connection.commit();

        const transaction = await transactionRepository.findTransactionById(transactionId);
        const updatedSenderAccount = await transactionRepository.getAccountById(senderAccount.account_id);

        return {
            ...transaction,
            sender_account_id: senderAccount.account_id,
            recipient_account_id: recipientAccount.account_id,
            new_balance: updatedSenderAccount.balance,
            account: updatedSenderAccount
        };
    } catch (error) {
        // Rollback if anything fails
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getAccountTransactions = async (accountId, customerId, options = {}) => {
    if (!accountId) {
        throw ApiError.badRequest("Account identifier is required");
    }

    // 1. Verify the account belongs to the logged-in customer
    const account = await transactionRepository.findAccountByIdAndCustomer(accountId, customerId);
    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    // 2. Fetch transactions where account is sender or recipient, sorted newest first
    const transactions = await transactionRepository.findTransactionsByAccountId(account.account_id, options);

    return transactions;
};

export default {
    deposit,
    withdraw,
    transfer,
    getTransactions,
    getAccountTransactions
};

