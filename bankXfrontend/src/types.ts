export type Role = "CUSTOMER" | "ADMIN";
export type AccountType = "SAVINGS" | "CURRENT";
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type TransactionType = "DEPOSIT" | "WITHDRAWL" | "TRANSFER";
export type TransactionStatus = "SUCCESS" | "FAILED";

export interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  date_of_birth: string | null;
  created_at: string;
}

export interface User {
  user_id: number;
  customer_id: number;
  role: Role;
}

export interface Account {
  account_id: number;
  customer_id: number;
  account_number: string | null;
  account_type: AccountType;
  balance: string;
  status: AccountStatus;
  created_at: string;
}

export interface Transaction {
  transactions_id: number;
  from_account_id: number | null;
  to_account_id: number | null;
  amount: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  created_at: string;
}

export interface AuthData {
  token: string;
  user: User;
  customer: Customer;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details: Array<{ field: string; message: string }>;
}