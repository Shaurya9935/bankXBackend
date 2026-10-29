import { pool } from "../../common/config/db.js";

export const findById = async (id) => {
  const [rows] = await pool.query("SELECT customer_id, full_name, email, phone, address, date_of_birth, created_at FROM customers WHERE customer_id = ?", [id]);
  return rows[0] || null;
};
export const update = async (id, fields) => {
  const allowed = ["full_name", "email", "phone", "address", "date_of_birth"];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id);
  const [result] = await pool.query(`UPDATE customers SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE customer_id = ?`, [...entries.map(([, value]) => value || null), id]);
  if (!result.affectedRows) return null;
  return findById(id);
};
export const list = async ({ search = "", limit = 50, offset = 0 }) => {
  const like = `%${search}%`;
  const [rows] = await pool.query(
    `SELECT customer_id, full_name, email, phone, address, date_of_birth, created_at
       FROM customers WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?
      ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [like, like, like, limit, offset]
  );
  return rows;
};