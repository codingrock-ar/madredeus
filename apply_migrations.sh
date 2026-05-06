#!/bin/bash

# Script para aplicar las migraciones pendientes de Madredeus en Linux

# Detectar directorio base
BASE_DIR="/home/ariel/teclab/madredeus"
CONFIG_FILE="$BASE_DIR/backend/src/Config/config.php"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: No se encontró el archivo $CONFIG_FILE"
    exit 1
fi

# Extraer credenciales usando grep y sed
DB_HOST=$(grep "'DB_HOST'" "$CONFIG_FILE" | cut -d"'" -f4)
DB_NAME=$(grep "'DB_NAME'" "$CONFIG_FILE" | cut -d"'" -f4)
DB_USER=$(grep "'DB_USER'" "$CONFIG_FILE" | cut -d"'" -f4)
DB_PASS=$(grep "'DB_PASS'" "$CONFIG_FILE" | cut -d"'" -f4)

# Si DB_HOST es 'db' (Docker), cambiar a 'localhost' para ejecución directa en host
if [ "$DB_HOST" == "db" ]; then
    DB_HOST="localhost"
fi

echo "Iniciando migraciones para la base de datos: $DB_NAME ($DB_HOST)..."

MIGRATIONS_DIR="$BASE_DIR/backend/sql/migrations"

# Ejecutar las dos últimas migraciones necesarias para esta tarea
FILES=("20_add_gender_and_sinigep_status.sql" "21_add_document_files.sql")

for FILE in "${FILES[@]}"; do
    FILE_PATH="$MIGRATIONS_DIR/$FILE"
    if [ -f "$FILE_PATH" ]; then
        echo "Aplicando $FILE..."
        mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$FILE_PATH"
        if [ $? -eq 0 ]; then
            echo "¡Éxito! $FILE aplicada correctamente."
        else
            echo "Error al aplicar $FILE (puede que ya exista)."
        fi
    else
        echo "Aviso: No se encontró el archivo $FILE_PATH"
    fi
done

echo "Proceso finalizado."
