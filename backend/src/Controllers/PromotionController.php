<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\PromotionRepositoryMySQL;

class PromotionController {
    private $repository;
    private $paymentRepository;

    public function __construct() {
        $this->repository = new PromotionRepositoryMySQL();
        $this->paymentRepository = new \App\Repositories\PaymentRepositoryMySQL();
    }

    public function processPromotion(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        
        $source = [
            'career' => $data['source_career'] ?? '',
            'shift' => $data['source_shift'] ?? '',
            'commission' => $data['source_commission'] ?? '',
            'period' => $data['source_period'] ?? ''
        ];

        if (!empty($data['filters']['student_id'])) {
            $source['id'] = $data['filters']['student_id'];
        }

        $target = [
            'career' => $data['target_career'] ?? '',
            'shift' => $data['target_shift'] ?? '',
            'commission' => $data['target_commission'] ?? '',
            'period' => $data['target_period'] ?? ''
        ];

        $checks = [
            'condicion' => $data['check_condicion'] ?? false,
            'deudas' => $data['check_deudas'] ?? false
        ];

        $bypassIds = $data['bypass_ids'] ?? [];
        
        $newStatus = null;
        if ($target['period'] === 'Egresó') {
            $newStatus = 'Egresado';
        } elseif ($target['period'] === 'Finalizó Cursada') {
            $newStatus = 'Finalizó Cursada';
        }

        // Handle source career ID if provided as title
        $sourceCareerId = null;
        if (!empty($source['career'])) {
            $stmt = (new \App\Config\Database())->getConnection()->prepare("SELECT id FROM careers WHERE title = :title");
            $stmt->execute([':title' => $source['career']]);
            $c = $stmt->fetch();
            if ($c) $sourceCareerId = $c['id'];
        }

        // If we are bypassing (manual promotion), just execute
        if (!empty($bypassIds)) {
            $success = $this->repository->promoteStudentsByIds($bypassIds, $target, $newStatus, $sourceCareerId);
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'message' => 'Alumnos promocionados manualmente correctamente'
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        // Fetch students for evaluation
        $students = $this->repository->getStudentsForPromotion($source);
        
        $promoted = [];
        $failed = [];

        foreach ($students as $student) {
            $reasons = [];
            
            if ($checks['condicion'] && $student['status'] !== 'En Curso') {
                $reasons[] = "Condición no es 'Regular' (Estado actual: {$student['status']})";
            }

            // Check for debt
            if ($checks['deudas'] && $this->paymentRepository->hasPendingDebt($student['id'])) {
                $reasons[] = "Posee deudas administrativas";
            }

            // Check matricula if not graduating
            if ($target['period'] !== 'Egresó' && $target['period'] !== 'Finalizó Cursada' && $target['period'] !== '') {
                $hasPaidMatricula = false;
                $targetCycle = $data['target_academic_cycle'] ?? date('Y');
                
                $paymentsRes = $this->paymentRepository->getAll(['student_id' => $student['id']]);
                if (!empty($paymentsRes['data'])) {
                    foreach ($paymentsRes['data'] as $payment) {
                        if (stripos($payment['concept'], 'matrícula') !== false || stripos($payment['concept'], 'matricula') !== false || $payment['type'] === 'Matrícula') {
                            if ($payment['status'] === 'Pagado') {
                                // Validate cycle
                                $paymentCycle = null;
                                if (!empty($payment['details'])) {
                                    $details = json_decode($payment['details'], true);
                                    if (isset($details['academic_cycle'])) {
                                        $paymentCycle = (string)$details['academic_cycle'];
                                    }
                                }
                                
                                if ($paymentCycle === (string)$targetCycle) {
                                    $hasPaidMatricula = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!$hasPaidMatricula) {
                    $reasons[] = "No registra una Matrícula pagada para el ciclo {$targetCycle}";
                }
            }

            if (empty($reasons)) {
                $promoted[] = $student;
            } else {
                $student['reason'] = implode(", ", $reasons);
                $failed[] = $student;
            }
        }

        $promotedIds = array_column($promoted, 'id');
        $executionSuccess = true;
        if (!empty($promotedIds)) {
            // All students in $promoted should have the same career_id from the query
            $sId = !empty($promoted) ? $promoted[0]['career_id'] : $sourceCareerId;
            $executionSuccess = $this->repository->promoteStudentsByIds($promotedIds, $target, $newStatus, $sId);
        }

        if ($executionSuccess) {
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'data' => [
                    'promoted_count' => count($promoted),
                    'failed_count' => count($failed),
                    'promoted_list' => $promoted,
                    'failed_list' => $failed
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Error al procesar la promoción en la base de datos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
