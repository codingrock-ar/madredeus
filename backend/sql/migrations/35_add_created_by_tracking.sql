-- Migration to add created_by to students and inscriptions
ALTER TABLE students ADD COLUMN created_by VARCHAR(150) DEFAULT NULL;
ALTER TABLE student_career_inscriptions ADD COLUMN created_by VARCHAR(150) DEFAULT NULL;
