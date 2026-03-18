<?php

namespace App\Config;

class Environment {
    
    // Configuración para entorno de desarrollo local
    private static $dev = [
        'APP_ENV' => 'development',
        'APP_DEBUG' => true,
        'APP_BASE_PATH' => '',
        'DB_TYPE' => 'mysql',
        'DB_HOST' => '127.0.0.1', 
        'DB_NAME' => 'madredeus_db',
        'DB_USER' => 'madredeus_app',
        'DB_PASS' => '1md1234'
    ];

    // Configuración para entorno de producción (Hosting Compartido)
    private static $prod = [
        'APP_ENV' => 'production',
        'APP_DEBUG' => false,
        'DB_TYPE' => 'mysql',
        'DB_HOST' => 'localhost', // O el host que provea el hosting
        'DB_NAME' => 'cpanel_madredeus',
        'DB_USER' => 'cpanel_user',
        'DB_PASS' => 'strong_password_here'
    ];

    /**
     * Retorna la configuración basada en un archivo local o predeterminados
     */
    public static function get() {
        $config = self::$dev;
        
        $localConfigFile = __DIR__ . '/config.php';
        if (file_exists($localConfigFile)) {
            $localConfig = require $localConfigFile;
            if (is_array($localConfig)) {
                $config = array_merge($config, $localConfig);
            }
        }

        return $config;
    }
}