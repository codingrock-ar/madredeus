-- Migration to remove discount_percentage from scholarship_types
ALTER TABLE scholarship_types DROP COLUMN discount_percentage;
