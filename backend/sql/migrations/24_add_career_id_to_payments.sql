-- Migration to add career_id to payments
USE madredeus_db;

ALTER TABLE payments 
ADD COLUMN career_id INT NULL AFTER student_id,
ADD CONSTRAINT fk_payment_career FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL;
