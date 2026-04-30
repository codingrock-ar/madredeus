-- Migration to fix missing columns in payments table
USE madredeus_db;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL AFTER amount,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Cuota' AFTER due_date,
ADD COLUMN IF NOT EXISTS details JSON DEFAULT NULL AFTER last_modified;

-- Ensure payment_method is a VARCHAR instead of ENUM if we want more flexibility
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(50) DEFAULT 'Efectivo';
ALTER TABLE payments MODIFY COLUMN status VARCHAR(20) DEFAULT 'Pendiente';
