CREATE TABLE IF NOT EXISTS payment_config_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL,
    old_value DECIMAL(10,2) DEFAULT NULL,
    new_value DECIMAL(10,2) NOT NULL,
    changed_by_user_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (config_key) REFERENCES payment_configs(config_key) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
