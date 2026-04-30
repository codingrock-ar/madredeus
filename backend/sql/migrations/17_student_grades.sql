-- Migration to support student grades linked to career inscriptions
USE madredeus_db;

CREATE TABLE IF NOT EXISTS student_grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  inscription_id INT NOT NULL,
  subject_id INT NOT NULL,
  grade VARCHAR(20) DEFAULT NULL,
  status VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_grade (inscription_id, subject_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (inscription_id) REFERENCES student_career_inscriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
