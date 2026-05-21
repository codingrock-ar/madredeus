<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\AuditLogRepositoryMySQL;

class AuditLogController {
    private $repository;

    public function __construct() {
        $this->repository = new AuditLogRepositoryMySQL();
    }

    /**
     * Endpoint para obtener la lista de bitácoras paginadas y filtradas
     */
    public function index(Request $request, Response $response, $args) {
        $queryParams = $request->getQueryParams();

        $params = [
            'search' => $queryParams['search'] ?? null,
            'id_tipo_evento' => $queryParams['id_tipo_evento'] ?? null,
            'id_usuario' => $queryParams['id_usuario'] ?? null,
            'fecha_desde' => $queryParams['fecha_desde'] ?? null,
            'fecha_hasta' => $queryParams['fecha_hasta'] ?? null,
            'page' => isset($queryParams['page']) ? (int)$queryParams['page'] : 1,
            'limit' => isset($queryParams['limit']) ? (int)$queryParams['limit'] : 50
        ];

        $result = $this->repository->getPaginated($params);
        $totalPages = ceil($result['total'] / $params['limit']);

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $result['data'],
            'meta' => [
                'total' => $result['total'],
                'page' => $params['page'],
                'limit' => $params['limit'],
                'total_pages' => $totalPages
            ]
        ], JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }

    /**
     * Endpoint para obtener los metadatos de los filtros (operadores e históricos)
     */
    public function getFilters(Request $request, Response $response, $args) {
        $metadata = $this->repository->getFiltersMetadata();

        $response->getBody()->write(json_encode([
            'status' => 'success',
            'data' => $metadata
        ], JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }
}
