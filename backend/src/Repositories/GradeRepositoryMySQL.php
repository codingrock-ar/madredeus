<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class GradeRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function saveGrades($studentId, $inscriptionId, array $grades) {
        if (!$this->db) return false;
        
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO student_grades (student_id, inscription_id, subject_id, grade, status)
                VALUES (:student_id, :inscription_id, :subject_id, :grade, :status)
                ON DUPLICATE KEY UPDATE 
                grade = VALUES(grade),
                status = VALUES(status)
            ");

            foreach ($grades as $gradeData) {
                // If grade and status are empty, skip or maybe delete? Let's just update to null/empty
                $stmt->execute([
                    ':student_id' => $studentId,
                    ':inscription_id' => $inscriptionId,
                    ':subject_id' => $gradeData['subject_id'],
                    ':grade' => $gradeData['grade'] ?? null,
                    ':status' => $gradeData['status'] ?? null
                ]);
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error saving grades: " . $e->getMessage());
            return false;
        }
    }
}
