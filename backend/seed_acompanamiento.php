<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();

// First check if it exists
$stmt = $db->query("SELECT id FROM careers WHERE title LIKE '%LAFERRERE ACOMPAÑAMIENTO%' OR title LIKE '%LAFERRERE ACOMPANAMIENTO%'");
$career = $stmt->fetch();
$career_id = null;

if (!$career) {
    echo "Career not found. Creating it...\n";
    $stmt = $db->prepare("INSERT INTO careers (title, duration, last_modified, degree_title) VALUES (?, 3, CURRENT_TIMESTAMP, ?)");
    $stmt->execute(['LAFERRERE ACOMPAÑAMIENTO TERAPEUTICO', 'ACOMPAÑANTE TERAPEUTICO']);
    $career_id = $db->lastInsertId();
    echo "Created career with ID: $career_id\n";
} else {
    $career_id = $career['id'];
    echo "Career already exists with ID: $career_id\n";
}

$subjects = [
    // 1er Año
    ['name' => 'Salud Pública y Salud Mental', 'academic_year' => 1],
    ['name' => 'Contextualización del Campo Profesional del Acompañamiento Terapéutico', 'academic_year' => 1],
    ['name' => 'Principios Médicos y de Psicofarmacología', 'academic_year' => 1],
    ['name' => 'Fundamentos de Psicología General y de Intervención Sociocomunitaria', 'academic_year' => 1],
    ['name' => 'Psicología de los ciclos vitales', 'academic_year' => 1],
    ['name' => 'Psicopatología', 'academic_year' => 1],
    ['name' => 'Modalidades de Intervención en el Acompañamiento Terapéutico', 'academic_year' => 1],

    // 2do Año
    ['name' => 'Investigación en Salud', 'academic_year' => 2],
    ['name' => 'Modelo de Ocupación Humana', 'academic_year' => 2],
    ['name' => 'Ética', 'academic_year' => 2],
    ['name' => 'Acompañamiento Terapéutico', 'academic_year' => 2],
    ['name' => 'Psicología de Grupos', 'academic_year' => 2],
    ['name' => 'Sistemas Familiares', 'academic_year' => 2],
    ['name' => 'Psicofarmacología', 'academic_year' => 2],

    // 3er Año
    ['name' => 'Inglés', 'academic_year' => 3],
    ['name' => 'Organización y Gestión de los Servicios de Salud Mental', 'academic_year' => 3],
    ['name' => 'Intervención Comunitaria y Recursos Sociales', 'academic_year' => 3],
    ['name' => 'Acompañamiento Terapéutico en la Niñez y Adolescencia', 'academic_year' => 3],
    ['name' => 'Acompañamiento Terapéutico del Adulto y Adulto Mayor', 'academic_year' => 3],
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
