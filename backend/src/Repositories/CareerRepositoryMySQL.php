<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class CareerRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if ($this->db) {
            $stmt = $this->db->query("SELECT * FROM careers ORDER BY title ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function getById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM careers WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        $sql = "INSERT INTO careers (title, duration) VALUES (:title, :duration)";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':title' => $data['title'] ?? '',
            ':duration' => $data['duration'] ?? 0
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE careers SET title = :title, duration = :duration WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'] ?? '',
            ':duration' => $data['duration'] ?? 0
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM careers WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
