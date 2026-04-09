-- Migration to add year and quarter structure to subjects
ALTER TABLE subjects 
ADD COLUMN academic_year INT DEFAULT 1,
ADD COLUMN quarter INT DEFAULT 1;
