<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\ScholarshipRepositoryMySQL;

class ScholarshipController {
    private $repository;

    public function __construct() {
        $this->repository = new ScholarshipRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $data = $this->repository->getAll();
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $data]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        if (empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'El nombre es obligatorio']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        $success = $this->repository->create($data);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Tipo de beca creado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }
        $response->getBody()->write(json_encode(['error' => 'Error al guardar']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        if (empty($data['name'])) {
            $response->getBody()->write(json_encode(['error' => 'El nombre es obligatorio']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        $success = $this->repository->update($id, $data);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Tipo de beca actualizado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function toggleStatus(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        $status = $data['status'] ?? 'active';
        $success = $this->repository->toggleStatus($id, $status);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Estado actualizado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar estado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $success = $this->repository->delete($id);
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Eliminado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        $response->getBody()->write(json_encode(['error' => 'Error al eliminar']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
