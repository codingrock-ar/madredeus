<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\PaymentRepositoryMySQL;

class PaymentController {
    private $repository;

    public function __construct() {
        $this->repository = new PaymentRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        $payments = $this->repository->getAll($queryParams);
        
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $payments]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function show(Request $request, Response $response, $args) {
        $payment = $this->repository->getById($args['id']);
        if (!$payment) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Pago no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $payment]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['student_id']) || empty($data['amount']) || empty($data['concept'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Faltan campos obligatorios']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $success = $this->repository->create($data);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Pago registrado correctamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al registrar el pago']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['amount']) || empty($data['concept'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Faltan campos obligatorios']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $success = $this->repository->update($id, [
            'amount' => $data['amount'],
            'payment_date' => $data['payment_date'] ?? date('Y-m-d H:i:s'),
            'payment_method' => $data['payment_method'] ?? 'Efectivo',
            'concept' => $data['concept'],
            'status' => $data['status'] ?? 'Pagado',
            'notes' => $data['notes'] ?? null
        ]);

        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Pago actualizado correctamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al actualizar el pago']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function delete(Request $request, Response $response, $args) {
        $success = $this->repository->delete($args['id']);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Pago eliminado correctamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al eliminar el pago']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function collectionPlanilla(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        $filters = [
            'career_id' => $queryParams['career_id'] ?? null,
            'cycle' => $queryParams['cycle'] ?? date('Y'),
            'search' => $queryParams['search'] ?? null
        ];

        $data = $this->repository->getCollectionPlanilla($filters);

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $data
        ]));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function courseStatus(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();
        $filters = [
            'career_id' => $queryParams['career_id'] ?? null,
            'cycle' => $queryParams['cycle'] ?? date('Y'),
            'commission' => $queryParams['commission'] ?? null,
            'search' => $queryParams['search'] ?? null
        ];

        $data = $this->repository->getCourseStatus($filters);

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $data
        ]));
        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    public function lastExecution(Request $request, Response $response, $args) {
        $date = $this->repository->getLastExecutionDate();
        $response->getBody()->write(json_encode(['status' => 'success', 'date' => $date]));
        return $response->withHeader('Content-Type', 'application/json');
    }
    public function generatePayments(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        $cancelExisting = $data['cancel_existing'] ?? true;
        $careerId = $data['career_id'] ?? null;
        $plan = isset($data['plan']) ? $data['plan'] : $data; 
        
        if (empty($plan) || !is_array($plan)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Datos inválidos para generar el plan de pagos']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $success = $this->repository->generatePaymentPlan($id, $plan, $cancelExisting, $careerId);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Plan de pagos generado correctamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al generar el plan de pagos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function notifyLate(Request $request, Response $response, $args) {
        $paymentId = $args['id'];
        $payment = $this->repository->getById($paymentId);
        
        if (!$payment) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Pago no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $studentRepo = new \App\Repositories\StudentRepositoryMySQL();
        $student = $studentRepo->getById($payment['student_id']);

        if (!$student || empty($student['email'])) {
             $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'El estudiante no tiene un email válido para notificaciones']));
             return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        try {
            $notification = new \App\Notifications\PaymentReminderNotification($student, $payment['amount'], $payment);
            $success = $notification->send();
            
            if ($success) {
                $this->repository->updateLastNotified($paymentId);
                $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Notificación enviada con éxito']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            } else {
                throw new \Exception("El servicio de correo no pudo entregar el mensaje");
            }
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al enviar notificación: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }


    public function getConfigs(Request $request, Response $response, $args) {
        $configs = $this->repository->getConfigs();
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $configs]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateConfig(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        if (empty($data['config_key']) || !isset($data['config_value'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Faltan datos']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $userId = null;
        $authHeader = $request->getHeaderLine('Authorization');
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
            $parts = explode('.', $token);
            if (count($parts) === 3) {
                $payload = json_decode(base64_decode($parts[1]), true);
                if (isset($payload['user_id'])) {
                    $userId = $payload['user_id'];
                } else if (isset($payload['sub'])) {
                    $userId = $payload['sub'];
                }
            }
        }

        $success = $this->repository->updateConfig($data['config_key'], $data['config_value'], $userId);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Configuración actualizada']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al actualizar']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function getConfigHistory(Request $request, Response $response, $args) {
        $history = $this->repository->getConfigHistory();
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $history]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function processPayment(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['paid_amount']) || empty($data['base_amount'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Faltan montos de pago']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $success = $this->repository->processPayment($id, $data);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Pago procesado correctamente']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al procesar pago']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function importHeaders(Request $request, Response $response, $args) {
        $uploadedFiles = $request->getUploadedFiles();
        if (empty($uploadedFiles['file'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'No se subió ningún archivo']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $file = $uploadedFiles['file'];
        if ($file->getError() !== UPLOAD_ERR_OK) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al subir el archivo']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $uploadPath = __DIR__ . '/../../public/uploads/';
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }
        
        $extension = strtolower(pathinfo($file->getClientFilename(), PATHINFO_EXTENSION));
        $filename = uniqid('import_') . '.' . $extension;
        $filepath = $uploadPath . $filename;
        
        $file->moveTo($filepath);
        
        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filepath);
            $worksheet = $spreadsheet->getActiveSheet();
            $headers = [];
            
            $rowIterator = $worksheet->getRowIterator();
            foreach ($rowIterator as $row) {
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false); 
                foreach ($cellIterator as $cell) {
                    $headers[] = (string)$cell->getValue();
                }
                break; // solo primera fila
            }
            
            $highestRow = $worksheet->getHighestRow();
            $count = max(0, $highestRow - 1);
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'data' => [
                    'headers' => $headers,
                    'count' => $count,
                    'filepath' => $filepath
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al leer el archivo: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }

    public function importProcess(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $filepath = $data['filepath'] ?? '';
        $mapping = $data['mapping'] ?? [];
        
        if (!file_exists($filepath)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Archivo no encontrado. Vuelva a subirlo.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filepath);
            $worksheet = $spreadsheet->getActiveSheet();
            
            $studentRepo = new \App\Repositories\StudentRepositoryMySQL();
            
            $results = [
                'total' => 0,
                'success' => 0,
                'errors' => 0,
                'errorList' => []
            ];
            
            $isFirstRow = true;
            $rowIndex = 1;
            foreach ($worksheet->getRowIterator() as $row) {
                if ($isFirstRow) {
                    $isFirstRow = false;
                    $rowIndex++;
                    continue; // Skip header
                }
                
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);
                $rowData = [];
                foreach ($cellIterator as $cell) {
                    $rowData[] = $cell->getValue();
                }
                
                // Si la fila está totalmente vacía, salteamos
                if (count(array_filter($rowData)) === 0) {
                    continue;
                }
                
                $results['total']++;
                
                $dniIndex = $mapping['dni'] !== '' ? (int)$mapping['dni'] : -1;
                $amountIndex = $mapping['amount'] !== '' ? (int)$mapping['amount'] : -1;
                $dateIndex = $mapping['payment_date'] !== '' ? (int)$mapping['payment_date'] : -1;
                $conceptIndex = $mapping['concept'] !== '' ? (int)$mapping['concept'] : -1;
                $methodIndex = $mapping['payment_method'] !== '' ? (int)$mapping['payment_method'] : -1;
                
                $dni = $dniIndex >= 0 && isset($rowData[$dniIndex]) ? trim((string)$rowData[$dniIndex]) : null;
                $amount = $amountIndex >= 0 && isset($rowData[$amountIndex]) ? (float)$rowData[$amountIndex] : 0;
                $payment_date = $dateIndex >= 0 && isset($rowData[$dateIndex]) ? trim((string)$rowData[$dateIndex]) : null;
                $concept = $conceptIndex >= 0 && isset($rowData[$conceptIndex]) ? trim((string)$rowData[$conceptIndex]) : 'Pago Masivo';
                $method = $methodIndex >= 0 && isset($rowData[$methodIndex]) && !empty(trim((string)$rowData[$methodIndex])) ? trim((string)$rowData[$methodIndex]) : 'Efectivo';
                
                if (empty($dni)) {
                    $results['errors']++;
                    $results['errorList'][] = ['row' => $rowIndex, 'dni' => '-', 'message' => 'Falta el DNI'];
                    $rowIndex++;
                    continue;
                }
                
                // Parse date (Excel date could be numeric)
                if (is_numeric($payment_date)) {
                    $payment_date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($payment_date)->format('Y-m-d');
                } else if ($payment_date) {
                    // Try to convert 19/5/2026 to 2026-05-19
                    $dateObj = \DateTime::createFromFormat('d/m/Y', $payment_date);
                    if ($dateObj) {
                        $payment_date = $dateObj->format('Y-m-d');
                    }
                }
                if (empty($payment_date)) {
                    $payment_date = date('Y-m-d');
                }
                
                // Find student
                $student = $studentRepo->getByDni($dni);
                if (!$student) {
                    $results['errors']++;
                    $results['errorList'][] = ['row' => $rowIndex, 'dni' => $dni, 'message' => 'Estudiante no encontrado con DNI ' . $dni];
                    $rowIndex++;
                    continue;
                }
                
                // Insert payment
                $paymentData = [
                    'student_id' => $student['id'],
                    'amount' => $amount,
                    'payment_date' => $payment_date,
                    'concept' => $concept,
                    'payment_method' => $method,
                    'status' => 'Pagado'
                ];
                
                $success = $this->repository->create($paymentData);
                if ($success) {
                    $results['success']++;
                } else {
                    $results['errors']++;
                    $results['errorList'][] = ['row' => $rowIndex, 'dni' => $dni, 'message' => 'Error al guardar el pago en base de datos'];
                }
                
                $rowIndex++;
            }
            
            // Delete temp file
            @unlink($filepath);
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'data' => $results
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
            
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error procesando archivo: ' . $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    }
    public function generateInterests(Request $request, Response $response, $args) {
        $result = $this->repository->generateInterests();
        if (isset($result['error'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al generar intereses: ' . $result['error']]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        
        $response->getBody()->write(json_encode([
            'status' => 'success', 
            'message' => 'Intereses generados correctamente',
            'total_generated' => $result['total_generated']
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
