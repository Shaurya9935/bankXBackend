import pool from "../../common/config/db.js"

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT
            u.user_id,
            u.customer_id,
            u.password_hash,
            u.role,
            c.full_name,
            c.email,
            c.phone,
            c.address,
            c.date_of_birth,
            c.created_at
        FROM users u
        INNER JOIN customers c 
            ON u.customer_id = c.customer_id
        WHERE c.email = ?`,
        [email]
    );
    return rows[0] || null;
}

const createCustomer = async(customerData, connection) => {
    const {
        fullName, 
        email,
        phone,
        address,
        dateOfBirth
    } = customerData;

    const [result] = await connection.execute(
        `INSERT INTO customers
        (full_name, email, phone, address, date_of_birth)
        VALUES(?, ?, ?, ?, ?)`,
        [fullName, email, phone, address, dateOfBirth]
    );
    return result.insertId;
}

const createUser = async (userData, connection) => {
    const {customerId, passwordHash} = userData;
    const [result] = await connection.execute(
        `INSERT INTO users
        (customer_id, password_hash)
        VALUES (?, ?)`,
        [customerId, passwordHash]
    );
    return result.insertId;
}

const findUserByPhone = async (phone) => {
    const [rows] = await pool.execute(
        `SELECT customer_id
         FROM customers
         WHERE phone = ?`,
        [phone]
    );

    return rows[0] || null;
};

export default{
    findUserByEmail,
    createCustomer,
    createUser,
    findUserByPhone
}