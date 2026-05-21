-- Migration to add is_deleted column to careers table
USE madredeus_db;

ALTER TABLE careers 
ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;
