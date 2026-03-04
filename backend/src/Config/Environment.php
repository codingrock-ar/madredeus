<?php

namespace App\Config;

class Environment {
    
    // Configuración para entorno de desarrollo local (Docker)
    private static $dev = [
        'APP_ENV' => 'development',
        'APP_DEBUG' => true,
        'DB_TYPE' => 'mysql',
        'DB_HOST' => 'db', // Nombre del servicio en docker-compose
        'DB_NAME' => 'madredeus_db',
        'DB_USER' => 'root',
        'DB_PASS' => 'secret'
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
     * Retorna la configuración basada en una variable de entorno o archivo
     * En hosting compartido puedes forzar 'production' aquí mismo devolviendo self::$prod
     */
    public static function get() {
        // Para local (docker) usamos dev.
        // Si subes esto al hosting, simplemente cambias el return a self::$prod;
        return self::$dev;
    }
}
