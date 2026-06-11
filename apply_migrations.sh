#!/bin/bash
# Script para aplicar las migraciones pendientes de Madredeus en Linux

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$BASE_DIR/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE="$BASE_DIR/backend/src/Config/config.php"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: No se encontró archivo de configuración (.env o config.php)"
    exit 1
fi

echo "Iniciando migraciones..."
php "$BASE_DIR/backend/sql/migrations/migrate.php"
