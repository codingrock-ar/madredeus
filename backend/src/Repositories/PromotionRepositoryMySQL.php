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

        $sql = "SELECT s.id, s.name, s.lastname, sci.status, sci.career_id 
                FROM students s
                JOIN student_career_inscriptions sci ON s.id = sci.student_id
                JOIN careers c ON sci.career_id = c.id
                WHERE c.title = :career 
                  AND sci.shift = :shift 
                  AND sci.commission = :commission 
                  AND sci.academic_cycle = :period";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':career' => $criteria['career'],
            ':shift' => $criteria['shift'],
            ':commission' => $criteria['commission'],
            ':period' => $criteria['period']
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function promoteStudentsByIds(array $ids, array $target, $newStatus = null, $sourceCareerId = null) {
        if (!$this->db || empty($ids)) return false;

        $careerTitle = $target['career'];
        $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
        $stmt->execute([':title' => $careerTitle]);
        $career = $stmt->fetch();
        if (!$career) return false;
        $targetCareerId = $career['id'];

        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        
        $sql = "UPDATE student_career_inscriptions 
                SET career_id = ?, 
                    shift = ?, 
                    commission = ?,
                    academic_cycle = ?";
        
        $params = [
            $targetCareerId,
            $target['shift'],
            $target['commission'],
            $target['period']
        ];

        if ($newStatus) {
            $sql .= ", status = ?";
            $params[] = $newStatus;
        }

        $sql .= " WHERE student_id IN ($placeholders)";
        $params = array_merge($params, $ids);

        if ($sourceCareerId) {
            $sql .= " AND career_id = ?";
            $params[] = $sourceCareerId;
        }
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
