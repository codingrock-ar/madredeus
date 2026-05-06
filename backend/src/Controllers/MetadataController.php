<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MetadataController {
    
    public function getStudentTypes(Request $request, Response $response, $args) {
        $db = (new \App\Config\Database())->getConnection();
        
        $careerShifts = [];
        if ($db) {
            $stmt = $db->query("
                SELECT c.title as career, s.name as shift 
                FROM career_shifts cs
                JOIN careers c ON cs.career_id = c.id
                JOIN shifts s ON cs.shift_id = s.id
            ");
            foreach ($stmt->fetchAll() as $row) {
                $careerShifts[$row['career']][] = $row['shift'];
            }
        }

        $shiftCommissions = [];
        if ($db) {
            $stmt = $db->query("
                SELECT s.name as shift, co.name as commission 
                FROM shift_commissions sc
                JOIN shifts s ON sc.shift_id = s.id
                JOIN commissions co ON sc.commission_id = co.id
            ");
            foreach ($stmt->fetchAll() as $row) {
                $shiftCommissions[$row['shift']][] = $row['commission'];
            }
        }

        $shifts = $db ? array_column($db->query("SELECT name FROM shifts")->fetchAll(), 'name') : [];
        $commissions = $db ? array_column($db->query("SELECT name FROM commissions")->fetchAll(), 'name') : [];

        $data = [
            'document_types' => ['CI', 'DNI', 'Pasaporte', 'Precaria'],
            'civil_statuses' => ['Soltero', 'Casado', 'Divorciado', 'Viudo'],
            'education_levels' => ['Primario', 'Secundario', 'Terciario', 'Universitario'],
            'yes_no_options' => ['Si', 'No'],
            'address_types' => ['Casa', 'Departamento'],
            'media_sources' => [
                'Diarios', 'Internet', 'Otras Personas', 'Radio', 'Revistas', 'TV', 'Vía Pública'
            ],
            'sinigep_statuses' => ['Pendiente', 'Informado', 'Error', 'Rechazado'],
            'genders' => ['Masculino', 'Femenino', 'Otro', 'No especifica'],
            'shifts' => $shifts,
            'commissions' => $commissions,
            'career_shifts' => $careerShifts,
            'shift_commissions' => $shiftCommissions
        ];

        // Fallbacks for empty mappings
        if (empty($data['career_shifts'])) {
            $data['career_shifts']['default'] = $shifts ?: ['Mañana', 'Tarde', 'Noche'];
        } else {
            $data['career_shifts']['default'] = $shifts;
        }

        if (empty($data['shift_commissions'])) {
            $data['shift_commissions']['default'] = $commissions ?: ['A', 'B', 'C', 'D'];
        } else {
            $data['shift_commissions']['default'] = $commissions;
        }

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $data
        ]));
        
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
