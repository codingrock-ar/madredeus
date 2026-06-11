<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Config/Database.php';

use App\Config\Database;

$db = (new Database())->getConnection();

// Traemos todos los usuarios modernos a memoria
$stmtUsers = $db->query("SELECT name, email FROM users");
$users = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

$userMap = [];
foreach ($users as $u) {
    $usernamePart = explode('@', $u['email'])[0];
    $userMap[strtolower($usernamePart)] = $u['email'];
    $userMap[strtolower($u['name'])] = $u['email'];
}

// Traemos los logs de "Alta"
$stmt = $db->query("
    SELECT b.Descripcion, u.NombeUsuario 
    FROM Bitacoras b 
    JOIN Usuario u ON b.IdUsuario = u.IdUsuario 
    WHERE b.Descripcion LIKE 'Se dado de Alta Estudiante%'
");
$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$updates = [];
foreach ($logs as $log) {
    if (preg_match('/Alta Estudiante\s*\((\d+)\)/', $log['Descripcion'], $matches)) {
        $dni = $matches[1];
        
        $username = strtolower($log['NombeUsuario']);
        $userEmail = $userMap[$username] ?? ($username . '@madredeus.com');

        $updates[$dni] = $userEmail;
    }
}

$updatedCount = 0;
$notFoundCount = 0;

$updateStmt = $db->prepare("
    UPDATE students 
    SET created_by = :created_by 
    WHERE dni = :dni AND (created_by IS NULL OR created_by = '')
");

foreach ($updates as $dni => $email) {
    $updateStmt->execute([
        ':created_by' => $email,
        ':dni' => $dni
    ]);
    
    if ($updateStmt->rowCount() > 0) {
        $updatedCount++;
    } else {
        $notFoundCount++;
    }
}

echo "Proceso finalizado. Alumnos actualizados con inscriptor original: $updatedCount\n";
echo "Alumnos omitidos (ya tenian inscriptor o no se encontro el DNI): $notFoundCount\n";
