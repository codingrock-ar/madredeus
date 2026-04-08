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
}
