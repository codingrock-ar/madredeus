<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Config\Database;
use PDO;

class NotificationController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getTemplates(Request $request, Response $response) {
        $stmt = $this->db->query("SELECT * FROM notification_templates");
        $templates = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode(['status' => 'success', 'data' => $templates]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateTemplate(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = $request->getParsedBody();
        
        $sql = "UPDATE notification_templates SET subject = :subject, body = :body WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            ':subject' => $data['subject'],
            ':body' => $data['body'],
            ':id' => $id
        ]);

        if ($result) {
            $response->getBody()->write(json_encode(['status' => 'success', 'message' => 'Template actualizado']));
        } else {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Error al actualizar']));
        }
        return $response->withHeader('Content-Type', 'application/json');
    }

    public static function getTemplateByKey($key) {
        $database = new Database();
        $db = $database->getConnection();
        $stmt = $db->prepare("SELECT subject, body FROM notification_templates WHERE template_key = :key");
        $stmt->execute([':key' => $key]);
        return $stmt->fetch();
    }
}
