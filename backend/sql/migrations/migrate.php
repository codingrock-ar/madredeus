<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use App\Config\Database;
use App\Config\Environment;

$config = Environment::get();
// Optional: check environment if you want to restrict this
// if ($config['APP_ENV'] !== 'development' && $config['APP_ENV'] !== 'staging') { ... }

echo "Iniciando migraciones...\n";

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        die("Error: No se pudo conectar a la base de datos.\n");
    }

    $migrationsDir = __DIR__;
    $files = scandir($migrationsDir);
    sort($files);

    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
            echo "Ejecutando migración: $file...\n";
            $sql = file_get_contents($migrationsDir . '/' . $file);
            
            // Execute the SQL file. 
            // Note: exec() might not handle multiple statements in some PDO drivers,
            // but for MySQL/MariaDB with default settings it usually works.
            // A more robust way is to split by semicolon.
            
            try {
                $db->exec($sql);
                echo "¡Exito! $file aplicada.\n";
            } catch (PDOException $e) {
                // If column already exists or similar, we might want to continue or show warning
                echo "Aviso/Error en $file: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "Todas las migraciones procesadas.\n";

} catch (Exception $e) {
    echo "Error general: " . $e->getMessage() . "\n";
    exit(1);
}
