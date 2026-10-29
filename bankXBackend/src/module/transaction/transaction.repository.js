import { pool } from "../../common/config/db.js";

const fields = "transactions_id, from_account_id, to_account_id, amount, transaction_type, status, description, created_at";

export const listByCustomer = async (customerId) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT t.${fields.replaceAll("transactions_id", "transactions_id").replaceAll(", ", ", t.")}
       FROM transactions t
       LEFT JOIN accounts source ON source.account_id = t.from_account_id
       LEFT JOIN accounts target ON target.account_id = t.to_account_id
      WHERE source.customer_id = ? OR target.customer_id = ?
      ORDER BY t.created_at DESC`,
    [customerId, customerId]
  );
  return rows;
};

export const execute = async ({ type, fromAccountId = null, toAccountId = null, amount, description = null }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const accountIds = [fromAccountId, toAccountId].filter(Boolean);
    const [accountRows] = await connection.query(
      `SELECT account_id, balance, status FROM accounts WHERE account_id IN (?) FOR UPDATE`,
      [accountIds]
    );
    const accounts = new Map(accountRows.map((account) => [Number(account.account_id), account]));
    if (fromAccountId && !accounts.has(Number(fromAccountId))) throw new Error("Source account not found");
    if (toAccountId && !accounts.has(Number(toAccountId))) throw new Error("Destination account not found");
    if (fromAccountId && Number(accounts.get(Number(fromAccountId)).balance) < Number(amount)) throw new Error("Insufficient balance");
    if (fromAccountId) await connection.query("UPDATE accounts SET balance = balance - ? WHERE account_id = ?", [amount, fromAccountId]);
    if (toAccountId) await connection.query("UPDATE accounts SET balance = balance + ? WHERE account_id = ?", [amount, toAccountId]);
    const [result] = await connection.query(
      `INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, status, description)
       VALUES (?, ?, ?, ?, 'SUCCESS', ?)`,
      [fromAccountId, toAccountId, amount, type, description]
    );
    await connection.commit();
    const [rows] = await connection.query(`SELECT ${fields} FROM transactions WHERE transactions_id = ?`, [result.insertId]);
    return rows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};