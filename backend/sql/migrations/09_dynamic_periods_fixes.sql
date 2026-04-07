-- Migration to add 'Finalizó Cursada' to students status and add Biotecnología career
USE madredeus_db;

ALTER TABLE students MODIFY COLUMN status ENUM('En Curso', 'Abandono', 'Egresado', 'Finalizó Cursada') DEFAULT 'En Curso';

INSERT INTO careers (title, duration) VALUES ('BIOTECNOLOGÍA', 5) 
ON DUPLICATE KEY UPDATE duration = 5;
