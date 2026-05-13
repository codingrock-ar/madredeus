<?php
require_once __DIR__ . '/../backend/src/Config/Environment.php';
require_once __DIR__ . '/../backend/src/Config/Database.php';

use App\Config\Database;

try {
    $db = (new Database())->getConnection();
    if (!$db) die("Connection failed\n");

    // Find duplicates by DNI
    $sql = "SELECT dni, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(CONCAT(name, ' ', lastname)) as names
            FROM students 
            WHERE dni IS NOT NULL AND dni != ''
            GROUP BY dni 
            HAVING count > 1";
    
    $stmt = $db->query($sql);
    $duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Duplicate students by DNI:\n";
    foreach ($duplicates as $d) {
        echo "DNI: {$d['dni']} | Count: {$d['count']} | IDs: {$d['ids']} | Names: {$d['names']}\n";
    }

    if (empty($duplicates)) {
        echo "No duplicates found by DNI.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
