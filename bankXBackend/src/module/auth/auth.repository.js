import { pool } from "../../common/config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.customer_id, u.password_hash, u.role,
            c.full_name, c.email, c.phone, c.address, c.date_of_birth, c.created_at
       FROM users u JOIN customers c ON c.customer_id = u.customer_id
      WHERE c.email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT u.user_id, u.customer_id, u.role,
            c.full_name, c.email, c.phone, c.address, c.date_of_birth, c.created_at
       FROM users u JOIN customers c ON c.customer_id = u.customer_id
      WHERE u.user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

export const createCustomerUser = async ({ fullName, email, phone, address, dateOfBirth, passwordHash }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customerResult] = await connection.query(
      `INSERT INTO customers (full_name, email, phone, address, date_of_birth)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, phone, address || null, dateOfBirth || null]
    );
    const customerId = customerResult.insertId;
    const [userResult] = await connection.query(
      `INSERT INTO users (customer_id, password_hash, role) VALUES (?, ?, 'CUSTOMER')`,
      [customerId, passwordHash]
    );
    await connection.commit();
    return { user_id: userResult.insertId, customer_id: customerId, role: "CUSTOMER" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};