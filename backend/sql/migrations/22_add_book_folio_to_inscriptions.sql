-- Migration to ensure book and folio exist in student_career_inscriptions
USE madredeus_db;

-- Sin el IF NOT EXISTS para mayor compatibilidad con versiones antiguas de MySQL
ALTER TABLE student_career_inscriptions
ADD COLUMN book VARCHAR(50) DEFAULT NULL,
ADD COLUMN folio VARCHAR(50) DEFAULT NULL;
