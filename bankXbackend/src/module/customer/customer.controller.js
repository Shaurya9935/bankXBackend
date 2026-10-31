import customerService from "./customer.service.js";

const getProfile = async (req, res, next) => {
    try {
        const result = await customerService.getProfile(req.user.customerId);
        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const result = await customerService.updateProfile(req.user.customerId, req.body);
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMyAccounts = async (req, res, next) => {
    try {
        const accounts = await customerService.getMyAccounts(req.user.customerId);
        return res.status(200).json({
            success: true,
            message: "Accounts Fetched Successfully",
            data: accounts
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getProfile,
    updateProfile,
    getMyAccounts
};
