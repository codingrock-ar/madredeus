<?php
require __DIR__ . '/../vendor/autoload.php';
use App\Config\Database;

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        die("Error: No se pudo conectar a la base de datos.\n");
    }

    $sql = "SELECT s.name, s.lastname, COUNT(sci.career_id) as career_count 
            FROM students s 
            JOIN student_career_inscriptions sci ON s.id = sci.student_id 
            GROUP BY s.id 
            HAVING career_count > 1";
    
    $stmt = $db->query($sql);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($results)) {
        echo "No students found with more than one career.\n";
    } else {
        foreach ($results as $row) {
            echo "Student: " . $row['name'] . " " . $row['lastname'] . " - Careers: " . $row['career_count'] . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
