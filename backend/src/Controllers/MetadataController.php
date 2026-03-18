<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class MetadataController {
    
    public function getStudentTypes(Request $request, Response $response, $args) {
        $data = [
            'document_types' => ['CI', 'DNI', 'Pasaporte', 'Precaria'],
            'civil_statuses' => ['Soltero', 'Casado', 'Divorciado', 'Viudo'],
            'education_levels' => ['Primario', 'Secundario', 'Terciario', 'Universitario'],
            'yes_no_options' => ['Si', 'No'],
            'address_types' => ['Casa', 'Departamento'],
            'media_sources' => [
                'Diarios', 
                'Internet', 
                'Otras Personas', 
                'Radio', 
                'Revistas', 
                'TV', 
                'Vía Pública'
            ]
        ];

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $data
        ]));
        
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }
}
