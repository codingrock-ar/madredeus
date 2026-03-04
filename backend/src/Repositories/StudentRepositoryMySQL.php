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
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(array $data) {
        if (!$this->db) return false;
        
        $sql = "INSERT INTO students (dni, name, lastname, email, birthdate, nationality, phone, address, city, career, commission, shift, status)
                VALUES (:dni, :name, :lastname, :email, :birthdate, :nationality, :phone, :address, :city, :career, :commission, :shift, :status)";
        
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
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
            ':status' => $data['status'] ?? 'En Curso'
        ]);
    }

    public function update($id, array $data) {
        if (!$this->db) return false;
        
        $sql = "UPDATE students 
                SET dni = :dni, name = :name, lastname = :lastname, email = :email, 
                    birthdate = :birthdate, nationality = :nationality, phone = :phone, 
                    address = :address, city = :city, career = :career, 
                    commission = :commission, shift = :shift, status = :status
                WHERE id = :id";
                
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([
            ':id' => $id,
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
            ':status' => $data['status'] ?? 'En Curso'
        ]);
    }

    public function delete($id) {
        if (!$this->db) return false;
        
        $stmt = $this->db->prepare("DELETE FROM students WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
