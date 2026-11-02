import employeeRepository from "./employee.repository.js";
import ApiError from "../../common/utils/api-error.js";

const VALID_DESIGNATIONS = ["MANAGER", "TELLER", "ACCOUNTANT", "SUPPORT"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE"];

const createEmployee = async (employeeData) => {
    const fullName = employeeData.full_name || employeeData.fullName;
    const email = employeeData.email;
    const phone = employeeData.phone;
    const designation = employeeData.designation;
    const salary = employeeData.salary;
    const joiningDate = employeeData.joining_date || employeeData.joiningDate;
    const branchId = employeeData.branch_id || employeeData.branchId;
    const status = (employeeData.status || "ACTIVE").toUpperCase();

    // 1. Validate full name
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
        throw ApiError.badRequest("Please provide a valid full name between 2 and 100 characters");
    }

    // 2. Validate and normalize email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim().toLowerCase())) {
        throw ApiError.badRequest("Please provide a valid email address");
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existingEmail = await employeeRepository.findEmployeeByEmail(normalizedEmail);
    if (existingEmail) {
        throw ApiError.conflict("Employee with this email already exists");
    }

    // 3. Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
        throw ApiError.badRequest("Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9");
    }
    const normalizedPhone = phone.trim();

    // Check phone uniqueness
    const existingPhone = await employeeRepository.findEmployeeByPhone(normalizedPhone);
    if (existingPhone) {
        throw ApiError.conflict("Employee with this phone number already exists");
    }

    // 4. Validate designation
    if (!designation || !VALID_DESIGNATIONS.includes(designation.toUpperCase())) {
        throw ApiError.badRequest(`Invalid designation. Must be one of: ${VALID_DESIGNATIONS.join(", ")}`);
    }
    const normalizedDesignation = designation.toUpperCase();

    // 5. Validate salary if provided
    let normalizedSalary = null;
    if (salary !== undefined && salary !== null && salary !== "") {
        const numSalary = Number(salary);
        if (isNaN(numSalary) || numSalary < 0) {
            throw ApiError.badRequest("Salary must be a non-negative number");
        }
        normalizedSalary = numSalary;
    }

    // 6. Validate joining date
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!joiningDate || !dobRegex.test(joiningDate)) {
        throw ApiError.badRequest("Please provide joining date in YYYY-MM-DD format");
    }

    // 7. Validate status
    if (!VALID_STATUSES.includes(status)) {
        throw ApiError.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    // 8. Resolve branch ID
    let resolvedBranchId = branchId;
    if (resolvedBranchId) {
        const branch = await employeeRepository.findBranchById(resolvedBranchId);
        if (!branch) {
            throw ApiError.notFound(`Branch #${resolvedBranchId} not found`);
        }
    } else {
        resolvedBranchId = await employeeRepository.getDefaultBranchId();
    }

    // 9. Persist employee
    const employeeId = await employeeRepository.createEmployee({
        branch_id: resolvedBranchId,
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        designation: normalizedDesignation,
        salary: normalizedSalary,
        joining_date: joiningDate,
        status
    });

    return await employeeRepository.findEmployeeById(employeeId);
};

const getAllEmployees = async (query = {}) => {
    const filters = {};

    if (query.branch_id || query.branchId) {
        filters.branch_id = parseInt(query.branch_id || query.branchId, 10);
    }

    if (query.designation) {
        const des = query.designation.toUpperCase();
        if (VALID_DESIGNATIONS.includes(des)) {
            filters.designation = des;
        }
    }

    if (query.status) {
        const st = query.status.toUpperCase();
        if (VALID_STATUSES.includes(st)) {
            filters.status = st;
        }
    }

    if (query.search && query.search.trim()) {
        filters.search = query.search.trim();
    }

    // Pagination
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    filters.limit = limit;
    filters.offset = offset;

    const [employees, total] = await Promise.all([
        employeeRepository.findAllEmployees(filters),
        employeeRepository.countEmployees(filters)
    ]);

    return {
        employees,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getEmployeeById = async (employeeId) => {
    if (!employeeId) {
        throw ApiError.badRequest("Employee ID is required");
    }

    const employee = await employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
        throw ApiError.notFound(`Employee #${employeeId} not found`);
    }

    return employee;
};

const updateEmployee = async (employeeId, updateData) => {
    if (!employeeId) {
        throw ApiError.badRequest("Employee ID is required");
    }

    const existingEmployee = await employeeRepository.findEmployeeById(employeeId);
    if (!existingEmployee) {
        throw ApiError.notFound(`Employee #${employeeId} not found`);
    }

    const updateFields = {};

    // 1. Full name
    const fullName = updateData.full_name || updateData.fullName;
    if (fullName !== undefined) {
        if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
            throw ApiError.badRequest("Please provide a valid full name between 2 and 100 characters");
        }
        updateFields.full_name = fullName.trim();
    }

    // 2. Email
    if (updateData.email !== undefined) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(updateData.email.trim().toLowerCase())) {
            throw ApiError.badRequest("Please provide a valid email address");
        }
        const normalizedEmail = updateData.email.trim().toLowerCase();

        const emailHolder = await employeeRepository.findEmployeeByEmail(normalizedEmail);
        if (emailHolder && emailHolder.employee_id !== existingEmployee.employee_id) {
            throw ApiError.conflict("Employee with this email already exists");
        }
        updateFields.email = normalizedEmail;
    }

    // 3. Phone
    if (updateData.phone !== undefined) {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(updateData.phone.trim())) {
            throw ApiError.badRequest("Please provide a valid 10-digit mobile number starting with 6, 7, 8, or 9");
        }
        const normalizedPhone = updateData.phone.trim();

        const phoneHolder = await employeeRepository.findEmployeeByPhone(normalizedPhone);
        if (phoneHolder && phoneHolder.employee_id !== existingEmployee.employee_id) {
            throw ApiError.conflict("Employee with this phone number already exists");
        }
        updateFields.phone = normalizedPhone;
    }

    // 4. Designation
    if (updateData.designation !== undefined) {
        const des = updateData.designation.toUpperCase();
        if (!VALID_DESIGNATIONS.includes(des)) {
            throw ApiError.badRequest(`Invalid designation. Must be one of: ${VALID_DESIGNATIONS.join(", ")}`);
        }
        updateFields.designation = des;
    }

    // 5. Salary
    if (updateData.salary !== undefined) {
        if (updateData.salary === null || updateData.salary === "") {
            updateFields.salary = null;
        } else {
            const numSalary = Number(updateData.salary);
            if (isNaN(numSalary) || numSalary < 0) {
                throw ApiError.badRequest("Salary must be a non-negative number");
            }
            updateFields.salary = numSalary;
        }
    }

    // 6. Joining date
    const joiningDate = updateData.joining_date || updateData.joiningDate;
    if (joiningDate !== undefined) {
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dobRegex.test(joiningDate)) {
            throw ApiError.badRequest("Please provide joining date in YYYY-MM-DD format");
        }
        updateFields.joining_date = joiningDate;
    }

    // 7. Status
    if (updateData.status !== undefined) {
        const st = updateData.status.toUpperCase();
        if (!VALID_STATUSES.includes(st)) {
            throw ApiError.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
        }
        updateFields.status = st;
    }

    // 8. Branch ID
    const branchId = updateData.branch_id || updateData.branchId;
    if (branchId !== undefined) {
        const branch = await employeeRepository.findBranchById(branchId);
        if (!branch) {
            throw ApiError.notFound(`Branch #${branchId} not found`);
        }
        updateFields.branch_id = branchId;
    }

    return await employeeRepository.updateEmployee(employeeId, updateFields);
};

const deleteEmployee = async (employeeId) => {
    if (!employeeId) {
        throw ApiError.badRequest("Employee ID is required");
    }

    const existingEmployee = await employeeRepository.findEmployeeById(employeeId);
    if (!existingEmployee) {
        throw ApiError.notFound(`Employee #${employeeId} not found`);
    }

    await employeeRepository.deleteEmployee(employeeId);
    return {
        message: `Employee #${employeeId} (${existingEmployee.full_name}) deleted successfully`
    };
};

export default {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};

