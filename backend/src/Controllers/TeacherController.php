<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\TeacherRepositoryMySQL;

class TeacherController {
    private $repository;

    public function __construct() {
        $this->repository = new TeacherRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $teachers = $this->repository->getAll();
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $teachers]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function show(Request $request, Response $response, $args) {
        $id = $args['id'];
        $teacher = $this->repository->getById($id);

        if (!$teacher) {
            $response->getBody()->write(json_encode(['error' => 'Profesor no encontrado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $teacher]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    
    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->create($data);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Profesor creado exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al guardar en la base de datos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['name']) || empty($data['lastname'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan campos obligatorios (Nombre, Apellido)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->update($id, $data);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Profesor actualizado exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar o profesor no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $success = $this->repository->delete($id);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Profesor eliminado']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al eliminar profesor o no encontrado']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
