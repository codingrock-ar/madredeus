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
    
    public function updateProfile($email, $name, $passwordHash = null) {
        if (!$this->db) return false;
        
        if ($passwordHash) {
            $stmt = $this->db->prepare("UPDATE users SET name = :name, password_hash = :password WHERE email = :email");
            return $stmt->execute([
                'name' => $name,
                'email' => $email,
                'password' => $passwordHash
            ]);
        } else {
            $stmt = $this->db->prepare("UPDATE users SET name = :name WHERE email = :email");
            return $stmt->execute([
                'name' => $name,
                'email' => $email
            ]);
        }
    }

    public function create($name, $email, $passwordHash) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password)");
        return $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $passwordHash
        ]);
    }
}
