import { success } from "../../common/dto/base.dto.js";
import * as service from "./customer.service.js";
export const me = async (req, res, next) => {
  try { res.json(success(await service.get(req.auth.customer_id))); } catch (error) { next(error); }
};
export const updateMe = async (req, res, next) => {
  try { res.json(success(await service.update(req.auth.customer_id, req.body), "Profile updated")); } catch (error) { next(error); }
};
export const get = async (req, res, next) => {
  try { res.json(success(await service.get(req.params.customerId))); } catch (error) { next(error); }
};
export const list = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(success(await service.list({ search: req.query.search || "", limit, offset })));
  } catch (error) { next(error); }
};