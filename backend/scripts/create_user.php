<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

if ($argc < 4) {
    echo "Uso: php create_user.php <nombre> <email> <password>\n";
    exit(1);
}

$name = $argv[1];
$email = $argv[2];
$password = $argv[3];

try {
    $db = (new Database())->getConnection();
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($user) {
        echo "El usuario con email $email ya existe. Actualizando nombre y contraseña...\n";
        $stmt = $db->prepare("UPDATE users SET name = ?, password_hash = ? WHERE email = ?");
        $stmt->execute([$name, $hash, $email]);
        echo "Usuario actualizado con éxito.\n";
    } else {
        echo "Creando nuevo usuario $name ($email)...\n";
        $stmt = $db->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $hash]);
        echo "Usuario creado con éxito.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
