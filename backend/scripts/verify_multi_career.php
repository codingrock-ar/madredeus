<?php
require_once __DIR__ . '/../src/Config/Environment.php';
require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Repositories/StudentRepositoryInterface.php';
require_once __DIR__ . '/../src/Repositories/StudentRepositoryMySQL.php';

$repo = new \App\Repositories\StudentRepositoryMySQL();

$studentId = 728607;

// Fetch current state
$student = $repo->getById($studentId);
echo "Initial inscriptions count: " . count($student['inscriptions']) . "\n";

// Simulate update from StudentForm.js
$updateData = $student;
$updateData['inscriptions'][0]['commission'] = 'MODIFIED_D';
$updateData['inscriptions'][1]['commission'] = 'MODIFIED_A';
$updateData['inscriptions'][1]['status'] = 'Egresado';

// Add a NEW inscription
$updateData['inscriptions'][] = [
    'career_title' => 'TECNICATURA SUPERIOR EN RADIOLOGIA',
    'academic_cycle' => '2026',
    'commission' => 'X',
    'shift' => 'TT',
    'status' => 'En Curso'
];

echo "Updating student...\n";
$success = $repo->update($studentId, $updateData);

if ($success) {
    echo "Update successful!\n";
    $updatedStudent = $repo->getById($studentId);
    echo "Final inscriptions count: " . count($updatedStudent['inscriptions']) . "\n";
    foreach ($updatedStudent['inscriptions'] as $ins) {
        echo "- " . $ins['career_title'] . ": " . $ins['commission'] . " (" . $ins['status'] . ")\n";
    }
} else {
    echo "Update failed.\n";
}
