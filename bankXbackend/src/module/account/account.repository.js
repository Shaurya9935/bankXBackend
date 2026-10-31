import pool from "../../common/config/db.js";

const findAccountByAccountId = async (accountId, customerId) => {
    const cleanId = String(accountId).replace(/^:/, "").trim();
    const [rows] = await pool.execute(
        `SELECT 
            a.account_id,
            a.customer_id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.created_at,
            b.branch_name,
            b.branch_code,
            b.city
        FROM accounts a
        INNER JOIN branches b
            ON a.branch_id = b.branch_id
        WHERE (a.account_id = ? OR a.account_number = ?)
        AND a.customer_id = ?`,
        [cleanId, cleanId, customerId]
    );
    return rows[0] || null;
};

const findAccountsByCustomerId = async (customerId) => {
    const [rows] = await pool.execute(
        `SELECT 
            a.account_id,
            a.customer_id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.created_at,
            b.branch_name,
            b.branch_code,
            b.city
        FROM accounts a
        INNER JOIN branches b
            ON a.branch_id = b.branch_id
        WHERE a.customer_id = ?
        ORDER BY a.created_at DESC`,
        [customerId]
    );
    return rows;
};

const findAccountById = async (accountId) => {
    const [rows] = await pool.execute(
        `SELECT 
            a.account_id,
            a.customer_id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.created_at,
            b.branch_name,
            b.branch_code,
            b.city
        FROM accounts a
        INNER JOIN branches b
            ON a.branch_id = b.branch_id
        WHERE a.account_id = ?`,
        [accountId]
    );
    return rows[0] || null;
};

const getDefaultBranchId = async () => {
    const [rows] = await pool.execute(`SELECT branch_id FROM branches LIMIT 1`);
    if (rows.length > 0) {
        return rows[0].branch_id;
    }
    const [result] = await pool.execute(
        `INSERT INTO branches (branch_name, branch_code, city, address)
         VALUES ('Main Branch', 'BX001', 'Mumbai', 'Head Office')`
    );
    return result.insertId;
};

const createAccount = async (accountData) => {
    const { customerId, branchId, accountNumber, account_type } = accountData;
    const [result] = await pool.execute(
        `INSERT INTO accounts (customer_id, branch_id, account_number, account_type, balance, status)
         VALUES (?, ?, ?, ?, 0.00, 'ACTIVE')`,
        [customerId, branchId, accountNumber, account_type]
    );
    return result.insertId;
};

const updateAccountBalance = async (accountId, amount, connection) => {
    const [result] = await connection.execute(
        `UPDATE accounts 
         SET balance = balance + ? 
         WHERE account_id = ?`,
        [amount, accountId]
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

export default {
    findAccountByAccountId,
    findAccountsByCustomerId,
    findAccountById,
    getDefaultBranchId,
    createAccount,
    updateAccountBalance,
    createTransaction,
    findTransactionById
};
