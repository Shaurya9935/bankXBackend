import { HttpError } from "../../common/dto/base.dto.js";
import { generateAccountNumber } from "../../common/utils/accountNumber.js";
import * as repository from "./account.repository.js";
export const list = (customerId) => repository.listByCustomer(customerId);
export const getOwned = async (id, customerId) => {
  const account = await repository.findById(id);
  if (!account || account.customer_id !== Number(customerId)) throw new HttpError(404, "Account not found", "ACCOUNT_NOT_FOUND");
  return account;
};
export const get = async (id) => {
  const account = await repository.findById(id);
  if (!account) throw new HttpError(404, "Account not found", "ACCOUNT_NOT_FOUND");
  return account;
};
export const create = async (customerId, accountType) => {
  if (!["SAVINGS", "CURRENT"].includes(accountType)) throw new HttpError(400, "Invalid account type", "INVALID_ACCOUNT_TYPE");
  return repository.create({ customerId, accountNumber: generateAccountNumber(), accountType });
};
export const setStatus = async (id, status) => {
  if (!["ACTIVE", "FROZEN", "CLOSED"].includes(status)) throw new HttpError(400, "Invalid account status", "INVALID_ACCOUNT_STATUS");
  const account = await repository.updateStatus(id, status);
  if (!account) throw new HttpError(404, "Account not found", "ACCOUNT_NOT_FOUND");
  return account;
};