-- Migration to expand careers table with more fields
ALTER TABLE careers 
ADD COLUMN resolution VARCHAR(255) NULL,
ADD COLUMN degree_title VARCHAR(255) NULL,
ADD COLUMN study_plan VARCHAR(255) NULL;
