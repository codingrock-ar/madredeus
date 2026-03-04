<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\StudentRepositoryMySQL;
use App\Repositories\StudentRepositoryInterface;

class StudentController {
    
    private StudentRepositoryInterface $repository;

    public function __construct() {
        // En una app más robusta (usando PHP-DI) se inyecta la interfaz automáticamente.
        // Aquí instanciamos directamente la implementación que deseamos usar (MySQL).
        // Si mañana migras a SQL Server, solo cambias esta línea o la config en el contenedor de dependencias.
        $this->repository = new StudentRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $students = $this->repository->getAll();
        
        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $students
        ]));
        
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
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
}
