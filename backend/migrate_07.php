<?php
require __DIR__ . '/vendor/autoload.php';

use App\Config\Database;

$db = (new Database())->getConnection();

$sql = file_get_contents(__DIR__ . '/sql/migrations/07_payment_config_history.sql');

try {
    $db->exec($sql);
    echo "Migration 07 executed successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
