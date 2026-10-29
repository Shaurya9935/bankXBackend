CREATE DATABASE IF NOT EXISTS banking_systems;

USE banking_systems;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    address VARCHAR(255),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE CASCADE
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    account_number VARCHAR(50),
    account_type ENUM(
        'SAVINGS',
        'CURRENT'
    ) DEFAULT 'SAVINGS',

    balance DECIMAL(15, 2)
        NOT NULL DEFAULT 0.00,
    
    status ENUM(
        'ACTIVE',
        'FROZEN',
        'CLOSED'
    ) DEFAULT 'ACTIVE',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT,

    CONSTRAINT balance_non_negative
        CHECK (balance >= 0)
);

-- CREATE INDEX idx_accounts_customer
-- ON accounts(customer_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    transactions_id INT PRIMARY KEY AUTO_INCREMENT,
    from_account_id INT NULL,
    to_account_id INT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM(
        'DEPOSIT',
        'WITHDRAWL',
        'TRANSFER'
    ) NOT NULL,

    status ENUM(
        'SUCCESS',
        'FAILED'
    ) DEFAULT 'SUCCESS',

    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_account_id)
        REFERENCES accounts(account_id),
        
    FOREIGN KEY (to_account_id)
        REFERENCES accounts(account_id),

    CONSTRAINT transaction_amount_positive
        CHECK (amount > 0)
);

-- CREATE INDEX idx_transactions_from
-- ON transactions(from_account_id);

-- CREATE INDEX idx_transactions_to
-- ON transactions(to_account_id);

-- CREATE INDEX idx_transactions_date
-- ON transactions(created_at);
