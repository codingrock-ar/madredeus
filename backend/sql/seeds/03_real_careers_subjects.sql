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
(1, 'Enfermería Profesional', 3),
(2, 'Técnico en Laboratorio', 3),
(3, 'Instrumentación Quirúrgica', 3),
(4, 'Técnico en Radiología', 3),
(5, 'Tecnicatura Superior en Podología', 3),
(6, 'Tecnicatura Superior en Química y Biotecnología', 3);

-- Insert Subjects for Enfermería Profesional (ID 1)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Comunicación y Relaciones Interpersonales', 1, 1, 1),
('Antropología y Fundamentos Socioculturales de Enfermería', 1, 1, 1),
('Espacio Definición Institucional (Formación General)', 1, 1, 1),
('Salud Pública', 1, 1, 1),
('Ciencias Biológicas', 1, 1, 1),
('Fundamentos de Enfermería', 1, 1, 1),
('Cuidados y Modelos de Atención', 1, 1, 2),
('Práctica Profesionalizante Inicial', 1, 1, 2),
('Enfermería Comunitaria', 1, 1, 2),
('Epidemiología', 1, 1, 2),
('Anatomía y Fisiología', 1, 1, 2),
('Nutrición y dietoterapia', 1, 1, 2),
('Farmacología', 1, 2, 1),
('Práctica Profesionalizante II', 1, 2, 1),
('Condiciones y medio ambiente del trabajo', 1, 2, 1),
('Informática en Salud', 1, 2, 1),
('Enfermería del adulto y del anciano', 1, 2, 1),
('Fundamentos socioculturales de la enfermería', 1, 2, 1),
('Primeros Auxilios II', 1, 2, 2),
('Práctica Profesionalizante III', 1, 2, 2),
('Gestión de servicios de Enfermería', 1, 2, 2),
('Procesos de atención en adultos y ancianos', 1, 2, 2),
('Inglés', 1, 2, 2),
('Aspectos psicosociales del cuidado', 1, 2, 2),
('Principios de bioética', 1, 3, 1),
('Emergentología I', 1, 3, 1),
('Práctica Profesionalizante IV', 1, 3, 1),
('Enfermería Materno Infantil y del adolescente', 1, 3, 1),
('Desarrollo profesional de Enfermería', 1, 3, 1),
('Bioética aplicada', 1, 3, 1),
('Primeros auxilios III', 1, 3, 2),
('Práctica profesionalizante V', 1, 3, 2),
('Emergentología II', 1, 3, 2),
('Deontología y Legislación', 1, 3, 2),
('Práctica Profesionalizante en comunidad VI', 1, 3, 2);

-- Insert Subjects for Técnico en Laboratorio (ID 2)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Bioética', 2, 1, 1), ('Biología', 2, 1, 1), ('Comunicación', 2, 1, 1), ('Informática Aplicada', 2, 1, 1), ('Matemática y Estadística', 2, 1, 1), ('Química General', 2, 1, 1),
('Práctica Profesionalizante en Bioseguridad y técnicas básicas de obtención de muestras', 2, 1, 2), ('Matemática y Física', 2, 1, 2), ('Inmunología y Bioseguridad', 2, 1, 2), ('Química Biológica', 2, 1, 2), ('Ética Profesional', 2, 1, 2), ('Práctica Pre analítica', 2, 1, 2),
('Taller de Estadística', 2, 2, 1), ('Bacteriología', 2, 2, 1), ('Química Instrumental', 2, 2, 1), ('Fisiopatología I', 2, 2, 1), ('Informática', 2, 2, 1), ('Práctica analítica', 2, 2, 1),
('Taller de Especialidad Clínica', 2, 2, 2), ('Genética', 2, 2, 2), ('Microbiología clínica', 2, 2, 2), ('Validación clínica', 2, 2, 2), ('Técnicas de Laboratorio', 2, 2, 2), ('Salud Pública', 2, 2, 2),
('Práctica Post analítica', 2, 3, 1), ('Serología y Virología', 2, 3, 1), ('Tecnología Clínica', 2, 3, 1), ('Ejercicio profesional y CYMAT', 2, 3, 1), ('Biotecnología', 2, 3, 1), ('Hematología', 2, 3, 1),
('Práctica Profesionalizante Externa', 2, 3, 2), ('Práctica Profesionalizante Externa II', 2, 3, 2), ('Psicología Institucional', 2, 3, 2), ('Organización y Gestión de Laboratorio', 2, 3, 2), ('Tecnológicas', 2, 3, 2);

-- Insert Subjects for Instrumentación Quirúrgica (ID 3)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Primeros auxilios', 3, 1, 1), ('Introducción a la anatomía y fisiología', 3, 1, 1), ('Introducción a los fundamentos de la instrumentación quirúrgica', 3, 1, 1), ('Introducción a la atención del paciente quirúrgico', 3, 1, 1), ('Espacio de definición institucional', 3, 1, 1), ('Informática', 3, 1, 1),
('Química biológica', 3, 1, 2), ('Inglés técnico', 3, 1, 2), ('Práctica profesionalizante en fundamentos quirúrgicos', 3, 1, 2), ('Microbiología y Parasitología', 3, 1, 2), ('Farmacología y Toxicología', 3, 1, 2), ('Anatomía y Fisiología II', 3, 1, 2),
('Física Biológica', 3, 2, 1), ('Fundamentos de Instr. Quirúrgica II', 3, 2, 1), ('Atención al paciente Quirúrgica II', 3, 2, 1), ('Inglés Técnico', 3, 2, 1), ('Práctica II', 3, 2, 1), ('Salud Pública', 3, 2, 1),
('Procedimientos Quirúrgicos Menores', 3, 2, 2), ('Psicología', 3, 2, 2), ('Metodología y Comunicación de la Investigación', 3, 2, 2), ('Anatomía Quirúrgica I', 3, 2, 2), ('Bioseguridad', 3, 2, 2), ('Ética y Ejercicio Profesional', 3, 2, 2),
('Prácticas Quirúrgicas Menores', 3, 3, 1), ('Procedimientos Quirúrgicos Medianos', 3, 3, 1), ('Anatomía Quirúrgica II', 3, 3, 1), ('Practicas Quirúrgicas Medianas', 3, 3, 1), ('Procedimientos Quirúrgicos Medianos II', 3, 3, 1), ('Organización y gestión de I. de Salud', 3, 3, 1),
('Prácticas Quirúrgicas Medianas II', 3, 3, 2), ('Procedimientos Quirúrgicos Mayores', 3, 3, 2), ('Cirugía Infantil', 3, 3, 2), ('Practicas Quirúrgicas Mayores', 3, 3, 2), ('Practicas Quirúrgicas Pediátricas', 3, 3, 2);

-- Insert Subjects for Técnico en Radiología (ID 4)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Ciencias biológicas', 4, 1, 1), ('Condiciones y Medio Ambiente de Trabajo', 4, 1, 1), ('Primeros auxilios', 4, 1, 1), ('Fundamentos del Diagnóstico por Imágenes', 4, 1, 1), ('Matemática', 4, 1, 2), ('Comunicación y Relaciones Interpersonales', 4, 1, 2),
('Anatomía y fisiología humana I', 4, 1, 2), ('Técnicas en imágenes I', 4, 1, 2), ('Física I', 4, 2, 1), ('Inglés técnico II', 4, 2, 1), ('Informática aplicada', 4, 2, 1), ('Anatomía y fisiología humana II', 4, 2, 1),
('Técnicas en imágenes II', 4, 2, 2), ('Física II.', 4, 2, 2), ('Química Biológica.', 4, 2, 2), ('Psicología general e institucional', 4, 2, 2), ('Prácticas hospitalarias I', 4, 3, 1), ('Anatomía y fisiología humana IIl', 4, 3, 1),
('Técnicas en imágenes III', 4, 3, 1), ('Bioseguridad. Condiciones y medio ambiente de trabajo.', 4, 3, 1), ('Ética y deontología del ejercicio profesional', 4, 3, 2), ('Radiologia pediátrica', 4, 3, 2), ('Prácticas hospitalarias II', 4, 3, 2), ('Fisiopatología', 4, 3, 2),
('Tomografía computada', 4, 3, 2), ('Introducción a la metodología de la investigación y bioestadística', 4, 3, 2), ('Administración y gestión en servicios de salud', 4, 3, 2), ('Prácticas hospitalarias III', 4, 3, 2), ('Resonancia magnética', 4, 3, 2), ('Salud pública y epidemiología', 4, 3, 2),
('Radioterapia', 4, 3, 2), ('Práctica hospitalaria IV', 4, 3, 2);

-- Insert Subjects for Tecnicatura Superior en Podología (ID 5)
INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES 
('Anatomía y fisiología general', 5, 1, 1), ('Microbiología y parasitología', 5, 1, 1), ('Introducción a la podología', 5, 1, 1), ('Practica profesionalizante: introducción a la atención podológica', 5, 1, 1), ('Bioseguridad', 5, 1, 1), ('Anatomía del miembro inferior', 5, 1, 1),
('Semiología podológica', 5, 1, 2), ('Patología medica', 5, 1, 2), ('Primeros auxilios', 5, 1, 2), ('Dermatología', 5, 1, 2), ('Practica profesionalizante: aplicación de protocolos de atención', 5, 1, 2), ('Biomecánica general', 5, 1, 2),
('Patologías podológicas', 5, 2, 1), ('Oncología terapéutica dermatológica', 5, 2, 1), ('Dermatología aplicada a la podología', 5, 2, 1), ('Practica profesionalizante: semiología del miembro inferior', 5, 2, 1), ('Biomecánica del miembro inferior', 5, 2, 1), ('Comunicación y relaciones interpersonales', 5, 2, 1),
('Oncología aplicada', 5, 2, 2), ('Terapéutica ungueal', 5, 2, 2), ('Farmacología', 5, 2, 2), ('Practica profesionalizante: tratamientos dermatológicos y ungueales', 5, 2, 2), ('Ortopodología', 5, 2, 2), ('Traumatología y Ortopedia I', 5, 2, 2),
('Psicología general', 5, 3, 1), ('Patologías', 5, 3, 1), ('Podológicas del adulto mayor', 5, 3, 1), ('Interpretación Radiológica', 5, 3, 1), ('Práctica Profesionalizante: Aplicación de Protocolos Ortopodológicos', 5, 3, 1), ('Taumatología y Ortopedia II', 5, 3, 1),
('Interpretación Radiológica Aplicada a la Podología', 5, 3, 2), ('Podología Física Aplicada al Deporte', 5, 3, 2), ('Pie Diabético', 5, 3, 2), ('Ética y Deontología Profesional', 5, 3, 2), ('Práctica Profesionalizante: Patología Diabética', 5, 3, 2);
