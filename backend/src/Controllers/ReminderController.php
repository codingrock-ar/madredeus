<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\EmailService;
use App\Notifications\PaymentReminderNotification;
use App\Notifications\DocumentationReminderNotification;
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

        $notification = new PaymentReminderNotification($student, $debt);
        $notification->send();

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

        // Determine missing docs based on DB columns
        $missing = [];
        if (!$student['req_dni_photocopy']) $missing[] = "Fotocopia DNI";
        if (!$student['req_degree_photocopy']) $missing[] = "Fotocopia Título";
        if (!$student['req_two_photos']) $missing[] = "Dos fotos 4x4";
        if (!$student['req_psychophysical']) $missing[] = "Apto Psicofísico";
        if (!$student['req_student_book']) $missing[] = "Libreta Estudiantil";
        if (!$student['req_vaccines']) $missing[] = "Certificado de Vacunas";

        if (empty($missing)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Student has no missing documentation']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $notification = new DocumentationReminderNotification($student, $missing);
        $notification->send();

        $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Reminder sent']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
