<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();

echo "--- CAREERS ---\n";
$stmt = $db->query("SELECT title FROM careers");
while ($row = $stmt->fetch()) {
    echo $row['title'] . " (Bytes: " . bin2hex($row['title']) . ")\n";
}

echo "\n--- SHIFTS ---\n";
$stmt = $db->query("SELECT name FROM shifts");
while ($row = $stmt->fetch()) {
    echo $row['name'] . " (Bytes: " . bin2hex($row['name']) . ")\n";
}

echo "\n--- COMMISSIONS ---\n";
$stmt = $db->query("SELECT name FROM commissions");
while ($row = $stmt->fetch()) {
    echo $row['name'] . " (Bytes: " . bin2hex($row['name']) . ")\n";
}
