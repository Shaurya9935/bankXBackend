# BankX Backend

BankX is the backend foundation for a banking management system. The current
implementation is centered on a MySQL database schema for customers, login
users, bank accounts, and account transactions.

## Project structure

```text
.
├── init.sql                 # Database and table definitions
├── docker-compose.yml       # MySQL 8.0 development service
├── package.json             # Node.js project metadata and dependencies
└── src/
    ├── common/              # Configuration, middleware, DTOs, and utilities
    ├── db/queries/          # SQL query drafts
    └── module/              # Auth, customer, account, transaction, and admin modules
```

## Getting started

### Prerequisites

- Docker Desktop with Docker Compose
- Node.js and npm

### Start MySQL

From this directory, run:

```bash
docker compose up -d mysql
```

The database is available on `localhost:3306` with:

| Setting | Value |
| --- | --- |
| Database | `banking_systems` |
| User | `root` |
| Password | `root` |
| Port | `3306` |

The `init.sql` file is mounted into MySQL's initialization directory. MySQL
only runs initialization scripts when the data volume is created for the first
time. To initialize a clean database during local development:

```bash
docker compose down -v
docker compose up -d mysql
```

> The database credentials in `docker-compose.yml` are development defaults.
> Use environment-specific secrets before deploying this project.

### VS Code Database Connection

If using VS Code with the [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) extension and its MySQL driver, a pre-configured connection named **bankX** is provided in [`.vscode/settings.json`](./.vscode/settings.json) connecting to `localhost:3306` (`root` / `root`).

Install Node.js dependencies with:

```bash
npm install
```

The application and module files are present as the project structure is being
built; database initialization is the currently implemented runnable setup.

## Database design

The schema is defined in [`init.sql`](./init.sql) and uses four core entities:

- **customers** stores a customer's personal and contact information.
- **users** stores authentication information for a customer or administrator.
- **accounts** stores the customer's bank accounts and current balances.
- **transactions** stores deposits, withdrawals, and transfers involving
  accounts.

### Entity-relationship diagram

The diagram uses crow's-foot notation. `||` means exactly one, `o|` means zero
or one, and `o{` means zero or many.

```mermaid
erDiagram
    CUSTOMERS ||--o| USERS : "has login"
    CUSTOMERS ||--o{ ACCOUNTS : owns
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
        VARCHAR account_number
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

`TRANSACTIONS` has two separate relationships to `ACCOUNTS`: one for the
source account and one for the destination account. Deposits normally use a
null `from_account_id`, withdrawals normally use a null `to_account_id`, and
transfers use both account references. These transaction-type rules are
business semantics and are not currently represented by a database `CHECK`
constraint.

## Keys and constraints

### Key

A key is an attribute, or a set of attributes, that identifies a row. The
schema uses the following keys:

| Table | Key | Type | Purpose |
| --- | --- | --- | --- |
| `customers` | `customer_id` | Primary key | Identifies each customer |
| `customers` | `email` | Alternate key (`UNIQUE`) | Prevents duplicate email addresses |
| `customers` | `phone` | Alternate key (`UNIQUE`) | Prevents duplicate phone numbers |
| `users` | `user_id` | Primary key | Identifies each login record |
| `users` | `customer_id` | Alternate key (`UNIQUE`) | Allows at most one user record per customer |
| `accounts` | `account_id` | Primary key | Identifies each bank account |
| `transactions` | `transactions_id` | Primary key | Identifies each transaction |

`AUTO_INCREMENT` generates values for the integer primary keys. Foreign keys
connect rows across tables:

- `users.customer_id` references `customers.customer_id`.
- `accounts.customer_id` references `customers.customer_id`.
- `transactions.from_account_id` references `accounts.account_id`.
- `transactions.to_account_id` references `accounts.account_id`.

### Other integrity constraints

- Required fields use `NOT NULL`.
- Customer email addresses and phone numbers are unique.
- A user's role is `CUSTOMER` or `ADMIN`.
- An account type is `SAVINGS` or `CURRENT`.
- An account status is `ACTIVE`, `FROZEN`, or `CLOSED`.
- A transaction type is `DEPOSIT`, `WITHDRAWL`, or `TRANSFER`.
- A transaction status is `SUCCESS` or `FAILED`.
- `accounts.balance >= 0`.
- `transactions.amount > 0`.
- Deleting a customer cascades to the related user record.
- Deleting a customer is restricted while accounts reference that customer.

The schema currently does **not** declare `account_number` as `UNIQUE`.
Therefore, `account_id`, not `account_number`, is the guaranteed account key.
If account numbers are intended to be externally unique, add a unique
constraint before relying on that rule in application code.

## Functional dependencies

A functional dependency `X -> Y` means that knowing the value of `X`
determines exactly one value of `Y`. The dependencies below are derived from
the declared primary and unique keys in `init.sql`.

### `customers`

Candidate keys are `customer_id`, `email`, and `phone`.

```text
customer_id -> full_name, email, phone, address, date_of_birth, created_at
email       -> customer_id, full_name, phone, address, date_of_birth, created_at
phone       -> customer_id, full_name, email, address, date_of_birth, created_at
```

`email` and `phone` are alternate keys because they are declared `UNIQUE` and
`NOT NULL`. The `UNIQUE` constraint prevents two customers from sharing either
value.

### `users`

Candidate keys are `user_id` and `customer_id`.

```text
user_id     -> customer_id, password_hash, role, created_at
customer_id -> user_id, password_hash, role, created_at
```

The second dependency exists because `users.customer_id` is both a foreign key
and `UNIQUE`. It models a one-to-zero-or-one login record for each customer.

### `accounts`

The declared candidate key is `account_id`.

```text
account_id -> customer_id, account_number, account_type, balance, status, created_at
```

The following dependency must **not** be assumed from the current schema:

```text
account_number -> account_id
```

It would only be valid if `account_number` had a `UNIQUE` constraint. Also,
`customer_id` does not determine one account because a customer may own
multiple accounts:

```text
customer_id -/> account_id
```

### `transactions`

The declared candidate key is `transactions_id`.

```text
transactions_id -> from_account_id, to_account_id, amount,
                   transaction_type, status, description, created_at
```

Neither `from_account_id` nor `to_account_id` identifies a transaction; an
account can participate in many transactions. Likewise, the combination of
the two account IDs, amount, and timestamp is not declared unique and cannot
be treated as a candidate key.

### Normalization summary

Under the constraints declared in `init.sql`, each table is in BCNF:

1. Every non-trivial functional dependency has a determinant that is a
   candidate key.
2. Customer contact attributes and user identity are protected by explicit
   alternate keys.
3. Repeating account and transaction data is separated into its own relation.
4. Foreign keys represent relationships without duplicating the referenced
   entity's descriptive attributes.

This normalization assessment depends on the declared constraints. For
example, adding a business rule that makes `account_number` unique would make
it an additional candidate key; omitting that constraint means the database
does not enforce that dependency.

## Data model caveats

- `WITHDRAWL` is the spelling currently used by the database enum. Changing it
  to `WITHDRAWAL` requires a schema and application migration.
- The database does not currently enforce that a transfer has two distinct
  valid accounts, or that deposits and withdrawals use the expected nullable
  account column.
- The database stores balances and transaction rows, but does not yet define
  a ledger trigger or transaction procedure to reconcile them automatically.
- The commented index definitions in `init.sql` can be enabled when query
  patterns and deployment requirements are established.
