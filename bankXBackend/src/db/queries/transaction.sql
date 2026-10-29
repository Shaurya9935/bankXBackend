CREATE TABLE transactions(
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

CREATE INDEX idx_transactions_from
ON transactions(from_account_id);

CREATE INDEX idx_transactions_to
ON transactions(to_account_id);

CREATE INDEX idx_transactions_date
ON transactions(created_at);
