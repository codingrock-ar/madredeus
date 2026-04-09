<?php

use Slim\Factory\AppFactory;

// Añadimos el autoloader de Composer
require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$config = \App\Config\Environment::get();
$basePath = $config['APP_BASE_PATH'] ?? '';

if (!empty($basePath)) {
    $app->setBasePath($basePath);
}

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
    $group->group('/students', function (\Slim\Routing\RouteCollectorProxy $studentGroup) {
        $studentGroup->get('', \App\Controllers\StudentController::class . ':index');
        $studentGroup->get('/report', \App\Controllers\StudentController::class . ':report');
        $studentGroup->get('/export', \App\Controllers\StudentController::class . ':exportExcel');
        $studentGroup->get('/autocomplete', \App\Controllers\StudentController::class . ':autocomplete');
        $studentGroup->get('/{id}', \App\Controllers\StudentController::class . ':show');
        $studentGroup->post('', \App\Controllers\StudentController::class . ':create');
        $studentGroup->post('/bulk-commission', \App\Controllers\StudentController::class . ':bulkUpdateCommission');
        $studentGroup->post('/{id}/inscriptions', \App\Controllers\StudentController::class . ':inscribe');
        $studentGroup->put('/{id}', \App\Controllers\StudentController::class . ':update');
        $studentGroup->delete('/{id}', \App\Controllers\StudentController::class . ':delete');
    });
    
    $group->get('/teachers', \App\Controllers\TeacherController::class . ':index');
    $group->get('/teachers/{id}', \App\Controllers\TeacherController::class . ':show');
    $group->post('/teachers', \App\Controllers\TeacherController::class . ':create');
    $group->post('/teachers/upload-photo', \App\Controllers\TeacherController::class . ':uploadPhoto');
    $group->put('/teachers/{id}', \App\Controllers\TeacherController::class . ':update');
    $group->get('/teachers/{id}/subjects', \App\Controllers\TeacherController::class . ':getSubjects');
    $group->post('/teachers/{id}/subjects', \App\Controllers\TeacherController::class . ':assignSubject');
    $group->delete('/teachers/{id}/subjects/{subject_id}', \App\Controllers\TeacherController::class . ':removeSubject');
    $group->delete('/teachers/{id}', \App\Controllers\TeacherController::class . ':delete');
    $group->get('/careers', \App\Controllers\CareerController::class . ':index');
    $group->get('/careers/{id}', \App\Controllers\CareerController::class . ':show');
    $group->post('/careers', \App\Controllers\CareerController::class . ':create');
    $group->post('/careers/upload-plan', \App\Controllers\CareerController::class . ':uploadStudyPlan');
    $group->put('/careers/{id}', \App\Controllers\CareerController::class . ':update');
    $group->delete('/careers/{id}', \App\Controllers\CareerController::class . ':delete');
    
    $group->get('/subjects', \App\Controllers\SubjectController::class . ':index');
    $group->get('/subjects/{id}', \App\Controllers\SubjectController::class . ':show');
    $group->post('/subjects', \App\Controllers\SubjectController::class . ':create');
    $group->post('/subjects/upload-program', \App\Controllers\SubjectController::class . ':uploadProgram');
    $group->put('/subjects/{id}', \App\Controllers\SubjectController::class . ':update');
    $group->delete('/subjects/{id}', \App\Controllers\SubjectController::class . ':delete');
    
    // Auth
    $group->post('/login', \App\Controllers\AuthController::class . ':login');
    $group->post('/register', \App\Controllers\AuthController::class . ':register');
    $group->post('/logout', \App\Controllers\AuthController::class . ':logout');
    $group->post('/recover-password', \App\Controllers\AuthController::class . ':recoverPassword');
    $group->put('/profile', \App\Controllers\AuthController::class . ':updateProfile');

    // Metadata
    $group->get('/metadata/student-types', \App\Controllers\MetadataController::class . ':getStudentTypes');

    // Configuración
    $group->get('/config/cycles', \App\Controllers\AcademicCycleController::class . ':index');
    $group->post('/config/cycles', \App\Controllers\AcademicCycleController::class . ':create');
    $group->put('/config/cycles/{id}', \App\Controllers\AcademicCycleController::class . ':update');
    $group->delete('/config/cycles/{id}', \App\Controllers\AcademicCycleController::class . ':delete');
    
    $group->get('/config/scholarships', \App\Controllers\ScholarshipController::class . ':index');
    $group->post('/config/scholarships', \App\Controllers\ScholarshipController::class . ':create');
    $group->put('/config/scholarships/{id}', \App\Controllers\ScholarshipController::class . ':update');
    $group->patch('/config/scholarships/{id}/status', \App\Controllers\ScholarshipController::class . ':toggleStatus');
    $group->delete('/config/scholarships/{id}', \App\Controllers\ScholarshipController::class . ':delete');
    
    // Promoción de alumnos
    $group->post('/promotion', \App\Controllers\PromotionController::class . ':processPromotion');

    // Pagos
    $group->get('/payments', \App\Controllers\PaymentController::class . ':index');
    $group->get('/payments/collection-planilla', \App\Controllers\PaymentController::class . ':collectionPlanilla');
    $group->get('/payments/{id}', \App\Controllers\PaymentController::class . ':show');
    $group->post('/payments', \App\Controllers\PaymentController::class . ':create');
    $group->put('/payments/{id}', \App\Controllers\PaymentController::class . ':update');
    $group->post('/reminders/payment', \App\Controllers\ReminderController::class . ':payReminder');
    $group->post('/reminders/documentation', \App\Controllers\ReminderController::class . ':docReminder');
    $group->delete('/payments/{id}', \App\Controllers\PaymentController::class . ':delete');
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
