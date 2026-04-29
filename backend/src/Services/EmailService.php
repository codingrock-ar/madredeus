<?php
namespace App\Services;

use App\Libs\EnvialoSimple\Transaccional;
use App\Libs\EnvialoSimple\Transaccional\Helpers\Builder\MailParams;

class EmailService {
    public static function send($to, $subject, $body) {
        $config = require __DIR__ . '/../Config/config.php';
        $apiKey = $config['MAIL']['envialo_simple_api_key'] ?? '';
        $fromEmail = $config['MAIL']['from_email'] ?? 'sistema@madredeus.edu.ar';
        $fromName = $config['MAIL']['from_name'] ?? 'Instituto Madre Deus';
        
        // Always log for debugging
        $logPath = $config['MAIL']['log_path'] ?? __DIR__ . '/../../logs/emails.log';
        if (!is_dir(dirname($logPath))) {
            mkdir(dirname($logPath), 0777, true);
        }
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = "[$timestamp] FROM: \"$fromName\" <$fromEmail> | TO: $to | SUBJECT: $subject\nBODY:\n$body\n" . str_repeat('-', 50) . "\n";
        file_put_contents($logPath, $logEntry, FILE_APPEND);

        if (empty($apiKey)) {
            error_log("EnvialoSimple API Key missing");
            return false;
        }

        try {
            $estr = new Transaccional($apiKey);
            $mailParams = new MailParams();
            $mailParams
                ->setFrom($fromEmail, $fromName)
                ->setTo($to)
                ->setSubject($subject)
                ->setHtml(nl2br($body))
                ->setText($body);

            return $estr->mail->send($mailParams);
        } catch (\Exception $e) {
            error_log("Error sending email via EnvialoSimple: " . $e->getMessage());
            return false;
        }
    }
}
