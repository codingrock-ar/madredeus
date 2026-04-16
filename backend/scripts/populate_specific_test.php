<?php
require __DIR__ . '/../vendor/autoload.php';
use App\Config\Database;

$db = (new Database())->getConnection();

// Course details
$careerTitle = 'BIOTECNOLOGIA';
$shift = 'TM';
$commission = 'B';
$period = '1';

// Career ID
$stmt = $db->prepare("SELECT id FROM careers WHERE title = ?");
$stmt->execute([$careerTitle]);
$careerId = $stmt->fetchColumn();

if (!$careerId) {
    die("Error: No se encontró la carrera $careerTitle\n");
}

echo "Generando 10 estudiantes para $careerTitle, $shift, $commission, Período $period...\n";

for ($i = 0; $i < 10; $i++) {
    $dni = (string)rand(60000000, 70000000);
    $name = "Test" . ($i + 1);
    $lastname = "Biotecno";
    $email = "test.biotecno$i@example.com";
    
    // Alumno
    $stmt = $db->prepare("INSERT INTO students (dni, name, lastname, email, career, commission, shift, academic_cycle, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'En Curso')");
    $stmt->execute([$dni, $name, $lastname, $email, $careerTitle, $commission, $shift, $period]);
    $studentId = $db->lastInsertId();
    
    // Inscripción
    $stmt = $db->prepare("INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, inscription_date) VALUES (?, ?, ?, ?, ?, 'En Curso', NOW())");
    $stmt->execute([$studentId, $careerId, $commission, $shift, $period]);
}

echo "¡Listo! 10 estudiantes generados.\n";
