CREATE TABLE accounts (
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
        REFERENCES customes(customer_id)
        ON DELETE RESTRICT

    CONSTRAINT balance_non_negative
        CHECK (balance >= 0)
)