-- Migration for academic cycles and scholarships
CREATE TABLE academic_cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE scholarship_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some default data
INSERT INTO academic_cycles (name, status) VALUES ('2024', 'active'), ('2025', 'inactive');
INSERT INTO scholarship_types (name, discount_percentage) VALUES ('Sin Beca', 0.00), ('Beca 50%', 50.00), ('Beca 100%', 100.00);
