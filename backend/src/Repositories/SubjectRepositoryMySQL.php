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
            $sql = "SELECT s.*, c.title as career_title 
                    FROM subjects s 
                    LEFT JOIN careers c ON s.career_id = c.id 
                    ORDER BY s.name ASC";
            $stmt = $this->db->query($sql);
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
        
        $sql = "INSERT INTO subjects (name, program, career_id) VALUES (:name, :program, :career_id)";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null,
            ':career_id' => !empty($data['career_id']) ? (int)$data['career_id'] : null
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE subjects SET name = :name, program = :program, career_id = :career_id WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null,
            ':career_id' => !empty($data['career_id']) ? (int)$data['career_id'] : null
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM subjects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
