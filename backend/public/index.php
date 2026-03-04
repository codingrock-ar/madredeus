<?php

use Slim\Factory\AppFactory;

// Añadimos el autoloader de Composer
require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

// Middleware de enrutamiento
$app->addRoutingMiddleware();

// Middleware para manejo de errores (en produccion poner en false)
$app->addErrorMiddleware(true, true, true);

// Configuración básica de CORS para que el fronend Vue pueda consumir la API
$app->options('/api/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Definición de Rutas API
$app->group('/api', function (\Slim\Routing\RouteCollectorProxy $group) {
    // Al no tener un contenedor DI complejo en este script simple,
    // llamamos directamente a los métodos del controlador
    $group->get('/students', \App\Controllers\StudentController::class . ':index');
    $group->get('/students/{id}', \App\Controllers\StudentController::class . ':show');
    $group->post('/students', \App\Controllers\StudentController::class . ':create');
    $group->put('/students/{id}', \App\Controllers\StudentController::class . ':update');
    $group->delete('/students/{id}', \App\Controllers\StudentController::class . ':delete');
    
    $group->get('/teachers', \App\Controllers\TeacherController::class . ':index');
    $group->get('/teachers/{id}', \App\Controllers\TeacherController::class . ':show');
    $group->post('/teachers', \App\Controllers\TeacherController::class . ':create');
    $group->put('/teachers/{id}', \App\Controllers\TeacherController::class . ':update');
    $group->delete('/teachers/{id}', \App\Controllers\TeacherController::class . ':delete');
    $group->get('/careers', \App\Controllers\CareerController::class . ':index');
    $group->get('/careers/{id}', \App\Controllers\CareerController::class . ':show');
    $group->post('/careers', \App\Controllers\CareerController::class . ':create');
    $group->put('/careers/{id}', \App\Controllers\CareerController::class . ':update');
    $group->delete('/careers/{id}', \App\Controllers\CareerController::class . ':delete');
    
    $group->get('/subjects', \App\Controllers\SubjectController::class . ':index');
    $group->get('/subjects/{id}', \App\Controllers\SubjectController::class . ':show');
    $group->post('/subjects', \App\Controllers\SubjectController::class . ':create');
    $group->put('/subjects/{id}', \App\Controllers\SubjectController::class . ':update');
    $group->delete('/subjects/{id}', \App\Controllers\SubjectController::class . ':delete');
    
    // Auth
    $group->post('/login', \App\Controllers\AuthController::class . ':login');
    $group->post('/register', \App\Controllers\AuthController::class . ':register');
    $group->post('/logout', \App\Controllers\AuthController::class . ':logout');
    $group->post('/recover-password', \App\Controllers\AuthController::class . ':recoverPassword');
    $group->put('/profile', \App\Controllers\AuthController::class . ':updateProfile');
});

// Ruta por defecto: Cargar la SPA (Frontend)
$app->get('/', function ($request, $response, $args) {
    $file = __DIR__ . '/index.html';
    if (file_exists($file)) {
        $response->getBody()->write(file_get_contents($file));
        return $response->withHeader('Content-Type', 'text/html');
    }
    $response->getBody()->write('Frontend no encontrado (Falta index.html)');
    return $response->withStatus(404);
});

$app->run();
