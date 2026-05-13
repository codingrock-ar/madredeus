-- Migration to track notifications
USE madredeus_db;

ALTER TABLE payments 
ADD COLUMN last_notified DATETIME DEFAULT NULL;

ALTER TABLE students
ADD COLUMN last_notified_docs DATETIME DEFAULT NULL;
