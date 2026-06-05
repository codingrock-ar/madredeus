<?php
// Este script está diseñado para ejecutarse desde la línea de comandos (CLI) vía Cron
require __DIR__ . '/../vendor/autoload.php';

use App\Repositories\PaymentRepositoryMySQL;

echo "[" . date('Y-m-d H:i:s') . "] Iniciando proceso de generación de intereses...\n";

try {
    $repository = new PaymentRepositoryMySQL();
    $result = $repository->generateInterests();
    
    if (isset($result['error'])) {
        echo "[" . date('Y-m-d H:i:s') . "] ERROR: " . $result['error'] . "\n";
    } else {
        echo "[" . date('Y-m-d H:i:s') . "] PROCESO COMPLETADO. Intereses generados: " . $result['total_generated'] . "\n";
    }
} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] ERROR CRITICO: " . $e->getMessage() . "\n";
    exit(1);
}
