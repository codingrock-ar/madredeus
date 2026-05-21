-- Migration to add duration and weekly_hours to subjects table
USE madredeus_db;

ALTER TABLE subjects 
ADD COLUMN duration VARCHAR(100) DEFAULT NULL,
ADD COLUMN weekly_hours VARCHAR(100) DEFAULT NULL;
