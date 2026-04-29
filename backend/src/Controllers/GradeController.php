<?php

namespace App\Controllers;

use App\Repositories\GradeRepositoryMySQL;
use App\Helpers\ResponseHelper;

class GradeController {
    private $gradeRepo;

    public function __construct() {
        $this->gradeRepo = new GradeRepositoryMySQL();
    }

    public function saveGrades($request, $response, $args) {
        $studentId = $args['id'];
        $inscriptionId = $args['inscription_id'];
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['grades']) || !is_array($data['grades'])) {
            \App\Helpers\ResponseHelper::error("Datos de calificaciones inválidos o incompletos", 400);
            return $response;
        }

        $success = $this->gradeRepo->saveGrades($studentId, $inscriptionId, $data['grades']);

        if ($success) {
            \App\Helpers\ResponseHelper::success(["message" => "Calificaciones guardadas exitosamente"]);
        } else {
            \App\Helpers\ResponseHelper::error("Error al guardar calificaciones", 500);
        }
        return $response;
    }
}
