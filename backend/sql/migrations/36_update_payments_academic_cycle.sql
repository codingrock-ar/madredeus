-- Migración para añadir academic_cycle a los pagos existentes
-- Se infiere el ciclo académico a partir de due_date, payment_date o created_at

UPDATE payments 
SET details = JSON_SET(
    IF(details IS NULL OR details = '' OR JSON_TYPE(details) != 'OBJECT', '{}', details), 
    '$.academic_cycle', 
    YEAR(COALESCE(due_date, payment_date, created_at))
)
WHERE details IS NULL 
   OR details = '' 
   OR JSON_EXTRACT(details, '$.academic_cycle') IS NULL
   OR JSON_TYPE(JSON_EXTRACT(details, '$.academic_cycle')) = 'NULL';
