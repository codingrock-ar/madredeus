#!/bin/bash

# Script para detener todos los contenedores y levantar solo Madredeus

# Obtener IDs de contenedores en ejecución
RUNNING_CONTAINERS=$(docker ps -q)

if [ -n "$RUNNING_CONTAINERS" ]; then
    echo "Deteniendo todos los contenedores en ejecución..."
    docker stop $RUNNING_CONTAINERS
else
    echo "No hay contenedores en ejecución."
fi

# Ir al directorio de Madredeus y levantar el stack
echo "Levantando stack de Madredeus..."
cd /home/ariel/teclab/madredeus && docker compose up -d

echo "------------------------------------------"
echo "Proceso completado. Madredeus está arriba."
docker ps
