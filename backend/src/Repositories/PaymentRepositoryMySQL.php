<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class PaymentRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll(array $filters = []) {
        if (!$this->db) return [];

        $sql = "SELECT p.*, s.name as student_name, s.lastname as student_lastname 
                FROM payments p
                JOIN students s ON p.student_id = s.id
                WHERE 1=1";
        
        $params = [];

        if (!empty($filters['student_id'])) {
            $sql .= " AND p.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (s.name LIKE :search OR s.lastname LIKE :search OR s.dni LIKE :search)";
            $params[':search'] = "%" . $filters['search'] . "%";
        }

        if (!empty($filters['start_date'])) {
            $sql .= " AND p.payment_date >= :start_date";
            $params[':start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $sql .= " AND p.payment_date <= :end_date";
            $params[':end_date'] = $filters['end_date'] . " 23:59:59";
        }

        if (!empty($filters['method'])) {
            $sql .= " AND p.payment_method = :method";
            $params[':method'] = $filters['method'];
        }

        $sql .= " ORDER BY p.payment_date DESC";

        // Obtener total sin límite para el resumen
        $countSql = "SELECT COUNT(*) as total_count, SUM(p.amount) as total_amount " . substr($sql, strpos($sql, "FROM"));
        // Limpiamos el countSql de ORDER BY para evitar errores en algunas versiones
        $countSql = substr($countSql, 0, strpos($countSql, "ORDER BY") ?: strlen($countSql));
        
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);
        $totals = $countStmt->fetch(PDO::FETCH_ASSOC);

        // Paginación
        $page = isset($filters['page']) ? (int)$filters['page'] : 1;
        $perPage = isset($filters['per_page']) ? (int)$filters['per_page'] : 20;
        $offset = ($page - 1) * $perPage;
        
        $sql .= " LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'total_count' => (int)$totals['total_count'],
            'total_amount' => (float)$totals['total_amount'],
            'page' => $page,
            'per_page' => $perPage
        ];
    }

    public function getById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM payments WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        $sql = "INSERT INTO payments (student_id, amount, payment_date, payment_method, concept, status, notes) 
                VALUES (:student_id, :amount, :payment_date, :payment_method, :concept, :status, :notes)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':student_id' => $data['student_id'],
            ':amount' => $data['amount'],
            ':payment_date' => $data['payment_date'] ?? date('Y-m-d H:i:s'),
            ':payment_method' => $data['payment_method'] ?? 'Efectivo',
            ':concept' => $data['concept'],
            ':status' => $data['status'] ?? 'Pagado',
            ':notes' => $data['notes'] ?? null
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE payments SET 
                amount = :amount, 
                payment_date = :payment_date, 
                payment_method = :payment_method, 
                concept = :concept, 
                status = :status, 
                notes = :notes 
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        $data[':id'] = $id;
        return $stmt->execute($data);
    }

    public function delete($id) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("DELETE FROM payments WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
