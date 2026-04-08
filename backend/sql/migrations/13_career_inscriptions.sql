-- Migration to support multiple career inscriptions per student
USE madredeus_db;

CREATE TABLE IF NOT EXISTS student_career_inscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    career_id INT NOT NULL,
    commission VARCHAR(50),
    shift VARCHAR(50),
    academic_cycle VARCHAR(50),
    status ENUM('En Curso', 'Abandono', 'Egresado', 'Finalizó Cursada') DEFAULT 'En Curso',
    inscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- Migrate existing data
INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, inscription_date)
SELECT 
    s.id, 
    c.id, 
    s.commission, 
    s.shift, 
    s.academic_cycle, 
    s.status, 
    s.created_at
FROM students s
JOIN careers c ON s.career = c.title
WHERE s.career IS NOT NULL;
