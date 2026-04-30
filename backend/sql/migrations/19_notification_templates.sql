-- Migration to create notification templates table and initial data
USE madredeus_db;

CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Templates
INSERT INTO notification_templates (template_key, name, subject, body, description) VALUES 
('welcome_student', 'Bienvenida Alumno', 'Bienvenido al Instituto Madre Deus', 'Hola {name}, te damos la bienvenida a la carrera {career}.', 'Email que se envía al registrar un alumno'),
('payment_reminder', 'Recordatorio de Pago', 'Recordatorio de Vencimiento de Cuota', 'Hola {name}, te recordamos que tienes una cuota pendiente de {amount}.', 'Email de recordatorio de deuda'),
('documentation_reminder', 'Documentación Faltante', 'Aviso de Documentación Pendiente', 'Hola {name}, te informamos que adeudas la siguiente documentación: {docs}.', 'Email para solicitar documentos faltantes'),
('legajo_summary', 'Resumen de Legajo', 'Tu Resumen de Legajo - IMD', 'Hola {name}, adjuntamos el resumen de tu legajo académico y administrativo.', 'Resumen completo enviado desde la ficha del alumno')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
