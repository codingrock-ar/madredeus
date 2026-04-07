<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\PromotionRepositoryMySQL;

class PromotionController {
    private $repository;

    public function __construct() {
        $this->repository = new PromotionRepositoryMySQL();
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

        // If we are bypassing (manual promotion), just execute
        if (!empty($bypassIds)) {
            $success = $this->repository->promoteStudentsByIds($bypassIds, $target, $newStatus);
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

            // Placeholder for debt check
            if ($checks['deudas']) {
                // $reasons[] = "Posee deudas administrativas"; 
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
            $executionSuccess = $this->repository->promoteStudentsByIds($promotedIds, $target, $newStatus);
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
