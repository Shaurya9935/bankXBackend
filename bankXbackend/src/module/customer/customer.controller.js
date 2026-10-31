import customerService from "./customer.service.js"


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
    getMyAccounts
}