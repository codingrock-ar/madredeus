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
                    ORDER BY s.academic_year ASC, s.quarter ASC, s.name ASC";
            $stmt = $this->db->query($sql);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function getByCareer($careerId) {
        if (!$this->db) return [];
        $sql = "SELECT * FROM subjects WHERE career_id = :career_id ORDER BY academic_year ASC, quarter ASC, name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':career_id' => $careerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        
        $sql = "INSERT INTO subjects (name, program, career_id, academic_year, quarter) 
                VALUES (:name, :program, :career_id, :academic_year, :quarter)";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null,
            ':career_id' => !empty($data['career_id']) ? (int)$data['career_id'] : null,
            ':academic_year' => !empty($data['academic_year']) ? (int)$data['academic_year'] : 1,
            ':quarter' => !empty($data['quarter']) ? (int)$data['quarter'] : 1
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE subjects SET name = :name, program = :program, career_id = :career_id, 
                academic_year = :academic_year, quarter = :quarter WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':program' => $data['program'] ?? null,
            ':career_id' => !empty($data['career_id']) ? (int)$data['career_id'] : null,
            ':academic_year' => !empty($data['academic_year']) ? (int)$data['academic_year'] : 1,
            ':quarter' => !empty($data['quarter']) ? (int)$data['quarter'] : 1
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM subjects WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
