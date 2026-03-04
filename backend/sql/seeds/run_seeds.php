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

    // Ruta al archivo de mock data
    $seedFile = __DIR__ . '/01_mock_data.sql';
    
    if (!file_exists($seedFile)) {
        die("Error: No se encontró el archivo de seeds en $seedFile\n");
    }

    $sql = file_get_contents($seedFile);
    
    // Ejecutar el script SQL
    $db->exec($sql);
    
    echo "¡Exito! Datos de prueba cargados correctamente en la base de datos.\n";

} catch (PDOException $e) {
    echo "Error ejecutando el seeder: " . $e->getMessage() . "\n";
    exit(1);
}
