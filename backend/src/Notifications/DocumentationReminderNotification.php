<?php

namespace App\Notifications;

class DocumentationReminderNotification extends EmailNotification {
    private $student;
    private $missingDocs;

    public function __construct($student, $missingDocs) {
        parent::__construct($student['email'], "Documentación Pendiente - Instituto Madre Deus");
        $this->student = $student;
        $this->missingDocs = $missingDocs;
        $this->build();
    }

    protected function build() {
        $body = "Hola {$this->student['name']} {$this->student['lastname']},\n\n";
        $body .= "Te informamos que aún debes presentar la siguiente documentación:\n";
        foreach ($this->missingDocs as $doc) {
            $body .= "- $doc\n";
        }
        $body .= "\nPor favor, entrega los originales lo antes posible.\n\n";
        $body .= "Atentamente,\nSecretaría Madre Deus";
        
        $this->body = $body;
    }
}
