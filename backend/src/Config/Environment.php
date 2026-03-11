<?php

namespace App\Config;

class Environment {
    
    // Configuración para entorno de desarrollo local
    private static $dev = [
        'APP_ENV' => 'development',
        'APP_DEBUG' => true,
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
     * Retorna la configuración basada en una variable de entorno o archivo
     * En hosting compartido puedes forzar 'production' aquí mismo devolviendo self::$prod
     */
    public static function get() {
        return self::$dev;
    }
}