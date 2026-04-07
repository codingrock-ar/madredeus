-- Migration for students payments table
USE madredeus_db;

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Depósito', 'Otro') DEFAULT 'Efectivo',
    concept VARCHAR(150) NOT NULL, -- Ej: Matricula 2024, Cuota 1, etc.
    status ENUM('Pagado', 'Pendiente', 'Anulado') DEFAULT 'Pagado',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Mock Data for testing
INSERT INTO payments (student_id, amount, concept, payment_method) VALUES 
(280937, 5000.00, 'Matrícula 2024', 'Transferencia'),
(671768, 4500.00, 'Cuota 1', 'Efectivo'),
(671767, 4500.00, 'Cuota 1', 'Tarjeta');
