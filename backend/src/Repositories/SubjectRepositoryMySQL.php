<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class SubjectRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if ($this->db) {
            $stmt = $this->db->query("SELECT * FROM subjects ORDER BY name ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function getById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM subjects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        $sql = "INSERT INTO subjects (name, program) VALUES (:name, :program)";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE subjects SET name = :name, program = :program WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM subjects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
