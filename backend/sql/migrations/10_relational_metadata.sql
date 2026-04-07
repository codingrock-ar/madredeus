-- Migration for relational shifts and commissions
USE madredeus_db;

CREATE TABLE IF NOT EXISTS shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS commissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS career_shifts (
    career_id INT NOT NULL,
    shift_id INT NOT NULL,
    PRIMARY KEY (career_id, shift_id),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shift_commissions (
    shift_id INT NOT NULL,
    commission_id INT NOT NULL,
    PRIMARY KEY (shift_id, commission_id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (commission_id) REFERENCES commissions(id) ON DELETE CASCADE
);

-- Initial Data
INSERT IGNORE INTO shifts (name) VALUES ('Mañana'), ('Tarde'), ('Noche'), ('TM'), ('TT'), ('TN'), ('TA');
INSERT IGNORE INTO commissions (name) VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('Z');

-- Example mappings (Abogacía is usually id 1 or similar, let's use subqueries)
INSERT IGNORE INTO career_shifts (career_id, shift_id) 
SELECT c.id, s.id FROM careers c, shifts s 
WHERE c.title = 'Abogacía' AND s.name IN ('Mañana', 'Tarde', 'Noche');

INSERT IGNORE INTO career_shifts (career_id, shift_id) 
SELECT c.id, s.id FROM careers c, shifts s 
WHERE c.title = 'Administración de Empresas' AND s.name IN ('Mañana', 'Noche');

INSERT IGNORE INTO career_shifts (career_id, shift_id) 
SELECT c.id, s.id FROM careers c, shifts s 
WHERE c.title = 'Enfermería Profesional' AND s.name IN ('TM', 'TT', 'TN');

-- Shift -> Commissions mapping
INSERT IGNORE INTO shift_commissions (shift_id, commission_id)
SELECT s.id, co.id FROM shifts s, commissions co
WHERE s.name IN ('Mañana', 'TM') AND co.name IN ('A', 'B');

INSERT IGNORE INTO shift_commissions (shift_id, commission_id)
SELECT s.id, co.id FROM shifts s, commissions co
WHERE s.name IN ('Tarde', 'TT') AND co.name IN ('C', 'D');

INSERT IGNORE INTO shift_commissions (shift_id, commission_id)
SELECT s.id, co.id FROM shifts s, commissions co
WHERE s.name IN ('Noche', 'TN') AND co.name IN ('E', 'Z');
