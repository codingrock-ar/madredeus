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
        $template = \App\Controllers\NotificationController::getTemplateByKey('payment_overdue');
        
        if ($template) {
            $this->subject = $template['subject'];
            $body = $template['body'];
            
            $body = str_replace('{name}', $this->student['name'], $body);
            $body = str_replace('{lastname}', $this->student['lastname'], $body);
            $body = str_replace('{amount}', number_format($this->debtAmount, 2, ',', '.'), $body);
            // Si tuviéramos concepto y fecha aquí, los reemplazaríamos
            $body = str_replace('{concept}', 'Deuda acumulada', $body);
            $body = str_replace('{date}', date('d/m/Y'), $body);
            
            $this->body = $body;
        } else {
            // Fallback
            $body = "Hola {$this->student['name']} {$this->student['lastname']},\n\n";
            $body .= "Te recordamos que posees una deuda pendiente de $" . number_format($this->debtAmount, 2, ',', '.') . ".\n";
            $body .= "Por favor, acércate a administración para regularizar tu situación.\n\n";
            $body .= "Atentamente,\nAdministración Madre Deus";
            $this->body = $body;
        }
    }
}
