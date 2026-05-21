<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\UserRepositoryMySQL;

class UserController {
    private $repository;

    public function __construct() {
        $this->repository = new UserRepositoryMySQL();
    }

    private function json(Response $response, $data, $status = 200) {
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    private function requireAdmin(Request $request): ?array {
        $token = str_replace('Bearer ', '', $request->getHeaderLine('Authorization'));
        if (!$token) return null;
        $user = $this->repository->findByToken($token);
        if (!$user || $user['role'] !== 'admin') return null;
        return $user;
    }

    public function list(Request $request, Response $response, $args) {
        $params = $request->getQueryParams();
        $search = $params['search'] ?? '';
        $users = $this->repository->findAll($search);
        return $this->json($response, ['status' => 'success', 'data' => $users]);
    }

    public function create(Request $request, Response $response, $args) {
        $data = json_decode((string)$request->getBody(), true);
        $name     = trim($data['name'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $role     = in_array($data['role'] ?? '', ['admin', 'user']) ? $data['role'] : 'user';

        if (!$name || !$email || !$password) {
            return $this->json($response, ['status' => 'error', 'error' => 'Nombre, email y contraseña son requeridos'], 400);
        }
        if ($this->repository->findByEmail($email)) {
            return $this->json($response, ['status' => 'error', 'error' => 'El email ya está en uso'], 400);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $ok = $this->repository->create($name, $email, $hash, $role);
        if ($ok) {
            return $this->json($response, ['status' => 'success', 'message' => 'Usuario creado exitosamente'], 201);
        }
        return $this->json($response, ['status' => 'error', 'error' => 'Error al crear el usuario'], 500);
    }

    public function update(Request $request, Response $response, $args) {
        $id   = (int)$args['id'];
        $data = json_decode((string)$request->getBody(), true);

        $toUpdate = [];
        if (isset($data['name']))  $toUpdate['name']  = trim($data['name']);
        if (isset($data['email'])) $toUpdate['email'] = trim($data['email']);
        if (isset($data['role']) && in_array($data['role'], ['admin', 'user'])) $toUpdate['role'] = $data['role'];
        if (!empty($data['password'])) $toUpdate['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);

        if (empty($toUpdate)) {
            return $this->json($response, ['status' => 'error', 'error' => 'No hay datos para actualizar'], 400);
        }

        $ok = $this->repository->update($id, $toUpdate);
        if ($ok) {
            return $this->json($response, ['status' => 'success', 'message' => 'Usuario actualizado']);
        }
        return $this->json($response, ['status' => 'error', 'error' => 'Error al actualizar'], 500);
    }

    public function block(Request $request, Response $response, $args) {
        $id = (int)$args['id'];
        $data = json_decode((string)$request->getBody(), true);
        $blocked = (bool)($data['blocked'] ?? true);
        $ok = $this->repository->setBlocked($id, $blocked);
        return $this->json($response, $ok
            ? ['status' => 'success', 'message' => $blocked ? 'Usuario bloqueado' : 'Usuario desbloqueado']
            : ['status' => 'error', 'error' => 'Error al actualizar estado']
        );
    }

    public function deactivate(Request $request, Response $response, $args) {
        $id = (int)$args['id'];
        $ok = $this->repository->setActive($id, 0);
        return $this->json($response, $ok
            ? ['status' => 'success', 'message' => 'Usuario dado de baja']
            : ['status' => 'error', 'error' => 'Error al dar de baja']
        );
    }

    public function activate(Request $request, Response $response, $args) {
        $id = (int)$args['id'];
        $ok = $this->repository->setActive($id, 1);
        return $this->json($response, $ok
            ? ['status' => 'success', 'message' => 'Usuario dado de alta']
            : ['status' => 'error', 'error' => 'Error al dar de alta']
        );
    }
}
