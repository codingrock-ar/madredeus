<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\StudentRepositoryMySQL;
use App\Repositories\StudentRepositoryInterface;
use App\Repositories\CareerRepositoryMySQL;
use App\Notifications\CareerInscriptionNotification;
use App\Notifications\StudentLegajoNotification;

class StudentController {
    
    private StudentRepositoryInterface $repository;

    public function __construct() {
        // En una app más robusta (usando PHP-DI) se inyecta la interfaz automáticamente.
        // Aquí instanciamos directamente la implementación que deseamos usar (MySQL).
        // Si mañana migras a SQL Server, solo cambias esta línea o la config en el contenedor de dependencias.
        $this->repository = new StudentRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        
        $params = [
            'search' => $queryParams['search'] ?? null,
            'career' => $queryParams['career'] ?? null,
            'commission' => $queryParams['commission'] ?? null,
            'shift' => $queryParams['shift'] ?? null,
            'status' => $queryParams['status'] ?? null,
            'academic_cycle' => $queryParams['academic_cycle'] ?? null,
            'page' => $queryParams['page'] ?? 1,
            'per_page' => $queryParams['per_page'] ?? 10
        ];

        $result = $this->repository->getPaginated($params);
        
        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $result['data'],
            'meta' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total_pages' => $result['total_pages']
            ]
        ]));
        
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function autocomplete(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        $term = $queryParams['q'] ?? '';

        if (strlen($term) < 3) {
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'data' => []
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $students = $this->repository->searchSimple($term);

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $students
        ]));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function show(Request $request, Response $response, $args) {
        $id = $args['id'];
        $student = $this->repository->getById($id);

        if (!$student) {
            $response->getBody()->write(json_encode(['error' => 'Estudiante no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $student
        ]));
        
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    
    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['dni']) || empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (DNI, Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->create($data);
        
        if ($success) {
            // Mandar Notificaciones por Mail para inscripciones iniciales
            if (!empty($data['inscriptions']) && is_array($data['inscriptions'])) {
                try {
                    $student = $this->repository->getById($success); // success returns the ID
                    $careerRepo = new CareerRepositoryMySQL();
                    foreach ($data['inscriptions'] as $ins) {
                        $careerId = $ins['career_id'] ?? null;
                        if ($careerId) {
                            $career = $careerRepo->getById($careerId);
                            if ($student && $career) {
                                $notification = new CareerInscriptionNotification($student, $career, $ins);
                                $notification->send();
                            }
                        }
                    }
                } catch (\Exception $e) {
                    error_log("Error al enviar notificaciones de inscripción inicial: " . $e->getMessage());
                }
            }

            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Estudiante creado exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al guardar en la base de datos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['dni']) || empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (DNI, Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->update($id, $data);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Estudiante actualizado exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar o estudiante no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $success = $this->repository->delete($id);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Estudiante eliminado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al eliminar estudiante o no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function bulkUpdateCommission(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $ids = $data['ids'] ?? [];
        $commission = $data['commission'] ?? '';

        if (empty($ids) || empty($commission)) {
            $response->getBody()->write(json_encode(['error' => 'Faltan IDs o comisión de destino']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $success = $this->repository->updateCommissionBulk($ids, $commission);

        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Comisiones actualizadas correctamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $response->getBody()->write(json_encode(['error' => 'Error al actualizar comisiones']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function inscribe(Request $request, Response $response, $args) {
        $studentId = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['career_id'])) {
            $response->getBody()->write(json_encode(['error' => 'Falta el ID de la carrera']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->inscribeCareer($studentId, $data);
        
        if ($success) {
            // Mandar Notificación por Mail
            try {
                $student = $this->repository->getById($studentId);
                $careerRepo = new CareerRepositoryMySQL();
                $career = $careerRepo->getById($data['career_id']);
                
                if ($student && $career) {
                    $notification = new CareerInscriptionNotification($student, $career, $data);
                    $notification->send();
                }
            } catch (\Exception $e) {
                error_log("Error al enviar notificación de inscripción: " . $e->getMessage());
            }

            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Inscripción realizada exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al procesar la inscripción']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function report(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        
        $filters = [
            'id' => $queryParams['legajo'] ?? null,
            'career' => $queryParams['career'] ?? null,
            'academic_cycle' => $queryParams['periodo'] ?? null,
            'shift' => $queryParams['turno'] ?? null,
            'commission' => $queryParams['comision'] ?? null,
            'academic_year' => $queryParams['ciclo'] ?? null,
            'status' => $queryParams['estado'] ?? null,
            'name' => $queryParams['name'] ?? null,
            'lastname' => $queryParams['lastname'] ?? null,
            'scholarship_id' => $queryParams['scholarship_id'] ?? null,
            'has_scholarship' => !empty($queryParams['becados']) && $queryParams['becados'] == 'true',
            'has_debt' => !empty($queryParams['deudores']) && $queryParams['deudores'] == 'true'
        ];

        $students = $this->repository->getForReport($filters);

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $students
        ]));
        
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function exportExcel(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        
        $filters = [
            'id' => $queryParams['legajo'] ?? null,
            'career' => $queryParams['career'] ?? null,
            'academic_cycle' => $queryParams['periodo'] ?? null,
            'shift' => $queryParams['turno'] ?? null,
            'commission' => $queryParams['comision'] ?? null,
            'academic_year' => $queryParams['ciclo'] ?? null,
            'status' => $queryParams['estado'] ?? null,
            'name' => $queryParams['name'] ?? null,
            'lastname' => $queryParams['lastname'] ?? null,
            'scholarship_id' => $queryParams['scholarship_id'] ?? null,
            'has_scholarship' => !empty($queryParams['becados']) && $queryParams['becados'] == 'true',
            'has_debt' => !empty($queryParams['deudores']) && $queryParams['deudores'] == 'true'
        ];

        $students = $this->repository->getForReport($filters);

        // Generar CSV compatible con Excel
        $output = fopen('php://temp', 'r+');
        
        // BOM para que Excel detecte UTF-8
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Cabecera
        fputcsv($output, [
            'Legajo', 'Apellido', 'Nombre', 'DNI', 'Carrera', 'Turno', 'Comisión', 
            'Ciclo Lectivo', 'Periodo', 'Estado', 'Beca'
        ], ';');

        foreach ($students as $student) {
            fputcsv($output, [
                $student['id'],
                $student['lastname'],
                $student['name'],
                $student['dni'],
                $student['career'],
                $student['shift'],
                $student['commission'],
                $student['academic_year'],
                $student['academic_cycle'],
                $student['status'],
                $student['scholarship_name'] ?? 'Sin Beca'
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        $response->getBody()->write($csv);

        $filename = 'listado_estudiantes_' . date('Ymd') . '.csv';
        return $response
            ->withHeader('Content-Type', 'text/csv; charset=utf-8')
            ->withHeader('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->withHeader('Pragma', 'no-cache')
            ->withHeader('Expires', '0');
    }

    public function sendLegajoEmail(Request $request, Response $response, $args) {
        $id = $args['id'];
        $student = $this->repository->getById($id);
        
        if (!$student) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Estudiante no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if (empty($student['email'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'El estudiante no tiene email registrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        try {
            $notification = new StudentLegajoNotification($student);
            $notification->send();
            
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Legajo enviado correctamente']));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al enviar: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
}
