import { HttpError } from "../../common/dto/base.dto.js";
import * as repository from "./transaction.repository.js";

const amount = (value) => /^\d+(\.\d{1,2})?$/.test(String(value)) && Number(value) > 0;
const validateAmount = (value) => {
  if (!amount(value)) throw new HttpError(400, "Amount must be greater than zero with up to two decimals", "INVALID_AMOUNT");
};
export const list = (customerId) => repository.listByCustomer(customerId);
export const deposit = async (input, customerId) => {
  validateAmount(input.amount);
  return execute({ ...input, type: "DEPOSIT", customerId, fromAccountId: null, toAccountId: input.to_account_id });
};
export const withdraw = async (input, customerId) => {
  validateAmount(input.amount);
  return execute({ ...input, type: "WITHDRAWL", customerId, fromAccountId: input.from_account_id, toAccountId: null });
};
export const transfer = async (input, customerId) => {
  validateAmount(input.amount);
  if (Number(input.from_account_id) === Number(input.to_account_id)) throw new HttpError(400, "Source and destination accounts must differ", "INVALID_TRANSFER");
  return execute({ ...input, type: "TRANSFER", customerId, fromAccountId: input.from_account_id, toAccountId: input.to_account_id });
};
const execute = async ({ type, fromAccountId, toAccountId, amount: value, description }) => {
  try { return await repository.execute({ type, fromAccountId, toAccountId, amount: value, description }); }
  catch (error) {
    if (error instanceof Error && error.message === "Insufficient balance") throw new HttpError(400, error.message, "INSUFFICIENT_BALANCE");
    if (error instanceof Error && error.message.includes("account not found")) throw new HttpError(404, error.message, "ACCOUNT_NOT_FOUND");
    throw error;
  }
};