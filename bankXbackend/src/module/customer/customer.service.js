import customerRepository from "./customer.repository.js"

const getMyAccounts = async(customerId) => {
    const accounts = await customerRepository.findAccountsByCustomerId(customerId);

    return accounts;
}
export default{
    getMyAccounts
}