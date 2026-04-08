<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();

// Fix double UTF-8 encoding of 'Mañana'
$stmt = $db->prepare("UPDATE shifts SET name = 'Mañana' WHERE name LIKE 'Ma%ana'");
$success = $stmt->execute();

if ($success) {
    echo "Successfully updated 'Mañana' in shifts table.\n";
} else {
    echo "Failed to update 'Mañana'.\n";
}
