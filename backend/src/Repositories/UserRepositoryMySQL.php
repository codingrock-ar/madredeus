<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class UserRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function findByEmail($email) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findAll($search = '') {
        if (!$this->db) return [];
        if ($search) {
            $stmt = $this->db->prepare("SELECT id, name, email, role, is_active, is_blocked, created_at FROM users WHERE name LIKE :s OR email LIKE :s ORDER BY name ASC");
            $stmt->execute(['s' => "%$search%"]);
        } else {
            $stmt = $this->db->query("SELECT id, name, email, role, is_active, is_blocked, created_at FROM users ORDER BY name ASC");
        }
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT id, name, email, role, is_active, is_blocked, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($name, $email, $passwordHash, $role = 'user') {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (:name, :email, :password, :role)");
        return $stmt->execute([
            'name'     => $name,
            'email'    => $email,
            'password' => $passwordHash,
            'role'     => $role
        ]);
    }

    public function update($id, $data) {
        if (!$this->db) return false;
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name']))  { $fields[] = 'name = :name';   $params['name']  = $data['name']; }
        if (isset($data['email'])) { $fields[] = 'email = :email'; $params['email'] = $data['email']; }
        if (isset($data['role']))  { $fields[] = 'role = :role';   $params['role']  = $data['role']; }
        if (isset($data['password_hash'])) { $fields[] = 'password_hash = :password_hash'; $params['password_hash'] = $data['password_hash']; }

        if (empty($fields)) return false;
        $stmt = $this->db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id");
        return $stmt->execute($params);
    }

    public function setBlocked($id, $blocked) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("UPDATE users SET is_blocked = :blocked WHERE id = :id");
        return $stmt->execute(['blocked' => (int)$blocked, 'id' => $id]);
    }

    public function setActive($id, $active) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("UPDATE users SET is_active = :active WHERE id = :id");
        return $stmt->execute(['active' => (int)$active, 'id' => $id]);
    }

    public function updateProfile($email, $name, $passwordHash = null) {
        if (!$this->db) return false;
        if ($passwordHash) {
            $stmt = $this->db->prepare("UPDATE users SET name = :name, password_hash = :password WHERE email = :email");
            return $stmt->execute(['name' => $name, 'email' => $email, 'password' => $passwordHash]);
        } else {
            $stmt = $this->db->prepare("UPDATE users SET name = :name WHERE email = :email");
            return $stmt->execute(['name' => $name, 'email' => $email]);
        }
    }
}
