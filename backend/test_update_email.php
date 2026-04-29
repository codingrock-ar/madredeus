<?php
require 'vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, name, lastname FROM students LIMIT 1");
$student = $stmt->fetch(PDO::FETCH_ASSOC);

if ($student) {
    $stmt = $db->prepare("UPDATE students SET email = :email WHERE id = :id");
    $stmt->execute([
        ':email' => 'arielerocca@gmail.com',
        ':id' => $student['id']
    ]);
    echo "Updated student ID {$student['id']} ({$student['name']} {$student['lastname']}) with email: arielerocca@gmail.com\n";
} else {
    echo "No students found in the database.\n";
}
