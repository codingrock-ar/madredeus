# ⛪ Proyecto MadreDeus - Sistema de Gestión Académica

Este sistema permite la gestión integral de alumnos, docentes, carreras y procesos de promoción académica.

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Docker** y **Docker Compose** instalados en el sistema.
- Puertos `8080` (Web/API) y `3306` (Base de Datos) disponibles.

### Pasos para Instalar
1.  **Clonar el repositorio** o situarse en la carpeta raíz del proyecto.
2.  **Lanzar el entorno dockerizado**:
    ```bash
    docker-compose up -d --build
    ```
3.  **Verificar contenedores**:
    ```bash
    docker ps
    ```
    Deberían aparecer los contenedores `madredeus_app` (PHP-Apache) y `madredeus_db` (MariaDB/MySQL).

### Configuración del Entorno
El sistema utiliza un archivo de configuración en `backend/src/Config/config.php`. El entorno de Docker ya viene pre-configurado para conectarse al servicio `db` con las credenciales por defecto:
- **DB_HOST**: `db`
- **DB_NAME**: `madredeus_db`
- **DB_USER**: `root`
- **DB_PASS**: `secret`

## 🛠️ Estructura del Proyecto

- `backend/src`: Lógica de negocio (Controladores, Repositorios, Modelos).
- `backend/public`: Frontend (Vue.js, CSS, Assets).
- `backend/sql`: Scripts de inicialización y migraciones de base de datos.
- `backend/public/js/components`: Componentes reutilizables de la interfaz.

## 📚 Manual de Uso del Sistema

### 1. Gestión de Alumnos
Accede a la sección de alumnos para ver el listado, filtrar por carrera o realizar búsquedas rápidas por DNI/Apellido. Puedes crear nuevos alumnos mediante el botón "Nuevo Alumno".

### 2. Proceso de Promoción de Alumnos
Esta es una herramienta crítica para avanzar a los estudiantes de un ciclo lectivo/periodo a otro.
-   **Selección**: Elige una Carrera. Verás que los campos de Origen y Destino se habilitan secuencialmente.
-   **Configuración**: Define el Turno, Comisión y Periodo actual. Luego, selecciona a dónde deseas promocionarlos.
-   **Validación**: El sistema requerirá que el periodo de destino sea mayor al de origen.
-   **Resultado**: Al finalizar, el sistema te dará un reporte detallado. Si algún alumno no pudo ser promocionado (ej: por deudas o falta de regularidad), podrás intentar promocionarlo manualmente desde la lista de resultados.

### 3. Becas y Configuración
El módulo de becas permite gestionar los beneficios de los alumnos (Alta/Baja) y exportar los listados a Excel para su control administrativo.

## 🧪 Pruebas y Desarrollo
Para ver los logs de la aplicación en tiempo real:
```bash
docker-compose logs -f app
```
Acceso a la base de datos desde el host:
```bash
mysql -h 127.0.0.1 -u root -psecret madredeus_db
```
