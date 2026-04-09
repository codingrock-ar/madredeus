<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\EmailService;
use App\Repositories\StudentRepositoryMySQL;

class ReminderController {
    private $studentRepository;

    public function __construct() {
        $this->studentRepository = new StudentRepositoryMySQL();
    }

    public function payReminder(Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $studentId = $data['student_id'] ?? null;
        $debt = $data['debt'] ?? 0;

        if (!$studentId) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student ID missing']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $student = $this->studentRepository->getById($studentId);
        if (!$student) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if (empty($student['email'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student has no email address']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        EmailService::sendPaymentReminder($student, $debt);

        $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Reminder sent']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function docReminder(Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $studentId = $data['student_id'] ?? null;

        if (!$studentId) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student ID missing']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $student = $this->studentRepository->getById($studentId);
        if (!$student) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if (empty($student['email'])) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student has no email address']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Determine missing docs
        $missing = [];
        if (!$student['has_dni']) $missing[] = "DNI";
        if (!$student['has_title']) $missing[] = "Título secundario";
        if (!$student['has_photo']) $missing[] = "Fotos carnet";
        if (!$student['has_aptitude']) $missing[] = "Aptitud física";

        if (empty($missing)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student has no missing documentation']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        EmailService::sendDocumentationReminder($student, $missing);

        $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Reminder sent']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
