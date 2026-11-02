import pool from "../../common/config/db.js";

const createEmployee = async (employeeData) => {
    const {
        branch_id,
        full_name,
        email,
        phone,
        designation,
        salary,
        joining_date,
        status = "ACTIVE"
    } = employeeData;

    const [result] = await pool.execute(
        `INSERT INTO employees 
        (branch_id, full_name, email, phone, designation, salary, joining_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            branch_id,
            full_name,
            email,
            phone,
            designation,
            salary !== undefined ? salary : null,
            joining_date,
            status
        ]
    );

    return result.insertId;
};

const findEmployeeById = async (employeeId) => {
    const cleanId = String(employeeId).replace(/^:/, "").trim();
    const [rows] = await pool.execute(
        `SELECT 
            e.employee_id,
            e.branch_id,
            e.full_name,
            e.email,
            e.phone,
            e.designation,
            e.salary,
            e.joining_date,
            e.status,
            e.created_at,
            b.branch_name,
            b.branch_code,
            b.city,
            b.address AS branch_address
        FROM employees e
        INNER JOIN branches b
            ON e.branch_id = b.branch_id
        WHERE e.employee_id = ?`,
        [cleanId]
    );

    return rows[0] || null;
};

const findEmployeeByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT * FROM employees WHERE email = ?`,
        [email.trim().toLowerCase()]
    );

    return rows[0] || null;
};

const findEmployeeByPhone = async (phone) => {
    const [rows] = await pool.execute(
        `SELECT * FROM employees WHERE phone = ?`,
        [phone.trim()]
    );

    return rows[0] || null;
};

const findAllEmployees = async (filters = {}) => {
    const {
        branch_id,
        designation,
        status,
        search,
        limit,
        offset
    } = filters;

    const conditions = [];
    const params = [];

    if (branch_id) {
        conditions.push("e.branch_id = ?");
        params.push(branch_id);
    }

    if (designation) {
        conditions.push("e.designation = ?");
        params.push(designation);
    }

    if (status) {
        conditions.push("e.status = ?");
        params.push(status);
    }

    if (search) {
        conditions.push("(e.full_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)");
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let sql = `
        SELECT 
            e.employee_id,
            e.branch_id,
            e.full_name,
            e.email,
            e.phone,
            e.designation,
            e.salary,
            e.joining_date,
            e.status,
            e.created_at,
            b.branch_name,
            b.branch_code,
            b.city
        FROM employees e
        INNER JOIN branches b
            ON e.branch_id = b.branch_id
        ${whereClause}
        ORDER BY e.created_at DESC
    `;

    if (limit !== undefined && offset !== undefined) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit, 10), parseInt(offset, 10));
    }

    const [rows] = await pool.execute(sql, params);
    return rows;
};

const countEmployees = async (filters = {}) => {
    const {
        branch_id,
        designation,
        status,
        search
    } = filters;

    const conditions = [];
    const params = [];

    if (branch_id) {
        conditions.push("e.branch_id = ?");
        params.push(branch_id);
    }

    if (designation) {
        conditions.push("e.designation = ?");
        params.push(designation);
    }

    if (status) {
        conditions.push("e.status = ?");
        params.push(status);
    }

    if (search) {
        conditions.push("(e.full_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)");
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
        SELECT COUNT(*) AS total
        FROM employees e
        ${whereClause}
    `;

    const [rows] = await pool.execute(sql, params);
    return rows[0]?.total || 0;
};

const updateEmployee = async (employeeId, updateFields) => {
    const cleanId = String(employeeId).replace(/^:/, "").trim();
    const setClauses = [];
    const params = [];

    const allowedColumns = [
        "branch_id",
        "full_name",
        "email",
        "phone",
        "designation",
        "salary",
        "joining_date",
        "status"
    ];

    for (const column of allowedColumns) {
        if (updateFields[column] !== undefined) {
            setClauses.push(`${column} = ?`);
            params.push(updateFields[column]);
        }
    }

    if (setClauses.length === 0) {
        return await findEmployeeById(cleanId);
    }

    params.push(cleanId);

    await pool.execute(
        `UPDATE employees
         SET ${setClauses.join(", ")}
         WHERE employee_id = ?`,
        params
    );

    return await findEmployeeById(cleanId);
};

const deleteEmployee = async (employeeId) => {
    const cleanId = String(employeeId).replace(/^:/, "").trim();
    const [result] = await pool.execute(
        `DELETE FROM employees WHERE employee_id = ?`,
        [cleanId]
    );

    return result.affectedRows > 0;
};

const findBranchById = async (branchId) => {
    const [rows] = await pool.execute(
        `SELECT * FROM branches WHERE branch_id = ?`,
        [branchId]
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

export default {
    createEmployee,
    findEmployeeById,
    findEmployeeByEmail,
    findEmployeeByPhone,
    findAllEmployees,
    countEmployees,
    updateEmployee,
    deleteEmployee,
    findBranchById,
    getDefaultBranchId
};

