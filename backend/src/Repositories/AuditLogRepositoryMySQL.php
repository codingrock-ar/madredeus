<?php

namespace App\Repositories;

use PDO;
use App\Config\Database;

class AuditLogRepositoryMySQL {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Obtiene registros de bitácora paginados y filtrados
     */
    public function getPaginated(array $params) {
        if (!$this->db) {
            return [
                'data' => [],
                'total' => 0
            ];
        }

        $page = isset($params['page']) ? (int)$params['page'] : 1;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = ($page - 1) * $limit;

        $whereClauses = [];
        $bindings = [];

        // Filtro por búsqueda (en descripción)
        if (!empty($params['search'])) {
            $whereClauses[] = "b.Descripcion LIKE :search";
            $bindings[':search'] = '%' . $params['search'] . '%';
        }

        // Filtro por Tipo de Evento
        if (isset($params['id_tipo_evento']) && $params['id_tipo_evento'] !== '' && $params['id_tipo_evento'] != -1) {
            $whereClauses[] = "b.IdTipoEvento = :id_tipo_evento";
            $bindings[':id_tipo_evento'] = (int)$params['id_tipo_evento'];
        }

        // Filtro por Usuario
        if (isset($params['id_usuario']) && $params['id_usuario'] !== '' && $params['id_usuario'] != -1) {
            $whereClauses[] = "b.IdUsuario = :id_usuario";
            $bindings[':id_usuario'] = (int)$params['id_usuario'];
        }

        // Filtro por Fecha Desde
        if (!empty($params['fecha_desde'])) {
            $whereClauses[] = "b.Fecha >= :fecha_desde";
            $bindings[':fecha_desde'] = $params['fecha_desde'] . ' 00:00:00';
        }

        // Filtro por Fecha Hasta
        if (!empty($params['fecha_hasta'])) {
            $whereClauses[] = "b.Fecha <= :fecha_hasta";
            $bindings[':fecha_hasta'] = $params['fecha_hasta'] . ' 23:59:59';
        }

        $whereSql = "";
        if (count($whereClauses) > 0) {
            $whereSql = "WHERE " . implode(" AND ", $whereClauses);
        }

        // 1. Obtener el conteo total para la paginación
        $countSql = "SELECT COUNT(*) FROM Bitacoras b $whereSql";
        $countStmt = $this->db->prepare($countSql);
        foreach ($bindings as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        // 2. Obtener los registros paginados
        $dataSql = "
            SELECT 
                b.IdBitacora,
                b.Descripcion,
                b.Fecha,
                b.IdUsuario,
                b.IdTipoEvento,
                e.Descripcion AS TipoEventoDescripcion,
                CONCAT(COALESCE(u.Nombre, ''), ' ', COALESCE(u.Apellido, '')) AS NombreUsuario,
                u.NombeUsuario AS Username
            FROM Bitacoras b
            LEFT JOIN EventosBitacora e ON b.IdTipoEvento = e.IdEventoBitacora
            LEFT JOIN Usuario u ON b.IdUsuario = u.IdUsuario
            $whereSql
            ORDER BY b.Fecha DESC, b.IdBitacora DESC
            LIMIT :limit OFFSET :offset
        ";

        $dataStmt = $this->db->prepare($dataSql);
        foreach ($bindings as $key => $value) {
            $dataStmt->bindValue($key, $value);
        }
        $dataStmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $dataStmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $dataStmt->execute();
        $data = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'data' => $data,
            'total' => $total
        ];
    }

    /**
     * Obtiene los metadatos para inicializar los filtros desplegables
     */
    public function getFiltersMetadata() {
        if (!$this->db) {
            return [
                'event_types' => [],
                'users' => []
            ];
        }

        // Obtener todos los tipos de evento
        $eventsStmt = $this->db->query("SELECT IdEventoBitacora, Descripcion FROM EventosBitacora ORDER BY IdEventoBitacora ASC");
        $eventTypes = $eventsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Obtener todos los usuarios con sus nombres completos
        $usersStmt = $this->db->query("
            SELECT 
                IdUsuario, 
                CONCAT(COALESCE(Nombre, ''), ' ', COALESCE(Apellido, '')) AS NombreCompleto,
                NombeUsuario AS Username
            FROM Usuario 
            ORDER BY NombreCompleto ASC
        ");
        $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'event_types' => $eventTypes,
            'users' => $users
        ];
    }

    /**
     * Resuelve un email del usuario moderno a su ID correspondiente en la tabla legacy Usuario.
     * Si no existe, lo crea e inserta automáticamente de forma seamless.
     */
    public function resolveLegacyUserIdByEmail($email) {
        if (empty($email)) {
            return 20; // ID de 'admin' por defecto
        }
        
        $username = explode('@', $email)[0];
        
        // Buscar en la tabla Usuario legacy
        $stmt = $this->db->prepare("SELECT IdUsuario FROM Usuario WHERE NombeUsuario = :username");
        $stmt->execute([':username' => $username]);
        $id = $stmt->fetchColumn();
        
        if ($id) {
            return (int)$id;
        }
        
        // Si no existe, buscar datos del usuario moderno
        $stmtUser = $this->db->prepare("SELECT name, email FROM users WHERE email = :email");
        $stmtUser->execute([':email' => $email]);
        $modernUser = $stmtUser->fetch(PDO::FETCH_ASSOC);
        
        $nombre = $modernUser['name'] ?? $username;
        $apellido = '';
        
        $parts = explode(' ', $nombre, 2);
        if (count($parts) > 1) {
            $nombre = $parts[0];
            $apellido = $parts[1];
        }
        
        // Encontrar un ID único disponible
        $maxIdStmt = $this->db->query("SELECT MAX(IdUsuario) FROM Usuario");
        $maxId = (int)$maxIdStmt->fetchColumn();
        $newId = max(20000, $maxId + 1); // ID seguro a partir de 20000
        
        // Insertar en la tabla legacy Usuario
        $insertStmt = $this->db->prepare("
            INSERT INTO Usuario (IdUsuario, Nombre, Apellido, NombeUsuario, Activo)
            VALUES (:id, :nombre, :apellido, :username, 1)
        ");
        $insertStmt->execute([
            ':id' => $newId,
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':username' => $username
        ]);
        
        return $newId;
   }

    /**
     * Registra una acción en la bitácora
     */
    public function logEvent($email, $tipoEventoId, $descripcion) {
        if (!$this->db) return false;
        
        try {
            $idUsuario = $this->resolveLegacyUserIdByEmail($email);
            
            // Limitamos a 255 caracteres por la estructura de columna de Bitacoras
            $descripcionSafe = strlen($descripcion) > 255 ? substr($descripcion, 0, 252) . "..." : $descripcion;
            
            $stmt = $this->db->prepare("
                INSERT INTO Bitacoras (Descripcion, Fecha, IdUsuario, IdTipoEvento)
                VALUES (:descripcion, NOW(), :id_usuario, :id_tipo_evento)
            ");
            
            return $stmt->execute([
                ':descripcion' => $descripcionSafe,
                ':id_usuario' => $idUsuario,
                ':id_tipo_evento' => (int)$tipoEventoId
            ]);
        } catch (\Exception $e) {
            error_log("Error al escribir en Bitacoras: " . $e->getMessage());
            return false;
        }
    }
}
