import customerRepository from "./customer.repository.js";
import ApiError from "../../common/utils/api-error.js";

const getProfile = async (customerId) => {
    const customer = await customerRepository.findCustomerById(customerId);
    if (!customer) {
        throw ApiError.notFound("Customer profile not found");
    }
    return customer;
};

const updateProfile = async (customerId, updateData) => {
    const customer = await customerRepository.findCustomerById(customerId);
    if (!customer) {
        throw ApiError.notFound("Customer profile not found");
    }

    return await customerRepository.updateCustomer(customerId, updateData);
};

const getMyAccounts = async (customerId) => {
    return await customerRepository.findAccountsByCustomerId(customerId);
};

export default {
    getProfile,
    updateProfile,
    getMyAccounts
};
