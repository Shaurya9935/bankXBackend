import pool from "../../common/config/db.js"

const findAccountsByCustomerId = async(customerId) => {
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
}

export default {
    findAccountsByCustomerId
}