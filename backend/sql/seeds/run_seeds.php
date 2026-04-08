<?php

require __DIR__ . '/../../vendor/autoload.php';

use App\Config\Environment;
use App\Config\Database;

// Obtenemos la configuración
$config = Environment::get();

// Verificamos que estamos en entorno de desarrollo
if ($config['APP_ENV'] !== 'development') {
    echo "Aborting: El entorno no es 'development'. Los mock data no se cargarán en producción.\n";
    exit(1);
}

echo "Iniciando carga de datos mock (Seeders)...\n";

try {
    $db = (new Database())->getConnection();
    if (!$db) {
        die("Error: No se pudo conectar a la base de datos.\n");
    }

    // 1. Ejecutar el script SQL (Mock data base)
    $seedFile = __DIR__ . '/01_mock_data.sql';
    if (file_exists($seedFile)) {
        $sql = file_get_contents($seedFile);
        $db->exec($sql);
        echo "¡Exito! Datos de base (01_mock_data.sql) cargados.\n";
    }

    // 2. Ejecutar el generador de datos extendido (Test data seeder)
    $extendedSeeder = __DIR__ . '/02_test_data_seeder.php';
    if (file_exists($extendedSeeder)) {
        require_once $extendedSeeder;
        // El script mismo se encarga de la salida
    }

} catch (PDOException $e) {
    echo "Error ejecutando el seeder: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "Error general: " . $e->getMessage() . "\n";
    exit(1);
}
