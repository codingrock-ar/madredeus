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
            $logoUrl = 'http://codingrock.site/imagenes/LogoMadreDeus.png';
            $htmlBody = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <img src='{$logoUrl}' alt='Instituto Madre Deus' style='max-width: 200px;'>
                    </div>
                    <div style='color: #333; line-height: 1.6;'>
                        " . nl2br($body) . "
                    </div>
                    <div style='margin-top: 30px; border-top: 1px solid #eee; pt-20; font-size: 12px; color: #777; text-align: center;'>
                        Este es un correo automático, por favor no respondas a este mensaje.<br>
                        Instituto Madre Deus - Administración
                    </div>
                </div>
            ";

            $mailParams
                ->setFrom($fromEmail, $fromName)
                ->setReplyTo($fromEmail)
                ->setTo($to)
                ->setSubject($subject)
                ->setHtml($htmlBody)
                ->setText($body);

            return $estr->mail->send($mailParams);
        } catch (\Exception $e) {
            error_log("Error sending email via EnvialoSimple: " . $e->getMessage());
            return false;
        }
    }
}
