<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class TeacherRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getAll() {
        if ($this->db) {
            $stmt = $this->db->query("SELECT * FROM teachers ORDER BY lastname ASC");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        return [];
    }

    public function getById($id) {
        if (!$this->db) return null;
        $stmt = $this->db->prepare("SELECT * FROM teachers WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        $sql = "INSERT INTO teachers (
            name, lastname, image, birthdate, birth_place, document_type, dni, civil_status,
            max_education_level, education_finished, degree_obtained, institution,
            address_street, address_number, address_type, address_province, address_locality, address_zip_code,
            email, phone_landline, phone_mobile, exp_asistencial, exp_academica,
            req_cv, req_psycho, req_psycho_obs, req_dni_copy, req_degree_copy, req_degree_copy_obs,
            cost_amount, cost_unit
        ) VALUES (
            :name, :lastname, :image, :birthdate, :birth_place, :document_type, :dni, :civil_status,
            :max_education_level, :education_finished, :degree_obtained, :institution,
            :address_street, :address_number, :address_type, :address_province, :address_locality, :address_zip_code,
            :email, :phone_landline, :phone_mobile, :exp_asistencial, :exp_academica,
            :req_cv, :req_psycho, :req_psycho_obs, :req_dni_copy, :req_degree_copy, :req_degree_copy_obs,
            :cost_amount, :cost_unit
        )";
        
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':lastname' => $data['lastname'] ?? '',
            ':image' => $data['image'] ?? null,
            ':birthdate' => $data['birthdate'] ?? null,
            ':birth_place' => $data['birth_place'] ?? null,
            ':document_type' => $data['document_type'] ?? 'DNI',
            ':dni' => $data['dni'] ?? null,
            ':civil_status' => $data['civil_status'] ?? null,
            ':max_education_level' => $data['max_education_level'] ?? null,
            ':education_finished' => $data['education_finished'] ?? 'No',
            ':degree_obtained' => $data['degree_obtained'] ?? null,
            ':institution' => $data['institution'] ?? null,
            ':address_street' => $data['address_street'] ?? null,
            ':address_number' => $data['address_number'] ?? null,
            ':address_type' => $data['address_type'] ?? 'Casa',
            ':address_province' => $data['address_province'] ?? null,
            ':address_locality' => $data['address_locality'] ?? null,
            ':address_zip_code' => $data['address_zip_code'] ?? null,
            ':email' => $data['email'] ?? null,
            ':phone_landline' => $data['phone_landline'] ?? null,
            ':phone_mobile' => $data['phone_mobile'] ?? null,
            ':exp_asistencial' => $data['exp_asistencial'] ?? null,
            ':exp_academica' => $data['exp_academica'] ?? null,
            ':req_cv' => isset($data['req_cv']) ? (int)$data['req_cv'] : 0,
            ':req_psycho' => isset($data['req_psycho']) ? (int)$data['req_psycho'] : 0,
            ':req_psycho_obs' => $data['req_psycho_obs'] ?? null,
            ':req_dni_copy' => isset($data['req_dni_copy']) ? (int)$data['req_dni_copy'] : 0,
            ':req_degree_copy' => isset($data['req_degree_copy']) ? (int)$data['req_degree_copy'] : 0,
            ':req_degree_copy_obs' => $data['req_degree_copy_obs'] ?? null,
            ':cost_amount' => $data['cost_amount'] ?? null,
            ':cost_unit' => $data['cost_unit'] ?? 'Hora'
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE teachers SET 
            name = :name, lastname = :lastname, image = :image, birthdate = :birthdate, 
            birth_place = :birth_place, document_type = :document_type, dni = :dni, civil_status = :civil_status,
            max_education_level = :max_education_level, education_finished = :education_finished, 
            degree_obtained = :degree_obtained, institution = :institution,
            address_street = :address_street, address_number = :address_number, address_type = :address_type, 
            address_province = :address_province, address_locality = :address_locality, address_zip_code = :address_zip_code,
            email = :email, phone_landline = :phone_landline, phone_mobile = :phone_mobile, 
            exp_asistencial = :exp_asistencial, exp_academica = :exp_academica,
            req_cv = :req_cv, req_psycho = :req_psycho, req_psycho_obs = :req_psycho_obs, 
            req_dni_copy = :req_dni_copy, req_degree_copy = :req_degree_copy, req_degree_copy_obs = :req_degree_copy_obs,
            cost_amount = :cost_amount, cost_unit = :cost_unit
            WHERE id = :id";
            
        $stmt = $this->db->prepare($sql);
        
        $params = [
            ':id' => $id,
            ':name' => $data['name'] ?? '',
            ':lastname' => $data['lastname'] ?? '',
            ':image' => $data['image'] ?? null,
            ':birthdate' => $data['birthdate'] ?? null,
            ':birth_place' => $data['birth_place'] ?? null,
            ':document_type' => $data['document_type'] ?? 'DNI',
            ':dni' => $data['dni'] ?? null,
            ':civil_status' => $data['civil_status'] ?? null,
            ':max_education_level' => $data['max_education_level'] ?? null,
            ':education_finished' => $data['education_finished'] ?? 'No',
            ':degree_obtained' => $data['degree_obtained'] ?? null,
            ':institution' => $data['institution'] ?? null,
            ':address_street' => $data['address_street'] ?? null,
            ':address_number' => $data['address_number'] ?? null,
            ':address_type' => $data['address_type'] ?? 'Casa',
            ':address_province' => $data['address_province'] ?? null,
            ':address_locality' => $data['address_locality'] ?? null,
            ':address_zip_code' => $data['address_zip_code'] ?? null,
            ':email' => $data['email'] ?? null,
            ':phone_landline' => $data['phone_landline'] ?? null,
            ':phone_mobile' => $data['phone_mobile'] ?? null,
            ':exp_asistencial' => $data['exp_asistencial'] ?? null,
            ':exp_academica' => $data['exp_academica'] ?? null,
            ':req_cv' => isset($data['req_cv']) ? (int)$data['req_cv'] : 0,
            ':req_psycho' => isset($data['req_psycho']) ? (int)$data['req_psycho'] : 0,
            ':req_psycho_obs' => $data['req_psycho_obs'] ?? null,
            ':req_dni_copy' => isset($data['req_dni_copy']) ? (int)$data['req_dni_copy'] : 0,
            ':req_degree_copy' => isset($data['req_degree_copy']) ? (int)$data['req_degree_copy'] : 0,
            ':req_degree_copy_obs' => $data['req_degree_copy_obs'] ?? null,
            ':cost_amount' => $data['cost_amount'] ?? null,
            ':cost_unit' => $data['cost_unit'] ?? 'Hora'
        ];
        
        return $stmt->execute($params);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM teachers WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
