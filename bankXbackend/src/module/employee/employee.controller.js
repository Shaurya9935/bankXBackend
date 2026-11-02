import employeeService from "./employee.service.js";

const createEmployee = async (req, res, next) => {
    try {
        const result = await employeeService.createEmployee(req.body);

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllEmployees = async (req, res, next) => {
    try {
        const result = await employeeService.getAllEmployees(req.query);

        return res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: result.employees,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId || req.params.id;
        const result = await employeeService.getEmployeeById(employeeId);

        return res.status(200).json({
            success: true,
            message: "Employee retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId || req.params.id;
        const result = await employeeService.updateEmployee(employeeId, req.body);

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId || req.params.id;
        const result = await employeeService.deleteEmployee(employeeId);

        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};

