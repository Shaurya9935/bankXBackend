import accountRepository from "./account.repository.js";
import ApiError from "../../common/utils/api-error.js";

const generateAccountNumber = () => {
    // Generate a 12-digit numeric account number starting with "1001"
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `1001${randomSuffix}`;
};

const createAccount = async (accountData) => {
    const { customerId, account_type, branch_id } = accountData;

    // Validate account type against schema enum ('SAVINGS', 'CURRENT')
    const type = (account_type || "SAVINGS").toUpperCase();
    if (!["SAVINGS", "CURRENT"].includes(type)) {
        throw ApiError.badRequest("Invalid account_type. Must be 'SAVINGS' or 'CURRENT'");
    }

    // Resolve branch
    let resolvedBranchId = branch_id;
    if (!resolvedBranchId) {
        resolvedBranchId = await accountRepository.getDefaultBranchId();
    }

    // Generate unique account number
    const accountNumber = generateAccountNumber();

    // Create account
    const accountId = await accountRepository.createAccount({
        customerId,
        branchId: resolvedBranchId,
        accountNumber,
        account_type: type
    });

    return await accountRepository.findAccountById(accountId);
};

const getMyAccounts = async (customerId) => {
    return await accountRepository.findAccountsByCustomerId(customerId);
};

const getMyAccount = async (accountId, customerId) => {
    const account = await accountRepository.findAccountByAccountId(accountId, customerId);

    if (!account) {
        throw ApiError.notFound("Account not found");
    }

    return account;
};

export default {
    createAccount,
    getMyAccounts,
    getMyAccount
};
