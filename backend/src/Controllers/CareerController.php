<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\CareerRepositoryMySQL;

class CareerController {
    private $repository;

    public function __construct() {
        $this->repository = new CareerRepositoryMySQL();
    }

    public function index(Request $request, Response $response, $args) {
        $careers = $this->repository->getAll();
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $careers]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function show(Request $request, Response $response, $args) {
        $id = $args['id'];
        $career = $this->repository->getById($id);

        if (!$career) {
            $response->getBody()->write(json_encode(['error' => 'Carrera no encontrada']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $career]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
    
    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['title'])) {
            $response->getBody()->write(json_encode(['error' => 'El título de la carrera es obligatorio']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->create($data);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Carrera creada exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al guardar en la base de datos']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode((string)$request->getBody(), true);
        
        if (empty($data['title'])) {
            $response->getBody()->write(json_encode(['error' => 'El título de la carrera es obligatorio']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $success = $this->repository->update($id, $data);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Carrera actualizada exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar o carrera no encontrada']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
    
    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $success = $this->repository->delete($id);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Carrera eliminada']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['error' => 'Error al eliminar carrera o no encontrada']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
