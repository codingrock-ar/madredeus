<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class ScholarshipRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if ($this->db) {
            $stmt = $this->db->query("SELECT * FROM scholarship_types ORDER BY name ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function create(array $data) {
        if (!$this->db) return false;
        $sql = "INSERT INTO scholarship_types (name, description, status) VALUES (:name, :description, :status)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        $sql = "UPDATE scholarship_types SET name = :name, description = :description, status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':description' => $data['description'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
    }

    public function toggleStatus($id, $status) {
        if (!$this->db) return false;
        $sql = "UPDATE scholarship_types SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id, ':status' => $status]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("DELETE FROM scholarship_types WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
