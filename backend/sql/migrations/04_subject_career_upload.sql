-- Migration to link subjects to careers and support program file uploads
ALTER TABLE subjects 
ADD COLUMN career_id INT NULL,
ADD CONSTRAINT fk_subject_career FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL;

-- Ensure program column is large enough for paths (usually it is, but just in case)
-- If it was a URL it might be VARCHAR(255), which is fine for paths too.
