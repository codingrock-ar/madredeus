---
name: vue-php-fullstack
description: Reglas y convenciones para el desarrollo Fullstack utilizando Vue.js (Frontend) y PHP (Backend).
---

# Vue.js + PHP (Fullstack) Developer Skill

Eres un experto desarrollador Fullstack especializado en la combinación de Vue.js para el frontend y PHP (en particular micro-frameworks como Slim) para el backend. 
Aplica siempre estas directrices cuando trabajes en proyectos que usen este stack:

## Arquitectura del Backend (PHP + Slim)
- **Patrón Repositorio**: Usa siempre interfaces y clases repositorio para abstraer la capa de datos. Esto es crucial cuando se requiere soportar distintos motores de bases de datos (Ej: cambiar de MySQL a SQL Server).
- **Controladores Delgados**: Los controladores (`src/Controllers/`) deben recibir requests estandarizados (PSR-7) y delegar la lógica de negocio a los repositorios o servicios. Devuelve siempre un JSON bien formado con códigos HTTP apropiados.
- **Inyección de Dependencias**: Acostumbra a inyectar las dependencias (por ejemplo, pasándole el `RepositoryInterface` al controlador) para mantener el código testable y modular.
- **Micro-framework Eficiente**: El `public/index.php` actúa como el Front Controller. Cualquier configuración de middleware (CORS, Manejo de Errores) debe estar documentada y ser lo más ligera posible, dado que correrá en entornos de recursos compartidos.
- **Comandos de Terminal limitados**: Entiende que el entorno de destino final puede ser un hosting compartido sin acceso SSH o consola, por ende toda dependencia y configuración (via Composer) debe poder inicializarse localmente y luego empaquetarse para subir por FTP/SFTP si fuera necesario.

## Arquitectura del Frontend (Vue.js)
- **Componentización**: Independientemente de si usas Vue mediante un `<script src="...vue.global.js">` para páginas simples (opción sin build) o Vite para SPAs, estructura el código de manera modular. Todo template debe estar lo más desacoplado posible de la lógica (`js/app.js` maneja la reactividad).
- **API Fetching**: Utiliza nativamente `fetch` (o en su defecto `axios`) manejando correctamente los estados (cargando, errores, éxito) para consultar tu backend en la ruta `/api/...`.
- **Estándares UI/UX**: Mantiene un diseño limpio y moderno (como el ya implementado) aplicando Tailwind CSS o Bootstrap integrado al DOM Reactivo de Vue. Evita recargar completamente la página a menos que sea inevitable.

## Flujo de Trabajo
1. Verifica primero el archivo `composer.json` en caso de trabajar el backend.
2. Analiza el código Vue (`data`, `methods`, `computed`, `watchers`).
3. Refactoriza y migra de un paradigma MVC tradicional o procedimental a un esquema Headless / API-First donde el backend sólo responde JSON y el DOM lo redibuja Vue de lado cliente.
