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

            // Fetch subjects for each inscription
            foreach ($student['inscriptions'] as &$inscription) {
                $stmt = $this->db->prepare("
                    SELECT * FROM subjects 
                    WHERE career_id = :career_id 
                    ORDER BY academic_year, quarter, name
                ");
                $stmt->bindParam(':career_id', $inscription['career_id'], PDO::PARAM_INT);
                $stmt->execute();
                $inscription['subjects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Fetch all payments
            $stmt = $this->db->prepare("
                SELECT * FROM payments 
                WHERE student_id = :student_id 
                ORDER BY payment_date DESC
            ");
            $stmt->bindParam(':student_id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $student['payments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
            $search = trim($params['search']);
            if (strpos($search, ',') !== false) {
                // Formato "Apellido, Nombre" (usado por el autocomplete al seleccionar)
                $parts = explode(',', $search);
                $lastname = trim($parts[0]);
                $name = trim($parts[1] ?? '');
                
                $where[] = "(s.lastname LIKE :lastname AND s.name LIKE :name)";
                $sqlParams[':lastname'] = '%' . $lastname . '%';
                $sqlParams[':name'] = '%' . $name . '%';
            } else {
                // Formato simple (DNI, Nombre o Apellido sueltos)
                $searchTerm = '%' . $search . '%';
                $where[] = "(s.name LIKE :search OR s.lastname LIKE :search OR s.dni LIKE :search)";
                $sqlParams[':search'] = $searchTerm;
            }
        }

        // Filtros de Inscripciones (Carrera, Comisión, Turno, Estado)
        // Se consolidan en un único EXISTS para que los filtros apliquen sobre la MISMA inscripción
        $insFilters = [];
        $insParams = [];

        if (!empty($params['career'])) {
            $insFilters[] = "c2.title = :career";
            $insParams[':career'] = $params['career'];
        }
        if (!empty($params['commission'])) {
            $insFilters[] = "sci2.commission = :commission";
            $insParams[':commission'] = $params['commission'];
        }
        if (!empty($params['shift'])) {
            $insFilters[] = "sci2.shift = :shift";
            $insParams[':shift'] = $params['shift'];
        }
        if (!empty($params['status'])) {
            $insFilters[] = "sci2.status = :status";
            $insParams[':status'] = $params['status'];
        }
        if (!empty($params['academic_cycle'])) {
            $insFilters[] = "sci2.academic_cycle = :academic_cycle";
            $insParams[':academic_cycle'] = $params['academic_cycle'];
        }

        if (!empty($insFilters)) {
            $where[] = "EXISTS (
                SELECT 1 FROM student_career_inscriptions sci2 
                JOIN careers c2 ON sci2.career_id = c2.id 
                WHERE sci2.student_id = s.id AND " . implode(" AND ", $insFilters) . "
            )";
            $sqlParams = array_merge($sqlParams, $insParams);
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Count total
        $countSql = "SELECT COUNT(*) FROM students s $whereSql";
        $countStmt = $this->db->prepare($countSql);
        
        foreach ($sqlParams as $key => $val) {
            // Only bind if the parameter is actually in the SQL
            if (strpos($countSql, $key) !== false) {
                $countStmt->bindValue($key, $val);
            }
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        // Get data with preferred career
        // Ensure :career_filter is always set for the main data query
        $sqlParams[':career_filter'] = $params['career'] ?? '';
        $dataSql = "SELECT s.*, pref.career_title as career, pref.commission, pref.shift, pref.status, pref.academic_cycle
                    FROM students s
                    LEFT JOIN (
                        SELECT t.student_id, t.career_title, t.commission, t.shift, t.status, t.academic_cycle
                        FROM (
                            SELECT sci.student_id, c.title as career_title, sci.commission, sci.shift, sci.status, sci.academic_cycle,
                                   ROW_NUMBER() OVER (
                                       PARTITION BY sci.student_id
                                       ORDER BY
                                           (CASE WHEN c.title = :career_filter THEN 0 ELSE 1 END),
                                           (CASE WHEN sci.status != 'Finalizó Cursada' THEN 0 ELSE 1 END),
                                           sci.inscription_date DESC,
                                           sci.id DESC
                                   ) as rn
                            FROM student_career_inscriptions sci
                            JOIN careers c ON sci.career_id = c.id
                        ) t WHERE t.rn = 1
                    ) pref ON s.id = pref.student_id
                    $whereSql 
                    ORDER BY s.id DESC 
                    LIMIT :limit OFFSET :offset";
        
        $dataStmt = $this->db->prepare($dataSql);
        foreach ($sqlParams as $key => $val) {
            // Only bind if the parameter is actually in the SQL
            if (strpos($dataSql, $key) !== false) {
                $dataStmt->bindValue($key, $val);
            }
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
                        dni, name, lastname, email, birthdate, nationality, phone, address, city,
                        photo, birth_place, document_type, civil_status, max_education_level, education_finished, degree_obtained,
                        institution, book, folio, academic_cycle, scholarship_id, academic_year, address_street, address_number, address_type, address_province,
                        address_locality, address_zip_code, phone_landline, phone_mobile, req_dni_photocopy, req_degree_photocopy,
                        req_degree_photocopy_obs, req_two_photos, req_psychophysical, req_psychophysical_obs, req_vaccines,
                        req_vaccines_obs, req_student_book, req_final_degree, req_final_degree_obs, found_institution, notes
                    ) VALUES (
                        :dni, :name, :lastname, :email, :birthdate, :nationality, :phone, :address, :city,
                        :photo, :birth_place, :document_type, :civil_status, :max_education_level, :education_finished, :degree_obtained,
                        :institution, :book, :folio, :academic_cycle, :scholarship_id, :academic_year, :address_street, :address_number, :address_type, :address_province,
                        :address_locality, :address_zip_code, :phone_landline, :phone_mobile, :req_dni_photocopy, :req_degree_photocopy,
                        :req_degree_photocopy_obs, :req_two_photos, :req_psychophysical, :req_psychophysical_obs, :req_vaccines,
                        :req_vaccines_obs, :req_student_book, :req_final_degree, :req_final_degree_obs, :found_institution, :notes
                    )";
            
            $stmt = $this->db->prepare($sql);
            $params = $this->mapParams($data);
            foreach ($params as $key => $val) {
                if (strpos($sql, $key) !== false) {
                    $stmt->bindValue($key, $val);
                }
            }
            $stmt->execute();
            
            $studentId = $this->db->lastInsertId();

            // Process inscriptions
            if (!empty($data['inscriptions']) && is_array($data['inscriptions'])) {
                foreach ($data['inscriptions'] as $ins) {
                    $careerId = $ins['career_id'] ?? null;
                    if (!$careerId && !empty($ins['career_title'])) {
                         $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                         $stmt->execute([':title' => $ins['career_title']]);
                         $careerId = $stmt->fetchColumn();
                    }

                    if ($careerId) {
                        $stmt = $this->db->prepare("
                            INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, book, folio, inscription_date)
                            VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, :book, :folio, NOW())
                        ");
                        $stmt->execute([
                            ':student_id' => $studentId,
                            ':career_id' => $careerId,
                            ':commission' => $ins['commission'] ?? null,
                            ':shift' => $ins['shift'] ?? null,
                            ':academic_cycle' => $ins['academic_cycle'] ?? null,
                            ':status' => $ins['status'] ?? 'En Curso',
                            ':book' => $ins['book'] ?? null,
                            ':folio' => $ins['folio'] ?? null
                        ]);
                    }
                }
            } else if (!empty($data['career'])) {
                // Fallback for old simple data structure during transition
                $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                $stmt->execute([':title' => $data['career']]);
                $career = $stmt->fetch();
                
                if ($career) {
                    $stmt = $this->db->prepare("
                        INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, book, folio, inscription_date)
                        VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, :book, :folio, NOW())
                    ");
                    $stmt->execute([
                        ':student_id' => $studentId,
                        ':career_id' => $career['id'],
                        ':commission' => $data['commission'] ?? null,
                        ':shift' => $data['shift'] ?? null,
                        ':academic_cycle' => $data['academic_cycle'] ?? null,
                        ':status' => $data['status'] ?? 'En Curso',
                        ':book' => $data['book'] ?? null,
                        ':folio' => $data['folio'] ?? null
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
                        address = :address, city = :city,
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
            foreach ($params as $key => $val) {
                if (strpos($sql, $key) !== false) {
                    $stmt->bindValue($key, $val);
                }
            }
            $stmt->execute();

            // Process inscriptions
            if (isset($data['inscriptions']) && is_array($data['inscriptions'])) {
                // IDs of inscriptions provided in the update
                $providedInsIds = array_filter(array_column($data['inscriptions'], 'id'));
                
                // Remove inscriptions NOT present in the provided list
                if (!empty($providedInsIds)) {
                    $placeholders = implode(',', array_fill(0, count($providedInsIds), '?'));
                    $stmt = $this->db->prepare("DELETE FROM student_career_inscriptions WHERE student_id = ? AND id NOT IN ($placeholders)");
                    $stmt->execute(array_merge([$id], $providedInsIds));
                } else {
                    // If an empty array is provided, it might mean remove all (caution)
                    // But usually there should be at least one. If empty, we might skip deletion or handle as "re-create all"
                }

                foreach ($data['inscriptions'] as $ins) {
                    $careerId = $ins['career_id'] ?? null;
                    if (!$careerId && !empty($ins['career_title'])) {
                        $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                        $stmt->execute([':title' => $ins['career_title']]);
                        $careerId = $stmt->fetchColumn();
                    }

                    if (!$careerId) continue;

                    if (!empty($ins['id'])) {
                        // Update existing
                        $stmt = $this->db->prepare("
                            UPDATE student_career_inscriptions 
                            SET career_id = :career_id,
                                commission = :commission, 
                                shift = :shift, 
                                academic_cycle = :academic_cycle, 
                                status = :status,
                                book = :book,
                                folio = :folio
                            WHERE id = :id AND student_id = :student_id
                        ");
                        $stmt->execute([
                            ':career_id' => $careerId,
                            ':commission' => $ins['commission'] ?? null,
                            ':shift' => $ins['shift'] ?? null,
                            ':academic_cycle' => $ins['academic_cycle'] ?? null,
                            ':status' => $ins['status'] ?? 'En Curso',
                            ':book' => $ins['book'] ?? null,
                            ':folio' => $ins['folio'] ?? null,
                            ':id' => $ins['id'],
                            ':student_id' => $id
                        ]);
                    } else {
                        // Create new
                        $stmt = $this->db->prepare("
                            INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, book, folio, inscription_date)
                            VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, :book, :folio, NOW())
                        ");
                        $stmt->execute([
                            ':student_id' => $id,
                            ':career_id' => $careerId,
                            ':commission' => $ins['commission'] ?? null,
                            ':shift' => $ins['shift'] ?? null,
                            ':academic_cycle' => $ins['academic_cycle'] ?? null,
                            ':status' => $ins['status'] ?? 'En Curso',
                            ':book' => $ins['book'] ?? null,
                            ':folio' => $ins['folio'] ?? null
                        ]);
                    }
                }
            } else if (!empty($data['career'])) {
                // Fallback for old simple data structure (deprecated but keeping for safety during dev)
                $stmt = $this->db->prepare("SELECT id FROM careers WHERE title = :title");
                $stmt->execute([':title' => $data['career']]);
                $career = $stmt->fetch();
                
                if ($career) {
                    $careerId = $career['id'];
                    $stmt = $this->db->prepare("SELECT id FROM student_career_inscriptions WHERE student_id = :student_id AND career_id = :career_id");
                    $stmt->execute([':student_id' => $id, ':career_id' => $careerId]);
                    $existing = $stmt->fetch();

                    if ($existing) {
                        $stmt = $this->db->prepare("
                            UPDATE student_career_inscriptions 
                            SET commission = :commission, shift = :shift, academic_cycle = :academic_cycle, status = :status, book = :book, folio = :folio
                            WHERE id = :id
                        ");
                        $stmt->execute([
                            ':commission' => $data['commission'] ?? null,
                            ':shift' => $data['shift'] ?? null,
                            ':academic_cycle' => $data['academic_cycle'] ?? null,
                            ':status' => $data['status'] ?? 'En Curso',
                            ':book' => $data['book'] ?? null,
                            ':folio' => $data['folio'] ?? null,
                            ':id' => $existing['id']
                        ]);
                    } else {
                        $stmt = $this->db->prepare("
                            INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, book, folio, inscription_date)
                            VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, :book, :folio, NOW())
                        ");
                        $stmt->execute([
                            ':student_id' => $id,
                            ':career_id' => $careerId,
                            ':commission' => $data['commission'] ?? null,
                            ':shift' => $data['shift'] ?? null,
                            ':academic_cycle' => $data['academic_cycle'] ?? null,
                            ':status' => $data['status'] ?? 'En Curso',
                            ':book' => $data['book'] ?? null,
                            ':folio' => $data['folio'] ?? null
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

        // Basic student filters
        if (!empty($filters['id'])) {
            $where[] = "s.id = :id";
            $sqlParams[':id'] = $filters['id'];
        }
        if (!empty($filters['name'])) {
            $where[] = "s.name LIKE :name";
            $sqlParams[':name'] = '%' . $filters['name'] . '%';
        }
        if (!empty($filters['lastname'])) {
            $where[] = "s.lastname LIKE :lastname";
            $sqlParams[':lastname'] = '%' . $filters['lastname'] . '%';
        }
        if (!empty($filters['scholarship_id'])) {
            $where[] = "s.scholarship_id = :scholarship_id";
            $sqlParams[':scholarship_id'] = $filters['scholarship_id'];
        }

        // Inscription filters (exists subquery for multi-career)
        $insFilters = [];
        $insParams = [];
        if (!empty($filters['career'])) {
            $insFilters[] = "c2.title = :career";
            $insParams[':career'] = $filters['career'];
        }
        if (!empty($filters['academic_cycle'])) {
            $insFilters[] = "sci2.academic_cycle = :academic_cycle";
            $insParams[':academic_cycle'] = $filters['academic_cycle'];
        }
        if (!empty($filters['shift'])) {
            $insFilters[] = "sci2.shift = :shift";
            $insParams[':shift'] = $filters['shift'];
        }
        if (!empty($filters['commission'])) {
            $insFilters[] = "sci2.commission = :commission";
            $insParams[':commission'] = $filters['commission'];
        }
        if (!empty($filters['status'])) {
            $insFilters[] = "sci2.status = :status";
            $insParams[':status'] = $filters['status'];
        }

        if (!empty($insFilters)) {
            $where[] = "EXISTS (
                SELECT 1 FROM student_career_inscriptions sci2 
                JOIN careers c2 ON sci2.career_id = c2.id 
                WHERE sci2.student_id = s.id AND " . implode(" AND ", $insFilters) . "
            )";
            $sqlParams = array_merge($sqlParams, $insParams);
        }
        
        $joinDebt = "";
        if (isset($filters['has_debt']) && $filters['has_debt'] === true) {
            $where[] = "p.status = 'Pendiente'";
            $joinDebt = "JOIN payments p ON s.id = p.student_id";
        }

        $whereSql = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        
        $sqlParams[':career_filter'] = $filters['career'] ?? '';

        // Select with preferred career (latest active or first found)
        $sql = "SELECT DISTINCT s.*, st.name as scholarship_name, pref.career_title as career, pref.commission, pref.shift, pref.status, pref.academic_cycle
                FROM students s 
                LEFT JOIN scholarship_types st ON s.scholarship_id = st.id 
                LEFT JOIN (
                    SELECT t.student_id, t.career_title, t.commission, t.shift, t.status, t.academic_cycle
                    FROM (
                        SELECT sci.student_id, c.title as career_title, sci.commission, sci.shift, sci.status, sci.academic_cycle,
                               ROW_NUMBER() OVER (
                                   PARTITION BY sci.student_id
                                   ORDER BY
                                       (CASE WHEN c.title = :career_filter THEN 0 ELSE 1 END),
                                       (CASE WHEN sci.status != 'Finalizó Cursada' THEN 0 ELSE 1 END),
                                       sci.inscription_date DESC,
                                       sci.id DESC
                               ) as rn
                        FROM student_career_inscriptions sci
                        JOIN careers c ON sci.career_id = c.id
                    ) t WHERE t.rn = 1
                ) pref ON s.id = pref.student_id
                $joinDebt
                $whereSql 
                ORDER BY s.lastname, s.name";

        $stmt = $this->db->prepare($sql);
        foreach ($sqlParams as $key => $val) {
             // Only bind if the parameter is actually in the SQL
             if (strpos($sql, $key) !== false) {
                $stmt->bindValue($key, $val);
             }
        }
        $stmt->execute();
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

    public function inscribeCareer($studentId, array $data) {
        if (!$this->db) return false;
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO student_career_inscriptions (student_id, career_id, commission, shift, academic_cycle, status, inscription_date)
                VALUES (:student_id, :career_id, :commission, :shift, :academic_cycle, :status, :inscription_date)
            ");
            
            return $stmt->execute([
                ':student_id' => $studentId,
                ':career_id' => $data['career_id'],
                ':commission' => $data['commission'] ?? null,
                ':shift' => $data['shift'] ?? null,
                ':academic_cycle' => $data['academic_cycle'] ?? null,
                ':status' => $data['status'] ?? 'En Curso',
                ':inscription_date' => $data['inscription_date'] ?? date('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            error_log("Error in inscribeCareer: " . $e->getMessage());
            return false;
        }
    }
}
