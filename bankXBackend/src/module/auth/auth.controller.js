import { success } from "../../common/dto/base.dto.js";
import * as service from "./auth.service.js";

export const register = async (req, res, next) => {
  try { res.status(201).json(success(await service.register(req.body), "Registration successful")); } catch (error) { next(error); }
};
export const login = async (req, res, next) => {
  try { res.json(success(await service.login(req.body), "Login successful")); } catch (error) { next(error); }
};
export const me = async (req, res, next) => {
  try { res.json(success(await service.me(req.auth.user_id), "Current user loaded")); } catch (error) { next(error); }
};