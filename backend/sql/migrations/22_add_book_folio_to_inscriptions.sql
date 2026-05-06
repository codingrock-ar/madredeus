-- Migration to ensure book and folio exist in student_career_inscriptions
USE madredeus_db;

ALTER TABLE student_career_inscriptions
ADD COLUMN IF NOT EXISTS book VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS folio VARCHAR(50) DEFAULT NULL;
