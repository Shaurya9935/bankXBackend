import { HttpError } from "../../common/dto/base.dto.js";
import * as repository from "./customer.repository.js";
export const get = async (id) => {
  const customer = await repository.findById(id);
  if (!customer) throw new HttpError(404, "Customer not found", "CUSTOMER_NOT_FOUND");
  return customer;
};
export const update = async (id, fields) => {
  const customer = await repository.update(id, fields);
  if (!customer) throw new HttpError(404, "Customer not found", "CUSTOMER_NOT_FOUND");
  return customer;
};
export const list = (query) => repository.list(query);