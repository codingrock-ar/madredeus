-- SQL Migration to add file columns for documents
USE madredeus_db;

ALTER TABLE students 
ADD COLUMN file_dni VARCHAR(255) DEFAULT NULL,
ADD COLUMN file_degree VARCHAR(255) DEFAULT NULL,
ADD COLUMN file_psychophysical VARCHAR(255) DEFAULT NULL,
ADD COLUMN file_vaccines VARCHAR(255) DEFAULT NULL,
ADD COLUMN file_student_book VARCHAR(255) DEFAULT NULL,
ADD COLUMN file_final_degree VARCHAR(255) DEFAULT NULL;
