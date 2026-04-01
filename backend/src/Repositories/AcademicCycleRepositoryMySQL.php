<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class AcademicCycleRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if ($this->db) {
            $stmt = $this->db->query("SELECT * FROM academic_cycles ORDER BY name DESC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function create(array $data) {
        if (!$this->db) return false;
        $sql = "INSERT INTO academic_cycles (name, start_date, end_date, status) VALUES (:name, :start_date, :end_date, :status)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':start_date' => $data['start_date'] ?? null,
            ':end_date' => $data['end_date'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        $sql = "UPDATE academic_cycles SET name = :name, start_date = :start_date, end_date = :end_date, status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':start_date' => $data['start_date'] ?? null,
            ':end_date' => $data['end_date'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("DELETE FROM academic_cycles WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
