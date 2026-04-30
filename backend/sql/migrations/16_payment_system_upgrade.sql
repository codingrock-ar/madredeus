-- Migration to upgrade payment system with interests and configurations
USE madredeus_db;

-- Upgrade payments table
ALTER TABLE payments 
ADD COLUMN base_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN interest_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN academic_year_index INT DEFAULT 1; -- To track if it's year 1 or 2 of the plan

-- Create payment configurations table
CREATE TABLE IF NOT EXISTS payment_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initialize default configurations
INSERT INTO payment_configs (config_key, config_value, description) VALUES 
('quota_base_amount', '40000', 'Monto base de la cuota mensual'),
('matricula_base_amount', '50000', 'Monto base de la matrícula'),
('interest_after_10', '10', 'Interés (%) después del día 10'),
('interest_after_20', '20', 'Interés (%) después del día 20'),
('interest_fixed_after_10', '0', 'Monto fijo adicional de interés después del día 10 (si se prefiere a %)'),
('interest_fixed_after_20', '0', 'Monto fijo adicional de interés después del día 20 (si se prefiere a %)');

-- Ensure some existing payments have base_amount for consistency
UPDATE payments SET base_amount = amount WHERE base_amount IS NULL;
