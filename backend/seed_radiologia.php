<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();
$career_id = 15;

$subjects = [
    // 1er Año
    ['name' => 'Comunicación en Salud', 'academic_year' => 1],
    ['name' => 'Salud Pública I', 'academic_year' => 1],
    ['name' => 'Fundamentos de Biología y Anatomía', 'academic_year' => 1],
    ['name' => 'Fundamentos de Ciencias Exactas', 'academic_year' => 1],
    ['name' => 'Radiofísica I', 'academic_year' => 1],
    ['name' => 'Práctica Profesionalizante I', 'academic_year' => 1],

    // 2do Año
    ['name' => 'Trabajo, Tecnología y Sociedad', 'academic_year' => 2],
    ['name' => 'Metodología de la Investigación', 'academic_year' => 2],
    ['name' => 'Salud Pública II', 'academic_year' => 2],
    ['name' => 'Salud y Seguridad de los Trabajadores', 'academic_year' => 2],
    ['name' => 'Radiofísica II', 'academic_year' => 2],
    ['name' => 'Tomografía Computada', 'academic_year' => 2],
    ['name' => 'Fisiopatología', 'academic_year' => 2],
    ['name' => 'Tecnologías Radiológicas en Radiodiagnóstico', 'academic_year' => 2],
    ['name' => 'Practica Profesionalizante II', 'academic_year' => 2],

    // 3er Año
    ['name' => 'Bioética', 'academic_year' => 3],
    ['name' => 'Informática en Salud', 'academic_year' => 3],
    ['name' => 'Investigación en Servicios de Salud', 'academic_year' => 3],
    ['name' => 'Resonancia Magnética', 'academic_year' => 3],
    ['name' => 'Tecnologías Radiológicas Especiales', 'academic_year' => 3],
    ['name' => 'Radioterapia', 'academic_year' => 3],
    ['name' => 'Práctica Profesionalizante III', 'academic_year' => 3],
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
