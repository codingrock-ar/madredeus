<?php
require_once __DIR__ . '/../backend/src/Config/Environment.php';
$config = \App\Config\Environment::get();

$conn = new mysqli($config['DB_HOST'], $config['DB_USER'], $config['DB_PASS'], $config['DB_NAME']);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully to " . $config['DB_NAME'] . "\n";

// Find duplicates by DNI
$sql = "SELECT dni, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(CONCAT(name, ' ', lastname)) as names
        FROM students 
        WHERE dni IS NOT NULL AND dni != ''
        GROUP BY dni 
        HAVING count > 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Duplicate students found by DNI:\n";
    while($row = $result->fetch_assoc()) {
        echo "DNI: " . $row["dni"]. " | Count: " . $row["count"]. " | IDs: " . $row["ids"]. " | Names: " . $row["names"]. "\n";
    }
} else {
    echo "No duplicates found by DNI.\n";
}

$conn->close();
