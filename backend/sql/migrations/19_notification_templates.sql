-- Migration to create notification templates table and initial data (Matching Local)
USE madredeus_db;

CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ensure description column exists (if table was created without it)
-- Standard MySQL ALTER TABLE (no IF NOT EXISTS for column)
-- We'll just run it, if it fails because it exists, it's fine for now, 
-- but better to check if we can do it safely.
-- Actually, the table locally DOES have description.

-- Initial Templates (Matching Local exactly)
INSERT INTO notification_templates (template_key, subject, body, description) VALUES 
('docs_missing', 'Documentación Pendiente - Instituto Madre Deus', 'Hola {name} {lastname},\n\nTe informamos que aún debes presentar la siguiente documentación:\n{docs}\n\nPor favor, entrega los originales lo antes posible.\n\nAtentamente,\nSecretaría Madre Deus', 'Solicitud de documentos faltantes'),
('payment_upcoming', 'Próximo Vencimiento - Instituto Madre Deus', 'Hola {name} {lastname},\n\nTe recordamos que se acerca la fecha de vencimiento de tu cuota:\n\nConcepto: {concept}\nMonto: {amount}\nVencimiento: {date}\n\nPor favor, regulariza tu situación para evitar recargos.\n\nAtentamente,\nAdministración Madre Deus', 'Aviso de vencimiento próximo'),
('payment_overdue', 'Cuota Vencida - Instituto Madre Deus', 'Hola {name} {lastname},\n\nTe informamos que posees una cuota vencida:\n\nConcepto: {concept}\nMonto: {amount}\nVencimiento: {date}\n\nPor favor, acércate a administración a la brevedad.\n\nAtentamente,\nAdministración Madre Deus', 'Aviso de deuda vencida'),
('legajo_summary', 'Resumen de Legajo - IMD', 'Hola {name} {lastname},\n\nAdjuntamos el resumen detallado de tu legajo académico y administrativo en el Instituto Madre Deus.\n\nAnte cualquier duda, por favor contáctanos.\n\nSaludos,\nAdministración IMD', 'Resumen de legajo enviado manualmente')
ON DUPLICATE KEY UPDATE subject=VALUES(subject), body=VALUES(body);
