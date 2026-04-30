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

        $sql = "SELECT p.*, s.name as student_name, s.lastname as student_lastname, s.dni as student_dni
                FROM payments p
                JOIN students s ON p.student_id = s.id
                WHERE 1=1";
        
        $params = [];

        if (!empty($filters['student_id'])) {
            $sql .= " AND p.student_id = :student_id";
            $params[':student_id'] = $filters['student_id'];
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $sql .= " AND (s.name LIKE :search OR s.lastname LIKE :search OR s.dni LIKE :search";
            
            // Si parece un DNI con formato (puntos/guiones), buscamos también la versión limpia
            $cleanSearch = preg_replace('/[^0-9]/', '', $searchTerm);
            if (!empty($cleanSearch) && $cleanSearch !== $searchTerm) {
                $sql .= " OR s.dni LIKE :clean_search";
                $params[':clean_search'] = "%" . $cleanSearch . "%";
            }
            $sql .= ")";
            $params[':search'] = "%" . $searchTerm . "%";
        }

        // Si hay búsqueda, los filtros de fecha se vuelven opcionales o secundarios
        // Para mejorar la UX, si el usuario busca por DNI, quiere ver el historial completo
        if (!empty($filters['start_date']) && empty($filters['search'])) {
            $sql .= " AND p.payment_date >= :start_date";
            $params[':start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date']) && empty($filters['search'])) {
            $sql .= " AND p.payment_date <= :end_date";
            $params[':end_date'] = $filters['end_date'] . " 23:59:59";
        }

        if (!empty($filters['method'])) {
            $sql .= " AND p.payment_method = :method";
            $params[':method'] = $filters['method'];
        }

        if (!empty($filters['career'])) {
            // Usamos la tabla de inscripciones para filtrar por carrera
            $sql .= " AND EXISTS (SELECT 1 FROM student_career_inscriptions sci JOIN careers c ON sci.career_id = c.id WHERE sci.student_id = s.id AND c.title = :career)";
            $params[':career'] = $filters['career'];
        }

        if (!empty($filters['commission'])) {
            $sql .= " AND EXISTS (SELECT 1 FROM student_career_inscriptions sci WHERE sci.student_id = s.id AND sci.commission = :commission)";
            $params[':commission'] = $filters['commission'];
        }

        $sql .= " ORDER BY p.payment_date DESC";

        // Obtener total sin límite para el resumen
        $countSql = "SELECT COUNT(*) as total_count, SUM(p.amount) as total_amount, AVG(p.amount) as avg_amount, MIN(p.amount) as min_amount " . substr($sql, strpos($sql, "FROM"));
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
            'avg_amount' => (float)($totals['avg_amount'] ?? 0),
            'min_amount' => (float)($totals['min_amount'] ?? 0),
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
        
        $sql = "INSERT INTO payments (student_id, amount, payment_date, due_date, type, payment_method, concept, status, notes, details) 
                VALUES (:student_id, :amount, :payment_date, :due_date, :type, :payment_method, :concept, :status, :notes, :details)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':student_id' => $data['student_id'],
            ':amount' => $data['amount'],
            ':payment_date' => $data['payment_date'] ?? null,
            ':due_date' => $data['due_date'] ?? null,
            ':type' => $data['type'] ?? 'Otro',
            ':payment_method' => $data['payment_method'] ?? 'Efectivo',
            ':concept' => $data['concept'],
            ':status' => $data['status'] ?? 'Pendiente',
            ':notes' => $data['notes'] ?? null,
            ':details' => isset($data['details']) ? json_encode($data['details']) : null
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE payments SET 
                amount = :amount, 
                payment_date = :payment_date, 
                due_date = :due_date,
                type = :type,
                payment_method = :payment_method, 
                concept = :concept, 
                status = :status, 
                notes = :notes,
                details = :details
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        
        $updateData = [
            ':id' => $id,
            ':amount' => $data['amount'],
            ':payment_date' => $data['payment_date'] ?? null,
            ':due_date' => $data['due_date'] ?? null,
            ':type' => $data['type'] ?? 'Otro',
            ':payment_method' => $data['payment_method'] ?? 'Efectivo',
            ':concept' => $data['concept'],
            ':status' => $data['status'] ?? 'Pendiente',
            ':notes' => $data['notes'] ?? null,
            ':details' => isset($data['details']) ? json_encode($data['details']) : null
        ];
        
        return $stmt->execute($updateData);
    }

    public function delete($id) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("DELETE FROM payments WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function getCollectionPlanilla(array $filters = []) {
        if (!$this->db) return [];

        $where = ["1=1"];
        $params = [];

        if (!empty($filters['career_id'])) {
            $where[] = "sci.career_id = :career_id";
            $params[':career_id'] = $filters['career_id'];
        }
        
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $searchSql = "(s.name LIKE :search OR s.lastname LIKE :search OR s.dni LIKE :search";
            
            $cleanSearch = preg_replace('/[^0-9]/', '', $searchTerm);
            if (!empty($cleanSearch) && $cleanSearch !== $searchTerm) {
                $searchSql .= " OR s.dni LIKE :clean_search";
                $params[':clean_search'] = "%" . $cleanSearch . "%";
            }
            $searchSql .= ")";
            $where[] = $searchSql;
            $params[':search'] = "%" . $searchTerm . "%";
        }

        $whereSql = implode(" AND ", $where);

        $sql = "SELECT 
                    s.id as student_id,
                    s.name as student_name,
                    s.lastname as student_lastname,
                    s.dni as student_dni,
                    GROUP_CONCAT(DISTINCT c.title SEPARATOR ', ') as careers_list,
                    GROUP_CONCAT(DISTINCT sci.commission SEPARATOR ', ') as commissions_list,
                    (SELECT SUM(p.amount) FROM payments p WHERE p.student_id = s.id AND p.status = 'Pagado') as total_paid,
                    (SELECT COUNT(*) FROM payments p WHERE p.student_id = s.id AND (p.concept LIKE 'Cuota%' OR p.type = 'Cuota') AND p.status = 'Pagado') as installments_paid
                FROM students s
                LEFT JOIN student_career_inscriptions sci ON s.id = sci.student_id
                LEFT JOIN careers c ON sci.career_id = c.id
                WHERE $whereSql
                GROUP BY s.id
                ORDER BY s.lastname, s.name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $currentMonth = (int)date('n');
        $expectedInstallments = max(0, $currentMonth - 3); 

        foreach ($results as &$row) {
            $row['has_debt'] = ($row['installments_paid'] < $expectedInstallments);
        }

        return $results;
    }

    public function getLastExecutionDate() {
        if (!$this->db) return null;
        $stmt = $this->db->query("SELECT MAX(created_at) FROM payments WHERE status != 'Anulado'");
        return $stmt->fetchColumn();
    }

    public function cancelPendingByStudent($studentId) {
        if (!$this->db) return false;
        $sql = "UPDATE payments SET status = 'Anulado' 
                WHERE student_id = :student_id AND status = 'Pendiente'";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':student_id' => $studentId]);
    }

    public function getConfigs() {
        if (!$this->db) return [];
        $stmt = $this->db->query("SELECT * FROM payment_configs");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateConfig($key, $value) {
        if (!$this->db) return false;
        $stmt = $this->db->prepare("UPDATE payment_configs SET config_value = :value WHERE config_key = :key");
        return $stmt->execute([':key' => $key, ':value' => $value]);
    }

    public function generatePaymentPlan($studentId, array $planData) {
        if (!$this->db) return false;
        
        try {
            $this->db->beginTransaction();
            
            // First, cancel any existing pending payments for this student to avoid duplicates
            $this->cancelPendingByStudent($studentId);

            $sql = "INSERT INTO payments (student_id, amount, base_amount, due_date, type, concept, status, details) 
                    VALUES (:student_id, :amount, :base_amount, :due_date, :type, :concept, 'Pendiente', :details)";
            
            $stmt = $this->db->prepare($sql);
            
            foreach ($planData as $payment) {
                $stmt->execute([
                    ':student_id' => $studentId,
                    ':amount' => $payment['amount'],
                    ':base_amount' => $payment['amount'],
                    ':due_date' => $payment['due_date'],
                    ':type' => $payment['type'],
                    ':concept' => $payment['concept'],
                    ':details' => isset($payment['details']) ? json_encode($payment['details']) : null
                ]);
            }
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            error_log("Error generating payment plan: " . $e->getMessage());
            return false;
        }
    }

    public function processPayment($id, array $data) {
        if (!$this->db) return false;

        $sql = "UPDATE payments SET 
                paid_amount = :paid_amount,
                interest_amount = :interest_amount,
                base_amount = :base_amount,
                amount = :total_amount,
                payment_date = CURRENT_TIMESTAMP,
                payment_method = :method,
                status = 'Pagado',
                notes = :notes
                WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':paid_amount' => $data['paid_amount'],
            ':interest_amount' => $data['interest_amount'] ?? 0,
            ':base_amount' => $data['base_amount'],
            ':total_amount' => $data['paid_amount'], // total amount is what was paid
            ':method' => $data['payment_method'] ?? 'Efectivo',
            ':notes' => $data['notes'] ?? null
        ]);
    }
}
