UPDATE madredeus_final.payments p
JOIN (
    SELECT StudentId, MAX(Date) as LastDebtDate 
    FROM madredeus_legacy.Student_Debt 
    GROUP BY StudentId
) legacy ON p.student_id = legacy.StudentId
SET p.due_date = legacy.LastDebtDate
WHERE p.notes = 'Saldo deudor migrado del sistema anterior';
