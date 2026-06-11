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
            'gender' => $queryParams['gender'] ?? null,
            'sinigep_status' => $queryParams['sinigep_status'] ?? null,
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
        
        $operatorEmail = $request->getHeaderLine('X-User-Email');
        $data['created_by'] = $operatorEmail;
        if (!empty($data['inscriptions']) && is_array($data['inscriptions'])) {
            foreach ($data['inscriptions'] as &$ins) {
                $ins['created_by'] = $operatorEmail;
                // Forzar el ciclo inicial en nuevas inscripciones si no es un alta directa de otro ciclo
                // (Para evitar que lo pongan en 1 sin tener legajo y sin haber pagado)
                if (!isset($ins['academic_cycle']) || $ins['academic_cycle'] === '') {
                    $ins['academic_cycle'] = '0';
                }
            }
        }
        
        if (empty($data['dni']) || empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (DNI, Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        try {
            $success = $this->repository->create($data);
            
            if ($success) {
                // Registrar auditoría de Alta
                try {
                    $operatorEmail = $request->getHeaderLine('X-User-Email');
                    $auditRepo = new \App\Repositories\AuditLogRepositoryMySQL();
                    $auditRepo->logEvent(
                        $operatorEmail,
                        1, // Alta
                        "Alta de Alumno: " . $data['lastname'] . ", " . $data['name'] . " (DNI: " . $data['dni'] . ")"
                    );
                } catch (\Exception $e) {
                    error_log("Error al auditar creación de estudiante: " . $e->getMessage());
                }

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
        } catch (\PDOException $e) {
            $errorMsg = 'Error al guardar en la base de datos: ' . $e->getMessage();
            if ($e->getCode() == 23000) { // Integrity constraint violation
                $errorMsg = 'Ya existe un estudiante con ese DNI o hay un dato duplicado.';
            }
            $response->getBody()->write(json_encode(['error' => $errorMsg]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error inesperado: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
    
    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['dni']) || empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (DNI, Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $operatorEmail = $request->getHeaderLine('X-User-Email');
        if (!empty($data['inscriptions']) && is_array($data['inscriptions'])) {
            foreach ($data['inscriptions'] as &$ins) {
                if (empty($ins['id'])) {
                    $ins['created_by'] = $operatorEmail;
                }
            }
        }
        
        try {
            // Obtener estado original antes de modificar
            $original = $this->repository->getById($id);
            
            // Validar avance de cuatrimestre 0
            if (!empty($data['inscriptions']) && is_array($data['inscriptions'])) {
                $originalInscriptions = [];
                if (!empty($original['inscriptions'])) {
                    foreach ($original['inscriptions'] as $oi) {
                        $originalInscriptions[$oi['id']] = $oi;
                    }
                }

                $hasPaidMatricula = false;
                if (!empty($original['payments'])) {
                    foreach ($original['payments'] as $payment) {
                        if (stripos($payment['concept'], 'matrícula') !== false || stripos($payment['concept'], 'matricula') !== false) {
                            if ($payment['status'] === 'Pagado') {
                                $hasPaidMatricula = true;
                                break;
                            }
                        }
                    }
                }

                foreach ($data['inscriptions'] as $ins) {
                    if (!empty($ins['id']) && isset($originalInscriptions[$ins['id']])) {
                        $oldCycle = (string)$originalInscriptions[$ins['id']]['academic_cycle'];
                        $newCycle = (string)$ins['academic_cycle'];
                        
                        if ($oldCycle === '0' && $newCycle !== '0' && $newCycle !== '') {
                            if (!$hasPaidMatricula) {
                                $response->getBody()->write(json_encode(['error' => 'No se puede avanzar el ciclo/cuatrimestre (desde 0 a ' . $newCycle . ') porque el alumno no registra una Matrícula pagada.']));
                                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
                            }
                        }
                    }
                }
            }
            
            $success = $this->repository->update($id, $data);
            
            if ($success) {
                // Registrar auditoría de Modificación con desglose detallado
                if ($original) {
                    try {
                        $cambios = [];
                        $camposAComparar = [
                            'dni' => 'DNI',
                            'name' => 'Nombre',
                            'lastname' => 'Apellido',
                            'email' => 'Email',
                            'phone' => 'Teléfono',
                            'address' => 'Dirección',
                            'city' => 'Localidad',
                            'notes' => 'Notas',
                            'gender' => 'Género',
                            'sinigep_status' => 'Estado Sinigep',
                        ];
                        
                        foreach ($camposAComparar as $campoKey => $campoLabel) {
                            $originalVal = $original[$campoKey] ?? '';
                            $newVal = $data[$campoKey] ?? '';
                            
                            if ($originalVal !== $newVal) {
                                $cambios[] = "$campoLabel (" . ($originalVal ?: 'Vacío') . " -> " . ($newVal ?: 'Vacío') . ")";
                            }
                        }
                        
                        $descripcion = "Modificación de Alumno: " . $data['lastname'] . ", " . $data['name'] . " (DNI: " . $data['dni'] . ").";
                        if (count($cambios) > 0) {
                            $descripcion .= " Cambios: " . implode(', ', $cambios);
                        } else {
                            $descripcion .= " Sin cambios en los datos principales.";
                        }
                        
                        $operatorEmail = $request->getHeaderLine('X-User-Email');
                        $auditRepo = new \App\Repositories\AuditLogRepositoryMySQL();
                        $auditRepo->logEvent($operatorEmail, 3, $descripcion); // Modificacion
                    } catch (\Exception $e) {
                        error_log("Error al auditar actualización de estudiante: " . $e->getMessage());
                    }
                }

                $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Estudiante actualizado exitosamente']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            }
            
            $response->getBody()->write(json_encode(['error' => 'Estudiante no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
    
    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        
        // Obtener datos antes de eliminar
        $student = null;
        try {
            $student = $this->repository->getById($id);
        } catch (\Exception $e) {
            error_log("Error al obtener estudiante para auditar baja: " . $e->getMessage());
        }
        
        $success = $this->repository->delete($id);
        
        if ($success) {
            // Registrar auditoría de Baja
            if ($student) {
                try {
                    $operatorEmail = $request->getHeaderLine('X-User-Email');
                    $auditRepo = new \App\Repositories\AuditLogRepositoryMySQL();
                    $auditRepo->logEvent(
                        $operatorEmail,
                        2, // Baja
                        "Baja de Alumno: " . $student['lastname'] . ", " . $student['name'] . " (DNI: " . $student['dni'] . ")"
                    );
                } catch (\Exception $e) {
                    error_log("Error al auditar eliminación de estudiante: " . $e->getMessage());
                }
            }

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
        
        $data['created_by'] = $request->getHeaderLine('X-User-Email');
        
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
            'periodo' => $queryParams['periodo'] ?? null, // Added for logging
            'academic_cycle' => $queryParams['periodo'] ?? null,
            'commission' => $queryParams['commission'] ?? null,
            'shift' => $queryParams['shift'] ?? null,
            'status' => $queryParams['status'] ?? null,
            'name' => $queryParams['name'] ?? null,
            'lastname' => $queryParams['lastname'] ?? null,
            'gender' => $queryParams['sexo'] ?? null,
            'sinigep_status' => $queryParams['sinigep_status'] ?? null,
            'scholarship_id' => $queryParams['scholarship_id'] ?? null,
            'has_scholarship' => !empty($queryParams['becados']) && $queryParams['becados'] == 'true',
            'has_debt' => !empty($queryParams['deudores']) && $queryParams['deudores'] == 'true'
        ];


        try {
            $students = $this->repository->getForReport($filters);
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'data' => $students
            ]));
        } catch (\Exception $e) {
            error_log("Error in StudentController::report: " . $e->getMessage());
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        
        return $response->withHeader('Content-Type', 'application/json');
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
            'gender' => $queryParams['sexo'] ?? null,
            'sinigep_status' => $queryParams['sinigep_status'] ?? null,
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

    public function exportSinigepExcel(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        
        $filters = [
            'career' => $queryParams['career'] ?? null,
            'academic_cycle' => $queryParams['periodo'] ?? null,
            'status' => $queryParams['status'] ?? null,
            'gender' => $queryParams['sexo'] ?? null,
            'sinigep_status' => $queryParams['sinigep_status'] ?? null,
            'name' => $queryParams['name'] ?? null
        ];

        $students = $this->repository->getForReport($filters);

        $output = fopen('php://temp', 'r+');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        fputcsv($output, [
            'Carrera', 'a-o', 'turno', 'Periodo Actual', 'comisi-n', 'Apellido', 
            'Nombre', 'TIPo Doc.', 'DNI', 'Genero', 'Lugar Nacimiento', 'Condicion', 'Nivel Educacion'
        ], ';');

        foreach ($students as $student) {
            $nivelEdu = trim(($student['max_education_level'] ?? '') . ' ' . (($student['education_finished'] === 'Si') ? 'Completo' : (($student['education_finished'] === 'No') ? 'Incompleto' : '')));
            fputcsv($output, [
                $student['career'],
                $student['academic_year'],
                $student['shift'],
                $student['academic_cycle'],
                $student['commission'],
                $student['lastname'],
                $student['name'],
                $student['document_type'] ?: 'DNI',
                $student['dni'],
                $student['gender'],
                $student['nationality'] ?: $student['birth_place'],
                $student['career_status'] ?: $student['status'],
                $nivelEdu
            ], ';');
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        $response->getBody()->write($csv);

        $filename = 'sinigep_export_' . date('Ymd') . '.csv';
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
    public function notifyDocs(Request $request, Response $response, $args) {
        $id = $args['id'];
        $student = $this->repository->getById($id);
        
        if (!$student) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Estudiante no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if (empty($student['email'])) {
             $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'El estudiante no tiene un email válido para notificaciones']));
             return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $missing = [];
        if (!$student['req_dni_photocopy']) $missing[] = "Fotocopia DNI";
        if (!$student['req_degree_photocopy']) $missing[] = "Fotocopia Título";
        if (!$student['req_two_photos']) $missing[] = "Dos fotos 4x4";
        if (!$student['req_psychophysical']) $missing[] = "Apto Psicofísico";
        if (!$student['req_student_book']) $missing[] = "Libreta Estudiantil";
        if (!$student['req_vaccines']) $missing[] = "Certificado de Vacunas";

        if (empty($missing)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'El alumno no tiene documentación pendiente registrada']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        try {
            $notification = new \App\Notifications\DocumentationReminderNotification($student, $missing);
            $success = $notification->send();
            
            if ($success) {
                $this->repository->updateLastNotifiedDocs($id);
                $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Notificación de documentación enviada']));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                throw new \Exception("Error al enviar email");
            }
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al enviar: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function uploadDocument(Request $request, Response $response, $args) {
        $id = $args['id'];
        $type = $args['type']; // dni, degree, etc.
        $uploadedFiles = $request->getUploadedFiles();
        $uploadedFile = $uploadedFiles['file'] ?? null;

        if (!$uploadedFile || $uploadedFile->getError() !== UPLOAD_ERR_OK) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al subir el archivo']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $student = $this->repository->getById($id);
        if (!$student) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Estudiante no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
        $filename = sprintf('%s_%s_%s.%s', $id, $type, bin2hex(random_bytes(4)), $extension);
        
        $uploadPath = __DIR__ . '/../../public/uploads/documents';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        $uploadedFile->moveTo($uploadPath . DIRECTORY_SEPARATOR . $filename);
        $relativePath = '/uploads/documents/' . $filename;

        $student['file_' . $type] = $relativePath;
        $this->repository->update($id, $student);

        $response->getBody()->write(json_encode([
            'status' => 'success', 
            'message' => 'Documento subido correctamente',
            'path' => $relativePath
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
