-- Migration to add reporting fields to students
USE madredeus_db;

ALTER TABLE students 
ADD COLUMN scholarship_id INT NULL,
ADD COLUMN academic_year VARCHAR(10) DEFAULT '2024';

-- Link scholarship_id to scholarship_types table
ALTER TABLE students 
ADD CONSTRAINT fk_student_scholarship 
FOREIGN KEY (scholarship_id) REFERENCES scholarship_types(id) 
ON DELETE SET NULL;

-- Initialize academic_year for existing students
UPDATE students SET academic_year = '2024' WHERE academic_year IS NULL;
