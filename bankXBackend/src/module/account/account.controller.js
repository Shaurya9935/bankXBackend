import { success } from "../../common/dto/base.dto.js";
import * as service from "./account.service.js";
export const list = async (req, res, next) => {
  try { res.json(success(await service.list(req.auth.customer_id))); } catch (error) { next(error); }
};
export const get = async (req, res, next) => {
  try { res.json(success(await service.getOwned(req.params.accountId, req.auth.customer_id))); } catch (error) { next(error); }
};
export const create = async (req, res, next) => {
  try { res.status(201).json(success(await service.create(req.auth.customer_id, req.body.account_type), "Account created")); } catch (error) { next(error); }
};
export const status = async (req, res, next) => {
  try { res.json(success(await service.setStatus(req.params.accountId, req.body.status), "Account status updated")); } catch (error) { next(error); }
};