import authService from "./auth.service.js";

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: result
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await authService.getMe(userId);

        return res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    getCurrentUser
};