-- Migrar depósitos/recibos anulados para mantener el historial completo
INSERT INTO madredeus_final.payments (
    student_id, career_id, amount, type, due_date, payment_method, concept, status, notes, created_at, paid_amount
)
SELECT 
    sd.StudentId,
    sci.career_id,
    ABS(CAST(sd.Amount AS DECIMAL(10,2))),
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
    'Anulado',
    CONCAT('Recibo anulado Nro: ', sd.PrePrintedReceiptId),
    sd.Date,
    0.00 -- En el sistema nuevo un pago anulado no debería sumar al monto pagado real
FROM madredeus_legacy.Student_Deposit sd
JOIN madredeus_final.students s ON sd.StudentId = s.id
LEFT JOIN madredeus_final.student_career_inscriptions sci ON sd.StudentId = sci.student_id
WHERE sd.IsCancelled = 1;
