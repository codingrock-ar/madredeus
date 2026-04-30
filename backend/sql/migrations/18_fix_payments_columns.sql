-- Migration to fix missing columns in payments table
USE madredeus_db;

-- Standard MySQL ALTER TABLE (does not support IF NOT EXISTS for columns)
ALTER TABLE payments 
ADD COLUMN due_date DATE DEFAULT NULL AFTER amount,
ADD COLUMN type VARCHAR(50) DEFAULT 'Cuota' AFTER due_date,
ADD COLUMN details JSON DEFAULT NULL AFTER last_modified;

-- Ensure payment_method is a VARCHAR instead of ENUM if we want more flexibility
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) DEFAULT 'Efectivo';
ALTER TABLE payments MODIFY COLUMN status VARCHAR(20) DEFAULT 'Pendiente';
