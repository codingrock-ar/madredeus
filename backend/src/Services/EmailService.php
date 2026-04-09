<?php
namespace App\Services;

class EmailService {
    public static function send($to, $subject, $body) {
        $logPath = __DIR__ . '/../../logs/emails.log';
        if (!is_dir(dirname($logPath))) {
            mkdir(dirname($logPath), 0777, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] TO: $to | SUBJECT: $subject\nBODY:\n$body\n" . str_repeat('-', 50) . "\n";
        
        file_put_contents($logPath, $logEntry, FILE_APPEND);
        
        // In a real environment, we would use PHPMailer or mail()
        // mail($to, $subject, $body, "From: sistema@madredeus.edu.ar");
        
        return true;
    }

    public static function sendPaymentReminder($student, $debtAmount) {
        $subject = "Recordatorio de Pago - Instituto Madre Deus";
        $body = "Hola {$student['name']} {$student['lastname']},\n\n";
        $body .= "Te recordamos que posees una deuda pendiente de $" . number_format($debtAmount, 2, ',', '.') . ".\n";
        $body .= "Por favor, acércate a administración para regularizar tu situación.\n\n";
        $body .= "Atentamente,\nAdministración Madre Deus";
        
        return self::send($student['email'], $subject, $body);
    }

    public static function sendDocumentationReminder($student, $missingDocs) {
        $subject = "Documentación Pendiente - Instituto Madre Deus";
        $body = "Hola {$student['name']} {$student['lastname']},\n\n";
        $body .= "Te informamos que aún debes presentar la siguiente documentación:\n";
        foreach ($missingDocs as $doc) {
            $body .= "- $doc\n";
        }
        $body .= "\nPor favor, entrega los originales lo antes posible.\n\n";
        $body .= "Atentamente,\nSecretaría Madre Deus";
        
        return self::send($student['email'], $subject, $body);
    }
}
