# BankX Frontend Integration Guide

This README is for the frontend developer working on **BankX -- Banking
and Transaction Management System**.

It explains the frontend scope, API contracts, authentication, expected
request/response formats, and key UI behaviors.

> **Backend base URL (local):** `http://localhost:5001`\
> **API prefix:** endpoints below include their full `/api/...` path.\
> **Content-Type:** `application/json`\
> **Important:** The contracts below reflect the backend flow agreed by
> the team. Confirm exact response field names and transaction route
> paths against the implemented backend before final integration.

------------------------------------------------------------------------

## 1. Frontend scope

Build a responsive banking dashboard with these screens/components:

-   Register
-   Login
-   Dashboard / account overview
-   Create account
-   Account details
-   Deposit money
-   Withdraw money
-   Transfer money
-   Transaction history
-   Profile / current-user details

The frontend should not calculate or directly modify account balances.
All balance changes must come from successful backend responses.

## 2. Authentication

The backend uses JWT authentication.

After successful login or registration, store the returned token and
attach it to protected requests:

``` http
Authorization: Bearer <token>
```

Example fetch helper:

``` js
const API_BASE_URL = "http://localhost:5001";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("bankx_token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}
```

For a `401 Unauthorized` response, clear the stored token and redirect
to Login.

> For a production app, prefer secure, HttpOnly cookies if the backend
> is configured for them. This project currently uses a Bearer token
> flow.

------------------------------------------------------------------------

## 3. Common response format

Successful responses generally follow this shape:

``` json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

Error responses should be handled using the HTTP status and `message`,
for example:

``` json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Do not rely only on the message text; use HTTP status codes to determine
the UI behavior.

Common statuses:

  -------------------------------------------------------------------------
  Status                  Meaning                   Frontend behavior
  ----------------------- ------------------------- -----------------------
  `200`                   Successful read/action    Display returned data

  `201`                   Resource created          Show success and
                                                    refresh relevant data

  `400`                   Invalid input             Show validation/error
                                                    message

  `401`                   Missing/invalid/expired   Redirect to login when
                          token or invalid login    session is invalid

  `403`                   Forbidden                 Show access denied

  `404`                   Resource not found / not  Show not-found state
                          accessible                

  `409`                   Duplicate/conflict        Show conflict message

  `500`                   Server error              Show generic error and
                                                    allow retry
  -------------------------------------------------------------------------

------------------------------------------------------------------------

## 4. API reference

### 4.1 Register

**`POST /api/auth/register`** --- Public

Request body:

``` json
{
  "fullName": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "address": "Kanpur",
  "dateOfBirth": "2004-05-15",
  "password": "ExamplePass123"
}
```

Expected response (`201`):

``` json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "userId": 1,
      "customerId": 1,
      "fullName": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "CUSTOMER"
    },
    "token": "<jwt>"
  }
}
```

Frontend: - Validate required fields and show field-level errors. - On
success, store the token if registration returns one, then navigate to
Dashboard. - Never send a role or customer ID from the form.

### 4.2 Login

**`POST /api/auth/login`** --- Public

Request body:

``` json
{
  "email": "aarav@example.com",
  "password": "ExamplePass123"
}
```

Expected response (`200`):

``` json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": 1,
      "customerId": 1,
      "fullName": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "CUSTOMER"
    },
    "token": "<jwt>"
  }
}
```

Frontend: - Store token as `bankx_token`. - Navigate to Dashboard. -
Show a generic invalid-credentials message for failed login.

### 4.3 Get current user

**`GET /api/auth/me`** --- Protected

Headers: `Authorization: Bearer <token>`

Request body: none.

Expected response (`200`):

``` json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "userId": 1,
    "customerId": 1,
    "fullName": "Aarav Sharma",
    "email": "aarav@example.com",
    "role": "CUSTOMER"
  }
}
```

Use this on app startup to validate the session and populate the
profile/header.

### 4.4 Create account

**`POST /api/accounts`** --- Protected

Request body:

``` json
{
  "account_type": "SAVINGS",
  "branch_id": 1
}
```

`branch_id` may be omitted if the backend selects a default branch.
Supported account types: `SAVINGS`, `CURRENT`.

Do **not** send `customerId`, `accountNumber`, `balance`, or `status`.
The backend derives the customer from the token, generates the account
number, and initializes balance/status.

Expected response (`201`):

``` json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "account_id": 1,
    "customer_id": 1,
    "account_number": "100100001234",
    "account_type": "SAVINGS",
    "balance": "0.00",
    "status": "ACTIVE",
    "branch_name": "Main Branch"
  }
}
```

Frontend: - Provide account type selection. - On success, refresh
account list and show the new account. - Display account numbers
clearly; avoid exposing them unnecessarily.

### 4.5 Get my accounts

**`GET /api/accounts`** --- Protected

Request body: none.

Expected response (`200`):

``` json
{
  "success": true,
  "message": "Accounts fetched successfully",
  "data": [
    {
      "account_id": 1,
      "account_number": "100100001234",
      "account_type": "SAVINGS",
      "balance": "25000.00",
      "status": "ACTIVE",
      "branch_name": "Main Branch",
      "branch_code": "BX001",
      "city": "Kanpur",
      "created_at": "2026-10-30T10:30:00.000Z"
    }
  ]
}
```

An empty `data: []` is valid when the customer has no accounts.

### 4.6 Get account details

**`GET /api/accounts/:accountId`** --- Protected

Example: `GET /api/accounts/1`

Request body: none.

Expected response (`200`): one account object in `data`, with account
number/type, balance, status, branch details, and creation date.

The backend checks that the account belongs to the logged-in customer.
If not found or not accessible, it may return `404`.

### 4.7 Deposit

**`POST /api/accounts/:accountId/deposit`** --- Protected

Example: `POST /api/accounts/1/deposit`

Request body:

``` json
{
  "amount": 5000,
  "description": "Initial deposit"
}
```

Expected response (`200` or `201`, depending on backend implementation):

``` json
{
  "success": true,
  "message": "Deposit successful",
  "data": {
    "transactionId": 1,
    "accountId": 1,
    "transactionType": "DEPOSIT",
    "amount": "5000.00",
    "status": "SUCCESS",
    "balance": "5000.00",
    "description": "Initial deposit"
  }
}
```

Frontend: - Amount must be positive. - Disable submit while request is
pending. - On success, refresh account balance and transaction
history. - Do not optimistically update balance before the server
confirms.

### 4.8 Withdraw

**`POST /api/accounts/:accountId/withdraw`** --- Protected

Example: `POST /api/accounts/1/withdraw`

Request body:

``` json
{
  "amount": 1000,
  "description": "ATM withdrawal"
}
```

Expected response is similar to Deposit, with `transactionType` set to
the backend's withdrawal enum value and updated balance.

Frontend: - Show insufficient-balance errors clearly. - Refresh
balance/history after success. - Backend schema may currently spell the
enum as `WITHDRAWL`; display a friendly label such as "Withdrawal" in
the UI.

### 4.9 Transfer

**`POST /api/accounts/:accountId/transfer`** --- Protected

Example: `POST /api/accounts/1/transfer`

Request body:

``` json
{
  "toAccountNumber": "100100001234",
  "amount": 1500,
  "description": "Transfer"
}
```

Expected response (`200` or `201`, depending on backend implementation):

``` json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transactionId": 2,
    "fromAccountId": 1,
    "toAccountId": 2,
    "transactionType": "TRANSFER",
    "amount": "1500.00",
    "status": "SUCCESS",
    "description": "Transfer"
  }
}
```

Frontend: - Let the user choose their source account. - Collect
recipient account number, amount, and optional description. - Confirm
transfer details before submission if possible. - Refresh both source
account balance and history after success. - Never ask the user to
provide their own customer ID.

### 4.10 Transaction history

**`GET /api/accounts/:accountId/transactions`** --- Protected

Example: `GET /api/accounts/1/transactions`

Request body: none.

Expected response (`200`):

``` json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [
    {
      "transaction_id": 1,
      "from_account_id": null,
      "to_account_id": 1,
      "amount": "5000.00",
      "transaction_type": "DEPOSIT",
      "status": "SUCCESS",
      "description": "Initial deposit",
      "created_at": "2026-10-31T10:30:00.000Z"
    }
  ]
}
```

The backend should return transactions where the account is either the
sender or recipient, newest first.

Frontend: - Show a useful empty state when there are no transactions. -
Label incoming/outgoing transfers clearly. - Format timestamps and
currency for the user's locale. - Treat amounts returned as
strings/decimal values; format them for display without floating-point
arithmetic for financial calculations.

------------------------------------------------------------------------

## 5. Suggested screen-to-API mapping

  Screen                      APIs
  --------------------------- ---------------------------------------------
  Register                    `POST /api/auth/register`
  Login                       `POST /api/auth/login`
  App startup / profile       `GET /api/auth/me`
  Dashboard                   `GET /api/accounts`
  Create account modal/page   `POST /api/accounts`
  Account details             `GET /api/accounts/:accountId`
  Deposit form                `POST /api/accounts/:accountId/deposit`
  Withdraw form               `POST /api/accounts/:accountId/withdraw`
  Transfer form               `POST /api/accounts/:accountId/transfer`
  Transaction history         `GET /api/accounts/:accountId/transactions`

------------------------------------------------------------------------

## 6. UI/UX requirements

-   Use loading states for all API requests.
-   Disable forms while submitting to prevent duplicate requests.
-   Show success/error feedback.
-   Confirm before submitting a transfer.
-   Display balances as currency, but do not calculate authoritative
    balances in the frontend.
-   Handle no accounts, no transactions, frozen/inactive account, and
    expired-session states.
-   Use responsive layouts for desktop and mobile.
-   Do not expose password hashes, JWT payload internals, database IDs
    unnecessarily, or backend stack traces.
-   Do not hardcode sample accounts or transaction records in the final
    integrated UI.

## 7. Integration checklist

-   [ ] Configure API base URL through an environment variable.
-   [ ] Register and login successfully.
-   [ ] Protected endpoints include the Bearer token.
-   [ ] App startup calls `/api/auth/me`.
-   [ ] Dashboard loads accounts from backend.
-   [ ] Account creation refreshes the account list.
-   [ ] Deposit/withdraw/transfer refresh balances and transaction
    history.
-   [ ] Invalid/expired token redirects to Login.
-   [ ] Empty states and API errors are handled.
-   [ ] Verify request/response field names against actual backend
    responses.
-   [ ] No mock data remains in the integrated flow.

------------------------------------------------------------------------

## 8. Backend integration note

If an endpoint path, enum spelling, response shape, or status code
differs from this guide, use the actual backend implementation as the
source of truth and update this README accordingly. The frontend
developer should coordinate with the backend developer rather than
silently changing API contracts.
