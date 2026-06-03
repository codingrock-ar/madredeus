<?php
$pdoL = new PDO('mysql:host=db;dbname=madredeus_legacy;charset=utf8', 'root', 'secret');

$studentId = 16;

echo "=== Legacy Student 16 Status ===\n";
$stmt = $pdoL->query("SELECT StatusId FROM Student_Matriculated WHERE StudentId = $studentId ORDER BY LastModificationDate DESC LIMIT 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n=== Legacy Student 16 Debts (Student_Debt) ===\n";
$stmt = $pdoL->query("SELECT DebtTypeId, SUM(Amount) as TotalDebt FROM Student_Debt WHERE StudentId = $studentId GROUP BY DebtTypeId");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== Legacy Student 16 Deposits (Student_Deposit) ===\n";
$stmt = $pdoL->query("SELECT DebtType as DebtTypeId, SUM(Amount) as TotalPaid FROM Student_Deposit WHERE StudentId = $studentId AND IsCancelled = 0 GROUP BY DebtType");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== Raw Legacy Debts for Interés (DebtTypeId 3 or 4) ===\n";
$stmt = $pdoL->query("SELECT * FROM Student_Debt WHERE StudentId = $studentId AND DebtTypeId IN (3,4) LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== Raw Legacy Deposits for Interés (DebtType 3 or 4) ===\n";
$stmt = $pdoL->query("SELECT * FROM Student_Deposit WHERE StudentId = $studentId AND DebtType IN (3,4) AND IsCancelled = 0 LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
