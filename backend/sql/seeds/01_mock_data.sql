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

-- Insertar Datos Mock para Estudiantes (Enriquecido para pruebas de paginación y nuevos campos)
INSERT INTO students (
    id, dni, name, lastname, email, birthdate, nationality, phone, address, city, career, commission, shift, status,
    academic_cycle, document_type, civil_status, max_education_level, education_finished, address_type, 
    address_street, address_number, address_province, address_locality, address_zip_code, phone_mobile, 
    found_institution
) VALUES
(280937, '94667680', 'Dora', 'Pedraza Macedo', 'dora.pedraza@mail.com', '1985-05-15', 'Boliviana', '1122334455', 'Av. Rivadavia 1234', 'CABA', 'Enfermería Profesional', 'B', 'TM', 'Abandono', '2023', 'DNI', 'Casado', 'Terciario', 'Si', 'Departamento', 'Av. Rivadavia', '1234', 'CABA', 'Balvanera', '1033', '1122334455', '["Internet", "Radio"]'),
(671768, '41235880', 'Nayla Rocio', 'Raynaldes', 'nayla.ray@mail.com', '1998-11-20', 'Argentina', '1133445566', 'Calle Falsa 123', 'La Matanza', 'Enfermería Profesional', 'A', 'TN', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Calle Falsa', '123', 'Buenos Aires', 'Laferrere', '1757', '1133445566', '["Amigo/Familiar"]'),
(671767, '45128820', 'Kiara Alexandra', 'Moya', 'kiara.m@mail.com', '2003-02-10', 'Argentina', '1144556677', 'Belgrano 456', 'San Justo', 'Enfermería Profesional', 'A', 'TN', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Belgrano', '456', 'Buenos Aires', 'San Justo', '1754', '1144556677', '["Internet"]'),
(671765, '45751406', 'Antonella Aylen', 'De Jesus', 'anto.dj@mail.com', '2003-08-25', 'Argentina', '1155667788', 'Pueyrredón 789', 'CABA', 'Técnico en Radiología', 'A', 'TM', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Departamento', 'Pueyrredón', '789', 'CABA', 'Recoleta', '1118', '1155667788', '["Redes Sociales"]'),
(728193, '40112233', 'Micaela', 'Sanchez', 'mica.sanchez@mail.com', '1997-03-30', 'Argentina', '1166778899', 'Moreno 101', 'Morón', 'Instrumentación Quirúrgica', 'C', 'TM', 'Egresado', '2021', 'DNI', 'Soltero', 'Terciario', 'Si', 'Casa', 'Moreno', '101', 'Buenos Aires', 'Morón', '1708', '1166778899', '["Diarios"]'),
(100001, '30000001', 'Juan', 'Perez', 'juan.perez@test.com', '1985-01-01', 'Argentina', '1100000001', 'Test 1', 'CABA', 'Enfermería Profesional', 'A', 'TM', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '1', 'CABA', 'Centro', '1000', '1100000001', '["Internet"]'),
(100002, '30000002', 'Maria', 'Gomez', 'maria.gomez@test.com', '1990-02-02', 'Argentina', '1100000002', 'Test 2', 'CABA', 'Técnico en Laboratorio', 'A', 'TT', 'En Curso', '2024', 'DNI', 'Casado', 'Secundario', 'Si', 'Casa', 'Test', '2', 'CABA', 'Centro', '1000', '1100000002', '["Internet"]'),
(100003, '30000003', 'Pedro', 'Rodriguez', 'pedro.rod@test.com', '1992-03-03', 'Argentina', '1100000003', 'Test 3', 'CABA', 'Podología', 'B', 'TN', 'Abandono', '2023', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '3', 'CABA', 'Centro', '1000', '1100000003', '["Radio"]'),
(100004, '30000004', 'Ana', 'Lopez', 'ana.lopez@test.com', '1988-04-04', 'Argentina', '1100000004', 'Test 4', 'CABA', 'Prótesis Dental', 'A', 'TM', 'En Curso', '2024', 'DNI', 'Divorciado', 'Secundario', 'Si', 'Casa', 'Test', '4', 'CABA', 'Centro', '1000', '1100000004', '["Internet"]'),
(100005, '30000005', 'Carlos', 'Garcia', 'carlos.garcia@test.com', '1995-05-05', 'Argentina', '1100000005', 'Test 5', 'CABA', 'Hemoterapia', 'C', 'TT', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '5', 'CABA', 'Centro', '1000', '1100000005', '["Redes Sociales"]'),
(100006, '30000006', 'Laura', 'Martinez', 'laura.mar@test.com', '1993-06-06', 'Argentina', '1100000006', 'Test 6', 'CABA', 'Enfermería Profesional', 'A', 'TM', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '6', 'CABA', 'Centro', '1000', '1100000006', '["Internet"]'),
(100007, '30000007', 'Jose', 'Hernandez', 'jose.her@test.com', '1987-07-07', 'Argentina', '1100000007', 'Test 7', 'CABA', 'Instrumentación Quirúrgica', 'B', 'TN', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '7', 'CABA', 'Centro', '1000', '1100000007', '["Internet"]'),
(100008, '30000008', 'Sofia', 'Diaz', 'sofia.diaz@test.com', '1996-08-08', 'Argentina', '1100000008', 'Test 8', 'CABA', 'Técnico en Radiología', 'A', 'TM', 'Egresado', '2022', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '8', 'CABA', 'Centro', '1000', '1100000008', '["Internet"]'),
(100009, '30000009', 'Luis', 'Torres', 'luis.torres@test.com', '1991-09-09', 'Argentina', '1100000009', 'Test 9', 'CABA', 'Podología', 'A', 'TT', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '9', 'CABA', 'Centro', '1000', '1100000009', '["Internet"]'),
(100010, '30000010', 'Elena', 'Ramirez', 'elena.ram@test.com', '1989-10-10', 'Argentina', '1100000010', 'Test 10', 'CABA', 'Prótesis Dental', 'C', 'TN', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '10', 'CABA', 'Centro', '1000', '1100000010', '["Internet"]'),
(100011, '30000011', 'Miguel', 'Alvarez', 'miguel.alv@test.com', '1994-11-11', 'Argentina', '1100000011', 'Test 11', 'CABA', 'Hemoterapia', 'A', 'TM', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '11', 'CABA', 'Centro', '1000', '1100000011', '["Internet"]'),
(100012, '30000012', 'Lucia', 'Flores', 'lucia.flo@test.com', '1992-12-12', 'Argentina', '1100000012', 'Test 12', 'CABA', 'Enfermería Profesional', 'B', 'TN', 'En Curso', '2024', 'DNI', 'Soltero', 'Secundario', 'Si', 'Casa', 'Test', '12', 'CABA', 'Centro', '1000', '1100000012', '["Internet"]')
ON DUPLICATE KEY UPDATE dni=VALUES(dni);

-- Insertar Datos Mock para Usuarios
-- Contraseña por defecto: 123456 (Usando bcrypt)
INSERT INTO users (name, email, password_hash) VALUES 
('Administrador', 'admin@madredeus.com', '$2y$10$zwnQGe7WO/4zl4HbmHm4/uZsj7YyllAiJdWd5Ehg6.ev2bLyVvdEi'),
('Ariel', 'ariel@madredeus.com', '$2y$10$zwnQGe7WO/4zl4HbmHm4/uZsj7YyllAiJdWd5Ehg6.ev2bLyVvdEi'),
('nortizzone', 'nortizzone@madredeus.com', '$2y$10$21lRM0R/yMGL/9gDugjPceRsoK95eOMk7fuXfK8503l1/gkjFYWhi')
ON DUPLICATE KEY UPDATE email=VALUES(email);
