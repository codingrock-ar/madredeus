<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class StudentRepositoryMySQL implements StudentRepositoryInterface {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if (!$this->db) return [];
        $stmt = $this->db->query("SELECT * FROM students ORDER BY id DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM students WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            // Fetch all inscriptions
            $stmt = $this->db->prepare("
                SELECT sci.*, c.title as career_title 
                FROM student_career_inscriptions sci 
                JOIN careers c ON sci.career_id = c.id 
                WHERE sci.student_id = :student_id
                ORDER BY sci.inscription_date DESC
            ");
            $stmt->bindParam(':student_id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $student['inscriptions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        return $student;
    }

    public function getPaginated(array $params) {
        if (!$this->db) return ['data' => [], 'total' => 0];

        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 10;
        $offset = ($page - 1) * $perPage;

        $where = [];
        $sqlParams = [];

        if (!empty($params['search'])) {
            $searchTerm = '%' . $params['search'] . '%';
            $where[] = "(s.name LIKE :search OR s.lastname LIKE :search OR s.dni LIKE :search)";
            $sqlParams[':search'] = $searchTerm;
        }

        // Si se filtra por carrera, se busca en la tabla de inscripciones
        if (!empty($params['career'])) {
            $where[] = "EXISTS (SELECT 1 FROM student_career_inscriptions sci2 JOIN careers c2 ON sci2.career_id = c2.id WHERE sci2.student_id = s.id AND c2.title = :career)";
            $sqlParams[':career'] = $params['career'];
        }

        if (!empty($params['commission'])) {
            $where[] = "EXISTS (SELECT 1 FROM student_career_inscriptions sci3 WHERE sci3.student_id = s.id AND sci3.commission = :commission)";
            $sqlParams[':commission'] = $params['commission'];
        }

        if (!empty($params['shift'])) {
            $where[] = "EXISTS (SELECT 1 FROM student_career_inscriptions sci4 WHERE sci4.student_id = s.id AND sci4.shift = :shift)";
            $sqlParams[':shift'] = $params['shift'];
        }

        if (!empty($params['status'])) {
            $where[] = "EXISTS (SELECT 1 FROM student_career_inscriptions sci5 WHERE sci5.student_id = s.id AND sci5.status = :status)";
            $sqlParams[':status'] = $params['status'];
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Count total
        $countSql = "SELECT COUNT(*) FROM students s $whereSql";
        $countStmt = $this->db->prepare($countSql);
        foreach ($sqlParams as $key => $val) {
            $countStmt->bindValue($key, $val);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        // Get data with preferred career
        // Lógica: Carrera a la que primero se inscribió y no está en estado Finalizó Cursada
        $dataSql = "SELECT s.*, pref.career_title as career, pref.commission, pref.shift, pref.status, pref.academic_cycle
                    FROM students s
                    LEFT JOIN (
                        SELECT sci.student_id, c.title as career_title, sci.commission, sci.shift, sci.status, sci.academic_cycle
                        FROM student_career_inscriptions sci
                        JOIN careers c ON sci.career_id = c.id
                        WHERE (sci.student_id, sci.inscription_date) IN (
                            SELECT student_id, MIN(inscription_date)
                            FROM student_career_inscriptions
                            WHERE status != 'Finalizó Cursada'
                            GROUP BY student_id
                        )
                        OR (sci.student_id, sci.inscription_date) IN (
                            -- Fallback if all careers are finished
                            SELECT student_id, MAX(inscription_date)
                            FROM student_career_inscriptions
                            GROUP BY student_id
                        )
                    ) pref ON s.id = pref.student_id
                    $whereSql 
                    ORDER BY s.id DESC 
                    LIMIT :limit OFFSET :offset";
        
        $dataStmt = $this->db->prepare($dataSql);
        foreach ($sqlParams as $key => $val) {
            $dataStmt->bindValue($key, $val);
        }
        $dataStmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $dataStmt->execute();
        $data = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
        ];
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        try {
            $this->db->beginTransaction();

            $sql = "INSERT INTO students (
                        dni, name, lastname, email, birthdate, nationality, phone, address, city, career, commission, shift, status,
                        photo, birth_place, document_type, civil_status, max_education_level, education_finished, degree_obtained,
                        institution, book, folio, academic_cycle, scholarship_id, academic_year, address_street, address_number, address_type, address_province,
                        address_locality, address_zip_code, phone_landline, phone_mobile, req_dni_photocopy, req_degree_photocopy,
                        req_degree_photocopy_obs, req_two_photos, req_psychophysical, req_psychophysical_obs, req_vaccines,
                        req_vaccines_obs, req_student_book, req_final_degree, req_final_degree_obs, found_institution, notes
                    ) VALUES (
                        :dni, :name, :lastname, :email, :birthdate, :nationality, :phone, :address, :city, :career, :commission, :shift, :status,
                        :photo, :birth_place, :document_type, :civil_status, :max_education_level, :education_finished, :degree_obtained,
                        :institution, :book, :folio, :academic_cycle, :scholarship_id, :academic_year, :address_street, :address_number, :address_type, :address_province,
                        :address_locality, :address_zip_code, :phone_landline, :phone_mobile, :req_dni_photocopy, :req_degree_photocopy,
                        :req_degree_photocopy_obs, :req_two_photos, :req_psychophysical, :req_psychophysical_obs, :req_vaccines,
                        :req_vaccines_obs, :req_student_book, :req_final_degree, :req_final_degree_obs, :found_institution, :notes
                    )";
            
            $stmt = $this->db->prepare($sql);
            $params = $this->mapParams($data);
            $stmt->execute($params);
            
            $studentId = $this->db->lastInsertId();

            // Create inscription if career data is provided
            if (!empty($data['career'])) {
                $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                $stmt->execute([':title' => $data['career']]);
                $career = $stmt->fetch();
                
                if ($career) {
                    $stmt = $this->db->prepare("
                        INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, inscription_date)
                        VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, NOW())
                    ");
                    $stmt->execute([
                        ':student_id' => $studentId,
                        ':career_id' => $career['id'],
                        ':commission' => $data['commission'] ?? null,
                        ':shift' => $data['shift'] ?? null,
                        ':academic_cycle' => $data['academic_cycle'] ?? null,
                        ':status' => $data['status'] ?? 'En Curso'
                    ]);
                }
            }

            $this->db->commit();
            return $studentId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error creating student: " . $e->getMessage());
            return false;
        }
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        try {
            $this->db->beginTransaction();

            $sql = "UPDATE students 
                    SET dni = :dni, name = :name, lastname = :lastname, email = :email, 
                        birthdate = :birthdate, nationality = :nationality, phone = :phone, 
                        address = :address, city = :city, career = :career, 
                        commission = :commission, shift = :shift, status = :status,
                        photo = :photo, birth_place = :birth_place, document_type = :document_type,
                        civil_status = :civil_status, max_education_level = :max_education_level,
                        education_finished = :education_finished, degree_obtained = :degree_obtained,
                        institution = :institution, book = :book, folio = :folio,
                        academic_cycle = :academic_cycle, scholarship_id = :scholarship_id,
                        academic_year = :academic_year, address_street = :address_street,
                        address_number = :address_number, address_type = :address_type,
                        address_province = :address_province, address_locality = :address_locality,
                        address_zip_code = :address_zip_code, phone_landline = :phone_landline,
                        phone_mobile = :phone_mobile, req_dni_photocopy = :req_dni_photocopy,
                        req_degree_photocopy = :req_degree_photocopy, req_degree_photocopy_obs = :req_degree_photocopy_obs,
                        req_two_photos = :req_two_photos, req_psychophysical = :req_psychophysical,
                        req_psychophysical_obs = :req_psychophysical_obs, req_vaccines = :req_vaccines,
                        req_vaccines_obs = :req_vaccines_obs, req_student_book = :req_student_book,
                        req_final_degree = :req_final_degree, req_final_degree_obs = :req_final_degree_obs,
                        found_institution = :found_institution, notes = :notes
                    WHERE id = :id";
                    
            $stmt = $this->db->prepare($sql);
            $params = $this->mapParams($data);
            $params[':id'] = $id;
            $stmt->execute($params);

            // Update or create inscription if career data is provided
            if (!empty($data['career'])) {
                $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                $stmt->execute([':title' => $data['career']]);
                $career = $stmt->fetch();
                
                if ($career) {
                    $careerId = $career['id'];
                    // Check if inscription exists for this career
                    $stmt = $this->db->prepare("SELECT id FROM student_career_inscriptions WHERE student_id = :student_id AND career_id = :career_id");
                    $stmt->execute([':student_id' => $id, ':career_id' => $careerId]);
                    $existing = $stmt->fetch();

                    if ($existing) {
                        $stmt = $this->db->prepare("
                            UPDATE student_career_inscriptions 
                            SET commission = :commission, 
                                shift = :shift, 
                                academic_cycle = :academic_cycle, 
                                status = :status
                            WHERE id = :id
                        ");
                        $stmt->execute([
                            ':commission' => $data['commission'] ?? null,
                            ':shift' => $data['shift'] ?? null,
                            ':academic_cycle' => $data['academic_cycle'] ?? null,
                            ':status' => $data['status'] ?? 'En Curso',
                            ':id' => $existing['id']
                        ]);
                    } else {
                        $stmt = $this->db->prepare("
                            INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, inscription_date)
                            VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, NOW())
                        ");
                        $stmt->execute([
                            ':student_id' => $id,
                            ':career_id' => $careerId,
                            ':commission' => $data['commission'] ?? null,
                            ':shift' => $data['shift'] ?? null,
                            ':academic_cycle' => $data['academic_cycle'] ?? null,
                            ':status' => $data['status'] ?? 'En Curso'
                        ]);
                    }
                }
            }

            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Error updating student: " . $e->getMessage());
            return false;
        }
    }

    public function getForReport(array $filters) {
        if (!$this->db) return [];

        $where = [];
        $sqlParams = [];

        if (!empty($filters['id'])) {
            $where[] = "s.id = :id";
            $sqlParams[':id'] = $filters['id'];
        }
        if (!empty($filters['career'])) {
            $where[] = "s.career = :career";
            $sqlParams[':career'] = $filters['career'];
        }
        if (!empty($filters['academic_cycle'])) {
            $where[] = "s.academic_cycle = :academic_cycle";
            $sqlParams[':academic_cycle'] = $filters['academic_cycle'];
        }
        if (!empty($filters['shift'])) {
            $where[] = "s.shift = :shift";
            $sqlParams[':shift'] = $filters['shift'];
        }
        if (!empty($filters['commission'])) {
            $where[] = "s.commission = :commission";
            $sqlParams[':commission'] = $filters['commission'];
        }
        if (!empty($filters['academic_year'])) {
            $where[] = "s.academic_year = :academic_year";
            $sqlParams[':academic_year'] = $filters['academic_year'];
        }
        if (!empty($filters['status'])) {
            $where[] = "s.status = :status";
            $sqlParams[':status'] = $filters['status'];
        }
        if (!empty($filters['scholarship_id'])) {
            $where[] = "s.scholarship_id = :scholarship_id";
            $sqlParams[':scholarship_id'] = $filters['scholarship_id'];
        }
        if (isset($filters['has_scholarship']) && $filters['has_scholarship'] === true) {
            $where[] = "s.scholarship_id IS NOT NULL";
        }
        
        $joinDebt = "";
        if (isset($filters['has_debt']) && $filters['has_debt'] === true) {
            $where[] = "p.status = 'Pendiente'";
            $joinDebt = "JOIN payments p ON s.id = p.student_id";
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        $sql = "SELECT DISTINCT s.*, st.name as scholarship_name 
                FROM students s 
                LEFT JOIN scholarship_types st ON s.scholarship_id = st.id 
                $joinDebt
                $whereSql 
                ORDER BY s.lastname, s.name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($sqlParams);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function mapParams(array $data) {
        return [
            ':dni' => $data['dni'] ?? null,
            ':name' => $data['name'] ?? '',
            ':lastname' => $data['lastname'] ?? '',
            ':email' => $data['email'] ?? null,
            ':birthdate' => !empty($data['birthdate']) ? $data['birthdate'] : null,
            ':nationality' => $data['nationality'] ?? null,
            ':phone' => $data['phone'] ?? null,
            ':address' => $data['address'] ?? null,
            ':city' => $data['city'] ?? null,
            ':career' => $data['career'] ?? null,
            ':commission' => $data['commission'] ?? null,
            ':shift' => $data['shift'] ?? null,
            ':status' => $data['status'] ?? 'En Curso',
            ':photo' => $data['photo'] ?? null,
            ':birth_place' => $data['birth_place'] ?? null,
            ':document_type' => $data['document_type'] ?? 'DNI',
            ':civil_status' => $data['civil_status'] ?? 'Soltero',
            ':max_education_level' => $data['max_education_level'] ?? 'Secundario',
            ':education_finished' => $data['education_finished'] ?? 'No',
            ':degree_obtained' => $data['degree_obtained'] ?? null,
            ':institution' => $data['institution'] ?? null,
            ':book' => $data['book'] ?? null,
            ':folio' => $data['folio'] ?? null,
            ':academic_cycle' => $data['academic_cycle'] ?? null,
            ':scholarship_id' => !empty($data['scholarship_id']) ? $data['scholarship_id'] : null,
            ':academic_year' => $data['academic_year'] ?? '2024',
            ':address_street' => $data['address_street'] ?? null,
            ':address_number' => $data['address_number'] ?? null,
            ':address_type' => $data['address_type'] ?? 'Casa',
            ':address_province' => $data['address_province'] ?? null,
            ':address_locality' => $data['address_locality'] ?? null,
            ':address_zip_code' => $data['address_zip_code'] ?? null,
            ':phone_landline' => $data['phone_landline'] ?? null,
            ':phone_mobile' => $data['phone_mobile'] ?? null,
            ':req_dni_photocopy' => !empty($data['req_dni_photocopy']) ? 1 : 0,
            ':req_degree_photocopy' => !empty($data['req_degree_photocopy']) ? 1 : 0,
            ':req_degree_photocopy_obs' => $data['req_degree_photocopy_obs'] ?? null,
            ':req_two_photos' => !empty($data['req_two_photos']) ? 1 : 0,
            ':req_psychophysical' => !empty($data['req_psychophysical']) ? 1 : 0,
            ':req_psychophysical_obs' => $data['req_psychophysical_obs'] ?? null,
            ':req_vaccines' => !empty($data['req_vaccines']) ? 1 : 0,
            ':req_vaccines_obs' => $data['req_vaccines_obs'] ?? null,
            ':req_student_book' => !empty($data['req_student_book']) ? 1 : 0,
            ':req_final_degree' => !empty($data['req_final_degree']) ? 1 : 0,
            ':req_final_degree_obs' => $data['req_final_degree_obs'] ?? null,
            ':found_institution' => isset($data['found_institution']) ? json_encode($data['found_institution']) : null,
            ':notes' => $data['notes'] ?? null
        ];
    }

    public function searchSimple(string $term) {
        $searchTerm = "%$term%";
        $stmt = $this->db->prepare("
            SELECT id, name, lastname, dni 
            FROM students 
            WHERE name LIKE :term 
               OR lastname LIKE :term 
               OR dni LIKE :term 
            LIMIT 10
        ");
        $stmt->bindParam(':term', $searchTerm);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function updateCommissionBulk(array $ids, string $commission) {
        if (!$this->db || empty($ids)) return false;
        
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "UPDATE students SET commission = ? WHERE id IN ($placeholders)";
        
        $stmt = $this->db->prepare($sql);
        $params = array_merge([$commission], $ids);
        
        return $stmt->execute($params);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM students WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
