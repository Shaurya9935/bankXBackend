import { success } from "../../common/dto/base.dto.js";
import * as service from "./transaction.service.js";
export const list = async (req, res, next) => {
  try { res.json(success(await service.list(req.auth.customer_id))); } catch (error) { next(error); }
};
export const deposit = async (req, res, next) => {
  try { res.status(201).json(success(await service.deposit(req.body, req.auth.customer_id), "Deposit completed")); } catch (error) { next(error); }
};
export const withdraw = async (req, res, next) => {
  try { res.status(201).json(success(await service.withdraw(req.body, req.auth.customer_id), "Withdrawal completed")); } catch (error) { next(error); }
};
export const transfer = async (req, res, next) => {
  try { res.status(201).json(success(await service.transfer(req.body, req.auth.customer_id), "Transfer completed")); } catch (error) { next(error); }
};