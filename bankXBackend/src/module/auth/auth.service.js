import bcrypt from "bcryptjs";
import { HttpError } from "../../common/dto/base.dto.js";
import { signToken } from "../../common/utils/jwt.js";
import * as repository from "./auth.repository.js";

const publicUser = (user) => ({
  user_id: user.user_id,
  customer_id: user.customer_id,
  role: user.role
});

const customer = (user) => ({
  customer_id: user.customer_id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  date_of_birth: user.date_of_birth,
  created_at: user.created_at
});

export const register = async (input) => {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const created = await repository.createCustomerUser({ ...input, passwordHash });
  const user = await repository.findUserById(created.user_id);
  return { token: signToken(publicUser(user)), user: publicUser(user), customer: customer(user) };
};

export const login = async ({ email, password }) => {
  const user = await repository.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }
  return { token: signToken(publicUser(user)), user: publicUser(user), customer: customer(user) };
};

export const me = async (userId) => {
  const user = await repository.findUserById(userId);
  if (!user) throw new HttpError(404, "User not found", "USER_NOT_FOUND");
  return { user: publicUser(user), customer: customer(user) };
};