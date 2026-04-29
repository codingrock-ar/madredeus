<?php

namespace App\Notifications;

class CareerInscriptionNotification extends EmailNotification {
    private $student;
    private $career;
    private $inscription;
    private $institution;

    public function __construct($student, $career, $inscription) {
        parent::__construct($student['email'], "Confirmación de Inscripción - " . $career['title']);
        $this->student = $student;
        $this->career = $career;
        $this->inscription = $inscription;
        $this->institution = require __DIR__ . '/../Config/institution.php';
        $this->build();
    }

    protected function build() {
        $body = "Hola {$this->student['name']},\n\n";
        $body .= "¡Te damos la bienvenida al Instituto Madre Deus! Tu inscripción ha sido procesada exitosamente.\n\n";
        
        $body .= "--- INFORMACIÓN DE LA CARRERA ---\n";
        $body .= "Carrera: {$this->career['title']}\n";
        $body .= "Comisión: " . ($this->inscription['commission'] ?? '-') . "\n";
        $body .= "Turno: " . ($this->inscription['shift'] ?? '-') . "\n";
        
        $shift = $this->inscription['shift'] ?? '';
        if (isset($this->institution['schedules'][$shift])) {
            $body .= "Horario: " . $this->institution['schedules'][$shift] . "\n";
        }
        
        $body .= "\n--- DEPARTAMENTOS DE CONTACTO ---\n";
        foreach ($this->institution['departments'] as $dept) {
            $body .= "* {$dept['name']}:\n";
            $body .= "  Email: {$dept['email']}\n";
            $body .= "  Horario: {$dept['hours']}\n";
        }
        
        $body .= "\n--- INFORMACIÓN DE PAGOS ---\n";
        $body .= "Para completar tu inscripción, recuerda regularizar el pago de la matrícula.\n";
        $body .= "Puedes realizar tus pagos en Administración o mediante los canales habilitados.\n\n";
        
        $body .= "Atentamente,\n" . $this->institution['name'];
        
        $this->body = $body;
    }
}
