<?php

namespace App\Notifications;

class PaymentReminderNotification extends EmailNotification {
    private $student;
    private $debtAmount;

    public function __construct($student, $debtAmount) {
        parent::__construct($student['email'], "Recordatorio de Pago - Instituto Madre Deus");
        $this->student = $student;
        $this->debtAmount = $debtAmount;
        $this->build();
    }

    protected function build() {
        $body = "Hola {$this->student['name']} {$this->student['lastname']},\n\n";
        $body .= "Te recordamos que posees una deuda pendiente de $" . number_format($this->debtAmount, 2, ',', '.') . ".\n";
        $body .= "Por favor, acércate a administración para regularizar tu situación.\n\n";
        $body .= "Atentamente,\nAdministración Madre Deus";
        
        $this->body = $body;
    }
}
