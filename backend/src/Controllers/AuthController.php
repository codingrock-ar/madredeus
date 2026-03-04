<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\UserRepositoryMySQL;

class AuthController {
    private $repository;

    public function __construct() {
        $this->repository = new UserRepositoryMySQL();
    }

    public function login(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->repository->findByEmail($email);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Simulando la creación de un Token JWT u otra lógica de sesión
            $token = base64_encode(random_bytes(32)); 
            
            $res = [
                'status' => 'success',
                'message' => 'Login exitoso',
                'token' => $token,
                'user' => [
                    'name' => $user['name'],
                    'email' => $user['email']
                ]
            ];
            
            $response->getBody()->write(json_encode($res));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }

    public function register(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Faltan datos requeridos']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Verificar si existe el correo
        if ($this->repository->findByEmail($email)) {
             $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'El email ya se encuentra en uso']));
             return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $success = $this->repository->create($name, $email, $passwordHash);

        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Usuario registrado exitosamente']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        }

        $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al crear el usuario']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    public function logout(Request $request, Response $response, $args) {
        // Al ser APIs stateless (ej JWT), comunmente el logout se maneja en frontend
        // invalidando ell token. Aquí simplemente devolvemos éxito.
        $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Logout procesado correctamente']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateProfile(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $email = $data['email'] ?? ''; // Usamos el email actual como ID
        $name = $data['name'] ?? '';
        $newPassword = $data['newPassword'] ?? '';
        
        if (empty($email) || empty($name)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'error' => 'Nombre y Email son requeridos']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
        
        $passwordHash = null;
        if (!empty($newPassword)) {
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        }
        
        $success = $this->repository->updateProfile($email, $name, $passwordHash);
        
        if ($success) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Perfil actualizado exitosamente', 'data' => ['name' => $name, 'email' => $email]]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }
        
        $response->getBody()->write(json_encode(['status' => 'error', 'error' => 'Error al actualizar el perfil']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
}
