# BankX Backend

BankX is a backend banking management REST API built with Node.js (ESM), Express 5, and MySQL 8.0. It provides secure user authentication, account management, and ACID-compliant transactional money operations (deposits, withdrawals, and transfers).

---

## 1. Project Structure

```text
bankXbackend/
├── docker-compose.yml           # MySQL 8.0 container definition
├── init.sql                     # Database schema definitions and constraints
├── package.json                 # Node dependencies and npm scripts
├── server.js                    # Server startup and database connection verification
└── src/
    ├── app.js                   # Express application setup, global middleware, and route mounting
    ├── common/
    │   ├── config/
    │   │   ├── db.js            # MySQL connection pool (mysql2/promise)
    │   │   └── env.js           # Environment variable loader
    │   ├── middleware/
    │   │   ├── auth.middleware.js     # JWT Bearer token authentication
    │   │   ├── error.middleware.js    # Global error handler (JSON formatted)
    │   │   └── validate.middleware.js # Schema validation middleware
    │   └── utils/
    │       ├── api-error.js     # Operational ApiError helper
    │       ├── api-response.js  # Standard ApiResponse envelope
    │       └── jwt.js           # JWT sign & verify utilities
    └── module/
        ├── account/             # Account creation, lookups, and account-specific transactions
        │   ├── account.controller.js
        │   ├── account.repository.js
        │   ├── account.routes.js
        │   └── account.service.js
        ├── auth/                # Customer registration, user login, and session validation
        │   ├── auth.controller.js
        │   ├── auth.middleware.js
        │   ├── auth.repository.js
        │   ├── auth.routes.js
        │   └── auth.service.js
        ├── customer/            # Customer profile and profile updates
        │   ├── customer.controller.js
        │   ├── customer.repository.js
        │   ├── customer.routes.js
        │   └── customer.service.js
        └── transaction/         # Money operations (deposit, withdraw, transfer) and history
            ├── transaction.controller.js
            ├── transaction.repository.js
            ├── transaction.routes.js
            └── transaction.service.js
```

---

## 2. Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/) with Docker Compose
* [Node.js](https://nodejs.org/) (v18+) and npm

### 1. Start MySQL Database
Start the containerized MySQL database:
```bash
docker compose up -d mysql
```

The database runs on `localhost:3306` with the development credentials:
* **Database**: `banking_systems`
* **User**: `root`
* **Password**: `root`

> To reset the database to a clean state matching `init.sql`:
> ```bash
> docker compose down -v
> docker compose up -d mysql
> ```

### 2. Configure Environment Variables
Create or verify `.env` in `bankXbackend/`:
```env
PORT=5001
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=banking_systems

JWT_SECRET=replace_with_a_long_random_secret
```

### 3. Install Dependencies and Run
```bash
npm install
npm run dev
```

The server starts on **`http://localhost:5001`**. Verify health:
```bash
curl http://localhost:5001/health
# {"success":true,"message":"BankX API is running"}
```

---

## 3. Architecture & Design Principles

### Layered Modular Pattern
Each domain feature is encapsulated under `src/module/<feature>/`:
* **Routes (`*.routes.js`)**: Maps HTTP paths, applies middleware (JWT validation, request sanitization).
* **Controller (`*.controller.js`)**: Extracts parameters from request (`params`, `query`, `body`, `req.user`), delegates to service, and formats HTTP response envelopes.
* **Service (`*.service.js`)**: Encapsulates business logic, balance validation, state transitions, and coordinates multi-step database transactions.
* **Repository (`*.repository.js`)**: Executes raw SQL queries and prepared statements against the database pool or transactional connection.

### Transaction Safety & ACID Compliance
All money-moving operations (deposit, withdraw, transfer) execute inside an atomic MySQL transaction:
1. `const connection = await pool.getConnection();`
2. `await connection.beginTransaction();`
3. Execute account balance updates + record corresponding `transactions` rows.
4. `await connection.commit();`
5. On any failure, `await connection.rollback()` is executed in the `catch` block.
6. The connection is guaranteed to be returned to the pool via `connection.release()` inside the `finally` block to prevent connection leaks.

---

## 4. API Endpoints

All authenticated endpoints require the header:
```http
Authorization: Bearer <token>
```

### Health Check
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status check | Public |

### 4.1 Authentication Module (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register customer profile & user login | Public |
| `POST` | `/api/auth/login` | Authenticate user with email and password | Public |
| `GET` | `/api/auth/me` | Fetch active user session & customer profile | Bearer |

#### `POST /api/auth/register`
* **Body**:
  ```json
  {
    "fullName": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "phone": "9876543210",
    "password": "Password123",
    "dateOfBirth": "2000-05-15",
    "address": "Civil Lines, Kanpur"
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "user_id": 1, "customer_id": 1, "role": "CUSTOMER" },
      "customer": { "customer_id": 1, "full_name": "Rahul Sharma", "email": "rahul@gmail.com", "phone": "9876543210", "address": "Civil Lines, Kanpur", "date_of_birth": "2000-05-15" }
    }
  }
  ```

#### `POST /api/auth/login`
* **Body**:
  ```json
  { "email": "rahul@gmail.com", "password": "Password123" }
  ```
* **Response (`200 OK`)**: Returns token, user, and customer objects.

---

### 4.2 Customer Profile Module (`/api/customers`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers/me` | Get current customer's profile | Bearer |
| `PATCH` | `/api/customers/me` | Update customer's profile fields | Bearer |
| `GET` | `/api/customers/me/accounts` | Get accounts owned by the customer | Bearer |

---

### 4.3 Accounts Module (`/api/accounts`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts` | List accounts belonging to customer | Bearer |
| `POST` | `/api/accounts` | Open a new bank account (`SAVINGS` or `CURRENT`) | Bearer |
| `GET` | `/api/accounts/:accountId` | Get account details by ID or 12-digit account number | Bearer |
| `GET` | `/api/accounts/:accountId/transactions`| Get transaction history for specific account | Bearer |
| `POST` | `/api/accounts/:accountId/deposit` | Deposit money into account | Bearer |
| `POST` | `/api/accounts/:accountId/withdraw` | Withdraw money from account | Bearer |
| `POST` | `/api/accounts/:accountId/transfer` | Transfer money to another account | Bearer |

#### `POST /api/accounts`
* **Body**: `{ "account_type": "SAVINGS" }` (or `"CURRENT"`)
* **Response (`201 Created`)**: Auto-generates unique 12-digit account number (e.g. `100172485191`) and associates fallback branch.

---

### 4.4 Transactions Module (`/api/transactions`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | List all transactions for customer | Bearer |
| `POST` | `/api/transactions/deposit` | Deposit money (`{ to_account_id, amount, description }`) | Bearer |
| `POST` | `/api/transactions/withdraw` | Withdraw money (`{ from_account_id, amount, description }`)| Bearer |
| `POST` | `/api/transactions/transfer` | Transfer money between accounts | Bearer |

#### Transfer Example
```http
POST /api/accounts/1/transfer
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "toAccountNumber": "100172485191",
  "amount": 1500,
  "description": "Rent payment"
}
```
* **Validation**:
  - Sender account must belong to logged-in customer and be `ACTIVE`.
  - Recipient account must exist, be `ACTIVE`, and cannot be the sender account.
  - Sender balance must be $\ge$ transfer amount.
  - Changes are committed atomically in MySQL.

---

## 5. Database Design & Schemas

The schema is defined in [`init.sql`](./init.sql) and uses core banking entities:

```mermaid
erDiagram
    CUSTOMERS ||--o| USERS : "has login"
    CUSTOMERS ||--o{ ACCOUNTS : owns
    BRANCHES ||--o{ ACCOUNTS : maintains
    BRANCHES ||--o{ EMPLOYEES : employs
    ACCOUNTS o|--o{ TRANSACTIONS : "from account"
    ACCOUNTS o|--o{ TRANSACTIONS : "to account"

    CUSTOMERS {
        INT customer_id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR phone UK
        VARCHAR address
        DATE date_of_birth
        TIMESTAMP created_at
    }

    BRANCHES {
        INT branch_id PK
        VARCHAR branch_name
        VARCHAR branch_code UK
        VARCHAR city
        VARCHAR address
        TIMESTAMP created_at
    }

    USERS {
        INT user_id PK
        INT customer_id FK_UK
        VARCHAR password_hash
        ENUM role
        TIMESTAMP created_at
    }

    ACCOUNTS {
        INT account_id PK
        INT customer_id FK
        INT branch_id FK
        VARCHAR account_number UK
        ENUM account_type
        DECIMAL balance
        ENUM status
        TIMESTAMP created_at
    }

    TRANSACTIONS {
        INT transactions_id PK
        INT from_account_id FK
        INT to_account_id FK
        DECIMAL amount
        ENUM transaction_type
        ENUM status
        VARCHAR description
        TIMESTAMP created_at
    }
```

### Constraints & Integrity Rules
- `customers.email` and `customers.phone` are declared `UNIQUE` and `NOT NULL`.
- `users.customer_id` has a unique foreign key constraint establishing a 1-to-1 relationship.
- `accounts.account_number` is `UNIQUE`.
- `accounts.balance >= 0` check constraint prevents negative balances at the database level.
- `transactions.amount > 0` check constraint enforces positive transaction amounts.
- `transaction_type` ENUM: `'DEPOSIT'`, `'WITHDRAWL'`, `'TRANSFER'`.
- `account_type` ENUM: `'SAVINGS'`, `'CURRENT'`.
- `status` ENUMs: Accounts (`'ACTIVE'`, `'FROZEN'`, `'CLOSED'`), Transactions (`'SUCCESS'`, `'FAILED'`).

---

## 6. Functional Dependencies & Normalization

### `customers`
Candidate keys: `customer_id`, `email`, `phone`.
```text
customer_id -> full_name, email, phone, address, date_of_birth, created_at
email       -> customer_id, full_name, phone, address, date_of_birth, created_at
phone       -> customer_id, full_name, email, address, date_of_birth, created_at
```

### `users`
Candidate keys: `user_id`, `customer_id`.
```text
user_id     -> customer_id, password_hash, role, created_at
customer_id -> user_id, password_hash, role, created_at
```

### `accounts`
Candidate keys: `account_id`, `account_number`.
```text
account_id     -> customer_id, branch_id, account_number, account_type, balance, status, created_at
account_number -> account_id, customer_id, branch_id, account_type, balance, status, created_at
```

### `transactions`
Candidate key: `transactions_id`.
```text
transactions_id -> from_account_id, to_account_id, amount, transaction_type, status, description, created_at
```

Under these constraints, each relation is in **Boyce-Codd Normal Form (BCNF)**.
