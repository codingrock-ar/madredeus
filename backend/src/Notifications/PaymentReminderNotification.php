<?php

namespace App\Notifications;

class PaymentReminderNotification extends EmailNotification {
    private $student;
    private $debtAmount;
    private $payment;

    public function __construct($student, $debtAmount, $payment = null) {
        parent::__construct($student['email'], "Recordatorio de Pago - Instituto Madre Deus");
        $this->student = $student;
        $this->debtAmount = $debtAmount;
        $this->payment = $payment;
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
            
            $concept = $this->payment ? $this->payment['concept'] : 'Deuda acumulada';
            $date = ($this->payment && !empty($this->payment['due_date'])) ? date('d/m/Y', strtotime($this->payment['due_date'])) : date('d/m/Y');

            $body = str_replace('{concept}', $concept, $body);
            $body = str_replace('{date}', $date, $body);
            
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
