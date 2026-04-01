-- Migration to add status to scholarship_types
ALTER TABLE scholarship_types ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';
