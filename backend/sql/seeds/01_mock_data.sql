USE madredeus_db;

-- Insertar Datos Mock para Carreras
INSERT INTO careers (id, title, duration) VALUES 
(2, 'ENFERMERIA PROFESIONAL', 3),
(3, 'INSTRUMENTACION QUIRURGICA', 3),
(4, 'TECNICO EN LABORATORIO', 2),
(5, 'TÉCNICO EN RADIOLOGÍA', 2),
(11, 'PODOLOGIA', 3),
(12, 'PRÓTESIS DENTAL', 2),
(13, 'HEMOTERAPIA', 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insertar Datos Mock para Materias
INSERT INTO subjects (id, name) VALUES 
(1, 'BIOLOGIA'),
(2, 'FUNDAMENTOS DE QUIMICA'),
(3, 'PRACTICA DE LABORATORIO'),
(4, 'ESTADO Y SOCIEDAD'),
(5, 'PRIMEROS AUXILIOS'),
(6, 'ANATOMOFISIOLOGIA'),
(7, 'MICROBIOLOGIA'),
(8, 'BIOETICA')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insertar Datos Mock para Profesores
INSERT INTO teachers (id, image, lastname, name) VALUES 
(4549, 'https://ui-avatars.com/api/?name=Giordano+Carolina', 'Giordano', 'Carolina Soledad'),
(1149, 'https://ui-avatars.com/api/?name=Test+Test', 'Test', 'Test'),
(2341, 'https://ui-avatars.com/api/?name=Perez+Juan', 'Perez', 'Juan'),
(5521, 'https://ui-avatars.com/api/?name=Gomez+Maria', 'Gomez', 'Maria Laura'),
(6103, 'https://ui-avatars.com/api/?name=Rios+Fernando', 'Rios', 'Fernando Hector')
ON DUPLICATE KEY UPDATE lastname=VALUES(lastname);

-- Insertar Datos Mock para Estudiantes
INSERT INTO students (id, dni, name, lastname, email, career, commission, shift, status) VALUES
(280937, '94667680', 'Dora', 'Pedraza Macedo', 'dora.pedraza@mail.com', 'Enfermería Profesional', 'B', 'TM', 'Abandono'),
(671768, '41235880', 'Nayla Rocio', 'Raynaldes', 'nayla.ray@mail.com', 'Enfermería Laferrere', 'A', 'TN', 'En Curso'),
(671767, '45128820', 'Kiara Alexandra', 'Moya', 'kiara.m@mail.com', 'Enfermería Laferrere', 'A', 'TN', 'En Curso'),
(671765, '45751406', 'Antonella Aylen', 'De Jesus', 'anto.dj@mail.com', 'Técnico en Radiología', 'A', 'TM', 'En Curso'),
(728193, '40112233', 'Micaela', 'Sanchez', 'mica.sanchez@mail.com', 'Instrumentación Quirúrgica', 'C', 'TM', 'Egresado')
ON DUPLICATE KEY UPDATE dni=VALUES(dni);

-- Insertar Datos Mock para Usuarios
-- Contraseña por defecto: 123456 (Usando bcrypt)
INSERT INTO users (name, email, password_hash) VALUES 
('Administrador', 'admin@madredeus.com', '$2y$10$zwnQGe7WO/4zl4HbmHm4/uZsj7YyllAiJdWd5Ehg6.ev2bLyVvdEi'),
('Ariel', 'ariel@madredeus.com', '$2y$10$zwnQGe7WO/4zl4HbmHm4/uZsj7YyllAiJdWd5Ehg6.ev2bLyVvdEi')
ON DUPLICATE KEY UPDATE email=VALUES(email);
