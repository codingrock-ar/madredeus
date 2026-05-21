-- ====================================================================
-- SCRIPT DE TRANSFORMACIÓN Y REFRACTORIZACIÓN DE BASE DE DADOS
-- DE: madredeus_legacy (Tablas en Mayúsculas/Legacy)
-- A: madredeus_final (Tablas en Minúsculas/Normalizadas)
-- ====================================================================

-- 1. Configuración de Sesión y Deshabilitación de Llaves Foráneas
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- 2. Limpieza de Tablas Nuevas para Asegurar una Carga Limpia
TRUNCATE TABLE users;
TRUNCATE TABLE shifts;
TRUNCATE TABLE commissions;
TRUNCATE TABLE notification_templates;
TRUNCATE TABLE payment_configs;
TRUNCATE TABLE scholarship_types;
TRUNCATE TABLE shift_commissions;
TRUNCATE TABLE academic_cycles;
TRUNCATE TABLE careers;
TRUNCATE TABLE subjects;
TRUNCATE TABLE students;
TRUNCATE TABLE student_career_inscriptions;
TRUNCATE TABLE student_grades;
TRUNCATE TABLE payments;
TRUNCATE TABLE teachers;
TRUNCATE TABLE teacher_subjects;

-- ====================================================================
-- FASE 1: IMPORTACIÓN DE TABLAS DE REFERENCIA Y CONFIGURACIÓN
-- ====================================================================

-- Importación de Usuarios Administradores desde la plantilla db
INSERT INTO users (id, name, email, password_hash, reset_token, reset_expires, created_at)
SELECT id, name, email, password_hash, reset_token, reset_expires, created_at 
FROM madredeus_db.users;

-- Importación de Turnos (Shifts) desde la plantilla db
INSERT INTO shifts (id, name)
SELECT id, name 
FROM madredeus_db.shifts;

-- Importación de Comisiones de Referencia desde la plantilla db
INSERT INTO commissions (id, name)
SELECT id, name 
FROM madredeus_db.commissions;

-- Importación de Plantillas de Notificaciones
INSERT INTO notification_templates (id, template_key, subject, body, description, updated_at)
SELECT id, template_key, subject, body, description, updated_at
FROM madredeus_db.notification_templates;

-- Importación de Configuración de Pagos
INSERT INTO payment_configs (id, config_key, config_value, description, updated_at)
SELECT id, config_key, config_value, description, updated_at
FROM madredeus_db.payment_configs;

-- Relación Shift-Commissions
INSERT INTO shift_commissions (shift_id, commission_id)
SELECT shift_id, commission_id 
FROM madredeus_db.shift_commissions;

-- Importación de Becas Históricas desde TipoBeca (Legacy)
INSERT INTO scholarship_types (id, name, description, last_modified, status)
SELECT 
    IdTipoBeca, 
    COALESCE(NULLIF(TRIM(Descripcion), ''), CONCAT('Beca ', IdTipoBeca)), 
    NULL, 
    CURRENT_TIMESTAMP, 
    CASE Activo WHEN 1 THEN 'active' ELSE 'inactive' END
FROM TipoBeca;

-- ====================================================================
-- FASE 2: MIGRACIÓN DE ENTIDADES ACADÉMICAS
-- ====================================================================

-- 2.1 Ciclos Académicos (Periods -> academic_cycles)
INSERT INTO academic_cycles (id, name, start_date, end_date, status, last_modified)
SELECT 
    IdPeriod, 
    COALESCE(NULLIF(TRIM(Descripcion), ''), CONCAT('Ciclo ', IdPeriod)), 
    DATE(FechaDesde), 
    DATE(FechaHasta), 
    'active', 
    CURRENT_TIMESTAMP
FROM Periods;

-- 2.2 Carreras (Courses -> careers)
INSERT INTO careers (id, title, duration, last_modified, resolution, degree_title, study_plan)
SELECT 
    ID, 
    TRIM(Degree), 
    CAST(Duration AS UNSIGNED), 
    COALESCE(LastModificationDate, CURRENT_TIMESTAMP),
    NULL,
    TRIM(Degree),
    NULL
FROM Courses;

-- 2.3 Materias (Subjects + CoursesSubjects -> subjects)
-- Usamos una tabla de mapeo para resolver duplicados de materias compartidas entre carreras
DROP TABLE IF EXISTS temp_subject_mapping;
CREATE TABLE temp_subject_mapping (
    legacy_subject_id INT,
    course_id INT,
    new_subject_id INT,
    PRIMARY KEY (legacy_subject_id, course_id)
);

-- Primero, insertamos la primera relación de cada materia para mantener el ID original en la medida de lo posible
INSERT INTO subjects (id, name, program, last_modified, career_id, academic_year, quarter)
SELECT 
    s.ID, 
    TRIM(s.Name), 
    NULLIF(TRIM(s.ProgramFileName), ''), 
    COALESCE(s.LastModificationDate, CURRENT_TIMESTAMP), 
    cs.CourseId, 
    1, -- Año por defecto
    1  -- Cuatrimestre por defecto
FROM Subjects s
JOIN (
    SELECT SubjectId, MIN(CourseId) as CourseId
    FROM CoursesSubjects
    GROUP BY SubjectId
) cs ON s.ID = cs.SubjectId
WHERE s.IsDeleted = 0;

-- Registramos estas inserciones en nuestro mapa
INSERT INTO temp_subject_mapping (legacy_subject_id, course_id, new_subject_id)
SELECT id, career_id, id FROM subjects;

-- Segundo, insertamos las relaciones de materias compartidas (secundarias) permitiendo auto-incremento
INSERT INTO subjects (name, program, last_modified, career_id, academic_year, quarter)
SELECT 
    TRIM(s.Name), 
    NULLIF(TRIM(s.ProgramFileName), ''), 
    COALESCE(s.LastModificationDate, CURRENT_TIMESTAMP), 
    cs.CourseId, 
    1, 
    1
FROM Subjects s
JOIN (
    SELECT SubjectId, CourseId
    FROM CoursesSubjects
    GROUP BY SubjectId, CourseId
) cs ON s.ID = cs.SubjectId
LEFT JOIN temp_subject_mapping tsm ON cs.SubjectId = tsm.legacy_subject_id AND cs.CourseId = tsm.course_id
WHERE s.IsDeleted = 0 AND tsm.new_subject_id IS NULL;

-- Completamos la tabla de mapeo con los nuevos IDs asignados para materias secundarias
INSERT INTO temp_subject_mapping (legacy_subject_id, course_id, new_subject_id)
SELECT cs.SubjectId, cs.CourseId, MIN(sub.id)
FROM (
    SELECT SubjectId, CourseId FROM CoursesSubjects GROUP BY SubjectId, CourseId
) cs
JOIN Subjects s ON cs.SubjectId = s.ID
JOIN subjects sub ON TRIM(s.Name) = TRIM(sub.name) COLLATE utf8mb4_unicode_ci AND cs.CourseId = sub.career_id
LEFT JOIN temp_subject_mapping tsm ON cs.SubjectId = tsm.legacy_subject_id AND cs.CourseId = tsm.course_id
WHERE tsm.new_subject_id IS NULL
GROUP BY cs.SubjectId, cs.CourseId;

-- ====================================================================
-- FASE 3: MIGRACIÓN DE ALUMNOS Y DOCENTES
-- ====================================================================

-- 3.1 Alumnos (Persons + Addresses + Educations + Requirements -> students)
-- Pivotamos los requisitos de documentación y limpiamos DNI duplicados o nulos
INSERT INTO students (
    id, dni, name, lastname, email, birthdate, gender, nationality, phone,
    address_street, address_number, address_type, address_province, address_locality, address_zip_code,
    phone_landline, phone_mobile, civil_status, max_education_level, education_finished, degree_obtained, institution,
    req_dni_photocopy, req_degree_photocopy, req_degree_photocopy_obs, req_two_photos, 
    req_psychophysical, req_psychophysical_obs, req_vaccines, req_vaccines_obs, 
    req_student_book, req_final_degree, req_final_degree_obs, notes, scholarship_id, status, created_at
)
SELECT 
    p.ID,
    -- Generamos un DNI único usando ROW_NUMBER() en caso de duplicados, y TEMP-ID en caso de nulos/vacíos
    CASE 
        WHEN p.DocumentNumber IS NULL OR TRIM(p.DocumentNumber) = '' THEN CONCAT('TEMP-', p.ID)
        WHEN ROW_NUMBER() OVER(PARTITION BY NULLIF(TRIM(p.DocumentNumber), '') ORDER BY p.ID) = 1 THEN TRIM(p.DocumentNumber)
        ELSE CONCAT(TRIM(p.DocumentNumber), '-DUP', ROW_NUMBER() OVER(PARTITION BY NULLIF(TRIM(p.DocumentNumber), '') ORDER BY p.ID) - 1)
    END as unique_dni,
    TRIM(p.Name),
    TRIM(p.Lastname),
    NULLIF(TRIM(p.Email), ''),
    -- Filtramos fechas de cumpleaños inválidas (ej. año 3666 o nulos)
    CASE WHEN p.BirthDate IS NOT NULL AND YEAR(p.BirthDate) >= 1900 AND YEAR(p.BirthDate) <= 2030 THEN DATE(p.BirthDate) ELSE NULL END,
    'No especifica',
    CASE WHEN TRIM(p.BirthPlace) = '' THEN NULL ELSE TRIM(p.BirthPlace) END,
    NULLIF(TRIM(p.CellPhoneNumber), ''),
    -- Dirección (Addresses)
    TRIM(addr.Street),
    CAST(addr.Number AS CHAR),
    CASE addr.HouseholdType WHEN 1 THEN 'Departamento' ELSE 'Casa' END,
    TRIM(addr.State),
    TRIM(addr.Town),
    TRIM(addr.ZipCode),
    NULLIF(TRIM(p.PhoneNumber), ''),
    NULLIF(TRIM(p.CellPhoneNumber), ''),
    CASE p.MaritalStatus WHEN 1 THEN 'Casado/a' WHEN 2 THEN 'Divorciado/a' ELSE 'Soltero/a' END,
    -- Nivel Educativo (Educations)
    CASE edu.EducationalLevel
        WHEN 0 THEN 'Primario'
        WHEN 2 THEN 'Terciario'
        WHEN 3 THEN 'Universitario'
        ELSE 'Secundario'
    END,
    CASE edu.Finished WHEN 1 THEN 'Si' ELSE 'No' END,
    TRIM(edu.DegreeObtained),
    TRIM(edu.Institution),
    -- Requisitos Pivotados (PersonsRequirements)
    COALESCE(req.req_dni, 0),
    COALESCE(req.req_degree, 0),
    req.req_degree_obs,
    COALESCE(req.req_photos, 0),
    COALESCE(req.req_psycho, 0),
    req.req_psycho_obs,
    COALESCE(req.req_vaccines, 0),
    req.req_vaccines_obs,
    COALESCE(req.req_book, 0),
    COALESCE(req.req_final, 0),
    req.req_final_obs,
    NULLIF(TRIM(p.Comments), ''),
    -- Beca de la matrícula (del historial de matrículas)
    m.ScholarshipType,
    -- Estado Académico Actual
    CASE m.StatusId
        WHEN 2 THEN 'En Curso'
        WHEN 3 THEN 'Egresado'
        WHEN 6 THEN 'Egresado'
        WHEN 7 THEN 'Finalizó Cursada'
        ELSE 'Abandono'
    END,
    COALESCE(p.LastModificationDate, CURRENT_TIMESTAMP)
FROM Persons p
LEFT JOIN Addresses addr ON p.ID = addr.PersonID
LEFT JOIN Educations edu ON p.ID = edu.PersonID
-- Agregamos la última inscripción académica
LEFT JOIN (
    SELECT StudentId, StatusId, ScholarshipType,
           ROW_NUMBER() OVER(PARTITION BY StudentId ORDER BY LastModificationDate DESC) as rn
    FROM Student_Matriculated
) m ON p.ID = m.StudentId AND m.rn = 1
-- Pivote en subquery para velocidad y limpieza de requerimientos por persona
LEFT JOIN (
    SELECT 
        PersonID,
        MAX(CASE WHEN RequirementType = 0 THEN Completed ELSE 0 END) as req_dni,
        MAX(CASE WHEN RequirementType = 1 THEN Completed ELSE 0 END) as req_degree,
        MAX(CASE WHEN RequirementType = 1 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_degree_obs,
        MAX(CASE WHEN RequirementType = 3 THEN Completed ELSE 0 END) as req_photos,
        MAX(CASE WHEN RequirementType = 4 THEN Completed ELSE 0 END) as req_psycho,
        MAX(CASE WHEN RequirementType = 4 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_psycho_obs,
        MAX(CASE WHEN RequirementType = 5 THEN Completed ELSE 0 END) as req_vaccines,
        MAX(CASE WHEN RequirementType = 5 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_vaccines_obs,
        MAX(CASE WHEN RequirementType = 6 THEN Completed ELSE 0 END) as req_book,
        MAX(CASE WHEN RequirementType = 7 THEN Completed ELSE 0 END) as req_final,
        MAX(CASE WHEN RequirementType = 7 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_final_obs
    FROM PersonsRequirements
    GROUP BY PersonID
) req ON p.ID = req.PersonID
WHERE p.PersonType = 0;

-- 3.2 Docentes (Persons -> teachers)
INSERT INTO teachers (
    id, name, lastname, birthdate, document_type, dni, email, phone_mobile, 
    address_street, address_number, address_type, address_province, address_locality, address_zip_code,
    exp_asistencial, exp_academica, civil_status, max_education_level, education_finished, degree_obtained, institution,
    cost_amount, cost_unit, last_modified
)
SELECT 
    p.ID,
    TRIM(p.Name),
    TRIM(p.Lastname),
    CASE WHEN p.BirthDate IS NOT NULL AND YEAR(p.BirthDate) >= 1900 AND YEAR(p.BirthDate) <= 2030 THEN DATE(p.BirthDate) ELSE NULL END,
    'DNI',
    CASE 
        WHEN p.DocumentNumber IS NULL OR TRIM(p.DocumentNumber) = '' THEN CONCAT('TEMP-T-', p.ID)
        ELSE TRIM(p.DocumentNumber)
    END,
    NULLIF(TRIM(p.Email), ''),
    NULLIF(TRIM(p.CellPhoneNumber), ''),
    TRIM(addr.Street),
    CAST(addr.Number AS CHAR),
    CASE addr.HouseholdType WHEN 1 THEN 'Departamento' ELSE 'Casa' END,
    TRIM(addr.State),
    TRIM(addr.Town),
    TRIM(addr.ZipCode),
    NULLIF(TRIM(p.CareExperience), ''),
    NULLIF(TRIM(p.TeachingExperience), ''),
    CASE p.MaritalStatus WHEN 1 THEN 'Casado/a' WHEN 2 THEN 'Divorciado/a' ELSE 'Soltero/a' END,
    CASE edu.EducationalLevel
        WHEN 0 THEN 'Primario'
        WHEN 2 THEN 'Terciario'
        WHEN 3 THEN 'Universitario'
        ELSE 'Secundario'
    END,
    CASE edu.Finished WHEN 1 THEN 'Si' ELSE 'No' END,
    TRIM(edu.DegreeObtained),
    TRIM(edu.Institution),
    p.Cost,
    CASE p.UnitOfTime WHEN 1 THEN 'Mes' ELSE 'Hora' END,
    COALESCE(p.LastModificationDate, CURRENT_TIMESTAMP)
FROM Persons p
LEFT JOIN Addresses addr ON p.ID = addr.PersonID
LEFT JOIN Educations edu ON p.ID = edu.PersonID
WHERE p.PersonType = 1;

-- ====================================================================
-- FASE 4: MIGRACIÓN DE INSCRIPCIONES Y NOTAS ACADÉMICAS
-- ====================================================================

-- 4.1 Inscripciones a Carreras (Student_Matriculated -> student_career_inscriptions)
INSERT INTO student_career_inscriptions (
    student_id, career_id, commission, shift, academic_cycle, status, inscription_date, book, folio
)
SELECT 
    sm.StudentId,
    c.CourseId,
    c.Commission,
    t.Description,
    p.Descripcion,
    CASE sm.StatusId
        WHEN 2 THEN 'En Curso'
        WHEN 3 THEN 'Egresado'
        WHEN 6 THEN 'Egresado'
        WHEN 7 THEN 'Finalizó Cursada'
        ELSE 'Abandono'
    END,
    COALESCE(sm.EnrollmentDate, CURRENT_TIMESTAMP),
    NULLIF(TRIM(pers.Libro), ''),
    NULLIF(TRIM(pers.Folio), '')
FROM Student_Matriculated sm
JOIN students s ON sm.StudentId = s.id
JOIN Commissions c ON sm.CurrentCommissionId = c.Id
LEFT JOIN Turn t ON c.ShiftId = t.Id
LEFT JOIN Periods p ON sm.CoursePeriod = p.IdPeriod
LEFT JOIN Persons pers ON sm.StudentId = pers.ID;

-- 4.2 Calificaciones/Notas (Scores -> student_grades)
INSERT INTO student_grades (
    student_id, inscription_id, subject_id, grade, status, exam_date, book, folio, created_at, updated_at
)
SELECT 
    s.StudentId,
    sci.id,
    tsm.new_subject_id,
    -- Si la nota es > 0, mapeamos el valor numérico, sino representa cursada en curso o regularidad sin examen
    MAX(CASE WHEN s.Score > 0 THEN CAST(s.Score AS CHAR) ELSE NULL END),
    CASE 
        WHEN MAX(s.Score) >= 4 THEN 'Aprobado' 
        WHEN MAX(s.Score) > 0 THEN 'Desaprobado' 
        ELSE 'Regular' 
    END,
    MAX(CASE WHEN s.ExamDate > '1901-01-01' THEN s.ExamDate ELSE NULL END),
    MAX(NULLIF(TRIM(s.Libro), '')),
    MAX(NULLIF(TRIM(s.Folio), '')),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM Scores s
JOIN student_career_inscriptions sci ON s.StudentId = sci.student_id
JOIN temp_subject_mapping tsm ON s.SubjectId = tsm.legacy_subject_id AND sci.career_id = tsm.course_id
GROUP BY s.StudentId, sci.id, tsm.new_subject_id;

-- ====================================================================
-- FASE 5: MIGRACIÓN DE FINANZAS E INTEGRIDAD FINANCIERA (1.5M REGISTROS)
-- ====================================================================

-- 5.1 Pagos Históricos Realizados (Deposits -> payments con status 'Pagado')
-- Mapea todos los recibos y cobros históricos reales de los estudiantes
INSERT INTO payments (
    student_id, career_id, amount, due_date, type, payment_date, payment_method, concept, status, notes, created_at, paid_amount
)
SELECT 
    sd.StudentId,
    sci.career_id,
    ABS(CAST(sd.Amount AS DECIMAL(10,2))),
    DATE(sd.Date),
    CASE sd.DebtType 
        WHEN 1 THEN 'Matrícula' 
        WHEN 3 THEN 'Interés' 
        WHEN 4 THEN 'Interés' 
        ELSE 'Cuota' 
    END,
    sd.Date,
    'Efectivo',
    COALESCE(NULLIF(TRIM(sd.Description), ''), 
             CASE sd.DebtType 
                WHEN 1 THEN 'Matrícula' 
                WHEN 3 THEN 'Interés 1' 
                WHEN 4 THEN 'Interés 2' 
                ELSE 'Cuota Mensual' 
             END),
    'Pagado',
    CONCAT('Recibo Nro: ', sd.PrePrintedReceiptId),
    sd.Date,
    ABS(CAST(sd.Amount AS DECIMAL(10,2)))
FROM Student_Deposit sd
JOIN students s ON sd.StudentId = s.id
LEFT JOIN student_career_inscriptions sci ON sd.StudentId = sci.student_id
WHERE sd.IsCancelled = 0;

-- 5.2 Saldos Deudores Activos (Cálculo del Neto de Deudas y Depósitos de la cuenta corriente)
-- Se migra como un registro pendiente ('Pendiente') solo para alumnos que tengan balance acumulado negativo
INSERT INTO payments (
    student_id, career_id, amount, due_date, type, payment_date, payment_method, concept, status, notes, created_at, paid_amount
)
SELECT 
    net.StudentId,
    sci.career_id,
    ABS(net.NetBalance),
    CURRENT_DATE,
    CASE net.DebtTypeId 
        WHEN 1 THEN 'Matrícula' 
        WHEN 3 THEN 'Interés' 
        WHEN 4 THEN 'Interés' 
        ELSE 'Cuota' 
    END,
    NULL,
    'Efectivo',
    CASE net.DebtTypeId 
        WHEN 1 THEN 'Matrícula Pendiente' 
        WHEN 3 THEN 'Interés 1 Pendiente' 
        WHEN 4 THEN 'Interés 2 Pendiente' 
        ELSE 'Saldo Deudor Cuotas' 
    END,
    'Pendiente',
    'Saldo deudor migrado del sistema anterior',
    CURRENT_TIMESTAMP,
    0.00
FROM (
    SELECT 
        StudentId,
        DebtTypeId,
        SUM(Amount) AS NetBalance
    FROM (
        SELECT StudentId, DebtType AS DebtTypeId, CAST(Amount AS DECIMAL(10,2)) AS Amount FROM Student_Deposit WHERE IsCancelled = 0
        UNION ALL
        SELECT StudentId, DebtTypeId, CAST(Amount AS DECIMAL(10,2)) AS Amount FROM Student_Debt
    ) combined
    GROUP BY StudentId, DebtTypeId
) net
JOIN students s ON net.StudentId = s.id
LEFT JOIN student_career_inscriptions sci ON net.StudentId = sci.student_id
WHERE net.NetBalance < -0.01;

-- ====================================================================
-- FASE 6: RESTAURACIÓN Y FINALIZACIÓN
-- ====================================================================

-- Reactivación de Llaves Foráneas y Modos
DROP TABLE IF EXISTS temp_subject_mapping;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE=@OLD_SQL_MODE;

SELECT 'MIGRACION DE DATOS COMPLETADA CON EXITO' AS Resultado;
