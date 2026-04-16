<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();

echo "Iniciando población de períodos de prueba...\n";

// Obtener todas las carreras y sus duraciones
$stmt = $db->query("SELECT id, duration FROM careers");
$careers = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $careers[$row['id']] = $row['duration'];
}

// Obtener todos los estudiantes con sus carreras
$stmt = $db->query("SELECT id, career FROM students WHERE career IS NOT NULL AND career != ''");
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mapeo de títulos a IDs para obtener duraciones
$stmt = $db->query("SELECT id, title, duration FROM careers");
$careerMeta = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $careerMeta[$row['title']] = [
        'id' => $row['id'],
        'duration' => $row['duration']
    ];
}

echo "Procesando " . count($students) . " estudiantes...\n";

$updatedCount = 0;
foreach ($students as $student) {
    $title = $student['career'];
    $duration = 3;
    $careerId = null;
    
    if (isset($careerMeta[$title])) {
        $duration = $careerMeta[$title]['duration'];
        $careerId = $careerMeta[$title]['id'];
    }
    
    $maxPeriods = $duration * 2;
    // Si la carrera tiene duración 1, max es 2. Si es 3, max es 6.
    $period = rand(1, $maxPeriods);
    
    // Actualizar tabla students
    $db->prepare("UPDATE students SET academic_cycle = ? WHERE id = ?")
       ->execute([$period, $student['id']]);
       
    // Actualizar inscripciones si existen
    if ($careerId) {
        $db->prepare("UPDATE student_career_inscriptions SET academic_cycle = ? WHERE student_id = ? AND career_id = ?")
           ->execute([$period, $student['id'], $careerId]);
    }
    
    $updatedCount++;
    if ($updatedCount % 50 === 0) echo "Actualizados $updatedCount...\n";
}

echo "\n¡Éxito! Se han actualizado $updatedCount estudiantes con sus respectivos períodos (cuatrimestres).\n";
