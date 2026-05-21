-- ====================================================================
-- SCRIPT DE LIMPIEZA DE TABLAS HISTÓRICAS/LEGACY
-- BASE DE DATOS: madredeus_final
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Addresses`;
DROP TABLE IF EXISTS `AdvertisingMedia`;
DROP TABLE IF EXISTS `Attendances`;
DROP TABLE IF EXISTS `Bitacoras`;
DROP TABLE IF EXISTS `Classes`;
DROP TABLE IF EXISTS `Commissions`;
DROP TABLE IF EXISTS `Configuration`;
DROP TABLE IF EXISTS `Consulta`;
DROP TABLE IF EXISTS `CorrelativeSubjects`;
DROP TABLE IF EXISTS `CoursePeriod`;
DROP TABLE IF EXISTS `CoursePrices`;
DROP TABLE IF EXISTS `Courses`;
DROP TABLE IF EXISTS `CoursesSubjects`;
DROP TABLE IF EXISTS `DaysAndTimes`;
DROP TABLE IF EXISTS `Educations`;
DROP TABLE IF EXISTS `EstudiantesGraduados`;
DROP TABLE IF EXISTS `EventosBitacora`;
DROP TABLE IF EXISTS `ExamTypes`;
DROP TABLE IF EXISTS `MonthCalendar`;
DROP TABLE IF EXISTS `PaginasExcepecion`;
DROP TABLE IF EXISTS `PaymentType`;
DROP TABLE IF EXISTS `PerfilPermisos`;
DROP TABLE IF EXISTS `Perfiles`;
DROP TABLE IF EXISTS `Periods`;
DROP TABLE IF EXISTS `Permisos`;
DROP TABLE IF EXISTS `PersonasGraduadas`;
DROP TABLE IF EXISTS `Persons`;
DROP TABLE IF EXISTS `PersonsRequirements`;
DROP TABLE IF EXISTS `ProfessionalExperiences`;
DROP TABLE IF EXISTS `PromotionTracker`;
DROP TABLE IF EXISTS `RequirementType`;
DROP TABLE IF EXISTS `Schedules`;
DROP TABLE IF EXISTS `SchedulesStudents`;
DROP TABLE IF EXISTS `ScoreSets`;
DROP TABLE IF EXISTS `Scores`;
DROP TABLE IF EXISTS `SimpleVersionScores`;
DROP TABLE IF EXISTS `States`;
DROP TABLE IF EXISTS `Student_Debt`;
DROP TABLE IF EXISTS `Student_DebtType`;
DROP TABLE IF EXISTS `Student_Deposit`;
DROP TABLE IF EXISTS `Student_Matriculated`;
DROP TABLE IF EXISTS `Student_Status`;
DROP TABLE IF EXISTS `StudentsAdvertisingMedia`;
DROP TABLE IF EXISTS `SubPermiso`;
DROP TABLE IF EXISTS `SubPermisoAcciones`;
DROP TABLE IF EXISTS `SubjectType`;
DROP TABLE IF EXISTS `Subjects`;
DROP TABLE IF EXISTS `SubjectsPendientes`;
DROP TABLE IF EXISTS `Supplier`;
DROP TABLE IF EXISTS `SupplierPayment`;
DROP TABLE IF EXISTS `SupplierType`;
DROP TABLE IF EXISTS `TipoBeca`;
DROP TABLE IF EXISTS `Towns`;
DROP TABLE IF EXISTS `Turn`;
DROP TABLE IF EXISTS `Usuario`;
DROP TABLE IF EXISTS `Years`;
DROP TABLE IF EXISTS `__MigrationHistory`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'LIMPIEZA DE TABLAS LEGACY COMPLETADA' AS Resultado;
