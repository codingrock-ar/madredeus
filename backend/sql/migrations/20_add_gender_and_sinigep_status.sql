-- SQL Migration to add gender and sinigep_status to students table
USE madredeus_db;

ALTER TABLE students 
ADD COLUMN gender VARCHAR(20) DEFAULT 'No especifica' AFTER birthdate,
ADD COLUMN sinigep_status VARCHAR(50) DEFAULT 'Pendiente' AFTER status;
