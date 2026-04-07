<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class PromotionRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getStudentsForPromotion(array $criteria) {
        if (!$this->db) return [];

        $sql = "SELECT id, name, lastname, status FROM students 
                WHERE career = :career 
                  AND shift = :shift 
                  AND commission = :commission 
                  AND academic_cycle = :period";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':career' => $criteria['career'],
            ':shift' => $criteria['shift'],
            ':commission' => $criteria['commission'],
            ':period' => $criteria['period']
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function promoteStudentsByIds(array $ids, array $target, $newStatus = null) {
        if (!$this->db || empty($ids)) return false;

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        
        $sql = "UPDATE students 
                SET career = ?, 
                    shift = ?, 
                    commission = ?,
                    academic_cycle = ?";
        
        $params = [
            $target['career'],
            $target['shift'],
            $target['commission'],
            $target['period']
        ];

        if ($newStatus) {
            $sql .= ", status = ?";
            $params[] = $newStatus;
        }

        $sql .= " WHERE id IN ($placeholders)";
        $params = array_merge($params, $ids);
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
