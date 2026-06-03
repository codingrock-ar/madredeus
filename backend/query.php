<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();

// Check LAFERRERE ENFERMERIA id
$stmt = $db->query("SELECT id, title FROM careers WHERE title LIKE '%LAFERRERE ENFERMERIA%'");
$career = $stmt->fetch();
if ($career) {
    echo "Career found: ID " . $career['id'] . "\n";
    $stmt = $db->prepare("SELECT quarter, COUNT(*) as c FROM subjects WHERE career_id = ? GROUP BY quarter");
    $stmt->execute([$career['id']]);
    print_r($stmt->fetchAll());
} else {
    echo "Career not found\n";
}

// Check student 711940
$stmt = $db->query("SELECT * FROM students WHERE id = 711940");
$student = $stmt->fetch();
if ($student) {
    echo "Student found\n";
    $stmt = $db->prepare("SELECT * FROM student_career_inscriptions WHERE student_id = ?");
    $stmt->execute([$student['id']]);
    print_r($stmt->fetchAll());
} else {
    echo "Student not found\n";
}
