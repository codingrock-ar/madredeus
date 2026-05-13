<?php
require_once __DIR__ . '/../backend/src/Config/Environment.php';
$config = \App\Config\Environment::get();

$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$studentId = 728293;
$sql = "SELECT sci.*, c.title as career_title 
        FROM student_career_inscriptions sci 
        JOIN careers c ON sci.career_id = c.id 
        WHERE sci.student_id = $studentId";

$result = $conn->query($sql);

echo "Inscriptions for student $studentId:\n";
while($row = $result->fetch_assoc()) {
    echo "ID: {$row['id']} | Career: {$row['career_title']} | Cycle: {$row['academic_cycle']} | Status: {$row['status']}\n";
}

$conn->close();
