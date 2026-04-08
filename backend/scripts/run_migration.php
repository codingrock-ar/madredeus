<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();

$sql = file_get_contents(__DIR__ . '/../sql/migrations/13_career_inscriptions.sql');

try {
    // Split SQL by semicolon, but handle cases where it might be inside strings (simplified)
    // For this specific migration, it's safe to just execute the whole thing if the driver supports multiple statements
    // or split it carefully.
    
    $statements = explode(';', $sql);
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        echo "Executing: " . substr($statement, 0, 50) . "...\n";
        $db->exec($statement);
    }
    echo "Migration completed successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
