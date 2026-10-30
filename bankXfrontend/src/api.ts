import axios from "axios";
import type { Account, ApiResponse, AuthData, Customer, Transaction } from "./types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bankx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) window.dispatchEvent(new Event("bankx:unauthorized"));
    return Promise.reject(error);
  }
);

export const apiError = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || (error.request ? "The backend could not be reached." : "The request could not be completed.")
    : "The request could not be completed.";

export const authApi = {
  login: (email: string, password: string) => api.post<ApiResponse<AuthData>>("/auth/login", { email, password }),
  register: (payload: Record<string, string>) => api.post<ApiResponse<AuthData>>("/auth/register", payload),
  me: () => api.get<ApiResponse<Omit<AuthData, "token">>>("/auth/me")
};

export const customerApi = {
  profile: () => api.get<ApiResponse<Customer>>("/customers/me"),
  update: (payload: Partial<Customer>) => api.patch<ApiResponse<Customer>>("/customers/me", payload)
};

export const accountApi = {
  list: () => api.get<ApiResponse<Account[]>>("/accounts"),
  get: (id: number) => api.get<ApiResponse<Account>>(`/accounts/${id}`),
  create: (account_type: Account["account_type"]) => api.post<ApiResponse<Account>>("/accounts", { account_type })
};

export const transactionApi = {
  list: () => api.get<ApiResponse<Transaction[]>>("/transactions"),
  deposit: (payload: { to_account_id: number; amount: string; description?: string }) => api.post<ApiResponse<Transaction>>("/transactions/deposit", payload),
  withdraw: (payload: { from_account_id: number; amount: string; description?: string }) => api.post<ApiResponse<Transaction>>("/transactions/withdraw", payload),
  transfer: (payload: { from_account_id: number; to_account_id: number; amount: string; description?: string }) => api.post<ApiResponse<Transaction>>("/transactions/transfer", payload)
};