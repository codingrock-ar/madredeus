#!/bin/bash
# Script para recrear la base de datos final desde cero e importar datos del sistema legacy

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$BASE_DIR/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    # Fallback to config.php if .env doesn't exist yet in their staging
    ENV_FILE="$BASE_DIR/backend/src/Config/config.php"
fi

DB_HOST=$(grep "DB_HOST" "$ENV_FILE" | cut -d"=" -f2 | tr -d "'" | tr -d ' ' | tr -d '"')
DB_NAME=$(grep "DB_NAME" "$ENV_FILE" | cut -d"=" -f2 | tr -d "'" | tr -d ' ' | tr -d '"')
DB_USER=$(grep "DB_USER" "$ENV_FILE" | cut -d"=" -f2 | tr -d "'" | tr -d ' ' | tr -d '"')
DB_PASS=$(grep "DB_PASS" "$ENV_FILE" | cut -d"=" -f2 | tr -d "'" | tr -d ' ' | tr -d '"')

if [ "$DB_HOST" == "db" ]; then
    DB_HOST="localhost"
fi

echo "ADVERTENCIA: Esto borrará la base de datos '$DB_NAME' y la recreará usando los datos de madredeus_legacy."
read -p "¿Estás seguro? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    exit 0
fi

echo "1. Recreando base de datos..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "2. Importando estructura base inicial..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BASE_DIR/backend/sql/init.sql"

echo "3. Ejecutando script de transformación (importando legacy a final)..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BASE_DIR/backend/sql/transform_legacy_to_final.sql"

echo "4. Ejecutando TODAS las migraciones nuevas..."
php "$BASE_DIR/backend/sql/migrations/migrate.php"

echo "¡Base de datos recreada y actualizada con éxito!"
