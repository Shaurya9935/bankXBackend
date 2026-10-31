import pool from "../../common/config/db.js";

const findAccountByIdAndCustomer = async (accountId, customerId) => {
    const cleanId = String(accountId).replace(/^:/, "").trim();
    const [rows] = await pool.execute(
        `SELECT 
            account_id,
            customer_id,
            account_number,
            account_type,
            balance,
            status,
            created_at
         FROM accounts
         WHERE (account_id = ? OR account_number = ?)
         AND customer_id = ?`,
        [cleanId, cleanId, customerId]
    );
    return rows[0] || null;
};

const findAccountByIdentifier = async (identifier) => {
    const cleanId = String(identifier).replace(/^:/, "").trim();
    const [rows] = await pool.execute(
        `SELECT 
            account_id,
            customer_id,
            account_number,
            account_type,
            balance,
            status,
            created_at
         FROM accounts
         WHERE account_id = ? OR account_number = ?`,
        [cleanId, cleanId]
    );
    return rows[0] || null;
};

const updateBalance = async (accountId, amount, connection) => {
    const [result] = await connection.execute(
        `UPDATE accounts 
         SET balance = balance + ? 
         WHERE account_id = ?`,
        [amount, accountId]
    );
    return result;
};

const deductBalance = async (accountId, amount, connection) => {
    const [result] = await connection.execute(
        `UPDATE accounts 
         SET balance = balance - ? 
         WHERE account_id = ? AND balance >= ?`,
        [amount, accountId, amount]
    );
    return result;
};

const createTransaction = async (transactionData, connection) => {
    const {
        fromAccountId = null,
        toAccountId = null,
        amount,
        transactionType,
        status = "SUCCESS",
        description = null
    } = transactionData;

    const [result] = await connection.execute(
        `INSERT INTO transactions 
         (from_account_id, to_account_id, amount, transaction_type, status, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [fromAccountId, toAccountId, amount, transactionType, status, description]
    );
    return result.insertId;
};

const findTransactionById = async (transactionId, connection) => {
    const client = connection || pool;
    const [rows] = await client.execute(
        `SELECT 
            transactions_id,
            from_account_id,
            to_account_id,
            amount,
            transaction_type,
            status,
            description,
            created_at
         FROM transactions
         WHERE transactions_id = ?`,
        [transactionId]
    );
    return rows[0] || null;
};

const getAccountById = async (accountId, connection) => {
    const client = connection || pool;
    const [rows] = await client.execute(
        `SELECT 
            account_id,
            customer_id,
            account_number,
            account_type,
            balance,
            status,
            created_at
         FROM accounts
         WHERE account_id = ?`,
        [accountId]
    );
    return rows[0] || null;
};

const findTransactionsByCustomerId = async (customerId) => {
    const [rows] = await pool.execute(
        `SELECT 
            t.transactions_id,
            t.from_account_id,
            t.to_account_id,
            t.amount,
            t.transaction_type,
            t.status,
            t.description,
            t.created_at
         FROM transactions t
         LEFT JOIN accounts a_from ON t.from_account_id = a_from.account_id
         LEFT JOIN accounts a_to ON t.to_account_id = a_to.account_id
         WHERE a_from.customer_id = ? OR a_to.customer_id = ?
         ORDER BY t.created_at DESC`,
        [customerId, customerId]
    );
    return rows;
};

const findTransactionsByAccountId = async (accountId, options = {}) => {
    let query = `
        SELECT 
            t.transactions_id,
            t.from_account_id,
            t.to_account_id,
            t.amount,
            t.transaction_type,
            t.status,
            t.description,
            t.created_at
        FROM transactions t
        WHERE t.from_account_id = ?
           OR t.to_account_id = ?
        ORDER BY t.created_at DESC
    `;
    const params = [accountId, accountId];

    if (options.limit) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(String(options.limit), String(options.offset || 0));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
};

export default {
    findAccountByIdAndCustomer,
    findAccountByIdentifier,
    updateBalance,
    deductBalance,
    createTransaction,
    findTransactionById,
    getAccountById,
    findTransactionsByCustomerId,
    findTransactionsByAccountId
};

