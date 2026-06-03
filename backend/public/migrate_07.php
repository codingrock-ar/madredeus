<?php
require __DIR__ . '/../src/Config/Environment.php';
require __DIR__ . '/../src/Config/Database.php';

use App\Config\Database;

try {
    $db = (new Database())->getConnection();
    $sql = file_get_contents(__DIR__ . '/../sql/migrations/07_payment_config_history.sql');
    $db->exec($sql);
    
    // Scraping bitácoras
    $scrapeSql = "
        INSERT INTO payment_config_history (config_key, old_value, new_value, changed_by_user_id, created_at)
        SELECT 
            'matricula',
            NULL,
            CAST(REGEXP_SUBSTR(Descripcion, '[0-9]+(\\\\.[0-9]+)?') AS DECIMAL(10,2)),
            IdUsuario,
            Fecha
        FROM Bitacoras
        WHERE (Descripcion LIKE '%arancel%' OR Descripcion LIKE '%precio%' OR Descripcion LIKE '%matricula%')
        AND Descripcion LIKE '%modificó%'
    ";
    
    try {
        $db->exec($scrapeSql);
        echo "Scraping bitácoras succeeded.\n";
    } catch (Exception $e) {
        echo "Scraping failed (perhaps no Bitacoras table?): " . $e->getMessage() . "\n";
    }
    
    echo "Migration 07 executed successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
