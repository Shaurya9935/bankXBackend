import pool from "../../common/config/db.js";

const findAccountsByCustomerId = async (customerId) => {
    const [rows] = await pool.execute(
        `SELECT 
            a.account_id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.created_at,
            b.branch_name
        FROM accounts a
        INNER JOIN branches b
            ON a.branch_id = b.branch_id
        WHERE a.customer_id = ?
        ORDER BY a.created_at DESC`,
        [customerId]
    );
    return rows;
};

const findCustomerById = async (customerId) => {
    const [rows] = await pool.execute(
        `SELECT 
            customer_id,
            full_name,
            email,
            phone,
            address,
            date_of_birth,
            created_at
         FROM customers
         WHERE customer_id = ?`,
        [customerId]
    );
    return rows[0] || null;
};

const updateCustomer = async (customerId, updateData) => {
    const { full_name, fullName, email, phone, address, date_of_birth, dateOfBirth } = updateData;

    await pool.execute(
        `UPDATE customers
         SET full_name = COALESCE(?, full_name),
             email = COALESCE(?, email),
             phone = COALESCE(?, phone),
             address = COALESCE(?, address),
             date_of_birth = COALESCE(?, date_of_birth)
         WHERE customer_id = ?`,
        [
            full_name || fullName || null,
            email ? email.trim().toLowerCase() : null,
            phone ? phone.trim() : null,
            address !== undefined ? address : null,
            date_of_birth || dateOfBirth || null,
            customerId
        ]
    );

    return await findCustomerById(customerId);
};

export default {
    findAccountsByCustomerId,
    findCustomerById,
    updateCustomer
};
