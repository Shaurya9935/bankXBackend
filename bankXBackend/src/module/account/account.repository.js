import { pool } from "../../common/config/db.js";

const fields = "account_id, customer_id, account_number, account_type, balance, status, created_at";
export const findById = async (id, connection = pool) => {
  const [rows] = await connection.query(`SELECT ${fields} FROM accounts WHERE account_id = ?`, [id]);
  return rows[0] || null;
};
export const listByCustomer = async (customerId) => {
  const [rows] = await pool.query(`SELECT ${fields} FROM accounts WHERE customer_id = ? ORDER BY created_at DESC`, [customerId]);
  return rows;
};
export const create = async ({ customerId, accountNumber, accountType }) => {
  const [result] = await pool.query("INSERT INTO accounts (customer_id, account_number, account_type) VALUES (?, ?, ?)", [customerId, accountNumber, accountType]);
  return findById(result.insertId);
};
export const updateStatus = async (id, status) => {
  const [result] = await pool.query("UPDATE accounts SET status = ? WHERE account_id = ?", [status, id]);
  return result.affectedRows ? findById(id) : null;
};