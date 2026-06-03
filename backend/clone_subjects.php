<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();

// ID for ENFERMERIA PROFESIONAL
$sourceCareerId = 2;
// ID for LAFERRERE ENFERMERIA
$targetCareerId = 13;

// Get subjects from source career
$stmt = $db->prepare("SELECT * FROM subjects WHERE career_id = ?");
$stmt->execute([$sourceCareerId]);
$sourceSubjects = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get subjects from target career
$stmt = $db->prepare("SELECT name FROM subjects WHERE career_id = ?");
$stmt->execute([$targetCareerId]);
$targetSubjectsRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
$targetSubjectNames = array_map(function($s) { return trim(strtolower($s['name'])); }, $targetSubjectsRows);

$insertedCount = 0;

$db->beginTransaction();
try {
    $insertStmt = $db->prepare("
        INSERT INTO subjects (name, program, last_modified, career_id, academic_year, quarter) 
        VALUES (:name, :program, CURRENT_TIMESTAMP, :career_id, :academic_year, :quarter)
    ");

    foreach ($sourceSubjects as $subject) {
        $nameLower = trim(strtolower($subject['name']));
        if (!in_array($nameLower, $targetSubjectNames)) {
            $insertStmt->execute([
                ':name' => $subject['name'],
                ':program' => $subject['program'],
                ':career_id' => $targetCareerId,
                ':academic_year' => $subject['academic_year'],
                ':quarter' => $subject['quarter']
            ]);
            $insertedCount++;
        }
    }
    $db->commit();
    echo "Successfully cloned $insertedCount subjects from career $sourceCareerId to $targetCareerId.\n";
} catch (Exception $e) {
    $db->rollBack();
    echo "Error cloning subjects: " . $e->getMessage() . "\n";
}
