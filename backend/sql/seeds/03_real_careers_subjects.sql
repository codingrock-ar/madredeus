-- Seed data for real careers and subjects
-- Based on https://madredeus.edu.ar/carreras/

-- Clean up existing data to avoid duplicates if re-run
DELETE FROM subjects;
DELETE FROM careers;

-- Reset auto-increment
ALTER TABLE careers AUTO_INCREMENT = 1;
ALTER TABLE subjects AUTO_INCREMENT = 1;

-- Insert Careers
INSERT INTO careers (id, title, duration) VALUES 
(2, 'ENFERMERIA PROFESIONAL', 3),
(3, 'INSTRUMENTACION QUIRURGICA', 3),
(4, 'TECNICO EN LABORATORIO', 3),
(5, 'TÉCNICO EN RADIOLOGÍA', 3),
(11, 'PODOLOGIA', 3),
(12, 'BIOTECNOLOGIA', 3),
(13, 'LAFERRERE ENFERMERIA', 3),
(14, 'POSGRADOD ENFERMERIA PEDIATRICA', 1),
(15, 'LAFERRERE RADIOLOGIA', 3);

-- Insert Subjects for ENFERMERIA PROFESIONAL (ID 2)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Comunicación y Relaciones Interpersonales', 2, 1, 1),
('Antropología y Fundamentos Socioculturales de Enfermería', 2, 1, 1),
('Espacio Definición Institucional (Formación General)', 2, 1, 1),
('Salud Pública', 2, 1, 1),
('Ciencias Biológicas', 2, 1, 1),
('Fundamentos de Enfermería', 2, 1, 1),
('Cuidados y Modelos de Atención', 2, 1, 2),
('Práctica Profesionalizante Inicial', 2, 1, 2),
('Enfermería Comunitaria', 2, 1, 2),
('Epidemiología', 2, 1, 2),
('Anatomía y Fisiología', 2, 1, 2),
('Nutrición y dietoterapia', 2, 1, 2),
('Farmacología', 2, 2, 1),
('Práctica Profesionalizante II', 2, 2, 1),
('Condiciones y medio ambiente del trabajo', 2, 2, 1),
('Informática en Salud', 2, 2, 1),
('Enfermería del adulto y del anciano', 2, 2, 1),
('Fundamentos socioculturales de la enfermería', 2, 2, 1),
('Primeros Auxilios II', 2, 2, 2),
('Práctica Profesionalizante III', 2, 2, 2),
('Gestión de servicios de Enfermería', 2, 2, 2),
('Procesos de atención en adultos y ancianos', 2, 2, 2),
('Inglés', 2, 2, 2),
('Aspectos psicosociales del cuidado', 2, 2, 2),
('Principios de bioética', 2, 3, 1),
('Emergentología I', 2, 3, 1),
('Práctica Profesionalizante IV', 2, 3, 1),
('Enfermería Materno Infantil y del adolescente', 2, 3, 1),
('Desarrollo profesional de Enfermería', 2, 3, 1),
('Bioética aplicada', 2, 3, 1),
('Primeros auxilios III', 2, 3, 2),
('Práctica profesionalizante V', 2, 3, 2),
('Emergentología II', 2, 3, 2),
('Deontología y Legislación', 2, 3, 2),
('Práctica Profesionalizante en comunidad VI', 2, 3, 2);

-- Insert Subjects for TECNICO EN LABORATORIO (ID 4)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Bioética', 4, 1, 1), ('Biología', 4, 1, 1), ('Comunicación', 4, 1, 1), ('Informática Aplicada', 4, 1, 1), ('Matemática y Estadística', 4, 1, 1), ('Química General', 4, 1, 1),
('Práctica Profesionalizante en Bioseguridad y técnicas básicas de obtención de muestras', 4, 1, 2), ('Matemática y Física', 4, 1, 2), ('Inmunología y Bioseguridad', 4, 1, 2), ('Química Biológica', 4, 1, 2), ('Ética Profesional', 4, 1, 2), ('Práctica Pre analítica', 4, 1, 2),
('Taller de Estadística', 4, 2, 1), ('Bacteriología', 4, 2, 1), ('Química Instrumental', 4, 2, 1), ('Fisiopatología I', 4, 2, 1), ('Informática', 4, 2, 1), ('Práctica analítica', 4, 2, 1),
('Taller de Especialidad Clínica', 4, 2, 2), ('Genética', 4, 2, 2), ('Microbiología clínica', 4, 2, 2), ('Validación clínica', 4, 2, 2), ('Técnicas de Laboratorio', 4, 2, 2), ('Salud Pública', 4, 2, 2),
('Práctica Post analítica', 4, 3, 1), ('Serología y Virología', 4, 3, 1), ('Tecnología Clínica', 4, 3, 1), ('Ejercicio profesional y CYMAT', 4, 3, 1), ('Biotecnología', 4, 3, 1), ('Hematología', 4, 3, 1),
('Práctica Profesionalizante Externa', 4, 3, 2), ('Práctica Profesionalizante Externa II', 4, 3, 2), ('Psicología Institucional', 4, 3, 2), ('Organización y Gestión de Laboratorio', 4, 3, 2), ('Tecnológicas', 4, 3, 2);

-- Insert Subjects for INSTRUMENTACION QUIRURGICA (ID 3)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Primeros auxilios', 3, 1, 1), ('Introducción a la anatomía y fisiología', 3, 1, 1), ('Introducción a los fundamentos de la instrumentación quirúrgica', 3, 1, 1), ('Introducción a la atención del paciente quirúrgico', 3, 1, 1), ('Espacio de definición institucional', 3, 1, 1), ('Informática', 3, 1, 1),
('Química biológica', 3, 1, 2), ('Inglés técnico', 3, 1, 2), ('Práctica profesionalizante en fundamentos quirúrgicos', 3, 1, 2), ('Microbiología y Parasitología', 3, 1, 2), ('Farmacología y Toxicología', 3, 1, 2), ('Anatomía y Fisiología II', 3, 1, 2),
('Física Biológica', 3, 2, 1), ('Fundamentos de Instr. Quirúrgica II', 3, 2, 1), ('Atención al paciente Quirúrgica II', 3, 2, 1), ('Inglés Técnico', 3, 2, 1), ('Práctica II', 3, 2, 1), ('Salud Pública', 3, 2, 1),
('Procedimientos Quirúrgicos Menores', 3, 2, 2), ('Psicología', 3, 2, 2), ('Metodología y Comunicación de la Investigación', 3, 2, 2), ('Anatomía Quirúrgica I', 3, 2, 2), ('Bioseguridad', 3, 2, 2), ('Ética y Ejercicio Profesional', 3, 2, 2),
('Prácticas Quirúrgicas Menores', 3, 3, 1), ('Procedimientos Quirúrgicos Medianos', 3, 3, 1), ('Anatomía Quirúrgica II', 3, 3, 1), ('Practicas Quirúrgicas Medianas', 3, 3, 1), ('Procedimientos Quirúrgicos Medianos II', 3, 3, 1), ('Organización y gestión de I. de Salud', 3, 3, 1),
('Prácticas Quirúrgicas Medianas II', 3, 3, 2), ('Procedimientos Quirúrgicos Mayores', 3, 3, 2), ('Cirugía Infantil', 3, 3, 2), ('Practicas Quirúrgicas Mayores', 3, 3, 2), ('Practicas Quirúrgicas Pediátricas', 3, 3, 2);

-- Insert Subjects for TÉCNICO EN RADIOLOGÍA (ID 5)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Ciencias biológicas', 5, 1, 1), ('Condiciones y Medio Ambiente de Trabajo', 5, 1, 1), ('Primeros auxilios', 5, 1, 1), ('Fundamentos del Diagnóstico por Imágenes', 5, 1, 1), ('Matemática', 5, 1, 2), ('Comunicación y Relaciones Interpersonales', 5, 1, 2),
('Anatomía y fisiología humana I', 5, 1, 2), ('Técnicas en imágenes I', 5, 1, 2), ('Física I', 5, 2, 1), ('Inglés técnico II', 5, 2, 1), ('Informática aplicada', 5, 2, 1), ('Anatomía y fisiología humana II', 5, 2, 1),
('Técnicas en imágenes II', 5, 2, 2), ('Física II.', 5, 2, 2), ('Química Biológica.', 5, 2, 2), ('Psicología general e institucional', 5, 2, 2), ('Prácticas hospitalarias I', 5, 3, 1), ('Anatomía y fisiología humana IIl', 5, 3, 1),
('Técnicas en imágenes III', 5, 3, 1), ('Bioseguridad. Condiciones y medio ambiente de trabajo.', 5, 3, 1), ('Ética y deontología del ejercicio profesional', 5, 3, 2), ('Radiologia pediátrica', 5, 3, 2), ('Prácticas hospitalarias II', 5, 3, 2), ('Fisiopatología', 5, 3, 2),
('Tomografía computada', 5, 3, 2), ('Introducción a la metodología de la investigación y bioestadística', 5, 3, 2), ('Administración y gestión en servicios de salud', 5, 3, 2), ('Prácticas hospitalarias III', 5, 3, 2), ('Resonancia magnética', 5, 3, 2), ('Salud pública y epidemiología', 5, 3, 2),
('Radioterapia', 5, 3, 2), ('Práctica hospitalaria IV', 5, 3, 2);

-- Insert Subjects for PODOLOGIA (ID 11)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Anatomía y fisiología general', 11, 1, 1), ('Microbiología y parasitología', 11, 1, 1), ('Introducción a la podología', 11, 1, 1), ('Practica profesionalizante: introducción a la atención podológica', 11, 1, 1), ('Bioseguridad', 11, 1, 1), ('Anatomía del miembro inferior', 11, 1, 1),
('Semiología podológica', 11, 1, 2), ('Patología medica', 11, 1, 2), ('Primeros auxilios', 11, 1, 2), ('Dermatología', 11, 1, 2), ('Practica profesionalizante: aplicación de protocolos de atención', 11, 1, 2), ('Biomecánica general', 11, 1, 2),
('Patologías podológicas', 11, 2, 1), ('Oncología terapéutica dermatológica', 11, 2, 1), ('Dermatología aplicada a la podología', 11, 2, 1), ('Practica profesionalizante: semiología del miembro inferior', 11, 2, 1), ('Biomecánica del miembro inferior', 11, 2, 1), ('Comunicación y relaciones interpersonales', 11, 2, 1),
('Oncología aplicada', 11, 2, 2), ('Terapéutica ungueal', 11, 2, 2), ('Farmacología', 11, 2, 2), ('Practica profesionalizante: tratamientos dermatológicos y ungueales', 11, 2, 2), ('Ortopodología', 11, 2, 2), ('Traumatología y Ortopedia I', 11, 2, 2),
('Psicología general', 11, 3, 1), ('Patologías', 11, 3, 1), ('Podológicas del adulto mayor', 11, 3, 1), ('Interpretación Radiológica', 11, 3, 1), ('Práctica Profesionalizante: Aplicación de Protocolos Ortopodológicos', 11, 3, 1), ('Taumatología y Ortopedia II', 11, 3, 1),
('Interpretación Radiológica Aplicada a la Podología', 11, 3, 2), ('Podología Física Aplicada al Deporte', 11, 3, 2), ('Pie Diabético', 11, 3, 2), ('Ética y Deontología Profesional', 11, 3, 2), ('Práctica Profesionalizante: Patología Diabética', 11, 3, 2);
