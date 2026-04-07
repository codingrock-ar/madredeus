<?php

namespace App\Config;

use PDO;
use PDOException;

class Database {
    
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $db_type;

    public function __construct() {
        $config = \App\Config\Environment::get();
        $this->host = $config['DB_HOST'];
        $this->db_name = $config['DB_NAME'];
        $this->username = $config['DB_USER'];
        $this->password = $config['DB_PASS'];
        $this->db_type = $config['DB_TYPE'];
    }

    public function getConnection() {
        $conn = null;

        try {
            if ($this->db_type === 'mysql') {
                $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
                $conn = new PDO($dsn, $this->username, $this->password);
                $conn->exec("SET NAMES utf8mb4");
            } 
            elseif ($this->db_type === 'sqlsrv') {
                // Configuración para el sistema legacy (SQL Server)
                $dsn = "sqlsrv:Server=" . $this->host . ";Database=" . $this->db_name;
                $conn = new PDO($dsn, $this->username, $this->password);
            }

            // Validar errores en excepciones para capturarlos fácilmente
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Retornar resultados en formato array asociativo por defecto
            $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        } catch(PDOException $exception) {
            // Manejar error de conexión sin mostrar credenciales y no detener script (die)
            // Esto permite que el repositorio decida retornar un array mock temporal
            error_log("Error de conexión: " . $exception->getMessage());
            return null;
        }

        return $conn;
    }
}
