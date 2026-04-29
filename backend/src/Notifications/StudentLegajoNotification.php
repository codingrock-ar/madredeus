<?php

namespace App\Notifications;

class StudentLegajoNotification extends EmailNotification {
    private $student;
    private $institution;

    public function __construct($student) {
        parent::__construct($student['email'], "Resumen de Legajo Estudiantil - " . $student['lastname'] . ", " . $student['name']);
        $this->student = $student;
        $this->institution = require __DIR__ . '/../Config/institution.php';
        $this->build();
    }

    protected function build() {
        $body = "Hola {$this->student['name']} {$this->student['lastname']},\n\n";
        $body .= "Adjuntamos el resumen de tu legajo estudiantil en el {$this->institution['name']}.\n\n";
        
        $body .= "--- DATOS PERSONALES ---\n";
        $body .= "ID: #{$this->student['id']}\n";
        $body .= "DNI: {$this->student['dni']}\n";
        $body .= "Email: " . ($this->student['email'] ?? '-') . "\n";
        $body .= "Teléfono: " . ($this->student['phone_mobile'] ?? '-') . "\n\n";
        
        if (!empty($this->student['inscriptions'])) {
            $body .= "--- INSCRIPCIONES ACTIVAS ---\n";
            foreach ($this->student['inscriptions'] as $ins) {
                $body .= "* {$ins['career_title']}\n";
                $body .= "  Comisión: {$ins['commission']} | Turno: {$ins['shift']}\n";
                $body .= "  Estado: {$ins['status']}\n\n";
            }
        }
        
        $body .= "--- ESTADO DE DOCUMENTACIÓN ---\n";
        $docs = [
            'DNI' => $this->student['req_dni_photocopy'] ?? $this->student['has_dni'] ?? false,
            'Título Secundario' => $this->student['req_degree_photocopy'] ?? $this->student['has_title'] ?? false,
            'Fotos 4x4' => $this->student['req_two_photos'] ?? $this->student['has_photo'] ?? false,
            'Apto Psicofísico' => $this->student['req_psychophysical'] ?? $this->student['has_aptitude'] ?? false,
        ];
        
        foreach ($docs as $name => $status) {
            $body .= ($status ? "[X] " : "[ ] ") . $name . "\n";
        }
        
        $body .= "\nSi tienes documentación pendiente, por favor entrégala a la brevedad en Secretaría.\n\n";
        
        $body .= "Atentamente,\n" . $this->institution['name'];
        
        $this->body = $body;
    }
}
