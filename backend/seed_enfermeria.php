<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();
$career_id = 13;

$subjects = [
    // 1er Año
    ['name' => 'Psicología', 'academic_year' => 1],
    ['name' => 'Teorías socioculturales de la salud', 'academic_year' => 1],
    ['name' => 'Condiciones y medio ambiente del trabajo', 'academic_year' => 1],
    ['name' => 'Salud pública I', 'academic_year' => 1],
    ['name' => 'Biología Humana', 'academic_year' => 1],
    ['name' => 'Fundamentos del cuidado', 'academic_year' => 1],
    ['name' => 'Cuidados de la salud centrados en la comunidad y la familia', 'academic_year' => 1],
    ['name' => 'Práctica profesionalizante I', 'academic_year' => 1],

    // 2do Año
    ['name' => 'Comunicación en ciencias de la salud', 'academic_year' => 2],
    ['name' => 'Inglés', 'academic_year' => 2],
    ['name' => 'Introducción a la metodología de la salud', 'academic_year' => 2],
    ['name' => 'Nutrición y dietoterapia', 'academic_year' => 2],
    ['name' => 'Salud pública II', 'academic_year' => 2],
    ['name' => 'Farmacología en enfermería', 'academic_year' => 2],
    ['name' => 'Enfermería del adulto y del adulto mayor I', 'academic_year' => 2],
    ['name' => 'Práctica profesionalizante II', 'academic_year' => 2],

    // 3er Año
    ['name' => 'Organización y gestión de servicios de enfermería', 'academic_year' => 3],
    ['name' => 'Aspectos bioéticos y legales de la profesión', 'academic_year' => 3],
    ['name' => 'Enfermería en salud mental', 'academic_year' => 3],
    ['name' => 'Enfermería del adulto y del adulto mayor II', 'academic_year' => 3],
    ['name' => 'Enfermería comunitaria y práctica educativa en salud', 'academic_year' => 3],
    ['name' => 'Enfermería en emergencias y catástrofes', 'academic_year' => 3],
    ['name' => 'Práctica profesionalizante III', 'academic_year' => 3],
];

try {
    $db->beginTransaction();
    
    // Check if we need to manually delete grades
    $stmt = $db->prepare("SELECT id FROM subjects WHERE career_id = ?");
    $stmt->execute([$career_id]);
    $oldIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($oldIds) > 0) {
        $in  = str_repeat('?,', count($oldIds) - 1) . '?';
        $db->prepare("DELETE FROM student_grades WHERE subject_id IN ($in)")->execute($oldIds);
        $db->prepare("DELETE FROM teacher_subjects WHERE subject_id IN ($in)")->execute($oldIds);
    }

    $stmt = $db->prepare("DELETE FROM subjects WHERE career_id = ?");
    $stmt->execute([$career_id]);

    $insert = $db->prepare("INSERT INTO subjects (name, career_id, academic_year, quarter) VALUES (?, ?, ?, 1)");
    
    foreach ($subjects as $s) {
        $insert->execute([$s['name'], $career_id, $s['academic_year']]);
    }

    $db->commit();
    echo "Successfully seeded " . count($subjects) . " subjects for career $career_id.\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
