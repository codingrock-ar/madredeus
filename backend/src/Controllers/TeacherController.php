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

    public function uploadPhoto(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $base64Image = $data['image'] ?? '';

        if (empty($base64Image)) {
            $response->getBody()->write(json_encode(['error' => 'No se recibió ninguna imagen']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Limpiar el prefijo data:image/png;base64,
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif

            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
                $response->getBody()->write(json_encode(['error' => 'Formato de imagen no permitido']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }

            $base64Image = base64_decode($base64Image);

            if ($base64Image === false) {
                $response->getBody()->write(json_encode(['error' => 'Error al decodificar la imagen']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
            }
        } else {
            $response->getBody()->write(json_encode(['error' => 'Datos de imagen inválidos']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $fileName = 'teacher_' . uniqid() . '.' . $type;
        $uploadPath = __DIR__ . '/../../public/uploads/teachers/' . $fileName;

        if (!file_exists(dirname($uploadPath))) {
            mkdir(dirname($uploadPath), 0777, true);
        }

        if (file_put_contents($uploadPath, $base64Image)) {
            $host = $request->getUri()->getScheme() . '://' . $request->getUri()->getHost();
            $port = $request->getUri()->getPort();
            if ($port) $host .= ':' . $port;
            
            // Si el host es localhost dentro de docker, pero accedemos desde fuera como localhost:8080
            // Usaremos una ruta relativa para que el navegador resuelva correctamente
            $url = 'uploads/teachers/' . $fileName;

            $response->getBody()->write(json_encode([
                'status' => 'success',
                'url' => $url
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $response->getBody()->write(json_encode(['error' => 'Error al guardar la imagen en el servidor']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
